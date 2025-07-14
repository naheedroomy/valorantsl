import pandas as pd
import streamlit as st


def process_leaderboard_data(data, start_index):
    leaderboard = []
    for i, player in enumerate(data, start=start_index):
        details = player['rank_details']['data']
        username_with_tag = f"{player['name']}#{player['tag']}"
        profile_link = f"https://tracker.gg/valorant/profile/riot/{player['name']}%23{player['tag']}/overview"

        leaderboard.append({
            '': i,  # Index column
            'Username': f'<a href="{profile_link}" target="_blank" title="{username_with_tag}">{player["name"]}</a>',
            'Elo': details['elo'],
            'Rank': details['currenttierpatched']
        })

    return pd.DataFrame(leaderboard)


def show_github_link():
    """Displays the 'View Source on GitHub' link."""
    st.markdown(
        """
        <div style='text-align: center; margin-top: 50px;'>
            <a href='https://github.com/naheedroomy/valorantsl' target='_blank'> View Source on GitHub 
                <img src='https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg' alt='GitHub logo' width='50' />
            </a>
        </div>
        """,
        unsafe_allow_html=True
    )
