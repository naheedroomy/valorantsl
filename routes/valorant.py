import json
import os
import time
from typing import List

import aiohttp
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse


from models.db.valorant import MongoImagesModel, MongoRankDetailsDataModel, MongoRankDetailsModel, \
    MongoAccountResponseModel
from models.pydantic.valorant import AccountResponseModel, SavedAccountResponseModel
from utils.misc import fetch_json

API_TOKEN = os.getenv('HENRIK_API_TOKEN')
API_BASE_URL = "https://api.henrikdev.xyz"

if not API_TOKEN:
    raise EnvironmentError("HENRIK_API_TOKEN environment variable not set")

valorant = APIRouter(prefix="/valorant", tags=["valorant"])


@valorant.get("/rank/{puuid}", response_model=AccountResponseModel)
async def get_rank_details(puuid: str):
    async with aiohttp.ClientSession() as session:
        headers_henrik = {
            'Authorization': f'{API_TOKEN}'
        }

        try:
            account_url = f'{API_BASE_URL}/valorant/v1/by-puuid/account/{puuid}'
            acc_details_json = await fetch_json(session, account_url, headers_henrik)
            acc_region = acc_details_json['data']['region']
            acc_name = acc_details_json['data']['name']
            acc_tag = acc_details_json['data']['tag']
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Exception: {e}")

        try:
            rank_url = f'{API_BASE_URL}/valorant/v1/by-puuid/mmr/{acc_region}/{puuid}'
            rank_details_json = await fetch_json(session, rank_url, headers_henrik)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Exception: {e}")

        return {
            "puuid": puuid,
            "name": acc_name,
            "tag": acc_tag,
            "region": acc_region,
            "rank_details": rank_details_json
        }


@valorant.post("/rank/{puuid}/{discord_id}/{discord_username}/", response_model=SavedAccountResponseModel)
async def save_rank_details(puuid: str,
                            discord_id: int,
                            discord_username: str):
    # check if the puuid is already in the database
    if MongoAccountResponseModel.objects(puuid=puuid):
        raise HTTPException(status_code=400, detail="Riot account already exists in the database.")

    # check if the discord_id is already in the database
    if MongoAccountResponseModel.objects(discord_id=discord_id):
        raise HTTPException(status_code=400, detail="Discord ID already exists in the database.")

    # check if the discord_username is already in the database
    if MongoAccountResponseModel.objects(discord_username=discord_username):
        raise HTTPException(status_code=400, detail="Discord username already exists in the database.")

    async with aiohttp.ClientSession() as session:
        headers_henrik = {
            'Authorization': f'{API_TOKEN}'
        }

        try:
            account_url = f'{API_BASE_URL}/valorant/v1/by-puuid/account/{puuid}'
            acc_details_json = await fetch_json(session, account_url, headers_henrik)
            acc_region = acc_details_json['data']['region']
            acc_name = acc_details_json['data']['name']
            acc_tag = acc_details_json['data']['tag']
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Exception: {e}")

        try:
            rank_url = f'{API_BASE_URL}/valorant/v1/by-puuid/mmr/{acc_region}/{puuid}'
            rank_details_json = await fetch_json(session, rank_url, headers_henrik)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Exception: {e}")

        # Extract and construct the embedded document models
        images_data = rank_details_json['data'].pop('images')
        images = MongoImagesModel(**images_data)
        rank_details_data = MongoRankDetailsDataModel(images=images, **rank_details_json['data'])
        rank_details = MongoRankDetailsModel(status=rank_details_json['status'], data=rank_details_data)

        # Construct the main document model
        account_response = MongoAccountResponseModel(
            puuid=puuid,
            name=acc_name,
            tag=acc_tag,
            region=acc_region,
            rank_details=rank_details,
            discord_id=discord_id,
            discord_username=discord_username,
        )

        # Save to database
        try:
            account_response.save()
        except Exception as e:
            print(e)
            raise HTTPException(status_code=500, detail=f"Failed to save data to the database: {e}")

        # Return the response model
        account_response_json = json.loads(account_response.to_json())
        account_response_json.pop('_id')

        return account_response_json


@valorant.get("/leaderboard", response_model=List[SavedAccountResponseModel])
async def get_leaderboard(
        page: int = Query(1, ge=1),
        page_size: int = Query(10, ge=1, le=100)
):
    try:
        # Calculate the number of items to skip
        skip = (page - 1) * page_size

        # Query the database with sorting and pagination
        total_count = MongoAccountResponseModel.objects(
            rank_details__data__elo__ne=0,
            rank_details__data__elo__exists=True
        ).count()

        leaderboard = MongoAccountResponseModel.objects(
            rank_details__data__elo__ne=0,
            rank_details__data__elo__exists=True
        ).order_by('-rank_details.data.elo').skip(skip).limit(page_size)

        response = []
        for account in leaderboard:
            item = json.loads(account.to_json())
            item.pop('_id')
            response.append(item)

        return JSONResponse(content=response, headers={"X-Total-Count": str(total_count)})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Exception: {e}")


@valorant.put("/update-all", response_model=List[SavedAccountResponseModel])
async def update_all_accounts():
    async with aiohttp.ClientSession() as session:
        headers_henrik = {
            'Authorization': f'{API_TOKEN}'
        }

        try:
            accounts = MongoAccountResponseModel.objects()

            updated_accounts = []
            for account in accounts:
                puuid = account.puuid
                account_url = f'{API_BASE_URL}/valorant/v1/by-puuid/account/{puuid}'
                rank_url = f'{API_BASE_URL}/valorant/v1/by-puuid/mmr/{account.region}/{puuid}'

                try:
                    acc_details_json = await fetch_json(session, account_url, headers_henrik)
                    rank_details_json = await fetch_json(session, rank_url, headers_henrik)

                    # Update account details
                    account.name = acc_details_json['data']['name']
                    account.tag = acc_details_json['data']['tag']
                    account.region = acc_details_json['data']['region']

                    # Update rank details
                    images_data = rank_details_json['data'].pop('images')
                    images = MongoImagesModel(**images_data)
                    rank_details_data = MongoRankDetailsDataModel(images=images, **rank_details_json['data'])
                    rank_details = MongoRankDetailsModel(status=rank_details_json['status'], data=rank_details_data)

                    account.rank_details = rank_details

                    # Save updated account to the database
                    account.save()
                    print(f"Succesfully updated account with PUUID: {puuid}")
                    # Prepare response
                    account_response_json = json.loads(account.to_json())
                    account_response_json.pop('_id')
                    updated_accounts.append(account_response_json)
                    time.sleep(2.5)

                except Exception as e:
                    print(f"Failed to update account with PUUID {puuid}: {e}")

            return updated_accounts

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Exception: {e}")
