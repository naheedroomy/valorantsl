// Leaderboard.js
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {
    Alert,
    CircularProgress,
    Container,
    CssBaseline,
    IconButton,
    Pagination,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    ThemeProvider,
    Tooltip,
    tooltipClasses,
    Typography
} from '@mui/material';
import {ArrowRight} from '@mui/icons-material';
import PropTypes from 'prop-types';
import {styled} from '@mui/system';
import darkTheme from '../theme'; // Import the theme

// Custom hook for fetching leaderboard data
const useLeaderboard = (page) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Set a constant page size
    const pageSize = 25;

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
    }, [page]);

    return {leaderboard, totalPages, loading, error, pageSize};
};

// Styled components
const StyledContainer = styled(Container)(({theme}) => ({
    paddingTop: theme.spacing(4),
}));

const StyledTableCell = styled(TableCell)(({theme}) => ({
    '&.rank-column': {
        width: '5%', // Adjust the width as needed
    },
    width: '33%',
}));

const StyledTableRow = styled(TableRow)(({theme}) => ({
    '&:hover': {
        // backgroundColor: theme.palette.action.hover, // Default hover color from theme
        backgroundColor: '#f0f0f0', // Custom hover color
        color: 'black', // Custom text color on hover
    },
    '& .MuiTableCell-root': {
        color: 'inherit', // Inherit color from the row on hover
    },
}));

const CustomTooltip = styled(({className, ...props}) => (
    <Tooltip {...props} classes={{popper: className}}/>
))(({theme}) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        fontSize: theme.typography.pxToRem(14),
    },
}));

// Component for displaying the leaderboard table
const LeaderboardTable = ({leaderboard, page, pageSize}) => (
    <TableContainer component={Paper}>
        <Table>
            <TableHead>
                <TableRow>
                    <StyledTableCell className="rank-column">Rank</StyledTableCell> {/* Add Rank header */}
                    <StyledTableCell>Name</StyledTableCell>
                    <StyledTableCell>Elo</StyledTableCell>
                    <StyledTableCell>Rank</StyledTableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {leaderboard.map((player, index) => (
                    <StyledTableRow key={player.puuid}>
                        <StyledTableCell className="rank-column">
                            {(page - 1) * pageSize + index + 1}
                        </StyledTableCell> {/* Calculate rank */}
                        <StyledTableCell>
                            {player.name}
                            <CustomTooltip title={`${player.name}#${player.tag}`}>
                                <IconButton
                                    component="a"
                                    href={`https://tracker.gg/valorant/profile/riot/${player.name}%23${player.tag}/overview`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{color: 'green', padding: '0 0 0 5px'}}
                                >
                                    <ArrowRight fontSize="inherit"/>
                                </IconButton>
                            </CustomTooltip>
                        </StyledTableCell>
                        <StyledTableCell>{player.rank_details.data.elo}</StyledTableCell>
                        <StyledTableCell>{player.rank_details.data.currenttierpatched}</StyledTableCell>
                    </StyledTableRow>
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
    page: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
};

// Main component for the leaderboard
const Leaderboard = () => {
    const [page, setPage] = useState(1);
    const {leaderboard, totalPages, loading, error, pageSize} = useLeaderboard(page);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    // Relevant part of Leaderboard.js

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline/>
            <StyledContainer>
                <Paper elevation={3} style={{padding: '20px', marginTop: '20px', textAlign: 'center'}}>
                    <Typography variant="h4" gutterBottom>
                        Valorant Leaderboard Sri Lanka
                    </Typography>
                    {loading ? (
                        <CircularProgress/>
                    ) : error ? (
                        <Alert severity="error">{error}</Alert>
                    ) : (
                        <>
                            <LeaderboardTable leaderboard={leaderboard} page={page} pageSize={pageSize}/>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                style={{marginTop: '20px'}}
                            />
                        </>
                    )}
                </Paper>
            </StyledContainer>
        </ThemeProvider>
    );

};

export default Leaderboard;
