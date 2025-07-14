import React, { useState, useEffect } from 'react';
import { fetchLeaderboardData } from '../api';

const Leaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        fetchLeaderboardData(page, pageSize)
            .then(response => {
                setLeaderboardData(response.data);
                // Assuming the API returns total count in headers, e.g., 'X-Total-Count'
                // This part might need adjustment based on your actual API response
                // setTotalCount(Number(response.headers['x-total-count']));
            })
            .catch(error => {
                console.error("Error fetching leaderboard data:", error);
            });
    }, [page]);

    return (
        <div>
            <h1>Leaderboard</h1>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Name</th>
                        <th>Rank Tier</th>
                        <th>RR</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboardData.map((user, index) => (
                        <tr key={user.puuid}>
                            <td>{index + 1 + (page - 1) * pageSize}</td>
                            <td>{user.account_data.name}#{user.account_data.tag}</td>
                            <td>{user.rank_details.current_data.currenttierpatched}</td>
                            <td>{user.rank_details.current_data.ranking_in_tier}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
            <span>Page {page}</span>
            <button onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
    );
};

export default Leaderboard;
