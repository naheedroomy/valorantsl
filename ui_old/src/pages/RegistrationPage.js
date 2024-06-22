// Registration.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Button, TextField, Paper, Box, ThemeProvider, CssBaseline } from '@mui/material';
import { styled } from '@mui/material/styles';
import darkTheme from '../theme'; // Import the theme
import discordLogo from '../assets/discord_logo.svg';

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
  const [existingUser, setExistingUser] = useState(null);
  const [createdUser, setCreatedUser] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');

    if (accessToken) {
      axios.get('http://localhost:8000/discord/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      .then(response => {
        setUser(response.data);
        checkIfUserExists(response.data.id);
      })
      .catch(error => {
        console.error('Error fetching user info:', error);
      });
    }
  }, []);

  const checkIfUserExists = (discordId) => {
    axios.get(`http://localhost:8000/discord/${discordId}`)
      .then(response => {
        if (response.data) {
          setExistingUser(response.data);
        }
      })
      .catch(error => {
        console.error('Error checking if user exists:', error);
      });
  };

  const handleLogin = () => {
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
        setCreatedUser(response.data);
      })
      .catch(error => {
        console.error('Error saving account details:', error);
        setSavedMessage('Failed to save account details.');
      });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="sm">
        <Paper elevation={3} style={{ padding: '20px', marginTop: '20px', textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Discord OAuth2 Login
          </Typography>
          {user ? (
            <Box>
              <Typography variant="h6">Welcome, {user.username}!</Typography>
              <Typography>ID: {user.id}</Typography>
              <Typography>Username: {user.username}</Typography>
              {existingUser ? (
                <Typography variant="body1" color="error">
                  This Discord ID already exists in the Leaderboard.
                </Typography>
              ) : createdUser ? (
                <Box mt={2}>
                  <Typography variant="h6">User Details</Typography>
                  <Typography>PUUID: {createdUser.puuid}</Typography>
                  <Typography>Name: {createdUser.name}#{createdUser.tag}</Typography>
                  <Typography>Rank: {createdUser.rank_details.data.currenttierpatched}</Typography>
                  <Typography>Elo: {createdUser.rank_details.data.elo}</Typography>
                </Box>
              ) : (
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
                </Box>
              )}
              {savedMessage && (
                <Typography variant="body2" color="textSecondary" style={{ marginTop: '10px' }}>
                  {savedMessage}
                </Typography>
              )}
            </Box>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
              <DiscordButton onClick={handleLogin}>
                <img src={discordLogo} alt="Discord Logo" style={{ width: '24px', marginRight: '8px' }} />
                Login with Discord
              </DiscordButton>
            </Box>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default Registration;
