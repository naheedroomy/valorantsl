import json
import os
import time
from typing import List

import aiohttp
from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from utils.misc import fetch_json

from models.db.valorant import MongoImagesModel, MongoRankDetailsDataModel, MongoRankDetailsModel, \
    MongoAccountResponseModel
from models.pydantic.valorant import AccountResponseModel, SavedAccountResponseModel

API_TOKEN = os.getenv('HENRIK_API_TOKEN')
API_BASE_URL = "https://api.henrikdev.xyz"

if not API_TOKEN:
    raise EnvironmentError("HENRIK_API_TOKEN environment variable not set")

valorant = APIRouter(prefix="/valorant", tags=["valorant"])


@valorant.get("/rank/{puuid}", response_model=AccountResponseModel)
async def get_rank_details(puuid: str, request: Request):
    session = request.app.state.http_session
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
        rank_url = f'{API_BASE_URL}/valorant/v3/by-puuid/mmr/{acc_region}/pc/{puuid}'
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
                            discord_username: str,
                            request: Request):
    # check if the puuid is already in the database
    if MongoAccountResponseModel.objects(puuid=puuid):
        raise HTTPException(status_code=400, detail="Riot account already exists in the database.")

    # check if the discord_id is already in the database

    if discord_id != 0:
        if MongoAccountResponseModel.objects(discord_id=discord_id):
            raise HTTPException(status_code=400, detail="Discord ID already exists in the database.")

    # check if the discord_username is already in the database
    if MongoAccountResponseModel.objects(discord_username=discord_username):
        raise HTTPException(status_code=400, detail="Discord username already exists in the database.")

    session = request.app.state.http_session
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
        # Calculate pagination offset
        skip = (page - 1) * page_size

        # Calculate the cutoff datetime (45 days ago)
        cutoff_date = datetime.utcnow() - timedelta(days=45)

        # Query the database with sorting, pagination, and filtering for accounts updated within 45 days
        total_count = MongoAccountResponseModel.objects(
            rank_details__data__elo__ne=0,
            rank_details__data__elo__exists=True,
            rank_details__data__last_elo_change_timestamp__gte=cutoff_date
        ).count()

        leaderboard = MongoAccountResponseModel.objects(
            rank_details__data__elo__ne=0,
            rank_details__data__elo__exists=True,
            rank_details__data__last_elo_change_timestamp__gte=cutoff_date
        ).order_by('-rank_details.data.elo').skip(skip).limit(page_size)

        response = []
        for account in leaderboard:
            item = json.loads(account.to_json())
            item.pop('_id')
            response.append(item)

        return JSONResponse(content=response, headers={"X-Total-Count": str(total_count)})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Exception: {e}")



@valorant.get("/leaderboard/all", response_model=List[SavedAccountResponseModel])
async def get_all_leaderboard():
    try:
        leaderboard = MongoAccountResponseModel.objects(
            rank_details__data__elo__ne=0,
            rank_details__data__elo__exists=True
        ).order_by('-rank_details.data.elo')

        response = []
        for account in leaderboard:
            item = json.loads(account.to_json())
            item.pop('_id')
            response.append(item)

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Exception: {e}")



from datetime import datetime, timedelta

@valorant.put("/update-all", response_model=List[SavedAccountResponseModel])
async def update_all_accounts(request: Request):
    session = request.app.state.http_session
    headers_henrik = {'Authorization': f'{API_TOKEN}'}

    try:
        accounts = MongoAccountResponseModel.objects()
        updated_accounts = []

        for account in accounts:
            puuid = account.puuid
            account_url = f'{API_BASE_URL}/valorant/v1/by-puuid/account/{puuid}'
            rank_url = f'{API_BASE_URL}/valorant/v1/by-puuid/mmr/{account.region}/{puuid}'
            mmr_history_url = f'{API_BASE_URL}/valorant/v1/by-puuid/mmr-history/{account.region}/{puuid}'

            try:
                acc_details_json = await fetch_json(session, account_url, headers_henrik)
                rank_details_json = await fetch_json(session, rank_url, headers_henrik)
                mmr_history_json = await fetch_json(session, mmr_history_url, headers_henrik)

                # Update account details
                account.name = acc_details_json['data']['name']
                account.tag = acc_details_json['data']['tag']

                # Process rank details from the mmr endpoint
                data = rank_details_json['data']
                images_data = data.pop('images')
                images = MongoImagesModel(**images_data)

                # Use the mmr-history endpoint to set the last elo change timestamp:
                if mmr_history_json.get('data') and len(mmr_history_json['data']) > 0:
                    first_item = mmr_history_json['data'][0]
                    date_raw = first_item.get('date_raw')
                    if date_raw is not None:
                        last_change_dt = datetime.utcfromtimestamp(date_raw)
                    else:
                        last_change_dt = datetime.utcnow()
                else:
                    last_change_dt = datetime.utcnow()

                data['last_elo_change_timestamp'] = last_change_dt

                rank_details_data = MongoRankDetailsDataModel(images=images, **data)
                rank_details = MongoRankDetailsModel(status=rank_details_json['status'], data=rank_details_data)
                account.rank_details = rank_details

                account.save()
                print(f"Successfully updated account with PUUID: {puuid}")

                account_response_json = json.loads(account.to_json())
                account_response_json.pop('_id')
                updated_accounts.append(account_response_json)
                time.sleep(2.5)
            except Exception as e:
                print(f"Failed to update account with PUUID {puuid}: {e}")

        return updated_accounts

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Exception: {e}")


