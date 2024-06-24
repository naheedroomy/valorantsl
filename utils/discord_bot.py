import asyncio
import logging
import os
import time

import aiohttp
import discord
import pymongo


# logging for the bots
class ScriptFilter(logging.Filter):
    def filter(self, record):
        return record.pathname == __file__


logger = logging.getLogger()
logger.setLevel(logging.INFO)

handler = logging.FileHandler('log/discord_roles.log')
handler.setLevel(logging.INFO)

# Create a logging format
formatter = logging.Formatter('%(asctime)s [%(levelname)s] [%(filename)s:%(lineno)d] - %(message)s',
                              datefmt='%d/%m/%Y %H:%M:%S')
handler.setFormatter(formatter)

handler.addFilter(ScriptFilter())
logger.addHandler(handler)

# Define intents
intents = discord.Intents.default()
intents.members = True

# Set up connection to MongoDB
MONGO_PASSWORD = os.getenv('MONGO_PASSWORD')
MONGO_HOST = os.getenv('MONGO_HOST')
DISCORD_BOT_TOKEN_1 = os.getenv('DISCORD_BOT_TOKEN_1')
DISCORD_BOT_TOKEN_2 = os.getenv('DISCORD_BOT_TOKEN_2')

mongo_client = pymongo.MongoClient(
    f"mongodb+srv://naheedroomy:{MONGO_PASSWORD}@{MONGO_HOST}?retryWrites=true&w=majority")
db = mongo_client["live"]
collection = db["user_leaderboard"]


