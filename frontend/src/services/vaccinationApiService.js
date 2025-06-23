import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

// Cấu hình Axios instance
const apiService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor để xử lý token
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const vaccinationApiService = {
  // Lấy danh sách tiêm chủng
  getAllVaccinations: async () => {
    try {
      const response = await apiService.get('/vaccinations');
      return response.data;
    } catch (error) {
      console.error('API error in getAllVaccinations:', error);
      throw error;
    }
  },

  // Lấy danh sách phụ huynh
  getAllParents: async () => {
    try {
      const response = await apiService.get('/parents');
      return response.data;
    } catch (error) {
      console.error('API error in getAllParents:', error);
      throw error;
    }
  },

  // Lấy thông tin tiêm chủng theo ID
  getVaccinationById: async (id) => {
    try {
      const response = await apiService.get(`/vaccinations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`API error in getVaccinationById(${id}):`, error);
      throw error;
    }
  },

  // Lấy thông tin phụ huynh theo ID
  getParentById: async (id) => {
    try {
      const response = await apiService.get(`/parents/${id}`);
      return response.data;
    } catch (error) {
      console.error(`API error in getParentById(${id}):`, error);
      throw error;
    }
  },

  // Tạo mới bản ghi tiêm chủng
  createVaccination: async (data) => {
    try {
      const response = await apiService.post('/vaccinations', data);
      return response.data;
    } catch (error) {
      console.error('API error in createVaccination:', error);
      throw error;
    }
  },

  // Cập nhật bản ghi tiêm chủng
  updateVaccination: async (id, data) => {
    try {
      const response = await apiService.put(`/vaccinations/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`API error in updateVaccination(${id}):`, error);
      throw error;
    }
  },

  // Xóa bản ghi tiêm chủng
  deleteVaccination: async (id) => {
    try {
      const response = await apiService.delete(`/vaccinations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`API error in deleteVaccination(${id}):`, error);
      throw error;
    }
  },

  // Tìm kiếm tiêm chủng
  searchVaccinations: async (params) => {
    try {
      const response = await apiService.get('/vaccinations', { params });
      return response.data;
    } catch (error) {
      console.error('API error in searchVaccinations:', error);
      throw error;
    }
  },

  // Tạo kế hoạch tiêm chủng
  createVaccinationPlan: async (planData) => {
    try {
      const response = await apiService.post('/vaccination-plans', planData);
      return response.data;
    } catch (error) {
      console.error('API error in createVaccinationPlan:', error);
      throw error;
    }
  },

  // Lấy danh sách kế hoạch tiêm chủng
  getVaccinationPlans: async () => {
    try {
      const response = await apiService.get('/vaccination-plans');
      return response.data;
    } catch (error) {
      console.error('API error in getVaccinationPlans:', error);
      throw error;
    }
  },

  // Xóa kế hoạch tiêm chủng
  deleteVaccinationPlan: async (id) => {
    try {
      const response = await apiService.delete(`/vaccination-plans/${id}`);
      return response.data;
    } catch (error) {
      console.error(`API error in deleteVaccinationPlan(${id}):`, error);
      throw error;
    }
  },

  // Cập nhật kế hoạch tiêm chủng
  updateVaccinationPlan: async (id, data) => {
    try {
      const response = await apiService.put(`/vaccination-plans/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`API error in updateVaccinationPlan(${id}):`, error);
      throw error;
    }
  },

  // Gửi thông báo tiêm chủng
  sendVaccinationNotification: async (notificationData) => {
    try {
      const response = await apiService.post('/vaccination-notifications', notificationData);
      return response.data;
    } catch (error) {
      console.error('API error in sendVaccinationNotification:', error);
      throw error;
    }
  },

  // Lấy danh sách thông báo tiêm chủng
  getVaccinationNotifications: async () => {
    try {
      const response = await apiService.get('/vaccination-notifications');
      return response.data;
    } catch (error) {
      console.error('API error in getVaccinationNotifications:', error);
      throw error;
    }
  },

  // Backup: Xử lý khi API không hoạt động
  getMockVaccinationRecords: () => {
    return [
      {
        "id": 1,
        "healthProfileId": null,
        "studentName": null,
        "vaccineName": "Vắc xin COVID-19 Pfizer",
        "vaccinationDate": "2024-04-15",
        "nextDoseDate": "2025-04-15",
        "doseNumber": 1,
        "administeredBy": null,
        "administeredAt": "Phòng y tế trường",
        "notes": "Không có phản ứng phụ",
        "parentConsent": null
      },
      {
        "id": 2,
        "healthProfileId": null,
        "studentName": null,
        "vaccineName": "Vắc xin COVID-19 Pfizer",
        "vaccinationDate": "2024-04-15",
        "nextDoseDate": "2025-04-15",
        "doseNumber": 1,
        "administeredBy": null,
        "administeredAt": "Phòng y tế trường",
        "notes": "Không có phản ứng phụ",
        "parentConsent": null
      },
      {
        "id": 3,
        "healthProfileId": null,
        "studentName": null,
        "vaccineName": "Vắc xin COVID-19 Pfizer",
        "vaccinationDate": "2024-04-15",
        "nextDoseDate": "2025-04-15",
        "doseNumber": 1,
        "administeredBy": null,
        "administeredAt": "Phòng y tế trường",
        "notes": "Không có phản ứng phụ",
        "parentConsent": null
      },
      {
        "id": 4,
        "healthProfileId": null,
        "studentName": null,
        "vaccineName": "Vắc xin Cúm mùa",
        "vaccinationDate": "2024-03-20",
        "nextDoseDate": "2025-03-20",
        "doseNumber": 1,
        "administeredBy": null,
        "administeredAt": "Phòng y tế trường",
        "notes": "Tiêm phòng cúm mùa thành công",
        "parentConsent": null
      }
    ];
  },
  
  // Mock data phụ huynh khi API không hoạt động
  getMockParents: () => {
    return [
      {
        "id": 1,
        "fullName": "Nguyễn Văn Hùng",
        "phoneNumber": "0945678901",
        "email": "nguyen.phuhuynh@gmail.com",
        "address": "123 Đường Lê Lợi, Quận 1, TP.HCM",
        "occupation": null,
        "relationshipType": "Bố",
        "accountId": "PARENT001"
      },
      {
        "id": 2,
        "fullName": "Trần Thị Mai",
        "phoneNumber": "0956789012",
        "email": "tran.phuhuynh@gmail.com",
        "address": "456 Đường Nguyễn Huệ, Quận 3, TP.HCM",
        "occupation": null,
        "relationshipType": "Mẹ",
        "accountId": "PARENT002"
      }
    ];
  },

  // Thêm phương thức gửi thông báo
  sendNotification: async (notificationData) => {
    try {
      const response = await apiService.post('/notifications/create', notificationData);
      return response.data;
    } catch (error) {
      console.error('API error in sendNotification:', error);
      throw error;
    }
  },

  // Lấy danh sách thông báo tiêm chủng theo loại
  getNotificationsByType: async (type) => {
    try {
      const response = await apiService.get(`/notifications/nurse/getNotificationsByType/${type}`);
      return response.data;
    } catch (error) {
      console.error(`API error in getNotificationsByType(${type}):`, error);
      throw error;
    }
  },

  // Thêm mũi tiêm mới
  addVaccinationRecord: async (vaccinationData) => {
    try {
      const response = await apiService.post('/vaccinations', vaccinationData);
      return response.data;
    } catch (error) {
      console.error('API error in addVaccinationRecord:', error);
      throw error;
    }
  },

  // Lấy danh sách vaccine
  getVaccines: async () => {
    try {
      const response = await apiService.get('/vaccines');
      return response.data;
    } catch (error) {
      console.error('API error in getVaccines:', error);
      // Trả về danh sách mock vaccine khi API không hoạt động
      return [
        { id: 1, name: 'Vắc xin COVID-19 Pfizer' },
        { id: 2, name: 'Vắc xin COVID-19 Moderna' },
        { id: 3, name: 'Vắc xin Cúm mùa' },
        { id: 4, name: 'Vắc xin Sởi-Quai bị-Rubella' },
        { id: 5, name: 'Vắc xin Bạch hầu-Ho gà-Uốn ván' }
      ];
    }
  },
};

export default vaccinationApiService;