import asyncio
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi_discord import RateLimited, Unauthorized
from fastapi_discord.exceptions import ClientSessionNotInitialized
from starlette.middleware.sessions import SessionMiddleware

from db import connect_db, disconnect_db
from routes.discord import discord_router
from routes.valorant import valorant
from utils.discord_bots import bot1, bot2
from utils.update_data import UpdateAllUsersBackgroundRunner

app = FastAPI()

update_all_users_runner = UpdateAllUsersBackgroundRunner()

# Configure allowed origins for CORS
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1",
    "https://valorantsl.com",
    "https://www.valorantsl.com",
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Session middleware
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET_KEY"),
)


@app.on_event("startup")
def on_startup():
    connect_db()


@app.on_event('startup')
async def update_users_on_startup():
    asyncio.create_task(update_all_users_runner.run_update_all_users())


@app.on_event('startup')
async def start_bots_on_startup():
    asyncio.create_task(bot1.run())
    asyncio.create_task(bot2.run())


@app.on_event("shutdown")
def on_shutdown():
    disconnect_db()


# Include routers
app.include_router(discord_router)
app.include_router(valorant)


# Exception Handlers
@app.exception_handler(Unauthorized)
async def unauthorized_error_handler(_, __):
    return JSONResponse({"error": "Unauthorized"}, status_code=401)


@app.exception_handler(RateLimited)
async def rate_limit_error_handler(_, e: RateLimited):
    return JSONResponse(
        {"error": "RateLimited", "retry": e.retry_after, "message": e.message},
        status_code=429,
    )


@app.exception_handler(ClientSessionNotInitialized)
async def client_session_error_handler(_, e: ClientSessionNotInitialized):
    print(e)
    return JSONResponse({"error": "Internal Error"}, status_code=500)
