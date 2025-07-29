import os

import streamlit as st

from utils.api import get_discord_user_details, check_discord_exists, get_discord_login_url, save_user_data

DISCORD_SERVER_INVITE = os.getenv("DISCORD_SERVER_INVITE")
st.set_page_config(
    page_title="Register - SL Valorant Leaderboard",
    page_icon="https://i.ibb.co/dpPsHQg/valsl.jpg"
)

st.title("Registration")
st.subheader('1. Login with Discord')

# Check if the URL has the OAuth callback parameters
query_params = st.query_params
access_token = query_params.get("access_token")

if access_token:
    # If access token is present in the URL, fetch user details
    user_details = get_discord_user_details(access_token)
    if user_details:
        st.write("User Details:", user_details)
    else:
        st.error("Failed to retrieve user details.")

    user_exists = check_discord_exists(user_details.get('id'))
    if user_exists:
        st.error("User already exists in the database.")
    else:
        st.subheader("2. Enter Riot PUUID ")
        st.markdown(
            """
            <a href="https://docs.google.com/document/d/e/2PACX-1vQMM-QwU743I9eq4ETtFDvfgkm5kgyRSPGUOlS-8PEAsqpeDNkuBMNDSJq19Zckbk4k5I6nCeU0M68I/pub" target="_blank" style="display: inline-block; margin-bottom: 1rem;">
                How do I find my Riot PUUID?
            </a>
            """,
            unsafe_allow_html=True
        )
        #         text field for puuid with a submit button
        puuid = st.text_input("Enter your Riot PUUID:")
        if st.button("Submit"):
            if puuid:
                with st.spinner('Checking user data...'):
                    response = save_user_data(puuid, user_details.get('id'), user_details.get('username'))
                    if response:
                        if response.get('detail'):
                            st.error(response.get('detail'))
                        else:
                            st.write("User registered successfully! The leaderboard will update in 30 minutes.")
                            st.write(response)
                            st.markdown(f"[Join the Discord server!]({DISCORD_SERVER_INVITE})")
                    else:
                        st.error("Failed to save user data.")
            else:
                st.error("Please enter your Riot PUUID.")

else:
    # If no access token, show the login button
    discord_login_url = get_discord_login_url()
    if discord_login_url:
        st.markdown(f'''
               <a href="{discord_login_url}" target="_self" style="text-decoration:none;">
                   <img src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.svg" alt="Discord Logo" style="width:20px;height:20px;margin-right:10px;">
                   Login with Discord
               </a>
           ''', unsafe_allow_html=True)
    else:
        st.error("Failed to retrieve Discord login URL.")

# Add GitHub link with logo at the bottom of the page
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
