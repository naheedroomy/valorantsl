import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Registration = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if there's an access token in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');

    if (accessToken) {
      // Fetch user info
      axios.get('http://localhost:8000/discord/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        console.error('Error fetching user info:', error);
      });
    }
  }, []);

  const handleLogin = () => {
    // Fetch the login URL from the backend
    axios.get('http://localhost:8000/discord/login')
      .then(response => {
        window.location.href = response.data.url;
      })
      .catch(error => {
        console.error('Error fetching login URL:', error);
      });
  };

  return (
    <div>
      <h1>Discord OAuth2 Login</h1>
      {user ? (
        <div>
          <h2>Welcome, {user.username}!</h2>
          <p>ID: {user.id}</p>
          <p>Global Name: {user.global_name}</p>
          <p>Username: {user.username}</p>
          <p>Email: {user.email}</p>
          <img src={user.avatar} alt="avatar" />
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
};

export default Registration;