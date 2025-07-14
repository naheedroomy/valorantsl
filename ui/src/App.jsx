import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Leaderboard from './pages/Leaderboard';
import Registration from './pages/Registration';
import Callback from './pages/Callback';

function App() {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Leaderboard</Link>
          </li>
          <li>
            <Link to="/register">Register</Link>
          </li>
        </ul>
      </nav>
      <hr />
      <Routes>
        <Route path="/" element={<Leaderboard />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/callback" element={<Callback />} />
      </Routes>
    </div>
  );
}

export default App;
