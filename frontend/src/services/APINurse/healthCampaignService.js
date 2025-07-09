import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

// Tạo axios instance với config cơ bản
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 Health Campaign API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor để handle response
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Health Campaign API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

const healthCampaignService = {
  // Lấy danh sách chiến dịch kiểm tra sức khỏe
  getHealthCampaigns: async () => {
    try {
      console.log('📥 Fetching health campaigns...');
      const response = await apiClient.get('/health-campaigns');
      
      if (response.status === 200) {
        const campaigns = response.data;
        console.log('✅ Health campaigns loaded:', campaigns.length, 'items');
        
        return {
          success: true,
          data: campaigns,
          message: 'Lấy danh sách chiến dịch thành công'
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Get health campaigns failed:', error);
      
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || error.message || 'Có lỗi khi lấy danh sách chiến dịch',
        error: error
      };
    }
  },

  // Tạo chiến dịch kiểm tra sức khỏe mới
  createHealthCampaign: async (campaignData) => {
    try {
      console.log('📤 Creating health campaign:', campaignData);
      const response = await apiClient.post('/health-campaigns', campaignData);
      
      if (response.status === 200 || response.status === 201) {
        const createdCampaign = response.data;
        console.log('✅ Health campaign created:', createdCampaign);
        
        return {
          success: true,
          data: createdCampaign,
          message: 'Tạo chiến dịch kiểm tra sức khỏe thành công'
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Create health campaign failed:', error);
      
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || error.message || 'Có lỗi khi tạo chiến dịch',
        error: error
      };
    }
  },

  // Cập nhật chiến dịch (nếu cần trong tương lai)
  updateHealthCampaign: async (id, campaignData) => {
    try {
      console.log('📤 Updating health campaign:', id, campaignData);
      const response = await apiClient.put(`/health-campaigns/${id}`, campaignData);
      
      if (response.status === 200) {
        const updatedCampaign = response.data;
        console.log('✅ Health campaign updated:', updatedCampaign);
        
        return {
          success: true,
          data: updatedCampaign,
          message: 'Cập nhật chiến dịch thành công'
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Update health campaign failed:', error);
      
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || error.message || 'Có lỗi khi cập nhật chiến dịch',
        error: error
      };
    }
  },

  // Xóa chiến dịch (nếu cần trong tương lai)
  deleteHealthCampaign: async (id) => {
    try {
      console.log('🗑️ Deleting health campaign:', id);
      const response = await apiClient.delete(`/health-campaigns/${id}`);
      
      if (response.status === 200 || response.status === 204) {
        console.log('✅ Health campaign deleted');
        
        return {
          success: true,
          data: null,
          message: 'Xóa chiến dịch thành công'
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Delete health campaign failed:', error);
      
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || error.message || 'Có lỗi khi xóa chiến dịch',
        error: error
      };
    }
  }
};

export default healthCampaignService; 