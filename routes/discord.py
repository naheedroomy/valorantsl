import json
import os

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.responses import RedirectResponse
from fastapi_discord import DiscordOAuthClient, User

from models.db.valorant import MongoAccountResponseModel

# Load Discord OAuth2 Configuration from environment variables
DISCORD_CLIENT_ID = os.getenv('DISCORD_CLIENT_ID')
DISCORD_CLIENT_SECRET = os.getenv('DISCORD_CLIENT_SECRET')
DISCORD_ENV = os.getenv('DISCORD_ENV', 'test')

DISCORD_REDIRECT_URI = os.getenv('DISCORD_REDIRECT_URI', 'http://localhost:8000/discord/callback')

# Check if environment variables are set
if not DISCORD_CLIENT_ID or not DISCORD_CLIENT_SECRET:
    raise EnvironmentError("Missing Discord client ID or secret. Please set the environment variables.")

# Initialize Discord OAuth Client
discord = DiscordOAuthClient(
    DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI, ("identify", "email")
)

discord_router = APIRouter(prefix="/discord", tags=["discord"])


@discord_router.on_event("startup")
async def on_startup():
    await discord.init()


@discord_router.get("/login")
async def login():
    return {"url": discord.oauth_login_url}


@discord_router.get("/callback")
async def callback(request: Request, code: str):
    token, refresh_token = await discord.get_access_token(code)
    # Redirect to the React app with the token in the query parameters
    redirect_url = f"http://localhost:8501/Registration?access_token={token}&refresh_token={refresh_token}"
    return RedirectResponse(url=redirect_url)


@discord_router.get("/user", dependencies=[Depends(discord.requires_authorization)], response_model=User)
async def get_user(user: User = Depends(discord.user)):
    return user


@discord_router.get("/{discord_id}")
async def get_discord_user(discord_id: int):
    user = MongoAccountResponseModel.objects(
        discord_id=discord_id
    )
    if user:
        return JSONResponse(content=json.loads(user.to_json()))
    return None
