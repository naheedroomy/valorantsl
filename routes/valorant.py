import aiohttp
from fastapi import APIRouter, HTTPException
import os
from typing import Dict, Any

API_TOKEN = os.getenv('HENRIK_API_TOKEN')
API_BASE_URL = "https://api.henrikdev.xyz"

if not API_TOKEN:
    raise EnvironmentError("HENRIK_API_TOKEN environment variable not set")

valorant = APIRouter(prefix="/valorant", tags=["valorant"])


async def fetch_json(session: aiohttp.ClientSession, url: str, headers: Dict[str, str]) -> Dict[str, Any]:
    async with session.get(url, headers=headers) as response:
        if response.status != 200:
            raise HTTPException(status_code=response.status, detail=f"Failed to fetch data from {url}")
        return await response.json()


@valorant.get("/get/rank/{puuid}")
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
            "name": acc_name,
            "tag": acc_tag,
            "region": acc_region,
            "rank_details": rank_details_json
        }
