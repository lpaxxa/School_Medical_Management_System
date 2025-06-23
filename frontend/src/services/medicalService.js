import api from './api';

// Các methods để tương tác với API
const medicalService = {
  // Lấy hồ sơ y tế của học sinh
  getHealthProfile: async (studentId) => {
    return api.get(`/health-profiles/student/${studentId}`);
  },
  
  // Lấy lịch sử kiểm tra y tế
  getMedicalCheckups: async (studentId) => {
    return api.get(`/medical-checkups/student/${studentId}`);
  },
  
  // Lấy lịch sử sự cố y tế 
  getMedicalIncidents: async (studentId) => {
    return api.get(`/medical-incidents/student/${studentId}`);
  },
};

export default medicalService;