import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">
            <Link to="/">🌍 Tourist Safety</Link>
          </div>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-blue-200">Dashboard</Link>
            <Link to="/safety-alerts" className="hover:text-blue-200">Safety Alerts</Link>
            <Link to="/itineraries" className="hover:text-blue-200">Itineraries</Link>
            <Link to="/places" className="hover:text-blue-200">Places</Link>
            <Link to="/community" className="hover:text-blue-200">Community</Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