@valorant.put("/update/rank/{puuid}", response_model=SavedAccountResponseModel)
async def update_account_rank(puuid: str, request: Request):
    session = request.app.state.http_session
    headers_henrik = {'Authorization': f'{API_TOKEN}'}

    try:
        account = MongoAccountResponseModel.objects(puuid=puuid).first()
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")

        account_url = f'{API_BASE_URL}/valorant/v1/by-puuid/account/{puuid}'
        rank_url = f'{API_BASE_URL}/valorant/v1/by-puuid/mmr/{account.region}/{puuid}'
        mmr_history_url = f'{API_BASE_URL}/valorant/v1/by-puuid/mmr-history/{account.region}/{puuid}'

        try:
            acc_details_json = await fetch_json(session, account_url, headers_henrik)
            rank_details_json = await fetch_json(session, rank_url, headers_henrik)
            mmr_history_json = await fetch_json(session, mmr_history_url, headers_henrik)

            # Update account details
            account.name = acc_details_json['data']['name']
            account.tag = acc_details_json['data']['tag']

            data = rank_details_json['data']
            images_data = data.pop('images')
            images = MongoImagesModel(**images_data)

            # Set the last elo change timestamp using the mmr-history endpoint:
            if mmr_history_json.get('data') and len(mmr_history_json['data']) > 0:
                first_item = mmr_history_json['data'][0]
                date_raw = first_item.get('date_raw')
                if date_raw is not None:
                    last_change_dt = datetime.utcfromtimestamp(date_raw)
                else:
                    last_change_dt = datetime.utcnow()
            else:
                last_change_dt = datetime.utcnow()

            data['last_elo_change_timestamp'] = last_change_dt

            rank_details_data = MongoRankDetailsDataModel(images=images, **data)
            rank_details = MongoRankDetailsModel(status=rank_details_json['status'], data=rank_details_data)
            account.rank_details = rank_details

            account.save()

            account_response_json = json.loads(account.to_json())
            account_response_json.pop('_id')
            return account_response_json

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to update account: {e}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Exception: {e}")

@valorant.get("/account/{puuid}", response_model=SavedAccountResponseModel)
async def get_account(puuid: str):
    try:
        account = MongoAccountResponseModel.objects(puuid=puuid).first()
        if not account:
            raise HTTPException(status_code=404, detail="Account not found in the database.")

        account_json = json.loads(account.to_json())
        account_json.pop('_id')
        return account_json

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Exception: {e}")


@valorant.get("/account/all/puuids", response_model=List[str])
async def get_all_accounts_puuid_list():
    try:
        accounts = MongoAccountResponseModel.objects()
        puuid_list = [account.puuid for account in accounts]
        return puuid_list

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Exception: {e}")





@valorant.put("/update/discord/{discord_id_old}/{discord_id_new}/{discord_username_new}",
              response_model=SavedAccountResponseModel)
async def update_account_discord(discord_id_new: int,
                                 discord_username_new: str,
                                 discord_id_old: int):
    account = MongoAccountResponseModel.objects(discord_id=discord_id_old).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found in the database.")
    try:
        account.discord_id = discord_id_new
        account.discord_username = discord_username_new
        account.save()
        account_json = json.loads(account.to_json())
        account_json.pop('_id')
        return account_json
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Exception: {e}")
