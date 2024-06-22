from datetime import timedelta

import requests
import streamlit as st


@st.cache_data(ttl=timedelta(minutes=30))
def fetch_leaderboard_data(page, page_size):
    response = requests.get(f"http://0.0.0.0:8000/valorant/leaderboard?page={page}&page_size={page_size}")
    leaderboard_data = response.json()
    total_count = int(response.headers.get("X-Total-Count", 0))
    return leaderboard_data, total_count
