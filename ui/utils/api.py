from datetime import timedelta

import requests
import streamlit as st


@st.cache_data(ttl=timedelta(minutes=30))
def fetch_leaderboard_data(page, page_size):
    response = requests.get(f"http://fastapi:8000/valorant/leaderboard?page={page}&page_size={page_size}")
    leaderboard_data = response.json()
    total_count = int(response.headers.get("X-Total-Count", 0))
    return leaderboard_data, total_count


def get_discord_login_url():
    response = requests.get("http://fastapi:8000/discord/login")
    if response.status_code == 200:
        return response.json().get('url')
    return None


# Function to get the user details using the access token
def get_discord_user_details(access_token):
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get("http://fastapi:8000/discord/user", headers=headers)
    if response.status_code == 200:
        minified_user = {
            "id": response.json().get('id'),
            "username": response.json().get('username'),
        }
        return minified_user
    return None


def check_discord_exists(discord_id):
    response = requests.get(f"http://fastapi:8000/discord/{discord_id}")
    if response:
        return response.json()
    return None


def save_user_data(puuid, discord_id, discord_username):
    response = requests.post(f"http://fastapi:8000/valorant/rank/{puuid}/{discord_id}/{discord_username}/")
    if response.status_code == 200:
        riot_name = f"{response.json().get('name')} #{response.json().get('tag')}"
        elo = response.json().get('rank_details').get('data').get('elo')
        rank = response.json().get('rank_details').get('data').get('currenttierpatched')
        minified_data = {
            "riot_name": riot_name,
            "elo": elo,
            "rank": rank
        }
        return minified_data
    elif response.status_code == 400:
        return response.json()
    return None
