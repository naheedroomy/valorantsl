from typing import Dict, Any

import aiohttp
from fastapi import HTTPException


async def fetch_json(session: aiohttp.ClientSession, url: str, headers: Dict[str, str]) -> Dict[str, Any]:
    async with session.get(url, headers=headers) as response:
        if response.status != 200:
            raise HTTPException(status_code=response.status, detail=f"Failed to fetch data from {url}")
        return await response.json()
