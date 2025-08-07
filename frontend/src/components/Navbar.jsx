import { Link, useLocation } from 'react-router-dom';
import { Trophy, UserPlus } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="bg-black/20 backdrop-blur-sm border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <img 
              src="https://i.ibb.co/dpPsHQg/valsl.jpg" 
              alt="ValSL" 
              className="w-8 h-8 rounded-full"
            />
            <h1 className="text-xl font-bold text-valorant-red">
              Sri Lanka Valorant Leaderboard
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-valorant-red text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Trophy size={18} />
              <span>Leaderboard</span>
            </Link>
            
            <Link
              to="/register"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/register'
                  ? 'bg-valorant-red text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <UserPlus size={18} />
              <span>Register</span>
            </Link>

            <a
              href={import.meta.env.VITE_DISCORD_INVITE || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Join Discord
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;