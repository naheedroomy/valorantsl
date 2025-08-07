import { Github, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black/20 backdrop-blur-sm border-t border-gray-700/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="text-sm text-gray-400">
            <p>© 2024 Sri Lanka Valorant Leaderboard. Made with ❤️ for the SL Valorant community.</p>
          </div>
          
          <div className="flex items-center space-x-6">
            <a
              href="https://github.com/naheedroomy/valorantsl"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <Github size={20} />
              <span className="text-sm">View Source</span>
            </a>
            
            <a
              href="mailto:nroomy1@gmail.com"
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ExternalLink size={16} />
              <span className="text-sm">Contact</span>
            </a>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700/30">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 text-xs text-gray-500">
            <p>
              Powered by{' '}
              <a 
                href="https://github.com/Henrik-3/unofficial-valorant-api" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-valorant-blue hover:text-blue-400 transition-colors"
              >
                unofficial-valorant-api
              </a>
            </p>
            <p>Data updates every 30 minutes</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;