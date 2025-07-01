import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

// Helper function to check token validity
const isTokenValid = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  
  try {
    // Parse JWT token (assuming it's a JWT)
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Check if token is expired
    return payload.exp * 1000 > Date.now();
  } catch (e) {
    console.error('Error checking token validity:', e);
    return false;
  }
};

// Helper function to refresh token if needed
const ensureValidToken = async () => {
  if (!isTokenValid()) {
    console.log('Token is invalid or expired, attempting to refresh...');
    try {
      // Try to refresh the token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken
        });
        
        if (response.data && response.data.token) {
          localStorage.setItem('authToken', response.data.token);
          console.log('Token refreshed successfully');
          return true;
        }
      }
      console.error('Could not refresh token');
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }
  return true;
};

// Cấu hình Axios instance
const apiService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor để xử lý token
apiService.interceptors.request.use(
  async (config) => {
    // Try to ensure we have a valid token before making the request
    await ensureValidToken();
    
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Request with token:', token.substring(0, 15) + '...');
    } else {
      console.warn('No auth token found in localStorage!');
    }
    console.log('Request URL:', config.url);
    console.log('Request method:', config.method);
    console.log('Request headers:', JSON.stringify(config.headers));
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error logging
apiService.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('Response error data:', error.response.data);
      console.error('Response error status:', error.response.status);
      console.error('Response error headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
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

  // Cập nhật bản ghi tiêm chủng - cập nhật theo đúng API endpoint và format
  updateVaccination: async (id, data) => {
    try {
      // Đảm bảo chỉ gửi các trường cần thiết theo format API
      const updatePayload = {
        administeredAt: data.administeredAt || "",
        doseNumber: data.doseNumber || 1,
        notes: data.notes || "",
        vaccineName: data.vaccineName || "",
        administeredBy: data.administeredBy || 1
      };
      
      console.log(`Updating vaccination record ${id} with data:`, updatePayload);
      const response = await apiService.put(`/vaccinations/${id}`, updatePayload);
      return response.data;
    } catch (error) {
      console.error(`API error in updateVaccination(${id}):`, error);
      throw error;
    }
  },

  // Xóa bản ghi tiêm chủng - cập nhật theo đúng API endpoint
  deleteVaccination: async (id) => {
    try {
      console.log(`Deleting vaccination record with ID: ${id}`);
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
      // Trả về mock data khi API lỗi
      return [
        {
          "id": 1,
          "vaccineName": "Vắc-xin Viêm gan B",
          "vaccinationDate": "2025-08-20",
          "status": "ONGOING",
          "statusVietnamese": "Đang diễn ra",
          "description": "Kế hoạch tiêm chủng vắc xin Viêm gan B cho học sinh mới",
          "createdAt": "2025-06-24",
          "updatedAt": "2025-06-24"
        },
        {
          "id": 2,
          "vaccineName": "Vắc-xin Viêm gan B",
          "vaccinationDate": "2025-08-20",
          "status": "ONGOING",
          "statusVietnamese": "Đang diễn ra",
          "description": "Kế hoạch tiêm chủng vắc xin Viêm gan B cho học sinh mới",
          "createdAt": "2025-06-24",
          "updatedAt": "2025-06-24"
        },
        {
          "id": 3,
          "vaccineName": "Vắc-xin Sởi-Quai bị-Rubella",
          "vaccinationDate": "2025-06-10",
          "status": "COMPLETED",
          "statusVietnamese": "Kết thúc",
          "description": "Kế hoạch tiêm chủng đã hoàn thành cho học sinh khối 11",
          "createdAt": "2025-06-24",
          "updatedAt": "2025-06-24"
        },
        {
          "id": 4,
          "vaccineName": "Vắc-xin cúm mùa",
          "vaccinationDate": "2025-09-05",
          "status": "CANCELLED",
          "statusVietnamese": "Đã hủy",
          "description": "Kế hoạch tiêm chủng đã bị hủy do thiếu vắc xin",
          "createdAt": "2025-06-24",
          "updatedAt": "2025-06-24"
        }
      ];
    }
  },

  // Lấy chi tiết kế hoạch tiêm chủng theo ID
  getVaccinationPlanById: async (id) => {
    try {
      const response = await apiService.get(`/vaccination-plans/${id}`);
      return response.data;
    } catch (error) {
      console.error(`API error in getVaccinationPlanById(${id}):`, error);
      // Trả về mock data khi API lỗi
      return {
        "id": id,
        "vaccineName": "Vắc-xin Viêm gan B",
        "vaccinationDate": "2025-08-20",
        "status": "ONGOING",
        "statusVietnamese": "Đang diễn ra",
        "description": "Kế hoạch tiêm chủng vắc xin Viêm gan B cho học sinh mới",
        "createdAt": "2025-06-24",
        "updatedAt": "2025-06-24"
      };
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
        "studentName": "Nguyễn Văn A",
        "vaccineName": "Vắc xin COVID-19 Pfizer",
        "vaccinationDate": "2024-04-15",
        "nextDoseDate": "2025-04-15",
        "doseNumber": 1,
        "administeredBy": "Bác sĩ Nguyễn Thị B",
        "administeredAt": "Phòng y tế trường",
        "notes": "Không có phản ứng phụ",
        "parentConsent": null
      },
      {
        "id": 2,
        "healthProfileId": null,
        "studentName": "Trần Thị C",
        "vaccineName": "Vắc xin COVID-19 Pfizer",
        "vaccinationDate": "2024-04-15",
        "nextDoseDate": "2025-04-15",
        "doseNumber": 1,
        "administeredBy": "Bác sĩ Nguyễn Thị B",
        "administeredAt": "Phòng y tế trường",
        "notes": "Không có phản ứng phụ",
        "parentConsent": null
      },
      {
        "id": 3,
        "healthProfileId": null,
        "studentName": "Lê Văn D",
        "vaccineName": "Vắc xin COVID-19 Pfizer",
        "vaccinationDate": "2024-04-15",
        "nextDoseDate": "2025-04-15",
        "doseNumber": 1,
        "administeredBy": "Bác sĩ Nguyễn Thị B",
        "administeredAt": "Phòng y tế trường",
        "notes": "Không có phản ứng phụ",
        "parentConsent": null
      },
      {
        "id": 4,
        "healthProfileId": null,
        "studentName": "Phạm Thị E",
        "vaccineName": "Vắc xin Cúm mùa",
        "vaccinationDate": "2024-03-20",
        "nextDoseDate": "2025-03-20",
        "doseNumber": 1,
        "administeredBy": "Bác sĩ Nguyễn Thị B",
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
      // Đảm bảo senderId là số nguyên và không phải null
      const senderId = notificationData.senderId ? parseInt(notificationData.senderId) : 1;
      
      // Chuẩn bị payload với senderId đã được xử lý
      const payload = {
        ...notificationData,
        senderId: senderId,
        receiverIds: notificationData.receiverIds.map(id => parseInt(id))
      };
      
      console.log('Sending notification payload:', JSON.stringify(payload, null, 2));
      
      // Lấy token xác thực
      const token = localStorage.getItem('authToken');
      
      // Tạo config request với header xác thực
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      };
      
      const response = await apiService.post('/notifications/create', payload, config);
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
      // Chuyển đổi dữ liệu từ form sang định dạng API yêu cầu
      const payload = {
        administeredAt: vaccinationData.administeredAt || "Phòng y tế trường",
        doseNumber: parseInt(vaccinationData.dose),
        nextDoseDate: vaccinationData.nextDoseDate || null,
        notes: vaccinationData.notes || "",
        vaccineName: vaccinationData.vaccineName,
        healthProfileId: parseInt(vaccinationData.studentId) || 1,
        notificationRecipientID: vaccinationData.recipientId || 1,
        administeredBy: 1 // ID của nhân viên y tế đang đăng nhập
      };
      
      console.log("Sending vaccination data:", payload);
      
      const response = await apiService.post('/vaccinations/create', payload);
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