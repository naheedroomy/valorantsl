import streamlit as st

from utils.api import fetch_leaderboard_data
from utils.constants import DISCORD_SERVER_INVITE
from utils.helpers import process_leaderboard_data

# Set the page configuration
st.set_page_config(
    page_title="SL Valorant Leaderboard",
    page_icon="https://i.ibb.co/dpPsHQg/valsl.jpg"
)


def show_leaderboard():
    st.title("Sri Lanka Valorant Leaderboard")
    st.write(
        "To register yourself on the leaderboard, click on the 'Register' Button on the sidebar. "
        "\nThe leaderboard is updated every 30 minutes.")
    st.markdown(f"[Join the Discord server!]({DISCORD_SERVER_INVITE})")

    # Custom CSS for column widths and styling
    st.markdown(
        """
        <style>
        .dataframe tbody tr th:only-of-type {
            vertical-align: left;
        }

        .dataframe tbody tr th {
            vertical-align: top;
        }

        .dataframe thead th {
            text-align: left;
        }

        .dataframe td {
            text-align: left;  /* Center-align the text of all rows by default */
        }

        .dataframe td:nth-child(2) {  /* Left-align the text of the username column */
            text-align: left;
            width: 300px;
        }

        .dataframe td:nth-child(3) {  /* Adjust the index to target specific columns */
            width: 300px;
        }

        .dataframe td:nth-child(4) {  /* Adjust the index to target specific columns */
            width: 300px;
        }

        .dataframe a {
            color: white;  /* Keep the hyperlink color white */
            text-decoration: none;
        }

        .dataframe tbody tr:hover {
            background-color: white !important;
            color: black !important;
        }

        .dataframe tbody tr:hover a {
            color: black !important;
        }
        </style>
        """,
        unsafe_allow_html=True
    )

    # Pagination controls
    page = st.session_state.get('page', 1)
    page_size = 75

    # Fetch data
    leaderboard_data, total_count = fetch_leaderboard_data(page, page_size)
    start_index = (page - 1) * page_size + 1
    leaderboard_df = process_leaderboard_data(leaderboard_data, start_index)

    total_pages = (total_count + page_size - 1) // page_size

    if not leaderboard_df.empty:
        # Display leaderboard
        st.write(leaderboard_df.to_html(escape=False, index=False), unsafe_allow_html=True)

        # Pagination buttons
        cols = st.columns(3)
        if cols[0].button("Previous") and page > 1:
            st.session_state.page = page - 1
            st.rerun()
        cols[1].write(f"Page {page} of {total_pages}")
        if cols[2].button("Next") and page < total_pages:
            st.session_state.page = page + 1
            st.rerun()
    else:
        st.write("No data available for this page.")


if __name__ == "__main__":
    show_leaderboard()
