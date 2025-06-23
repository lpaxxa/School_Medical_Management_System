import api from './api';

// Các methods để tương tác với API
const medicalService = {
  // Lấy hồ sơ y tế của học sinh - sử dụng studentId
  getHealthProfile: async (studentId) => {
    try {
      const response = await api.get(`/health-profiles/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching health profile:', error);
      throw error;
    }
  },
  
  // Lấy lịch sử kiểm tra y tế
  getMedicalCheckups: async (studentId) => {
    try {
      const response = await api.get(`/medical-checkups/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical checkups:', error);
      throw error;
    }
  },
  
  // Lấy lịch sử sự cố y tế 
  getMedicalIncidents: async (studentId) => {
    try {
      const response = await api.get(`/medical-incidents/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical incidents:', error);
      throw error;
    }
  },

  // Thêm API cho vaccination
  getVaccinationNotifications: async (parentId, studentCode) => {
    try {
      const response = await api.get(`/notifications/getAcceptedNotificationsByParent/${parentId}/${studentCode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vaccination notifications:', error);
      throw error;
    }
  },

  // Lấy chi tiết vaccination
  getVaccinationDetail: async (notificationId) => {
    try {
      console.log('Calling vaccination detail API with notificationId:', notificationId);
      console.log('API URL will be:', `/vaccinations/notification-recipient/${notificationId}`);
      
      const response = await api.get(`/vaccinations/notification-recipient/${notificationId}`);
      
      console.log('Vaccination detail API response:', response);
      console.log('Response data:', response.data);
      console.log('Response structure:', Object.keys(response.data || {}));
      
      return response.data;
    } catch (error) {
      console.error('Error fetching vaccination detail:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  // Method để lấy health profile chi tiết (giữ lại để backward compatibility)
  getHealthProfileDetail: async (studentId) => {
    return medicalService.getHealthProfile(studentId);
  }
};

export default medicalService;