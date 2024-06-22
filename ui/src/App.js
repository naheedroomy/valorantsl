// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Registration from './pages/RegistrationPage';
import Leaderboard from './pages/Leaderboard';
import Layout from './components/Layout';

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route exact path="/" element={<Leaderboard />} />
          <Route path="/registration" element={<Registration />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
