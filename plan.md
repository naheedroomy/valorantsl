# Valorant Sri Lanka Leaderboard Enhancement Plan

## Overview
This document outlines comprehensive improvements to enhance the Valorant Sri Lanka Leaderboard using the full capabilities of the HenrikAPI. The suggestions are based on available API endpoints and aim to transform the current basic leaderboard into a feature-rich competitive gaming platform.

## Current Implementation Analysis

### Existing Features
- Basic leaderboard with ELO ranking
- Discord OAuth2 registration
- Automated rank updates every 30 minutes
- Discord bot role management
- Simple player registration via PUUID

### Current API Usage
- `GET /valorant/v1/by-puuid/account/{puuid}` - Account details
- `GET /valorant/v3/by-puuid/mmr/{region}/pc/{puuid}` - Current rank (v3)
- `GET /valorant/v1/by-puuid/mmr/{region}/{puuid}` - Current rank (v1, deprecated)
- `GET /valorant/v1/by-puuid/mmr-history/{region}/{puuid}` - MMR history

## Enhancement Suggestions

### 1. Match History & Performance Analytics 🔥 **HIGH PRIORITY**

#### Implementation Details:
**New API Endpoints to Integrate:**
- `GET /valorant/v3/matches/{region}/{name}/{tag}` - Get match list
- `GET /valorant/v4/matches/{region}/{platform}/{name}/{tag}` - Enhanced match list
- `GET /valorant/v3/by-puuid/matches/{region}/{puuid}` - Match list by PUUID
- `GET /valorant/v4/match/{region}/{matchid}` - Detailed match data

**Features to Add:**
```python
# New API routes to implement
@valorant.get("/matches/{puuid}")
async def get_player_matches(puuid: str, limit: int = 20):
    # Fetch recent matches for player profile
    
@valorant.get("/match-details/{match_id}")
async def get_match_details(match_id: str):
    # Get detailed match breakdown
    
@valorant.get("/player-stats/{puuid}")
async def get_player_statistics(puuid: str):
    # Calculate aggregate statistics from matches
```

**UI Components:**
- Player profile page with match history grid
- Match details modal with round-by-round breakdown
- Performance charts (K/D trends, win rate, agent usage)
- Comparison tools between players

**Database Enhancements:**
```python
# New MongoDB collections
class MatchModel(Document):
    match_id = StringField(required=True, unique=True)
    puuid = StringField(required=True)
    map_name = StringField()
    game_mode = StringField()
    rounds_played = IntField()
    team_score = IntField()
    enemy_score = IntField()
    player_stats = EmbeddedDocumentField(PlayerMatchStats)
    match_date = DateTimeField()

class PlayerMatchStats(EmbeddedDocument):
    kills = IntField()
    deaths = IntField()
    assists = IntField()
    damage_dealt = IntField()
    agent_name = StringField()
    # ... more fields
```

### 2. Enhanced MMR Tracking 🔥 **HIGH PRIORITY**

#### Current Issues:
- Using deprecated v1 MMR endpoint
- Limited MMR history visualization

#### Improvements:
**API Upgrade:**
```python
# Replace deprecated v1 endpoints
# OLD: GET /valorant/v1/by-puuid/mmr/{region}/{puuid}
# NEW: GET /valorant/v3/by-puuid/mmr/{region}/{platform}/{puuid}

# Enhanced MMR history
# USE: GET /valorant/v2/by-puuid/mmr-history/{region}/{platform}/{puuid}
```

**New Features:**
- MMR progression charts using Chart.js or similar
- Peak rank tracking and achievements
- Seasonal comparisons
- RR gain/loss pattern analysis
- Prediction models for next rank

**Implementation Example:**
```python
@valorant.get("/mmr-analysis/{puuid}")
async def get_mmr_analysis(puuid: str):
    """Enhanced MMR analytics including trends and predictions"""
    # Fetch detailed MMR history
    # Calculate trends, peaks, predictions
    # Return comprehensive analytics
```

### 3. Platform Support (Console Integration) 🎮 **MEDIUM PRIORITY**

#### Current Limitation:
- Only supports PC players
- Missing console player base

