import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Container, Typography, Pagination, Tooltip, CircularProgress, Alert
} from '@mui/material';
import PropTypes from 'prop-types';

// Custom hook for fetching leaderboard data
const useLeaderboard = (page, pageSize) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://0.0.0.0:8000/valorant/leaderboard?page=${page}&page_size=${pageSize}`);
        setLeaderboard(response.data);
        setTotalPages(Math.ceil(response.headers['x-total-count'] / pageSize));
        setError(null);
      } catch (error) {
        setError('Error fetching leaderboard');
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, [page, pageSize]);

  return { leaderboard, totalPages, loading, error };
};

// Component for displaying the leaderboard table
const LeaderboardTable = ({ leaderboard }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Elo</TableCell>
          <TableCell>Rank</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {leaderboard.map((player) => (
          <TableRow key={player.puuid}>
            <TableCell>
              <Tooltip title={`${player.name}#${player.tag}`}>
                <a
                  href={`https://tracker.gg/valorant/profile/riot/${player.name}%23${player.tag}/overview`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline', color: 'inherit' }}
                >
                  {player.name}
                </a>
              </Tooltip>
            </TableCell>
            <TableCell>{player.rank_details.data.elo}</TableCell>
            <TableCell>{player.rank_details.data.currenttierpatched}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

LeaderboardTable.propTypes = {
  leaderboard: PropTypes.arrayOf(
    PropTypes.shape({
      puuid: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      tag: PropTypes.string.isRequired,
      rank_details: PropTypes.shape({
        data: PropTypes.shape({
          elo: PropTypes.number.isRequired,
          currenttierpatched: PropTypes.string.isRequired,
        }).isRequired,
      }).isRequired,
    })
  ).isRequired,
};

// Main component for the leaderboard
const Leaderboard = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const { leaderboard, totalPages, loading, error } = useLeaderboard(page, pageSize);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Leaderboard
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <LeaderboardTable leaderboard={leaderboard} />
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            style={{ marginTop: '20px' }}
          />
        </>
      )}
    </Container>
  );
};

export default Leaderboard;
