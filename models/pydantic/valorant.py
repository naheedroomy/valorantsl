from pydantic import BaseModel


class ImagesModel(BaseModel):
    small: str
    large: str
    triangle_down: str
    triangle_up: str


class RankDetailsDataModel(BaseModel):
    currenttier: int
    currenttierpatched: str
    images: ImagesModel
    ranking_in_tier: int
    mmr_change_to_last_game: int
    elo: int
    name: str
    tag: str
    old: bool


class RankDetailsModel(BaseModel):
    status: int
    data: RankDetailsDataModel


class AccountResponseModel(BaseModel):
    puuid: str
    name: str
    tag: str
    region: str
    rank_details: RankDetailsModel


class SavedAccountResponseModel(BaseModel):
    puuid: str
    name: str
    tag: str
    region: str
    rank_details: RankDetailsModel
    discord_id: int
    discord_username: str
    discord_global_username: str
