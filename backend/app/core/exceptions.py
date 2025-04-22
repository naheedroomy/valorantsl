from fastapi.responses import JSONResponse
from fastapi_discord import RateLimited, Unauthorized
from fastapi_discord.exceptions import ClientSessionNotInitialized
from fastapi import FastAPI

def register_exception_handlers(app: FastAPI):
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
