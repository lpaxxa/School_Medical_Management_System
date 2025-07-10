import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import * as healthCheckupService from '../../services/APINurse/healthCheckupService';

export const HealthCheckupContext = createContext();

// Custom hook to use context
export const useHealthCheckup = () => {
  const context = useContext(HealthCheckupContext);
  if (!context) {
    throw new Error('useHealthCheckup must be used within a HealthCheckupProvider');
  }
  return context;
};

export const HealthCheckupProvider = ({ children }) => {
  // State cho API mới
  const [medicalCheckups, setMedicalCheckups] = useState([]);
  
  // State cho API cũ
  const [healthCheckups, setHealthCheckups] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCheckup, setSelectedCheckup] = useState(null);
  const [selectedHealthCheckup, setSelectedHealthCheckup] = useState(null);

  // Fetch all medical checkups (API mới)
  const fetchMedicalCheckups = useCallback(async () => {
    try {
      setLoading(true);
      const data = await healthCheckupService.getAllMedicalCheckups();
      setMedicalCheckups(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching medical checkups:', err);
      setError('Không thể tải dữ liệu khám sức khỏe. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all health checkups (API cũ)
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

  // Load medical checkups when component mounts
  useEffect(() => {
    fetchMedicalCheckups();
    fetchHealthCheckups();
  }, [fetchMedicalCheckups, fetchHealthCheckups]);

  // Get medical checkup by ID (API mới)
  const fetchMedicalCheckupById = async (id) => {
    try {
      setLoading(true);
      const data = await healthCheckupService.getMedicalCheckupById(id);
      return data;
    } catch (err) {
      console.error(`Error fetching medical checkup with ID ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get health checkup by ID (API cũ)
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

  // Update medical checkup (API mới)
  const updateMedicalCheckup = async (id, checkupData) => {
    try {
      setLoading(true);
      const result = await healthCheckupService.updateMedicalCheckup(id, checkupData);
      
      // Update state
      setMedicalCheckups(medicalCheckups.map(checkup => 
        checkup.id === id ? result : checkup
      ));
      
      return result;
    } catch (err) {
      console.error(`Error updating medical checkup with ID ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update health checkup (API cũ)
  const updateHealthCheckupData = async (id, checkupData) => {
    try {
      setLoading(true);
      const result = await healthCheckupService.updateHealthCheckup(id, checkupData);
      
      // Update state
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

  // Add health checkup (API cũ)
  const addHealthCheckup = async (checkupData) => {
    try {
      setLoading(true);
      const newCheckup = await healthCheckupService.addHealthCheckup(checkupData);
      // Refresh the main list to reflect any changes in stats
      fetchHealthCheckups(); 
      return newCheckup;
    } catch (err) {
      console.error('Error creating health checkup:', err);
      setError('Không thể tạo hồ sơ khám sức khỏe.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove health checkup (API cũ)
  const removeHealthCheckup = async (id) => {
    try {
      setLoading(true);
      const result = await healthCheckupService.deleteHealthCheckup(id);
      
      if (result) {
        // Remove from state
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

  // Send notification to parent (API mới)
  const sendParentNotification = async (studentId, message) => {
    try {
      setLoading(true);
      const result = await healthCheckupService.sendParentNotification(studentId, message);
      return result;
    } catch (err) {
      console.error('Error sending notification:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Notify parent by checkup ID
  const notifyParent = async (checkupId) => {
    try {
      setLoading(true);
      const result = await healthCheckupService.notifyParent(checkupId);
      return result;
    } catch (err) {
      console.error(`Error notifying parent for checkup ID ${checkupId}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Notify all parents
  const notifyAllParents = async (message) => {
    try {
      setLoading(true);
      const result = await healthCheckupService.notifyAllParents(message);
      return result;
    } catch (err) {
      console.error('Error notifying all parents:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Schedule consultation for student with NEED_FOLLOW_UP status
  const scheduleConsultation = async (checkupId, consultationData) => {
    try {
      setLoading(true);
      const result = await healthCheckupService.scheduleConsultation(checkupId, consultationData);
      return result;
    } catch (err) {
      console.error(`Error scheduling consultation for checkup ID ${checkupId}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh medical checkups
  const refreshMedicalCheckups = () => {
    fetchMedicalCheckups();
  };

  // Refresh health checkups
  const refreshHealthCheckups = () => {
    fetchHealthCheckups();
  };

  const value = {
    // API mới
    medicalCheckups,
    fetchMedicalCheckupById,
    updateMedicalCheckup,
    sendParentNotification,
    refreshMedicalCheckups,
    notifyParent,
    notifyAllParents,
    scheduleConsultation,
    
    // API cũ
    healthCheckups,
    loading,
    error,
    selectedHealthCheckup,
    setSelectedHealthCheckup,
    selectedCheckup,
    setSelectedCheckup,
    fetchHealthCheckupById,
    addHealthCheckup,
    updateHealthCheckupData,
    removeHealthCheckup,
    refreshHealthCheckups,
    getHealthCampaigns: healthCheckupService.getHealthCampaigns,
    getParents: healthCheckupService.getParents,
    sendNotification: healthCheckupService.sendNotification,
    getStudentById: healthCheckupService.getStudentById,
    getStudents: healthCheckupService.getStudents,
    getParentById: healthCheckupService.getParentById,
    sendCampaignNotifications: healthCheckupService.sendCampaignNotifications,
    getCampaignStudents: healthCheckupService.getCampaignStudents,
    getConsentDetails: healthCheckupService.getConsentDetails,
    getStudentsRequiringFollowup: healthCheckupService.getStudentsRequiringFollowup,
  };

  return (
    <HealthCheckupContext.Provider value={value}>
      {children}
    </HealthCheckupContext.Provider>
  );
};
