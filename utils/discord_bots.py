import asyncio
import logging
import os

import aiohttp
import discord

# Define intents
intents = discord.Intents.default()
intents.members = True

DISCORD_BOT_TOKEN_1 = os.getenv('DISCORD_BOT_TOKEN_1')
DISCORD_BOT_TOKEN_2 = os.getenv('DISCORD_BOT_TOKEN_2')
DISCORD_GUILD_ID = int(os.getenv('DISCORD_GUILD_ID'))
VALORANTSL_API_URL = os.getenv('VALORANTSL_API_URL')


class ScriptFilter(logging.Filter):
    def filter(self, record):
        return record.pathname == __file__


def setup_logging(bot_name):
    logger = logging.getLogger(bot_name)
    logger.setLevel(logging.INFO)

    handler = logging.FileHandler(f'log/{bot_name}_discord.log')
    handler.setLevel(logging.INFO)

    # Create a logging format
    formatter = logging.Formatter('%(asctime)s [%(levelname)s] [%(filename)s:%(lineno)d] - %(message)s',
                                  datefmt='%d/%m/%Y %H:%M:%S')
    handler.setFormatter(formatter)

    handler.addFilter(ScriptFilter())
    logger.addHandler(handler)
    return logger


logger1 = setup_logging('bot1')
logger2 = setup_logging('bot2')

ALPHA_RANKS = ['Diamond', 'Ascendant', 'Radiant', 'Immortal']
OMEGA_RANKS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Iron']
RANK_NAMES_MAPPER = {
    'Iron': 'Iron',
    'Bronze': 'Brz',
    'Silver': 'Slv',
    'Gold': 'Gld',
    'Platinum': 'Plt',
    'Ascendant': 'Asc',
    'Diamond': 'Dia',
    'Immortal': 'Imm',
    'Radiant': 'Radiant'
}


