import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getAllHealthCheckups } from '../../services/healthCheckupService';

export const HealthCheckupContext = createContext();

export const HealthCheckupProvider = ({ children }) => {
  const [healthCheckups, setHealthCheckups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHealthCheckup, setSelectedHealthCheckup] = useState(null);

  const fetchHealthCheckups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllHealthCheckups();
      setHealthCheckups(data);
    } catch (error) {
      console.error('Error fetching health checkups:', error);
      setError('Failed to load health checkups. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealthCheckups();
  }, [fetchHealthCheckups]);

  const getHealthCheckupById = (id) => {
    return healthCheckups.find(checkup => checkup.id === id) || null;
  };

  const refreshHealthCheckups = () => {
    fetchHealthCheckups();
  };
  const value = {
    healthCheckups,
    loading,
    error,
    selectedHealthCheckup,
    setSelectedHealthCheckup,
    getHealthCheckupById,
    refreshHealthCheckups
  };
    return (
    <HealthCheckupContext.Provider value={value}>
      {children}
    </HealthCheckupContext.Provider>
  );
};