class DiscordBotBackgroundRunner:
    def __init__(self, bot_id):
        self.bot_id = bot_id
        self.client = discord.Client(intents=intents)

        @self.client.event
        async def on_member_join(member):
            logging.info(f"[ BOT {self.bot_id} ] - {member} has joined the server!")
            tier_icons = await self.fetch_tier_data()
            await self.update_member_roles(member, tier_icons)

        @self.client.event
        async def on_ready():
            print(f'{self.client.user} has connected to Discord!')
            self.client.loop.create_task(self.main_loop())

    async def fetch_tier_data(self):
        async with aiohttp.ClientSession() as session:
            async with session.get('https://valorant-api.com/v1/competitivetiers') as response:
                if response.status == 200:
                    data = await response.json()
                    tiers = data['data'][0]['tiers']
                    tier_icons = {tier['tierName']: tier['smallIcon'] for tier in tiers if tier['smallIcon']}
                    return tier_icons
                else:
                    logging.error(f"Failed to fetch tier data: {response.status}")
                    return {}

    async def update_alpha_omega_roles(self, member, rank):
        if member is None:
            return

        alpha_ranks = ['Platinum', 'Diamond', 'Immortal', 'Ascendant', 'Radiant']
        omega_ranks = ['Gold', 'Silver', 'Iron', 'Bronze']

        alpha_role = discord.utils.get(member.guild.roles, name="Alpha")
        omega_role = discord.utils.get(member.guild.roles, name="Omega")

        if rank in alpha_ranks:
            if omega_role in member.roles:
                await member.remove_roles(omega_role)
            if alpha_role not in member.roles:
                await member.add_roles(alpha_role)
        elif rank in omega_ranks:
            if alpha_role in member.roles:
                await member.remove_roles(alpha_role)
            if omega_role not in member.roles:
                await member.add_roles(omega_role)
        else:
            if alpha_role in member.roles:
                await member.remove_roles(alpha_role)
            if omega_role in member.roles:
                await member.remove_roles(omega_role)

    async def update_member_roles(self, member, tier_icons):
        if member is None:
            logging.error(f"Member object is None. Skipping role update.")
            return

        try:
            await asyncio.sleep(1.2)

            manual_role = discord.utils.get(member.guild.roles, name="Manual")
            if manual_role in member.roles:
                rank_roles = ['Ascendant', 'Diamond', 'Immortal', 'Radiant', 'Gold', 'Platinum', 'Silver', 'Iron',
                              'Bronze',
                              'Unranked']
                current_rank_role = next((role for role in member.roles if role.name in rank_roles), None)

                if current_rank_role:
                    await self.update_alpha_omega_roles(member, current_rank_role.name)

                return

            discord_username = str(member)
            discord_id = member.id
            logging.info(f"[ BOT {self.bot_id} ] - Processing {discord_username}")
            query = {"discord_username": discord_username}
            result = collection.find_one(query)

            if result:
                stored_discord_id = result.get("discord_id")
                if stored_discord_id == 0 or stored_discord_id is None:
                    update_query = {"discord_username": discord_username}
                    new_values = {"$set": {"discord_id": discord_id}}
                    logging.info(
                        f"[ BOT {self.bot_id} ] -  Updating discord_id for {discord_username} in the database.")
                    collection.update_one(update_query, new_values)

            query = {"$or": [{"discord_id": discord_id}, {"discord_username": discord_username}]}
            result = collection.find_one(query)
            if result:
                if "discord_id" in result and discord_id and discord_id != 0 and result[
                    "discord_username"] != discord_username:
                    update_query = {"discord_id": discord_id}
                    new_values = {"$set": {"discord_username": discord_username}}
                    logging.info(
                        f"[ BOT {self.bot_id} ] - Updating discord_username for {discord_username} in the database.")
                    collection.update_one(update_query, new_values)

                verified_role = discord.utils.get(member.guild.roles, name="Verified")
                await member.add_roles(verified_role)

                unverified_role = discord.utils.get(member.guild.roles, name="Unverified")
                if unverified_role in member.roles:
                    await member.remove_roles(unverified_role)
                    logging.info(f"[ BOT {self.bot_id} ] - Removed unverified role from {discord_username}.")

                rank = result.get("rank")
                if rank is None:
                    logging.error(
                        f"[ BOT {self.bot_id} ] - Rank not found for {discord_username}. Skipping role update.")
                    return

                original_rank = rank
                rank = rank.split()[0]

                rank_dict = {'Iron': 'Irn', 'Bronze': 'Brz', 'Silver': 'Slv', 'Gold': 'Gld', 'Platinum': 'Plt',
                             'Diamond': 'Dia', 'Immortal': 'Imm', 'Radiant': 'Radiant', 'Ascendant': 'Asc',
                             'Unranked': 'Unranked'}

                rank_short = rank_dict[rank]
                new_nickname = f"{member.name}({rank_short})"
                if member.nick != new_nickname:
                    try:
                        await member.edit(nick=new_nickname)
                        logging.info(f"[ BOT {self.bot_id} ] - Updated nickname - {discord_username} - {new_nickname}.")
                    except discord.errors.Forbidden:
                        logging.error(
                            f"[ BOT {self.bot_id} ] - Failed to update nickname for {discord_username} due to insufficient permissions.")
                        return

                if rank:
                    rank_roles = ['Ascendant', 'Diamond', 'Immortal', 'Radiant', 'Gold', 'Platinum', 'Silver', 'Iron',
                                  'Bronze',
                                  'Unranked']
                    current_rank_role = next((role for role in member.roles if role.name in rank_roles), None)

                    if not current_rank_role or current_rank_role.name != rank:
                        if current_rank_role:
                            await member.remove_roles(current_rank_role)
                            logging.info(
                                f"[ BOT {self.bot_id} ] - Removed - {discord_username} - {current_rank_role.name}.")

                        rank_role = discord.utils.get(member.guild.roles, name=rank)
                        if rank_role:
                            await member.add_roles(rank_role)
                            logging.info(f"[ BOT {self.bot_id} ] - Updated - {discord_username} - {rank}.")
                        else:
                            logging.error(f"[ BOT {self.bot_id} ] - Role not found for rank: {rank}")

                    if rank == 'Unranked':
                        manual_role = discord.utils.get(member.guild.roles, name="Manual")
                        if manual_role not in member.roles:
                            await member.add_roles(manual_role)

                    await self.update_alpha_omega_roles(member, rank)
            else:
                unverified_role = discord.utils.get(member.guild.roles, name="Unverified")
                await member.add_roles(unverified_role)

        except discord.errors.DiscordServerError as e:
            if e.status == 503:
                logging.error(f"[ BOT {self.bot_id} ] - Discord server error (503): {e}. Retrying...")
                await asyncio.sleep(10)  # Wait for 10 seconds before retrying
                await self.update_member_roles(member, tier_icons)  # Retry the function
            else:
                logging.error(f"[ BOT {self.bot_id} ] - Discord server error: {e}")

        except discord.errors.NotFound as e:
            logging.error(f"[ BOT {self.bot_id} ] - Member not found: {discord_username}. Skipping role update.")

        except Exception as e:
            logging.error(f"[ BOT {self.bot_id} ] - Unexpected error in update_member_roles: {e}")

    async def update_all_member_roles(self):
        count = 0
        start_time = time.time()
        tier_icons = await self.fetch_tier_data()
        for guild in self.client.guilds:
            members = [member for member in guild.members if not member.bot]
            members_count = len(members)
            members.sort(key=lambda x: x.name)
            if self.bot_id == 1:
                members = members[:members_count // 2 + members_count % 2]
            else:
                members = members[members_count // 2 + members_count % 2:]

            for member in members:
                count += 1
                await self.update_member_roles(member, tier_icons)

        time_taken = time.time() - start_time
        logging.info(f"[ BOT {self.bot_id} ] - Time taken to update all member roles: {time_taken / 60} minutes")
        logging.info(f"[ BOT {self.bot_id} ] - Total members processed: {count}")

    async def main_loop(self):
        await self.client.wait_until_ready()  # Wait until the client is ready
        while True:
            try:
                await self.update_all_member_roles()
            except Exception as e:
                logging.error(f"[ BOT {self.bot_id} ] - Error in main loop: {e}")
            finally:
                logging.info(f"[ BOT {self.bot_id} ] - Sleeping for 15 minutes before next iteration.")
                await asyncio.sleep(15 * 60)

    async def run(self):
        await self.client.start(DISCORD_BOT_TOKEN_1 if self.bot_id == 1 else DISCORD_BOT_TOKEN_2)


# Initialize the bots
bot1 = DiscordBotBackgroundRunner(bot_id=1)
bot2 = DiscordBotBackgroundRunner(bot_id=2)
