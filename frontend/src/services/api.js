import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Leaderboard API
export const fetchLeaderboardData = async (page = 1, pageSize = 50) => {
  try {
    const response = await api.get(`/valorant/leaderboard?page=${page}&page_size=${pageSize}`);
    const totalCount = parseInt(response.headers['x-total-count'] || '0');
    return {
      data: response.data,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize)
    };
  } catch (error) {
    throw new Error('Failed to fetch leaderboard data');
  }
};

// Discord Authentication
export const getDiscordLoginUrl = async () => {
  try {
    const response = await api.get('/discord/login');
    return response.data.url;
  } catch (error) {
    throw new Error('Failed to get Discord login URL');
  }
};

export const getDiscordUserDetails = async (accessToken) => {
  try {
    const response = await api.get('/discord/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return {
      id: response.data.id,
      username: response.data.username,
    };
  } catch (error) {
    throw new Error('Failed to get user details');
  }
};

export const checkDiscordExists = async (discordId) => {
  try {
    const response = await api.get(`/discord/${discordId}`);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const saveUserData = async (puuid, discordId, discordUsername) => {
  try {
    const response = await api.post(`/valorant/rank/${puuid}/${discordId}/${discordUsername}/`);
    if (response.status === 200) {
      return {
        riotName: `${response.data.name}#${response.data.tag}`,
        elo: response.data.rank_details.data.elo,
        rank: response.data.rank_details.data.currenttierpatched
      };
    }
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Failed to save user data');
  }
};