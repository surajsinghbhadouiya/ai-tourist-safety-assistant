import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SafetyAlerts from './pages/SafetyAlerts';
import Itineraries from './pages/Itineraries';
import Places from './pages/Places';
import Community from './pages/Community';
import AIAssistant from './components/AIAssistant';
import JokeGenerator from './components/JokeGenerator';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token
      setUser({ token });
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {user && <Navbar />}
        <Routes>
          {user ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/safety-alerts" element={<SafetyAlerts />} />
              <Route path="/itineraries" element={<Itineraries />} />
              <Route path="/places" element={<Places />} />
              <Route path="/community" element={<Community />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/jokes" element={<JokeGenerator />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
