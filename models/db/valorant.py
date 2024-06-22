from mongoengine import Document, StringField, IntField, EmbeddedDocument, EmbeddedDocumentField, URLField, BooleanField


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


class MongoRankDetailsModel(EmbeddedDocument):
    status = IntField()
    data = EmbeddedDocumentField(MongoRankDetailsDataModel)


class MongoAccountResponseModel(Document):
    meta = {'collection': 'test_user_leaderboard'}
    puuid = StringField(required=True, unique=True)
    name = StringField(required=True)
    tag = StringField(required=True)
    region = StringField(required=True)
    rank_details = EmbeddedDocumentField(MongoRankDetailsModel)