#### Enhancement:
```python
# Support for console platforms
SUPPORTED_PLATFORMS = ["pc", "console"]

@valorant.post("/rank/{puuid}/{platform}/{discord_id}/{discord_username}/")
async def save_rank_details_multi_platform(
    puuid: str,
    platform: str,  # New parameter
    discord_id: int,
    discord_username: str
):
    # Updated to handle console players
```

**Database Updates:**
```python
class MongoAccountResponseModel(Document):
    # ... existing fields
    platform = StringField(choices=SUPPORTED_PLATFORMS, default="pc")
    # ... rest of model
```

### 4. Advanced Leaderboard Features 📊 **HIGH PRIORITY**

#### New Leaderboard Categories:
```python
@valorant.get("/leaderboard/weekly")
async def get_weekly_leaderboard():
    # Players with most RR gained this week
    
@valorant.get("/leaderboard/rising-stars")
async def get_rising_stars():
    # Players with highest rank improvement
    
@valorant.get("/leaderboard/by-agent/{agent_name}")
async def get_agent_leaderboard(agent_name: str):
    # Best players for specific agents
    
@valorant.get("/leaderboard/filtered")
async def get_filtered_leaderboard(
    min_rank: int = None,
    max_rank: int = None,
    platform: str = None,
    last_active_days: int = 30
):
    # Advanced filtering options
```

#### UI Enhancements:
- Dropdown filters for rank tiers
- Toggle between different leaderboard types
- Search functionality
- Export leaderboard data

### 5. Player Statistics Dashboard 📈 **MEDIUM PRIORITY**

#### Individual Player Analytics:
```python
@valorant.get("/analytics/player/{puuid}")
async def get_player_analytics(puuid: str):
    """Comprehensive player analytics dashboard"""
    return {
        "career_stats": calculate_career_statistics(puuid),
        "agent_performance": get_agent_statistics(puuid),
        "map_performance": get_map_statistics(puuid),
        "recent_trends": calculate_performance_trends(puuid),
        "comparisons": get_rank_benchmarks(puuid)
    }
```

#### New Calculated Metrics:
- **Consistency Rating**: Standard deviation of performance
- **Clutch Percentage**: 1vX situation win rate
- **First Blood Rate**: Percentage of rounds with first kill
- **KAST**: Kill, Assist, Survive, Trade percentage
- **Average Damage Per Round**: Consistent damage output

### 6. Content Integration 🎨 **LOW PRIORITY**

#### Using Content API:
```python
@valorant.get("/content/seasons")
async def get_seasons():
    # Get current and past competitive seasons
    
@valorant.get("/content/agents")
async def get_agents():
    # Get all agent information
    
@valorant.get("/content/maps")
async def get_maps():
    # Get all map information
```

#### Player Cosmetics Display:
- Current battle pass progress
- Equipped player cards
- Favorite agents and skins
- Collection completion rates

### 7. Search & Discovery 🔍 **MEDIUM PRIORITY**

#### Enhanced Search Features:
```python
@valorant.get("/search/players")
async def search_players(
    query: str,
    platform: str = "pc",
    limit: int = 10
):
    """Search players by name, tag, or partial matches"""
    # Implement fuzzy search
    # Return ranked results
```

#### Discovery Features:
- "Players Near Your Rank" suggestions
- "Most Active Players" this week
- "Similar Performance" player recommendations
- Regional statistics and comparisons

### 8. Performance Optimization ⚡ **HIGH PRIORITY**

#### Current Issues:
- No caching mechanism
- 2.5s delay between API calls (inefficient)
- No batch processing

#### Improvements:
```python
# Redis caching implementation
import redis
import json
from datetime import timedelta

redis_client = redis.Redis(host='localhost', port=6379, db=0)

@valorant.get("/leaderboard-cached")
async def get_cached_leaderboard():
    cache_key = "leaderboard:all"
    cached_data = redis_client.get(cache_key)
    
    if cached_data:
        return json.loads(cached_data)
    
    # Fetch fresh data
    leaderboard = await get_leaderboard()
    
    # Cache for 5 minutes
    redis_client.setex(
        cache_key, 
        timedelta(minutes=5), 
        json.dumps(leaderboard)
    )
    
    return leaderboard
```

