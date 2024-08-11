# Valorant Sri Lanka Leaderboard (www.valorantsl.com)

## Overview

This project is a comprehensive leaderboard system for Valorant players in Sri Lanka, featuring a FastAPI backend and a Streamlit frontend for ease of use. It allows users to register using their Discord accounts and Riot PUUID, and integrates with MongoDB hosted on MongoAtlas. Additionally, it includes two Discord bots that manage and update user information and roles within the Leaderboard Discord server.

Entire project (apart from the database) is hosted using AWS LightSail.

## Features

- **User Registration**: Users can register on the website using their Discord accounts via OAuth2 and their Riot PUUID.
- **Leaderboard**: Displays a real-time leaderboard of players in Sri Lanka.
- **Discord Bots**: 
  - Tracks members of the Leaderboard Discord server.
  - Updates usernames in the server based on ranks.
  - Updates roles based on ranks, providing different channel access based on ranks.
- **Automated Rank Updates**: Ranks are updated every 30 minutes using the [unofficial-valorant-api](https://github.com/Henrik-3/unofficial-valorant-api).

## Technologies Used

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/)
- **Frontend**: [Streamlit](https://streamlit.io/)
- **Database**: [MongoDB](https://www.mongodb.com/) (hosted on [MongoAtlas](https://www.mongodb.com/cloud/atlas))
- **Discord Bots**: [discord.py](https://discordpy.readthedocs.io/en/stable/)
- **Valorant API**: [unofficial-valorant-api](https://github.com/Henrik-3/unofficial-valorant-api)

## Project Structure

- `/`: Contains the FastAPI backend code.
- `ui/`: Contains the Streamlit frontend code.
- `utils/`: Contains the code for the Discord bots, and updating users.
- `database/`: Configuration MongoDB.
- `.env.example`: Example environment file for sensitive configurations.

## Docker and Deployment

Both the FastAPI backend and Streamlit frontend are dockerized. GitHub Actions are set up to automatically rebuild the Docker images and deploy the application upon a push to the main branch. This process is specified in the `.github/workflows/deploy.yml` file.

## Usage

- Visit the website and register using your Discord account and Riot PUUID.
- Check the leaderboard to see the top Valorant players in Sri Lanka.
- Join the Discord server to interact with other players and see your rank reflected in your username and roles. (and compete within the server)

## Credits

- [Henrik-3/unofficial-valorant-api](https://github.com/Henrik-3/unofficial-valorant-api) for providing the API used to fetch Valorant data.

## Contributing

This is a personal project for my portfolio, and the code is available for transparency. Contributions and feedback are welcome!

## Contact

If you have any questions or suggestions, feel free to reach out at [nroomy1@gmail.com](mailto:nroomy1@gmail.com).

---
