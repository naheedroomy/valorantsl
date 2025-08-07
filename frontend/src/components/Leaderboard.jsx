import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Crown, Medal, Award, RefreshCw } from 'lucide-react';
import { fetchLeaderboardData } from '../services/api';

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50;

  const fetchData = async (page) => {
    setLoading(true);
    try {
      const result = await fetchLeaderboardData(page, pageSize);
      setData(result.data);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const getRankIcon = (position) => {
    if (position === 1) return <Crown className="text-yellow-400" size={20} />;
    if (position === 2) return <Medal className="text-gray-400" size={20} />;
    if (position === 3) return <Award className="text-yellow-600" size={20} />;
    return null;
  };

  const getRankColor = (rank) => {
    const lowerRank = rank?.toLowerCase() || '';
    if (lowerRank.includes('radiant')) return 'text-yellow-400';
    if (lowerRank.includes('immortal')) return 'text-purple-400';
    if (lowerRank.includes('ascendant')) return 'text-green-400';
    if (lowerRank.includes('diamond')) return 'text-blue-400';
    if (lowerRank.includes('platinum')) return 'text-teal-400';
    if (lowerRank.includes('gold')) return 'text-yellow-300';
    if (lowerRank.includes('silver')) return 'text-gray-300';
    if (lowerRank.includes('bronze')) return 'text-orange-400';
    if (lowerRank.includes('iron')) return 'text-gray-500';
    return 'text-gray-400';
  };

  const startIndex = (currentPage - 1) * pageSize + 1;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <RefreshCw className="animate-spin text-white" size={48} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-400 text-xl">{error}</p>
          <button
            onClick={() => fetchData(currentPage)}
            className="mt-4 bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Sri Lanka Valorant Leaderboard
        </h1>
        <p className="text-gray-300 text-lg">
          Featuring the top Valorant players in Sri Lanka. Updated every 30 minutes.
        </p>
        <p className="text-gray-400 mt-2">
          Total Players: {totalCount.toLocaleString()}
        </p>
      </div>

      <div className="bg-secondary rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black border-b border-white/20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  ELO
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Profile
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {data.map((player, index) => {
                const position = startIndex + index;
                const details = player.rank_details?.data;
                const profileUrl = `https://tracker.gg/valorant/profile/riot/${player.name}%23${player.tag}/overview`;

                return (
                  <tr key={player._id || index} className="hover:bg-white/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getRankIcon(position)}
                        <span className="text-lg font-semibold text-white">
                          #{position}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-white">
                          {player.name}
                        </div>
                        <div className="text-gray-400">
                          #{player.tag}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-semibold text-white">
                        {details?.elo?.toLocaleString() || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getRankColor(details?.currenttierpatched)}`}>
                        {details?.currenttierpatched || 'Unranked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-gray-300 transition-colors flex items-center space-x-1"
                      >
                        <span className="text-sm">View</span>
                        <ExternalLink size={14} />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-black px-6 py-4 border-t border-white/20">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing {startIndex} to {Math.min(startIndex + pageSize - 1, totalCount)} of {totalCount} players
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md border border-white/20 text-sm font-medium text-white bg-secondary hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>
                
                <span className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md border border-white/20 text-sm font-medium text-white bg-secondary hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;