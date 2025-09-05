# Valorant Sri Lanka Leaderboard - External URLs Report

## Project Overview

**Valorant Sri Lanka Leaderboard** (www.valorantsl.com) is a comprehensive leaderboard system for Valorant players in Sri Lanka. The system features:

- **FastAPI Backend**: Handles user registration, rank updates, and leaderboard data
- **Streamlit Frontend**: User interface for registration and leaderboard viewing
- **Discord Integration**: OAuth2 authentication and Discord bots for role management
- **MongoDB Storage**: Stores player data, ranks, and Discord information
- **Automated Updates**: Ranks updated every 30 minutes using external APIs

### Sample Database Document Structure
The MongoDB stores player information in the following format:
```json
{
  "_id": "6679d66401d6c46c00b9962a",
  "puuid": "124f65b6-bb3c-54e6-9661-f3cf05058379",
  "name": "Cold Harbor",
  "tag": "sever",
  "region": "eu",
  "discord_id": "366412698600210432",
  "discord_username": "elemental5920",
  "rank_details": {
    "status": 200,
    "data": {
      "currenttier": 21,
      "currenttierpatched": "Ascendant 1",
      "images": {
        "small": "https://media.valorant-api.com/competitivetiers/.../smallicon.png",
        "large": "https://media.valorant-api.com/competitivetiers/.../largeicon.png"
      },
      "ranking_in_tier": 27,
      "mmr_change_to_last_game": -15,
      "elo": 1827
    }
  }
}
```

## External URLs and APIs

### 1. Henrik's Unofficial Valorant API
**Primary data source for Valorant player information**

- **Base URL**: `https://api.henrikdev.xyz`
- **Authentication**: API token via `Authorization` header
- **Rate Limiting**: 2.5-second delay between requests

**Endpoints Used:**
- `GET /valorant/v1/by-puuid/account/{puuid}` - Retrieve account details (name, tag, region)
- `GET /valorant/v3/by-puuid/mmr/{region}/pc/{puuid}` - Get current rank (newer endpoint)
- `GET /valorant/v1/by-puuid/mmr/{region}/{puuid}` - Get current rank (legacy endpoint)
- `GET /valorant/v1/by-puuid/mmr-history/{region}/{puuid}` - Retrieve match history for timestamp data

**Usage Locations:**
- `routes/valorant.py:16` - Base URL definition
- `routes/valorant.py:32, 41, 79, 88, 196-198, 257-259` - API endpoint calls

### 2. Discord OAuth2 & API
**User authentication and Discord bot functionality**

- **OAuth2 Flow**: Handled by `fastapi_discord` library
- **Scopes**: `identify`, `email`
- **Redirect URIs**: Configurable via environment variables

**Configuration:**
- `DISCORD_CLIENT_ID` - Discord application client ID
- `DISCORD_CLIENT_SECRET` - Discord application secret
- `DISCORD_REDIRECT_URI` - OAuth callback URL
- `CALLBACK_REDIRECT_URI` - Frontend redirect after authentication

**Usage Locations:**
- `routes/discord.py:24-26` - OAuth client initialization
- `routes/discord.py:38` - OAuth login URL generation
- `routes/discord.py:43-46` - Token exchange and callback handling

### 3. Valorant Media API (CDN)
**Official Valorant rank images and assets**

- **Base URL**: `https://media.valorant-api.com`
- **Content**: Competitive tier images (rank icons)

**Image Types:**
- Small icons: `/competitivetiers/{tier-id}/{rank}/smallicon.png`
- Large icons: `/competitivetiers/{tier-id}/{rank}/largeicon.png`
- Triangle icons: `/competitivetiers/{tier-id}/{rank}/ranktriangleupicon.png`
- Triangle down icons: `/competitivetiers/{tier-id}/{rank}/ranktriangledownicon.png`

**Usage**: Images are retrieved automatically through Henrik's API responses and stored in MongoDB.

### 4. Tracker.gg
**External Valorant profile links**

