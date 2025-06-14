// This is a debug component to help trace issues with the nurse dashboard
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';

const DebugComponent = () => {
  const { currentUser } = useAuth();
  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://68419fdad48516d1d35c4cf6.mockapi.io/api/login/v1/users');
        setApiData(response.data);
      } catch (err) {
        console.error('API Error:', err);
        setError(err.message);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', backgroundColor: '#f0f0f0' }}>
      <h3>Debug Information</h3>
      
      <div>
        <h4>Current User:</h4>
        <pre>{JSON.stringify(currentUser, null, 2)}</pre>
      </div>
      
      <div>
        <h4>API Test:</h4>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {apiData && (
          <div>
            <p>API is working. Found {apiData.length} users.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugComponent;
