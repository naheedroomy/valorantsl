import asyncio
import os
from contextlib import asynccontextmanager

import aiohttp
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

update_all_users_runner = UpdateAllUsersBackgroundRunner()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    connect_db()
    session = aiohttp.ClientSession()
    app.state.http_session = session
    asyncio.create_task(update_all_users_runner.run_update_all_users(session))
    asyncio.create_task(bot1.run(session))
    asyncio.create_task(bot2.run(session))
    yield
    # Shutdown
    await session.close()
    disconnect_db()


app = FastAPI(lifespan=lifespan)

# Configure allowed origins for CORS
allowed_origins = [
    "http://localhost:8501",
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
