import os

ALLOWED_ORIGINS = [
    "http://localhost:8501",
    "http://127.0.0.1",
    "https://valorantsl.com",
    "https://www.valorantsl.com",
]

SESSION_SECRET_KEY = os.getenv("SESSION_SECRET_KEY", "default_dev_key")