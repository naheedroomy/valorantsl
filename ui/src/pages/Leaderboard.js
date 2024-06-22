import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Container, Typography, Pagination } from '@mui/material';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLeaderboard(page, pageSize);
  }, [page, pageSize]);

  const fetchLeaderboard = async (page, pageSize) => {
    try {
      const response = await axios.get(`http://0.0.0.0:8000/valorant/leaderboard?page=${page}&page_size=${pageSize}`);
      setLeaderboard(response.data);
      setTotalPages(Math.ceil(response.headers['x-total-count'] / pageSize));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Leaderboard
      </Typography>
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
                <TableCell>{player.name}</TableCell>
                <TableCell>{player.rank_details.data.elo}</TableCell>
                <TableCell>{player.rank_details.data.currenttierpatched}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        color="primary"
        style={{ marginTop: '20px' }}
      />
    </Container>
  );
};

export default Leaderboard;
