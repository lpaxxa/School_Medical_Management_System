import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

// Cấu hình Axios instance cho Admin Medication
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

const medicationService = {
  // Lấy danh sách tất cả medication items
  getAllMedicationItems: async () => {
    try {
      console.log('🚀 [Admin] Fetching medication items...');
      
      const response = await apiService.get('/medication-items/get-all');
      
      console.log('✅ [Admin] Medication items fetched successfully:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách thuốc thành công!'
      };
    } catch (error) {
      console.error('❌ [Admin] Error fetching medication items:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi lấy danh sách thuốc';
      
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

  // Lấy thông tin medication item theo ID
  getMedicationItemById: async (id) => {
    try {
      console.log(`🔍 [Admin] Fetching medication item ID ${id}...`);
      
      const response = await apiService.get(`/medication-items/${id}`);
      
      console.log('✅ [Admin] Medication item fetched successfully:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin thuốc thành công!'
      };
    } catch (error) {
      console.error(`❌ [Admin] Error fetching medication item ID ${id}:`, error);
      
      return {
        success: false,
        error: error,
        message: 'Có lỗi xảy ra khi lấy thông tin thuốc'
      };
    }
  },

  // Thống kê medication items theo loại
  getMedicationStatistics: async () => {
    try {
      console.log('📊 [Admin] Fetching medication statistics...');
      
      const response = await apiService.get('/medication-items/get-all');
      
      if (response.data && Array.isArray(response.data)) {
        const items = response.data;
        
        // Thống kê theo loại
        const stats = {
          total: items.length,
          byType: {},
          lowStock: 0,
          nearExpiry: 0,
          totalValue: 0
        };
        
        const now = new Date();
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(now.getMonth() + 6);
        
        items.forEach(item => {
          // Thống kê theo loại
          const type = item.itemType || 'Khác';
          stats.byType[type] = (stats.byType[type] || 0) + 1;
          
          // Kiểm tra hàng tồn kho thấp (dưới 20)
          if (item.stockQuantity < 20) {
            stats.lowStock++;
          }
          
          // Kiểm tra sắp hết hạn (trong 6 tháng)
          const expiryDate = new Date(item.expiryDate);
          if (expiryDate <= sixMonthsFromNow) {
            stats.nearExpiry++;
          }
        });
        
        console.log('✅ [Admin] Medication statistics calculated:', stats);
        return {
          success: true,
          data: stats,
          message: 'Thống kê thuốc thành công!'
        };
      }
      
      throw new Error('Dữ liệu không đúng định dạng');
    } catch (error) {
      console.error('❌ [Admin] Error calculating medication statistics:', error);
      
      return {
        success: false,
        error: error,
        message: 'Có lỗi xảy ra khi thống kê thuốc'
      };
    }
  }
};

export default medicationService; 