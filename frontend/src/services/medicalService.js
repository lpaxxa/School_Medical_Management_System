import api from './api';

// Các methods để tương tác với API
const medicalService = {
  // Lấy hồ sơ y tế của học sinh - sử dụng studentCode (HS001, HS002, ...)
  getHealthProfile: async (studentCode) => {
    try {
      const response = await api.get(`/health-profiles/getStudentProfileByID/${studentCode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching health profile:', error);
      throw error;
    }
  },
  
  // Lấy lịch sử kiểm tra y tế - chỉ cho các tab khác (không phải GeneralTab)
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

  // // API mới cho sự cố y tế của phụ huynh với format mới
  // getStudentIncidents: async (parentId, studentId) => {
  //   try {
  //     const response = await api.get(`/incidents/parents/${parentId}/students/${studentId}/incidents`);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error fetching student incidents:', error);
  //     throw error;
  //   }
  // },

  // API cho lịch sử tiêm chủng 
  getVaccinationHistory: async (studentId) => {
    try {
      const response = await api.get(`/vaccination-history/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vaccination history:', error);
      throw error;
    }
  },

  // API mới cho lịch sử tiêm chủng của phụ huynh - format mới
  getStudentVaccinations: async (parentId, studentId) => {
    try {
      const response = await api.get(`/vaccinations/parents/${parentId}/students/${studentId}/vaccinations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student vaccinations:', error);
      throw error;
    }
  },

  // API cho vaccination plans - CHỈ DÀNH CHO TAB TIÊM CHỦNG
  getVaccinationPlans: async (studentId) => {
    try {
      const response = await api.get(`/vaccination-plans/students/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vaccination plans:', error);
      throw error;
    }
  },

  // API để xác nhận hoặc từ chối tiêm chủng - CHỈ DÀNH CHO TAB TIÊM CHỦNG
  confirmVaccination: async (data) => {
    try {
      const response = await api.post(
        "/notification-recipient-vaccines/create",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error confirming vaccination:", error);
      throw error;
    }
  },

  // API cho thông báo y tế
  getMedicalNotifications: async (studentId) => {
    try {
      const response = await api.get(`/medical-notifications/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical notifications:', error);
      throw error;
    }
  },

  // API cho thuốc và điều trị
  getMedications: async (studentId) => {
    try {
      const response = await api.get(`/medications/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medications:', error);
      throw error;
    }
  },

  // API cho thể trạng và sức khỏe
  getHealthMetrics: async (studentId) => {
    try {
      const response = await api.get(`/health-metrics/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      throw error;
    }
  },

  // API cho dị ứng
  getAllergies: async (studentId) => {
    try {
      const response = await api.get(`/allergies/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching allergies:', error);
      throw error;
    }
  },

  // API cho bệnh tật đặc biệt
  getSpecialConditions: async (studentId) => {
    try {
      const response = await api.get(`/special-conditions/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching special conditions:', error);
      throw error;
    }
  },

  // API cập nhật thông tin y tế
  updateHealthProfile: async (studentId, data) => {
    try {
      const response = await api.put(`/health-profiles/student/${studentId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating health profile:', error);
      throw error;
    }
  },

  // API tạo báo cáo y tế
  generateMedicalReport: async (studentId, reportType) => {
    try {
      const response = await api.get(`/medical-reports/student/${studentId}?type=${reportType}`);
      return response.data;
    } catch (error) {
      console.error('Error generating medical report:', error);
      throw error;
    }
  },

  // API cho giấy phép y tế/chứng nhận sức khỏe
  getHealthCertificates: async (studentId) => {
    try {
      const response = await api.get(`/health-certificates/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching health certificates:', error);
      throw error;
    }
  },

  // API cho lịch hẹn khám
  getMedicalAppointments: async (studentId) => {
    try {
      const response = await api.get(`/medical-appointments/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical appointments:', error);
      throw error;
    }
  },

  // Method để lấy health profile chi tiết (giữ lại để backward compatibility)
  getHealthProfileDetail: async (studentId) => {
    return medicalService.getHealthProfile(studentId);
  },

  // Method để lấy tất cả dữ liệu y tế tổng hợp
  getAllMedicalData: async (studentId) => {
    try {
      const [
        healthProfile,
        checkups,
        incidents,
        vaccinationHistory,
        notifications,
        medications,
        metrics,
        allergies,
        specialConditions,
        certificates,
        appointments
      ] = await Promise.allSettled([
        medicalService.getHealthProfile(studentId),
        medicalService.getMedicalCheckups(studentId),
        medicalService.getMedicalIncidents(studentId),
        medicalService.getVaccinationHistory(studentId),
        medicalService.getMedicalNotifications(studentId),
        medicalService.getMedications(studentId),
        medicalService.getHealthMetrics(studentId),
        medicalService.getAllergies(studentId),
        medicalService.getSpecialConditions(studentId),
        medicalService.getHealthCertificates(studentId),
        medicalService.getMedicalAppointments(studentId)
      ]);

      return {
        healthProfile: healthProfile.status === 'fulfilled' ? healthProfile.value : null,
        checkups: checkups.status === 'fulfilled' ? checkups.value : [],
        incidents: incidents.status === 'fulfilled' ? incidents.value : [],
        vaccinationHistory: vaccinationHistory.status === 'fulfilled' ? vaccinationHistory.value : [],
        notifications: notifications.status === 'fulfilled' ? notifications.value : [],
        medications: medications.status === 'fulfilled' ? medications.value : [],
        metrics: metrics.status === 'fulfilled' ? metrics.value : null,
        allergies: allergies.status === 'fulfilled' ? allergies.value : [],
        specialConditions: specialConditions.status === 'fulfilled' ? specialConditions.value : [],
        certificates: certificates.status === 'fulfilled' ? certificates.value : [],
        appointments: appointments.status === 'fulfilled' ? appointments.value : []
      };
    } catch (error) {
      console.error('Error fetching all medical data:', error);
      throw error;
    }
  },

  // Lấy checkups cho GeneralTab merge - sử dụng studentCode
  getMedicalCheckupsForGeneral: async (studentCode) => {
    try {
      // Nếu không có endpoint riêng, tạm thời trả về array rỗng
      // Trong tương lai có thể implement endpoint /medical-checkups/student-code/{studentCode}
      console.log('Getting checkups for student code:', studentCode);
      return [];
    } catch (error) {
      console.error('Error fetching medical checkups for general tab:', error);
      return [];
    }
  },
};

export default medicalService;