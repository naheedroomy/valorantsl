import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getDiscordUserDetails } from '../api';

const Callback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const accessToken = searchParams.get('access_token');
        if (accessToken) {
            localStorage.setItem('discord_access_token', accessToken);
            // Optionally fetch user details here and store them
            getDiscordUserDetails(accessToken)
                .then(response => {
                    console.log("Discord user details:", response.data);
                    localStorage.setItem('discord_user', JSON.stringify(response.data));
                    // Redirect to a profile or registration page
                    navigate('/register'); 
                })
                .catch(error => {
                    console.error("Error fetching discord user details", error);
                    // Handle error, maybe redirect to an error page or login
                    navigate('/register');
                });
        } else {
            // Handle no access token
            console.error("No access token found in callback URL");
            navigate('/register');
        }
    }, [searchParams, navigate]);

    return (
        <div>
            <p>Processing authentication...</p>
        </div>
    );
};

export default Callback;