class DiscordBotBackgroundRunner:
    def __init__(self, bot_id):
        self.bot_id = bot_id
        self.client = discord.Client(intents=intents)
        self.logger = logger1 if bot_id == 1 else logger2

        if bot_id == 1:
            @self.client.event
            async def on_member_join(member):
                guild = discord.utils.get(self.client.guilds, id=DISCORD_GUILD_ID)
                if guild:
                    db_response = await self.get_info_from_db(self.logger)
                    self.logger.info(f'New member joined: {member.name} (ID: {member.id})')
                    await bot1.update_discord_roles(member, db_response, self.logger)

            @self.client.event
            async def on_ready():
                self.logger.info(f'{self.client.user} has connected to Discord!')
                guild = discord.utils.get(self.client.guilds, id=DISCORD_GUILD_ID)
                if guild:
                    db_response = await self.get_info_from_db(self.logger)

                    members = sorted(guild.members, key=lambda member: member.id)

                    for member in members:
                        await self.update_database_discord_data(member, db_response, self.logger)
                        await asyncio.sleep(1)
        else:
            @self.client.event
            async def on_ready():
                self.logger.info(f'{self.client.user} has connected to Discord!')
                guild = discord.utils.get(self.client.guilds, id=DISCORD_GUILD_ID)
                if guild:
                    db_response = await self.get_info_from_db(self.logger)

                    members = sorted(guild.members, key=lambda member: member.id)

                    for member in members:
                        await self.update_discord_roles(member, db_response, self.logger)
                        await asyncio.sleep(1)

    async def get_info_from_db(self, logger):
        async with aiohttp.ClientSession() as session:
            async with session.get(f'{VALORANTSL_API_URL}/valorant/leaderboard/all') as response:
                if response.status == 200:
                    logger.info("Successfully retrieved leaderboard data")
                    data = await response.json()
                    return data
                else:
                    logger.error(f"Failed to get leaderboard data: HTTP {response.status}")
                    return None

    async def update_database_discord_data(self, member, db_response, logger):
        discord_id = int(member.id)
        discord_username = member.name

        match_found = False

        for database_user in db_response:
            db_discord_id = int(database_user['discord_id'])
            db_username = database_user['discord_username']

            if abs(discord_id - db_discord_id) <= 200:
                match_found = True
                async with aiohttp.ClientSession() as session:
                    async with session.put(
                            f'{VALORANTSL_API_URL}/valorant/update/discord/{db_discord_id}/{discord_id}/{discord_username}') as response:
                        if response.status == 200:
                            logger.info(f"Updated database discord_id | {db_discord_id} --> {discord_id},"
                                        f" discord_username | {db_username} --> {discord_username}")

        if not match_found:
            logger.info(f"Discord ID {discord_id} not found in database. Username: {discord_username}")

    async def update_nickname(self, member, global_name, rank_tier, logger):
        mapped_rank = RANK_NAMES_MAPPER.get(rank_tier, rank_tier)
        new_nickname = f"{global_name} ({mapped_rank})"
        try:
            await member.edit(nick=new_nickname)
            logger.info(f"Updated display name for discord username: {member.name} -> {new_nickname}")
        except discord.errors.Forbidden:
            logger.warning(f"Bot does not have permissions to update display name for discord username: {member.name}")

    async def update_roles(self, member, new_roles, logger):
        try:
            roles_to_remove = [role for role in member.roles if role.name != "@everyone"]

            if roles_to_remove:
                await member.remove_roles(*roles_to_remove)
                logger.info(f"{member.name} : Removed roles: {', '.join(role.name for role in roles_to_remove)}")
            else:
                logger.info(f"{member.name} : No roles to remove")

            if new_roles:
                await member.add_roles(*new_roles)
                logger.info(f"{member.name} : Added roles: {', '.join(role.name for role in new_roles)}")

        except discord.errors.Forbidden:
            logger.warning(f"Bot does not have permissions to update roles for discord username: {member.name}")

        except discord.errors.NotFound as e:
            logger.error(f"Role not found in the server: {e}")

    async def get_new_roles(self, member, rank_tier):
        new_roles = []
        if rank_tier in ALPHA_RANKS:
            alpha_role = discord.utils.get(member.guild.roles, name="Alpha")
            rank_role = discord.utils.get(member.guild.roles, name=rank_tier)
            verified_role = discord.utils.get(member.guild.roles, name="Verified")
            new_roles = [alpha_role, rank_role, verified_role]
        elif rank_tier in OMEGA_RANKS:
            omega_role = discord.utils.get(member.guild.roles, name="Omega")
            rank_role = discord.utils.get(member.guild.roles, name=rank_tier)
            verified_role = discord.utils.get(member.guild.roles, name="Verified")
            new_roles = [omega_role, rank_role, verified_role]
        return new_roles

    async def update_discord_roles(self, member, db_response, logger):
        global_name = member.global_name
        discord_id = int(member.id)
        discord_username = member.name

        # Find the user in db_response
        user_data = next((user for user in db_response if int(user['discord_id']) == discord_id), None)

        if user_data:
            # Safely get the rank details
            rank = user_data.get('rank_details', {}).get('data', {}).get('currenttierpatched', 'Unknown')
            rank_tier = rank.split(' ')[0]

            await self.update_nickname(member, global_name, rank_tier, logger)

            # Check for "Manual" role
            manual_role = discord.utils.get(member.guild.roles, name="Manual")
            if manual_role in member.roles:
                logger.info(f"Skipping role update for {discord_username} as they have 'Manual' role.")
                return

            new_roles = await self.get_new_roles(member, rank_tier)
            await self.update_roles(member, new_roles, logger)

        else:
            unverified_role = discord.utils.get(member.guild.roles, name="Unverified")
            new_roles = [unverified_role]
            await self.update_roles(member, new_roles, logger)

    async def main_loop(self):
        await self.client.wait_until_ready()  # Wait until the client is ready
        while True:
            try:
                guild = discord.utils.get(self.client.guilds, id=DISCORD_GUILD_ID)
                if guild:
                    db_response = await self.get_info_from_db(self.logger)
                    members = sorted(guild.members, key=lambda member: member.id)

                    for member in members:
                        if self.bot_id == 1:
                            await self.update_database_discord_data(member, db_response, self.logger)
                        else:
                            await self.update_discord_roles(member, db_response, self.logger)
                        await asyncio.sleep(0.5)

            except Exception as e:
                self.logger.error(f"Error in main loop: {e}")
            finally:
                self.logger.info("Sleeping for 15 minutes before next iteration.")
                await asyncio.sleep(15 * 60)

    async def run(self):
        await self.client.start(DISCORD_BOT_TOKEN_1 if self.bot_id == 1 else DISCORD_BOT_TOKEN_2)


# Initialize the bots
bot1 = DiscordBotBackgroundRunner(bot_id=1)
bot2 = DiscordBotBackgroundRunner(bot_id=2)
