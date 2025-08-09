import { useState, useEffect } from 'react'
import axios from 'axios'
import { Crown, Trophy, Medal, Github, Users, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const DISCORD_INVITE = import.meta.env.VITE_DISCORD_INVITE || 'https://discord.gg/valorantsl'

function App() {
  const [leaderboardData, setLeaderboardData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 50

  useEffect(() => {
    fetchLeaderboard(currentPage)
  }, [currentPage])

  const fetchLeaderboard = async (page) => {
    try {
      setLoading(true)
      setError(null)
      console.log(`Fetching leaderboard from: ${API_URL}/valorant/leaderboard`)
      
      const response = await axios.get(`${API_URL}/valorant/leaderboard`, {
        params: {
          page,
          page_size: pageSize
        },
        timeout: 10000
      })
      
      console.log('Leaderboard response:', response)
      setLeaderboardData(response.data)
      setTotalCount(parseInt(response.headers['x-total-count'] || 0))
    } catch (err) {
      let errorMessage = 'Failed to load leaderboard data'
      
      if (err.code === 'ECONNREFUSED') {
        errorMessage = `Cannot connect to API server at ${API_URL}. Make sure the backend is running.`
      } else if (err.response) {
        errorMessage = `API Error: ${err.response.status} - ${err.response.statusText}`
      } else if (err.request) {
        errorMessage = `Network Error: Unable to reach ${API_URL}. Check your connection and CORS settings.`
      } else {
        errorMessage = `Error: ${err.message}`
      }
      
      setError(errorMessage)
      console.error('Error fetching leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (position) => {
    switch (position) {
      case 1:
        return <Crown className="w-7 h-7 text-yellow-400" />
      case 2:
        return <Trophy className="w-7 h-7 text-slate-300" />
      case 3:
        return <Medal className="w-7 h-7 text-orange-400" />
      default:
        return <span className="text-2xl font-bold text-slate-400">#{position}</span>
    }
  }

  const getTopCardClass = (position) => {
    const baseClass = "bg-slate-800/90 backdrop-blur-sm border-2 rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer relative overflow-hidden"
    
    switch (position) {
      case 1:
        return `${baseClass} border-yellow-400/60 shadow-yellow-400/20 hover:shadow-yellow-400/40 hover:border-yellow-400/80`
      case 2:
        return `${baseClass} border-slate-400/60 shadow-slate-400/20 hover:shadow-slate-400/40 hover:border-slate-400/80`
      case 3:
        return `${baseClass} border-orange-400/60 shadow-orange-400/20 hover:shadow-orange-400/40 hover:border-orange-400/80`
      default:
        return `${baseClass} border-slate-600/60 hover:border-slate-500/80`
    }
  }

  const openProfile = (playerName, playerTag) => {
    const profileLink = `https://tracker.gg/valorant/profile/riot/${playerName}%23${playerTag}/overview`
    window.open(profileLink, '_blank')
  }

  const totalPages = Math.ceil(totalCount / pageSize)
  const startIndex = (currentPage - 1) * pageSize

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white text-2xl font-semibold">Loading leaderboard...</p>
          <p className="text-slate-400 mt-2">Fetching player rankings</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="bg-red-900/30 border border-red-500/50 rounded-2xl p-8 mb-8">
            <h2 className="text-red-400 text-3xl font-bold mb-6">Connection Error</h2>
            <p className="text-red-300 text-xl mb-6">{error}</p>
            <div className="text-slate-300 text-sm space-y-3 bg-slate-800/50 p-6 rounded-xl">
              <p><strong className="text-white">API URL:</strong> {API_URL}</p>
              <p><strong className="text-white">Troubleshooting:</strong></p>
              <ul className="list-disc list-inside space-y-2 text-left">
                <li>Make sure the backend API is running</li>
                <li>Check if Docker containers are up: <code className="bg-slate-700 px-2 py-1 rounded text-yellow-300">docker-compose ps</code></li>
                <li>Verify CORS settings allow your domain</li>
                <li>Check browser console for more details</li>
              </ul>
            </div>
          </div>
          <button 
            onClick={() => fetchLeaderboard(currentPage)}
            className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-xl transition-all duration-200 hover:scale-105"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/95 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Sri Lanka Valorant Leaderboard
                </h1>
                <p className="text-slate-400 text-sm">Updated every 30 minutes</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-xl transition-all duration-200 hover:scale-105 font-semibold"
              >
                <Users className="w-5 h-5" />
                <span>Join Discord</span>
              </a>
              <a
                href="https://github.com/naheedroomy/valorantsl"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 px-5 py-3 rounded-xl transition-all duration-200 hover:scale-105 font-semibold"
              >
                <Github className="w-5 h-5" />
                <span>Source</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <p className="text-slate-300 text-lg mb-6">
            To register yourself on the leaderboard, click the Discord button above to join our server.
          </p>
        </div>

        {/* Top 3 Players */}
        {leaderboardData.length >= 3 && currentPage === 1 && (
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-yellow-400 via-red-500 to-purple-500 bg-clip-text text-transparent">
              🏆 Top 3 Champions 🏆
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {leaderboardData.slice(0, 3).map((player, index) => {
                const position = startIndex + index + 1
                const details = player.rank_details.data
                const username = `${player.name}#${player.tag}`

                return (
                  <div 
                    key={player.puuid} 
                    className={getTopCardClass(position)}
                    onClick={() => openProfile(player.name, player.tag)}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full"></div>
                    
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-4">
                        {getRankIcon(position)}
                        <span className="text-3xl font-bold text-white">#{position}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{details.elo}</div>
                        <div className="text-sm text-slate-400 uppercase tracking-wider">ELO</div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-3 text-white truncate" title={username}>
                        {player.name}
                      </h3>
                      <div className="flex items-center space-x-3 mb-4">
                        {details.images?.small && (
                          <img 
                            src={details.images.small} 
                            alt={details.currenttierpatched}
                            className="w-10 h-10 rounded-lg"
                          />
                        )}
                        <span className="text-xl font-semibold text-slate-200">
                          {details.currenttierpatched}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-slate-300 hover:text-white transition-colors">
                      <ExternalLink className="w-5 h-5" />
                      <span className="font-semibold">Click to View Profile</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-slate-700 bg-slate-800/70">
            <h2 className="text-3xl font-bold text-white mb-2">Full Leaderboard</h2>
            <div className="flex justify-between items-center text-slate-400">
              <p>Page {currentPage} of {totalPages}</p>
              <p>{totalCount} total players</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="text-left py-6 px-8 font-bold text-white text-lg">Rank</th>
                  <th className="text-left py-6 px-8 font-bold text-white text-lg">Player</th>
                  <th className="text-left py-6 px-8 font-bold text-white text-lg">Current Rank</th>
                  <th className="text-left py-6 px-8 font-bold text-white text-lg">ELO</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((player, index) => {
                  const position = startIndex + index + 1
                  const details = player.rank_details.data
                  const username = `${player.name}#${player.tag}`

                  return (
                    <tr 
                      key={player.puuid} 
                      className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-all duration-200 cursor-pointer group ${
                        position <= 3 && currentPage === 1 ? 'bg-gradient-to-r from-yellow-500/5 via-transparent to-transparent' : ''
                      }`}
                      onClick={() => openProfile(player.name, player.tag)}
                    >
                      <td className="py-6 px-8">
                        <div className="flex items-center space-x-3">
                          {position <= 3 && currentPage === 1 ? getRankIcon(position) : (
                            <span className="text-slate-300 font-bold text-xl">#{position}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <div className="font-bold text-white text-lg truncate max-w-64 group-hover:text-blue-400 transition-colors" title={username}>
                          {player.name}
                        </div>
                        <div className="text-slate-400 text-sm">#{player.tag}</div>
                      </td>
                      <td className="py-6 px-8">
                        <div className="flex items-center space-x-3">
                          {details.images?.small && (
                            <img 
                              src={details.images.small} 
                              alt={details.currenttierpatched}
                              className="w-8 h-8 rounded"
                            />
                          )}
                          <span className="text-slate-200 font-semibold">{details.currenttierpatched}</span>
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <span className="font-bold text-xl text-white">{details.elo}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-8 border-t border-slate-700 bg-slate-800/70">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-3 px-6 py-4 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Previous</span>
              </button>
              
              <div className="flex items-center space-x-6 text-slate-300">
                <span className="text-lg font-semibold">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="h-6 w-px bg-slate-600"></div>
                <span className="text-sm">
                  {totalCount} total players
                </span>
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-3 px-6 py-4 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App