- **URL Pattern**: `https://tracker.gg/valorant/profile/riot/{name}%23{tag}/overview`
- **Purpose**: Provides detailed player statistics and match history

**Usage Locations:**
- `ui/utils/helpers.py:9` - Profile link generation for leaderboard

### 5. Discord CDN
**Discord branding assets**

- **Discord Logo**: `https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.svg`

**Usage Locations:**
- `ui/pages/Registration.py:65` - Discord OAuth button styling

### 6. Image Hosting (ImgBB)
**Application favicon and branding**

- **Site Logo**: `https://i.ibb.co/dpPsHQg/valsl.jpg`

**Usage Locations:**
- `ui/Leaderboard.py:10` - Streamlit page icon
- `ui/pages/Registration.py:10` - Streamlit page icon

### 7. GitHub
**Source code repository and branding**

- **Repository**: `https://github.com/naheedroomy/valorantsl`
- **GitHub Logo**: `https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg`

**Usage Locations:**
- `ui/Leaderboard.py:103-104` - Footer source code link
- `ui/pages/Registration.py:76-77` - Footer source code link

### 8. Google Docs
**Documentation and guides**

- **PUUID Guide**: `https://docs.google.com/document/d/e/2PACX-1vQMM-QwU743I9eq4ETtFDvfgkm5kgyRSPGUOlS-8PEAsqpeDNkuBMNDSJq19Zckbk4k5I6nCeU0M68I/pub`

**Usage Locations:**
- `ui/pages/Registration.py:35` - Link to PUUID finding documentation

### 9. MongoDB Atlas
**Primary database storage**

- **Connection**: Via environment variables
  - `MONGO_HOST` - Database host
  - `MONGO_USERNAME` - Database username  
  - `MONGO_PASSWORD` - Database password
- **Purpose**: Stores all player data, ranks, and Discord information

### 10. Internal Service URLs

**Development/Local:**
- `http://localhost:8000` - FastAPI backend
- `http://localhost:8501` - Streamlit frontend
- `http://fastapi:8000` - Docker internal API communication

**Production:**
- `https://valorantsl.com` - Primary domain
- `https://www.valorantsl.com` - WWW subdomain

**Usage Locations:**
- `app.py:23-26` - CORS allowed origins
- `routes/discord.py:16-17` - OAuth redirect URIs
- `utils/update_data.py:8` - Internal API communication
- `ui/utils/api.py:7` - Frontend API communication

## Data Flow Architecture

```
User Registration:
Discord OAuth2 → Backend → Valorant API → MongoDB

Rank Updates:
Scheduled Task → Valorant API → MongoDB → Discord Bot Role Updates

Leaderboard Display:
Frontend → Backend → MongoDB → UI with External Links (Tracker.gg)
```

## Security Considerations

### API Keys and Tokens
- `HENRIK_API_TOKEN` - Henrik's Valorant API authentication
- `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` - Discord OAuth2 credentials
- `DISCORD_BOT_TOKEN_1` / `DISCORD_BOT_TOKEN_2` - Discord bot tokens
- `SESSION_SECRET_KEY` - Application session security

### Rate Limiting
- 2.5-second delay between Valorant API requests to avoid rate limits
- OAuth2 token refresh handling for Discord authentication

### Environment Configuration
All sensitive URLs and API keys are stored in environment variables, with examples provided in `.env.example`.

## Summary

The Valorant Sri Lanka Leaderboard integrates with **10 external services** to provide a comprehensive gaming leaderboard experience:

1. **Henrik's Valorant API** - Primary data source
2. **Discord OAuth2** - Authentication
3. **Valorant Media CDN** - Rank images  
4. **Tracker.gg** - External profiles
5. **Discord CDN** - UI assets
6. **ImgBB** - Application branding
7. **GitHub** - Source code repository
8. **Google Docs** - User documentation
9. **MongoDB Atlas** - Database storage
10. **Internal Services** - Application architecture

The system is designed with proper separation of concerns, secure API key management, and appropriate rate limiting to ensure reliable operation while respecting external service limitations.