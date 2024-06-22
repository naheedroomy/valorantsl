import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Button, TextField, Avatar, Paper, Box, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const DiscordButton = styled(Button)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#7289da',
  color: '#ffffff',
  '&:hover': {
    backgroundColor: '#5b6eae',
  },
  textTransform: 'none',
  padding: theme.spacing(1, 2),
}));

const Registration = () => {
  const [user, setUser] = useState(null);
  const [puuid, setPuuid] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

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

  const handlePuuidChange = (event) => {
    setPuuid(event.target.value);
  };

  const handleSubmit = () => {
    if (!puuid || !user) {
      return;
    }

    axios.post(`http://localhost:8000/valorant/rank/${puuid}/${user.id}/${user.username}`)
      .then(response => {
        setSavedMessage('Account details saved successfully!');
      })
      .catch(error => {
        console.error('Error saving account details:', error);
        setSavedMessage('Failed to save account details.');
      });
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Typography variant="h4" gutterBottom>
          Discord OAuth2 Login
        </Typography>
        {user ? (
          <Box>
            <Typography variant="h6">Welcome, {user.username}!</Typography>
            <Typography>ID: {user.id}</Typography>
            <Typography>Global Name: {user.global_name}</Typography>
            <Typography>Username: {user.username}</Typography>
            <Typography>Email: {user.email}</Typography>
            <Box mt={2}>
              <TextField
                label="PUUID"
                variant="outlined"
                fullWidth
                value={puuid}
                onChange={handlePuuidChange}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                style={{ marginTop: '10px' }}
              >
                Submit
              </Button>
              {savedMessage && (
                <Typography variant="body2" color="textSecondary" style={{ marginTop: '10px' }}>
                  {savedMessage}
                </Typography>
              )}
            </Box>
          </Box>
        ) : (
          <DiscordButton onClick={handleLogin}>
            <img src='https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.svg' alt="Discord Logo" style={{ width: '24px', marginRight: '8px' }} />
            Login with Discord
          </DiscordButton>
        )}
      </Paper>
    </Container>
  );
};

export default Registration;
