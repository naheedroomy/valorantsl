import React, { useState, useEffect } from 'react';
import { getDiscordLoginUrl, saveUserData } from '../api';
import { useNavigate } from 'react-router-dom';

const Registration = () => {
    const [discordUser, setDiscordUser] = useState(null);
    const [puuid, setPuuid] = useState('');
    const navigate = useNavigate();
    
    useEffect(() => {
        const user = localStorage.getItem('discord_user');
        if (user) {
            setDiscordUser(JSON.parse(user));
        }
    }, []);

    const handleLogin = async () => {
        try {
            const response = await getDiscordLoginUrl();
            window.location.href = response.data.url;
        } catch (error) {
            console.error("Error getting Discord login URL:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!puuid) {
            alert('Please enter your Valorant PUUID.');
            return;
        }
        try {
            await saveUserData(puuid, discordUser.id, discordUser.username);
            alert('Account saved successfully!');
            navigate('/');
        } catch (error) {
            console.error("Error saving user data:", error);
            alert('Failed to save account. Please check the PUUID and try again.');
        }
    };

    if (!discordUser) {
        return (
            <div>
                <h1>Register</h1>
                <p>To register your Valorant account, you need to log in with Discord.</p>
                <button onClick={handleLogin}>Login with Discord</button>
            </div>
        );
    }

    return (
        <div>
            <h1>Register Valorant Account</h1>
            <p>Logged in as: {discordUser.username}#{discordUser.discriminator}</p>
            <form onSubmit={handleSubmit}>
                <label>
                    Valorant PUUID:
                    <input type="text" value={puuid} onChange={(e) => setPuuid(e.target.value)} />
                </label>
                <p><small>You can find your PUUID from your Riot account page.</small></p>
                <button type="submit">Save Account</button>
            </form>
        </div>
    );
};

export default Registration;
