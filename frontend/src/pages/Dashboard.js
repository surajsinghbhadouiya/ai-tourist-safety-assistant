import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/safety/alerts?lat=40.7128&lng=-74.0060`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to Tourist Safety Assistant</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-blue-600">Safety Alerts</h3>
          <p className="text-3xl font-bold mt-2">12</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-green-600">Verified Places</h3>
          <p className="text-3xl font-bold mt-2">245</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-purple-600">My Itineraries</h3>
          <p className="text-3xl font-bold mt-2">3</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-orange-600">Warnings</h3>
          <p className="text-3xl font-bold mt-2">5</p>
        </div>
      </div>

      <div className="mt-12 bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Recent Safety Alerts</h2>
        {data?.data?.length > 0 ? (
          <div className="space-y-4">
            {data.data.map((alert, index) => (
              <div key={index} className="border-l-4 border-red-500 bg-red-50 p-4">
                <h3 className="font-semibold text-red-900">{alert.title}</h3>
                <p className="text-red-700">{alert.description}</p>
                <p className="text-sm text-red-600 mt-2">Distance: {alert.distance_meters}m</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No alerts for your current location</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
