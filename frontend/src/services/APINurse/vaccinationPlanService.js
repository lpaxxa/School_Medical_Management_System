import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

// Cấu hình Axios instance
const apiService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor để xử lý token (nếu cần)
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

const vaccinationPlanService = {
  // Tạo kế hoạch tiêm chủng
  createVaccinationPlan: async (planData) => {
    try {
      console.log('🚀 Gửi request tạo kế hoạch tiêm chủng:', planData);
      
      const response = await apiService.post('/vaccination-plans', planData);
      
      console.log('✅ Tạo kế hoạch tiêm chủng thành công:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Tạo kế hoạch tiêm chủng thành công!'
      };
    } catch (error) {
      console.error('❌ Lỗi khi tạo kế hoạch tiêm chủng:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi tạo kế hoạch tiêm chủng';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || `Lỗi ${error.response.status}: ${error.response.statusText}`;
        console.error('Response error:', error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        console.error('Request error:', error.request);
      } else {
        // Something happened in setting up the request
        errorMessage = `Lỗi cấu hình request: ${error.message}`;
        console.error('Config error:', error.message);
      }
      
      return {
        success: false,
        error: error,
        message: errorMessage
      };
    }
  },

  // Lấy danh sách kế hoạch tiêm chủng
  getVaccinationPlans: async () => {
    try {
      console.log('🔍 Lấy danh sách kế hoạch tiêm chủng...');
      
      const response = await apiService.get('/vaccination-plans');
      
      console.log('✅ Lấy danh sách thành công:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách kế hoạch thành công!'
      };
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách kế hoạch:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi lấy danh sách kế hoạch tiêm chủng';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Lỗi ${error.response.status}: ${error.response.statusText}`;
        console.error('Response error:', error.response.data);
      } else if (error.request) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        console.error('Request error:', error.request);
      } else {
        errorMessage = `Lỗi cấu hình request: ${error.message}`;
        console.error('Config error:', error.message);
      }
      
      return {
        success: false,
        error: error,
        message: errorMessage
      };
    }
  },

  // Lấy kế hoạch tiêm chủng theo ID
  getVaccinationPlanById: async (id) => {
    try {
      console.log(`🔍 Lấy kế hoạch tiêm chủng ID ${id}...`);
      
      const response = await apiService.get(`/vaccination-plans/${id}`);
      
      console.log('✅ Lấy kế hoạch thành công:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Lấy kế hoạch tiêm chủng thành công!'
      };
    } catch (error) {
      console.error(`❌ Lỗi khi lấy kế hoạch ID ${id}:`, error);
      
      return {
        success: false,
        error: error,
        message: 'Có lỗi xảy ra khi lấy kế hoạch tiêm chủng'
      };
    }
  },

  // Cập nhật kế hoạch tiêm chủng
  updateVaccinationPlan: async (id, planData) => {
    try {
      console.log(`🔄 Cập nhật kế hoạch tiêm chủng ID ${id}:`, planData);
      
      const response = await apiService.put(`/vaccination-plans/${id}`, planData);
      
      console.log('✅ Cập nhật thành công:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật kế hoạch tiêm chủng thành công!'
      };
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật kế hoạch:', error);
      
      return {
        success: false,
        error: error,
        message: 'Có lỗi xảy ra khi cập nhật kế hoạch tiêm chủng'
      };
    }
  },

  // Xóa kế hoạch tiêm chủng
  deleteVaccinationPlan: async (id) => {
    try {
      console.log(`🗑️ Xóa kế hoạch tiêm chủng ID ${id}`);
      
      const response = await apiService.delete(`/vaccination-plans/${id}`);
      
      console.log('✅ Xóa thành công:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Xóa kế hoạch tiêm chủng thành công!'
      };
    } catch (error) {
      console.error('❌ Lỗi khi xóa kế hoạch:', error);
      
      return {
        success: false,
        error: error,
        message: 'Có lỗi xảy ra khi xóa kế hoạch tiêm chủng'
      };
    }
  }
};

export default vaccinationPlanService; 