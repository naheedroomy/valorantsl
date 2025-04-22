import mongoengine
import os

MONGO_PASSWORD = os.getenv('MONGO_PASSWORD')
MONGO_HOST = os.getenv('MONGO_HOST')
MONGO_USERNAME = os.getenv('MONGO_USERNAME')

def connect_db():
    mongoengine.connect(host=f"mongodb+srv://{MONGO_USERNAME}:{MONGO_PASSWORD}@{MONGO_HOST}?retryWrites=true&w=majority")


def disconnect_db():
    mongoengine.disconnect()
