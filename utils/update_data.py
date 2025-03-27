import asyncio
import logging
import os
import time

import aiohttp

VALORANTSL_API_URL = os.getenv("VALORANTSL_API_URL", "http://fastapi:8000")


class ScriptFilter(logging.Filter):
    def filter(self, record):
        return record.pathname == __file__


logger = logging.getLogger()
logger.setLevel(logging.INFO)

handler = logging.FileHandler('log/update_accounts.log')
handler.setLevel(logging.INFO)

# Create a logging format
formatter = logging.Formatter('%(asctime)s [%(levelname)s] [%(filename)s:%(lineno)d] - %(message)s',
                              datefmt='%d/%m/%Y %H:%M:%S')
handler.setFormatter(formatter)

handler.addFilter(ScriptFilter())
logger.addHandler(handler)


class UpdateAllUsersBackgroundRunner:

    async def get_all_puuids(self, session):
        try:
            async with session.get(f'{VALORANTSL_API_URL}/valorant/account/all/puuids') as response:
                if response.status == 200:
                    logging.info(f"Successfully retrieved {len(await response.json())} PUUIDs")
                    return await response.json()
                else:
                    logging.error(f"Failed to get PUUIDs: HTTP {response.status}")
                    return None
        except Exception as e:
            logging.error(f"Exception occurred while getting PUUIDs: {e}")
            return None

    async def update_account(self, session, puuid):
        max_retries = 3
        for attempt in range(1, max_retries + 1):
            try:
                async with session.put(f'{VALORANTSL_API_URL}/valorant/update/rank/{puuid}') as response:
                    if response.status == 200:
                        logging.info(f"Successfully updated account: {puuid}")
                        return await response.json()
                    else:
                        logging.error(f"Attempt {attempt} - Failed to update account {puuid}: HTTP {response.status}")
            except Exception as e:
                logging.error(f"Attempt {attempt} - Exception while updating account {puuid}: {e}")

            if attempt < max_retries:
                await asyncio.sleep(2)  # Wait for 2 seconds before retrying

        # After max retries, return None or handle as needed
        return None

    async def update_all_users(self):
        async with aiohttp.ClientSession() as session:
            puuid_list = await self.get_all_puuids(session)
            if puuid_list:
                for puuid in puuid_list:
                    await self.update_account(session, puuid)
                    time.sleep(2)
            else:
                logging.error("Failed to retrieve PUUID list")

    async def run_update_all_users(self):
        await asyncio.sleep(20)  # Wait for 20 seconds to ensure the server is fully started
        while True:
            await self.update_all_users()
            await asyncio.sleep(60 * 30)  # 30 min interval
