from datetime import datetime

from mongoengine import Document, StringField, IntField, EmbeddedDocument, EmbeddedDocumentField, URLField, BooleanField, DateTimeField


class MongoImagesModel(EmbeddedDocument):
    small = URLField()
    large = URLField()
    triangle_down = URLField()
    triangle_up = URLField()


class MongoRankDetailsDataModel(EmbeddedDocument):
    currenttier = IntField()
    currenttierpatched = StringField()
    images = EmbeddedDocumentField(MongoImagesModel)
    ranking_in_tier = IntField()
    mmr_change_to_last_game = IntField()
    elo = IntField()
    name = StringField()
    tag = StringField()
    old = BooleanField()
    # New fields:
    elo_last_changed_time = IntField(default=0)  # stores elapsed time (in seconds, for example)
    last_elo_change_timestamp = DateTimeField(default=datetime.utcnow)


class MongoRankDetailsModel(EmbeddedDocument):
    status = IntField()
    data = EmbeddedDocumentField(MongoRankDetailsDataModel)


class MongoAccountResponseModel(Document):
    meta = {'collection': 'user_leaderboard_complete'}
    puuid = StringField(required=True, unique=True)
    name = StringField(required=True)
    tag = StringField(required=True)
    region = StringField(required=True)
    discord_id = IntField(required=True)
    discord_username = StringField(required=True, unique=True)
    rank_details = EmbeddedDocumentField(MongoRankDetailsModel)
