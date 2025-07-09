import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

// Cấu hình Axios instance cho Admin
const apiService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor để xử lý token cho Admin
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
  // Helper function để format status
  formatStatus: (status) => {
    const statusMap = {
      'WAITING_PARENT': {
        text: 'Chờ phụ huynh',
        color: '#ff9800',
        bgColor: '#fff3e0',
        icon: '⏳'
      },
      'IN_PROGRESS': {
        text: 'Đang triển khai',
        color: '#2196f3',
        bgColor: '#e3f2fd',
        icon: '🔄'
      },
      'COMPLETED': {
        text: 'Hoàn thành',
        color: '#4caf50',
        bgColor: '#e8f5e8',
        icon: '✅'
      },
      'CANCELED': {
        text: 'Đã hủy',
        color: '#f44336',
        bgColor: '#ffebee',
        icon: '❌'
      }
    };
    
    return statusMap[status] || {
      text: status,
      color: '#666',
      bgColor: '#f5f5f5',
      icon: '❓'
    };
  },

  // Helper function để format ngày tháng
  formatDate: (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString('vi-VN', options);
  },

  // Helper function để format ngày tiêm (chỉ ngày)
  formatVaccinationDate: (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
    
    return date.toLocaleDateString('vi-VN', options);
  },

  // Helper function để kiểm tra trạng thái thời gian
  getTimeStatus: (vaccinationDate, deadlineDate) => {
    const now = new Date();
    const vaccDate = new Date(vaccinationDate);
    const deadline = new Date(deadlineDate);
    
    if (now > vaccDate) {
      return { type: 'past', text: 'Đã qua', color: '#666' };
    } else if (now > deadline) {
      return { type: 'overdue', text: 'Quá hạn đăng ký', color: '#f44336' };
    } else if (now > new Date(deadline.getTime() - 24 * 60 * 60 * 1000)) {
      return { type: 'urgent', text: 'Sắp hết hạn', color: '#ff9800' };
    } else {
      return { type: 'normal', text: 'Còn thời gian', color: '#4caf50' };
    }
  },

  // Tạo kế hoạch tiêm chủng
  createVaccinationPlan: async (planData) => {
    try {
      console.log('🚀 [Admin] Gửi request tạo kế hoạch tiêm chủng:', planData);
      
      const response = await apiService.post('/vaccination-plans/create', planData);
      
      console.log('✅ [Admin] Tạo kế hoạch tiêm chủng thành công:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Tạo kế hoạch tiêm chủng thành công!'
      };
    } catch (error) {
      console.error('❌ [Admin] Lỗi khi tạo kế hoạch tiêm chủng:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi tạo kế hoạch tiêm chủng';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || `Lỗi ${error.response.status}: ${error.response.statusText}`;
        console.error('[Admin] Response error:', error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        console.error('[Admin] Request error:', error.request);
      } else {
        // Something happened in setting up the request
        errorMessage = `Lỗi cấu hình request: ${error.message}`;
        console.error('[Admin] Config error:', error.message);
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
      console.log('🔍 [Admin] Lấy danh sách kế hoạch tiêm chủng...');
      
      const response = await apiService.get('/vaccination-plans/getAllVaccinationPlans');
      
      console.log('✅ [Admin] Lấy danh sách thành công:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách kế hoạch thành công!'
      };
    } catch (error) {
      console.error('❌ [Admin] Lỗi khi lấy danh sách kế hoạch:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi lấy danh sách kế hoạch tiêm chủng';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Lỗi ${error.response.status}: ${error.response.statusText}`;
        console.error('[Admin] Response error:', error.response.data);
      } else if (error.request) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        console.error('[Admin] Request error:', error.request);
      } else {
        errorMessage = `Lỗi cấu hình request: ${error.message}`;
        console.error('[Admin] Config error:', error.message);
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
      console.log(`🔍 [Admin] Lấy kế hoạch tiêm chủng ID ${id}...`);
      
      const response = await apiService.get(`/vaccination-plans/${id}`);
      
      console.log('✅ [Admin] Lấy kế hoạch thành công:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Lấy kế hoạch tiêm chủng thành công!'
      };
    } catch (error) {
      console.error(`❌ [Admin] Lỗi khi lấy kế hoạch ID ${id}:`, error);
      
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
      console.log(`🔄 [Admin] Cập nhật kế hoạch tiêm chủng ID ${id}:`, planData);
      
      const response = await apiService.put(`/vaccination-plans/${id}`, planData);
      
      console.log('✅ [Admin] Cập nhật thành công:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật kế hoạch tiêm chủng thành công!'
      };
    } catch (error) {
      console.error('❌ [Admin] Lỗi khi cập nhật kế hoạch:', error);
      
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
      console.log(`🗑️ [Admin] Xóa kế hoạch tiêm chủng ID ${id}`);
      
      const response = await apiService.delete(`/vaccination-plans/${id}`);
      
      console.log('✅ [Admin] Xóa thành công:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Xóa kế hoạch tiêm chủng thành công!'
      };
    } catch (error) {
      console.error('❌ [Admin] Lỗi khi xóa kế hoạch:', error);
      
      return {
        success: false,
        error: error,
        message: 'Có lỗi xảy ra khi xóa kế hoạch tiêm chủng'
      };
    }
  },

  // Thay đổi trạng thái kế hoạch tiêm chủng
  updateVaccinationPlanStatus: async (id, status) => {
    try {
      console.log(`🔄 [Admin] Thay đổi trạng thái kế hoạch ID ${id} thành:`, status);
      
      const response = await apiService.patch(`/vaccination-plans/${id}/status`, {
        status: status
      });
      
      console.log('✅ [Admin] Thay đổi trạng thái thành công:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Thay đổi trạng thái thành công!'
      };
    } catch (error) {
      console.error('❌ [Admin] Lỗi khi thay đổi trạng thái:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi thay đổi trạng thái';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Lỗi ${error.response.status}: ${error.response.statusText}`;
        console.error('[Admin] Response error:', error.response.data);
      } else if (error.request) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        console.error('[Admin] Request error:', error.request);
      } else {
        errorMessage = `Lỗi cấu hình request: ${error.message}`;
        console.error('[Admin] Config error:', error.message);
      }
      
      return {
        success: false,
        error: error,
        message: errorMessage
      };
    }
  }
};

export default vaccinationPlanService;