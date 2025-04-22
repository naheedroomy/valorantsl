import asyncio
from fastapi import FastAPI

from backend.app.db import connect_db, disconnect_db
from backend.app.api.discord import discord_router
from backend.app.api.valorant import valorant
from backend.app.services.discord_bots import bot1, bot2
from backend.app.services.update_data import UpdateAllUsersBackgroundRunner
from backend.app.core.middleware import add_middlewares
from backend.app.core.exceptions import register_exception_handlers

app = FastAPI()
update_all_users_runner = UpdateAllUsersBackgroundRunner()

# Add middleware and exception handlers
add_middlewares(app)
register_exception_handlers(app)

@app.on_event("startup")
def on_startup():
    connect_db()

@app.on_event("startup")
async def update_users_on_startup():
    asyncio.create_task(update_all_users_runner.run_update_all_users())

@app.on_event("startup")
async def start_bots_on_startup():
    asyncio.create_task(bot1.run())
    asyncio.create_task(bot2.run())

@app.on_event("shutdown")
def on_shutdown():
    disconnect_db()

# Routers
app.include_router(discord_router)
app.include_router(valorant)