#### Batch Processing:
```python
async def batch_update_players(puuid_list: List[str]):
    """Update multiple players efficiently"""
    async with aiohttp.ClientSession() as session:
        tasks = []
        for puuid in puuid_list:
            task = update_single_player(session, puuid)
            tasks.append(task)
        
        # Process in batches of 10 to respect rate limits
        for i in range(0, len(tasks), 10):
            batch = tasks[i:i+10]
            await asyncio.gather(*batch)
            await asyncio.sleep(1)  # Rate limiting
```

### 9. Mobile & UI Enhancements 📱 **MEDIUM PRIORITY**

#### Responsive Design:
- Convert Streamlit to FastAPI + React/Vue frontend
- Progressive Web App (PWA) capabilities
- Mobile-first design approach
- Offline functionality for cached data

#### New UI Components:
```jsx
// Example React components
<PlayerCard player={playerData} />
<MatchHistoryGrid matches={matchHistory} />
<RankProgressChart mmrHistory={mmrData} />
<AgentPerformanceRadar agentStats={agentData} />
<LeaderboardFilters onFilterChange={handleFilter} />
```

### 10. Social Features 👥 **LOW PRIORITY**

#### Community Features:
```python
@valorant.post("/teams/create")
async def create_team(team_data: TeamModel):
    # Create team/clan functionality
    
@valorant.get("/tournaments/active")
async def get_active_tournaments():
    # Community tournament system
    
@valorant.post("/players/{puuid}/follow")
async def follow_player(puuid: str, follower_id: int):
    # Player following system
```

## Implementation Roadmap

### Phase 1 (Immediate - 2-4 weeks) 🔥
1. **Upgrade MMR endpoints** to v3 (remove deprecated v1)
2. **Add match history** integration
3. **Implement caching** with Redis
4. **Create player profile** pages
5. **Add basic filtering** to leaderboard

### Phase 2 (Short-term - 1-2 months) 📊
1. **Statistics dashboard** with calculated metrics
2. **Console platform** support
3. **Advanced leaderboard** categories
4. **Search and discovery** features
5. **Performance analytics** and trends

### Phase 3 (Long-term - 3-6 months) 🎨
1. **Frontend overhaul** (React/Vue)
2. **Mobile optimization** and PWA
3. **Social features** and community tools
4. **Content integration** (cosmetics, seasons)
5. **Advanced analytics** and ML predictions

## Technical Requirements

### New Dependencies:
```python
# Backend additions
redis>=4.0.0
celery>=5.2.0  # For background tasks
pandas>=1.5.0  # For data analysis
numpy>=1.21.0  # For calculations

# Frontend (if migrating from Streamlit)
fastapi-users>=10.0.0
jinja2>=3.1.0
```

### Infrastructure Needs:
- Redis server for caching
- Celery worker for background tasks
- Additional database indexes for performance
- CDN for static assets (if adding images)

### Database Optimizations:
```python
# New indexes for performance
class MongoAccountResponseModel(Document):
    # ... existing fields
    
    meta = {
        'indexes': [
            'puuid',
            'discord_id',
            ('rank_details.data.elo', -1),  # Leaderboard sorting
            ('updated_at', -1),  # Recent activity
            ('platform', 'rank_details.data.elo'),  # Platform leaderboards
        ]
    }
```

## Expected Impact

### User Experience:
- **5x increase** in time spent on platform
- **Enhanced engagement** through detailed statistics
- **Better competitive** understanding
- **Community building** through social features

### Technical Benefits:
- **Reduced API calls** through caching (60% reduction)
- **Faster page loads** (sub-2 second response times)
- **Better scalability** for growing user base
- **Modern tech stack** for future enhancements

### Competitive Advantage:
- **Most comprehensive** Sri Lankan Valorant platform
- **Detailed analytics** not available elsewhere
- **Community features** to retain users
- **Professional presentation** for potential sponsorships

## Conclusion

These enhancements would transform the basic leaderboard into a comprehensive competitive gaming platform, leveraging the full potential of the HenrikAPI while providing significant value to the Sri Lankan Valorant community. The phased approach ensures manageable development while delivering immediate value improvements.