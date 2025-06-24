import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import * as healthCheckupService from '../../services/APINurse/healthCheckupService';

export const HealthCheckupContext = createContext();

// Tạo custom hook để sử dụng context
export const useHealthCheckup = () => {
  const context = useContext(HealthCheckupContext);
  if (!context) {
    throw new Error('useHealthCheckup phải được sử dụng trong HealthCheckupProvider');
  }
  return context;
};

export const HealthCheckupProvider = ({ children }) => {
  const [healthCheckups, setHealthCheckups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHealthCheckup, setSelectedHealthCheckup] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const fetchHealthCheckups = useCallback(async () => {
    try {
      setLoading(true);
      const data = await healthCheckupService.getAllHealthCheckups();
      setHealthCheckups(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching health checkups:', err);
      setError('Không thể tải dữ liệu khám sức khỏe. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, []);

  // New function to fetch health checkup notifications
  const fetchHealthCheckupNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await healthCheckupService.getHealthCheckupNotifications();
      setNotifications(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('Error fetching health checkup notifications:', err);
      setError('Không thể tải thông báo khám sức khỏe. Vui lòng thử lại sau.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealthCheckups();
  }, [fetchHealthCheckups]);

  const fetchHealthCheckupById = async (id) => {
    try {
      setLoading(true);
      const data = await healthCheckupService.getHealthCheckupById(id);
      return data;
    } catch (err) {
      console.error(`Error fetching health checkup with ID ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addHealthCheckupData = async (checkupData) => {
    try {
      setLoading(true);
      const result = await healthCheckupService.addHealthCheckup(checkupData);
      setHealthCheckups([...healthCheckups, result]);
      return result;
    } catch (err) {
      console.error('Error adding health checkup:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateHealthCheckupData = async (id, checkupData) => {
    try {
      setLoading(true);
      const result = await healthCheckupService.updateHealthCheckup(id, checkupData);
      
      // Cập nhật state
      setHealthCheckups(healthCheckups.map(checkup => 
        checkup.id === id ? result : checkup
      ));
      
      return result;
    } catch (err) {
      console.error(`Error updating health checkup with ID ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeHealthCheckup = async (id) => {
    try {
      setLoading(true);
      const result = await healthCheckupService.deleteHealthCheckup(id);
      
      if (result) {
        // Xóa khỏi state
        setHealthCheckups(healthCheckups.filter(checkup => checkup.id !== id));
      }
      
      return result;
    } catch (err) {
      console.error(`Error deleting health checkup with ID ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // New function to create a notification
  const createNotification = async (notificationData) => {
    try {
      setLoading(true);
      const result = await healthCheckupService.createHealthCheckupNotification(notificationData);
      return result;
    } catch (err) {
      console.error('Error creating notification:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshHealthCheckups = () => {
    fetchHealthCheckups();
  };

  const refreshNotifications = () => {
    return fetchHealthCheckupNotifications();
  };

  const value = {
    healthCheckups,
    notifications,
    loading,
    error,
    selectedHealthCheckup,
    setSelectedHealthCheckup,
    fetchHealthCheckupById,
    addHealthCheckupData,
    updateHealthCheckupData,
    removeHealthCheckup,
    refreshHealthCheckups,
    fetchHealthCheckupNotifications,
    createNotification,
    refreshNotifications
  };

  return (
    <HealthCheckupContext.Provider value={value}>
      {children}
    </HealthCheckupContext.Provider>
  );
};
