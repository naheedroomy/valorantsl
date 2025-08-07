import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { getDiscordLoginUrl, getDiscordUserDetails, checkDiscordExists, saveUserData } from '../services/api';

const Registration = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [discordLoginUrl, setDiscordLoginUrl] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [puuid, setPuuid] = useState('');
  const [registrationResult, setRegistrationResult] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Check for OAuth callback parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('access_token');
    
    if (accessToken) {
      handleDiscordCallback(accessToken);
    } else {
      fetchDiscordLoginUrl();
    }
  }, [location]);

  const fetchDiscordLoginUrl = async () => {
    try {
      const url = await getDiscordLoginUrl();
      setDiscordLoginUrl(url);
    } catch (err) {
      setError('Failed to get Discord login URL');
    }
  };

  const handleDiscordCallback = async (accessToken) => {
    setLoading(true);
    try {
      const details = await getDiscordUserDetails(accessToken);
      setUserDetails(details);
      
      // Check if user already exists
      const existingUser = await checkDiscordExists(details.id);
      if (existingUser) {
        setError('User already exists in the database');
        return;
      }
      
      setStep(2);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    if (!puuid.trim()) {
      setError('Please enter your Riot PUUID');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await saveUserData(puuid.trim(), userDetails.id, userDetails.username);
      setRegistrationResult(result);
      setSuccess('User registered successfully! The leaderboard will update in 30 minutes.');
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetRegistration = () => {
    setStep(1);
    setUserDetails(null);
    setPuuid('');
    setError('');
    setSuccess('');
    setRegistrationResult(null);
    // Clear URL parameters
    navigate('/register', { replace: true });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-secondary rounded-xl border border-white/20 p-8">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Join the Leaderboard
        </h1>
        <p className="text-gray-300 text-center mb-8">
          Register yourself on the Sri Lanka Valorant Leaderboard
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-400 mt-0.5" size={20} />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500/50 rounded-lg flex items-start space-x-3">
            <CheckCircle className="text-green-400 mt-0.5" size={20} />
            <p className="text-green-300 text-sm">{success}</p>
          </div>
        )}

        {/* Step 1: Discord Login */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Step 1: Login with Discord
              </h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-valorant-red" size={32} />
                </div>
              ) : (
                <div className="text-center">
                  {discordLoginUrl ? (
                    <a
                      href={discordLoginUrl}
                      className="inline-flex items-center space-x-3 bg-white hover:bg-gray-200 text-black px-6 py-3 rounded-lg text-lg font-medium transition-colors"
                    >
                      <svg width="24" height="24" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0)">
                          <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.280 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="white"/>
                        </g>
                        <defs>
                          <clipPath id="clip0">
                            <rect width="71" height="55" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                      <span>Login with Discord</span>
                    </a>
                  ) : (
                    <p className="text-red-400">Failed to load Discord login URL</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Enter PUUID */}
        {step === 2 && userDetails && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Step 2: Enter Your Riot PUUID
              </h2>
              
              <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 mb-6">
                <p className="text-green-300 text-sm">
                  Successfully logged in as <strong>{userDetails.username}</strong>
                </p>
              </div>

              <div className="mb-4">
                <a
                  href="https://docs.google.com/document/d/e/2PACX-1vQMM-QwU743I9eq4ETtFDvfgkm5kgyRSPGUOlS-8PEAsqpeDNkuBMNDSJq19Zckbk4k5I6nCeU0M68I/pub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-300 transition-colors inline-flex items-center space-x-1"
                >
                  <span>How do I find my Riot PUUID?</span>
                  <ExternalLink size={16} />
                </a>
              </div>

              <form onSubmit={handleRegistration} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={puuid}
                    onChange={(e) => setPuuid(e.target.value)}
                    placeholder="Enter your Riot PUUID"
                    className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors"
                    disabled={loading}
                  />
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={resetRegistration}
                    className="flex-1 px-4 py-3 bg-black hover:bg-white/10 text-white rounded-lg border border-white/20 transition-colors"
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !puuid.trim()}
                    className="flex-1 bg-white hover:bg-gray-200 disabled:bg-muted disabled:cursor-not-allowed text-black px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Registering...</span>
                      </>
                    ) : (
                      <span>Register</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && registrationResult && (
          <div className="space-y-6 text-center">
            <div className="mb-6">
              <CheckCircle className="mx-auto text-green-400 mb-4" size={64} />
              <h2 className="text-2xl font-semibold text-white mb-2">
                Registration Successful!
              </h2>
            </div>

            <div className="bg-black rounded-lg p-6 text-left border border-white/20">
              <h3 className="text-lg font-medium text-white mb-4">Your Details:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Riot Name:</span>
                  <span className="text-white">{registrationResult.riotName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ELO:</span>
                  <span className="text-valorant-red font-semibold">{registrationResult.elo?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rank:</span>
                  <span className="text-white">{registrationResult.rank}</span>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-300">
              <p className="mb-4">
                The leaderboard will update with your information in 30 minutes.
              </p>
              <a
                href={import.meta.env.VITE_DISCORD_INVITE || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-md transition-colors"
              >
                <span>Join our Discord Server!</span>
                <ExternalLink size={16} />
              </a>
            </div>

            <button
              onClick={resetRegistration}
              className="bg-black hover:bg-white/10 text-white px-6 py-2 rounded-lg border border-white/20 transition-colors"
            >
              Register Another User
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Registration;