import asyncio

import aiohttp
import requests


class UpdateAllUsersBackgroundRunner:
    async def update_all_users(self):
        async with aiohttp.ClientSession() as session:
            try:
                async with session.put('http://localhost:8000/valorant/update-all') as response:
                    if response.status == 200:
                        print("Successfully updated all users")
                        return await response.json()
                    else:
                        print(f"Failed to update: HTTP {response.status}")
                        return None
            except Exception as e:
                print(f"Exception occurred: {e}")
                return None

    async def run_update_all_users(self):
        await asyncio.sleep(20)  # Wait for 20 seconds to ensure the server is fully started
        while True:
            await self.update_all_users()
            await asyncio.sleep(60 * 30)  # 30 min interval
