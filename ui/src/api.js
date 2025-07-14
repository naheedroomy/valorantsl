import axios from 'axios';

const VALORANTSL_API_URL = import.meta.env.VITE_VALORANTSL_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: VALORANTSL_API_URL,
});

export const fetchLeaderboardData = (page, pageSize) => {
    return api.get(`/valorant/leaderboard?page=${page}&page_size=${pageSize}`);
};

export const getDiscordLoginUrl = () => {
    return api.get('/discord/login');
};

export const saveUserData = (puuid, discordId, discordUsername) => {
    return api.post(`/valorant/rank/${puuid}/${discordId}/${discordUsername}/`);
};

export const getDiscordUserDetails = (accessToken) => {
    return api.get('/discord/user', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
};
