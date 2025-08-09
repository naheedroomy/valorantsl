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
        timeout: 10000 // 10 second timeout
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
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Trophy className="w-6 h-6 text-gray-300" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-400">#{position}</span>
    }
  }

  const getCardClass = (position) => {
    const baseClass = "bg-gradient-to-r backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
    
    switch (position) {
      case 1:
        return `${baseClass} from-yellow-500/20 to-yellow-600/10 border-yellow-400/30 shadow-yellow-400/20`
      case 2:
        return `${baseClass} from-gray-400/20 to-gray-500/10 border-gray-300/30 shadow-gray-300/20`
      case 3:
        return `${baseClass} from-amber-500/20 to-amber-600/10 border-amber-400/30 shadow-amber-400/20`
      default:
        return `${baseClass} from-blue-500/10 to-purple-500/10 border-white/10 hover:border-white/20`
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize)
  const startIndex = (currentPage - 1) * pageSize

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center max-w-2xl mx-auto p-8">
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 mb-6">
            <h2 className="text-red-400 text-2xl font-bold mb-4">Connection Error</h2>
            <p className="text-red-300 text-lg mb-4">{error}</p>
            <div className="text-gray-400 text-sm space-y-2">
              <p><strong>API URL:</strong> {API_URL}</p>
              <p><strong>Troubleshooting:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-left">
                <li>Make sure the backend API is running</li>
                <li>Check if Docker containers are up: <code className="bg-gray-800 px-2 py-1 rounded">docker-compose ps</code></li>
                <li>Verify CORS settings allow your domain</li>
                <li>Check browser console for more details</li>
              </ul>
            </div>
          </div>
          <button 
            onClick={() => fetchLeaderboard(currentPage)}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                  Sri Lanka Valorant Leaderboard
                </h1>
                <p className="text-gray-400 text-sm">Updated every 30 minutes</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Join Discord</span>
              </a>
              <a
                href="https://github.com/naheedroomy/valorantsl"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>View Source</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <p className="text-gray-300 mb-4">
            To register yourself on the leaderboard, click on the Discord button above to join our server.
          </p>
        </div>

        {/* Top 3 Players */}
        {leaderboardData.length >= 3 && currentPage === 1 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent">
              🏆 Top 3 Champions 🏆
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {leaderboardData.slice(0, 3).map((player, index) => {
                const position = startIndex + index + 1
                const details = player.rank_details.data
                const username = `${player.name}#${player.tag}`
                const profileLink = `https://tracker.gg/valorant/profile/riot/${player.name}%23${player.tag}/overview`

                return (
                  <div key={player.puuid} className={`${getCardClass(position)} relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full"></div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getRankIcon(position)}
                        <span className="text-2xl font-bold">#{position}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-blue-300">{details.elo}</div>
                        <div className="text-sm text-gray-400">ELO</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-xl font-bold mb-2 text-white truncate" title={username}>
                        {player.name}
                      </h3>
                      <div className="flex items-center space-x-2 mb-3">
                        {details.images?.small && (
                          <img 
                            src={details.images.small} 
                            alt={details.currenttierpatched}
                            className="w-8 h-8 rounded"
                          />
                        )}
                        <span className="text-lg font-medium text-gray-300">
                          {details.currenttierpatched}
                        </span>
                      </div>
                    </div>

                    <a
                      href={profileLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 hover:text-blue-200 px-4 py-2 rounded-lg transition-all duration-200"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View Profile</span>
                    </a>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold">Full Leaderboard</h2>
            <p className="text-gray-400 text-sm">Page {currentPage} of {totalPages}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold">Rank</th>
                  <th className="text-left py-4 px-6 font-semibold">Player</th>
                  <th className="text-left py-4 px-6 font-semibold">Current Rank</th>
                  <th className="text-left py-4 px-6 font-semibold">ELO</th>
                  <th className="text-center py-4 px-6 font-semibold">Profile</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((player, index) => {
                  const position = startIndex + index + 1
                  const details = player.rank_details.data
                  const username = `${player.name}#${player.tag}`
                  const profileLink = `https://tracker.gg/valorant/profile/riot/${player.name}%23${player.tag}/overview`

                  return (
                    <tr 
                      key={player.puuid} 
                      className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                        position <= 3 && currentPage === 1 ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          {position <= 3 && currentPage === 1 ? getRankIcon(position) : (
                            <span className="text-gray-400 font-semibold">#{position}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white truncate max-w-48" title={username}>
                          {player.name}
                        </div>
                        <div className="text-sm text-gray-400">#{player.tag}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          {details.images?.small && (
                            <img 
                              src={details.images.small} 
                              alt={details.currenttierpatched}
                              className="w-6 h-6 rounded"
                            />
                          )}
                          <span className="text-gray-300">{details.currenttierpatched}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-blue-300">{details.elo}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <a
                          href={profileLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 hover:text-blue-200 px-3 py-1 rounded-md text-sm transition-all duration-200"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View</span>
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-6 border-t border-white/10">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <span className="text-gray-500">
                  ({totalCount} total players)
                </span>
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App