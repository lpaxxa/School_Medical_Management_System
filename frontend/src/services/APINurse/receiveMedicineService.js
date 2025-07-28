// Service API cho quản lý thuốc từ phụ huynh
import api from './../api.js';
import sessionService from '../sessionService';
import axios from 'axios';

// BASE_URL cho tab "Đơn nhận thuốc"
const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1/nurse-medication-approvals`;
// BASE_URL1 cho tab "Lịch sử dùng thuốc"
const BASE_URL1 = `${import.meta.env.VITE_BACKEND_URL}/api/v1/medication-administrations`;

// Instance cho "Đơn nhận thuốc"
const apiService = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Instance cho "Lịch sử dùng thuốc"
const apiService1 = axios.create({
  baseURL: BASE_URL1,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Thêm interceptor cho cả hai instance nếu cần token using sessionService
[apiService, apiService1].forEach(service => {
  service.interceptors.request.use(
    (config) => {
      const token = sessionService.getToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        // Extend session on API activity
        sessionService.extendSession();
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
});

// Thay thế hàm checkAuthToken hiện tại
// Simplified token check using sessionService
const checkAuthToken = () => {
  const isAuthenticated = sessionService.isAuthenticated();
  const token = sessionService.getToken();

  if (isAuthenticated && token) {
    console.log(`Token exists: ${token.substring(0, 15)}...`);
    console.log('Token hợp lệ và chưa hết hạn.');
    return true;
  } else {
    console.warn('Không tìm thấy token hợp lệ!');
    return false;
  }
};

// Gọi hàm để kiểm tra
const tokenValid = checkAuthToken();
console.log('Token valid:', tokenValid);

const receiveMedicineService = {
  // Test server connectivity - Function để kiểm tra kết nối server
  testServerConnection: async () => {
    try {
      console.log('🔍 Testing server connection...');
      console.log('🔍 API Service 1 Base URL:', apiService1.defaults.baseURL);
      
      // Test with a simple GET request to a known endpoint
      const response = await apiService1.get('/recent?page=1&size=1');
      console.log('✅ Server connection successful:', response.status);
      return {
        success: true,
        message: "Server connection successful",
        status: response.status
      };
    } catch (error) {
      console.error('❌ Server connection failed:', error);
      return {
        success: false,
        message: "Server connection failed",
        error: error.message,
        status: error.response?.status
      };
    }
  },

  // API thật để lấy tất cả yêu cầu thuốc
  getAllMedicineRequests: async () => {
    try {
      console.log('Gọi API lấy danh sách yêu cầu thuốc...');
      console.log('Auth token status:', sessionService.getToken() ? 'Token exists' : 'No token');
      
      // SỬA ĐỔI: Sử dụng apiService thay vì api và điều chỉnh endpoint
      const response = await apiService.get('/all-requests');
      console.log('API getAllMedicineRequests response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error("API call failed for getAllMedicineRequests:", error.response || error);
      
      // Ném lỗi thay vì dùng mock data
      throw {
        message: error.response?.data?.message || 'Không thể tải danh sách yêu cầu thuốc',
        status: error.response?.status
      };
    }
  },

  // TODO: Chờ API - Tìm kiếm thuốc theo tên
  searchMedicationByName: async (searchTerm) => {
    console.log("TODO: Implement real API - Searching medication by name:", searchTerm);
    
    // Tạm thời throw error để tránh dùng mock data trong production
    throw {
      success: false,
      message: 'API chưa được implement cho chức năng tìm kiếm thuốc theo tên. Vui lòng liên hệ team phát triển.'
    };
  },
  // TODO: Chờ API - Lấy chi tiết yêu cầu thuốc theo ID
  getMedicineRequestById: async (id) => {
    try {
      console.log("Calling API - Getting medicine request by ID:", id);
      
      // Gọi API thực tế để lấy chi tiết yêu cầu thuốc
      const response = await api.get(`/nurse-medication-approvals/${id}`);
      console.log('API Response for getMedicineRequestById:', response.data);
      
      return response.data;
    } catch (error) {
      console.error("API call failed for getMedicineRequestById:", error.response || error);
      
      // Ném lỗi thay vì dùng mock data
      throw {
        message: error.response?.data?.message || 'Không thể tải thông tin chi tiết yêu cầu thuốc',
        status: error.response?.status
      };
    }
  },
  // TODO: Chờ API - Thêm yêu cầu thuốc mới
  // CẢNH BÁO: Function này đang sử dụng mock data. Cần implement API thực tế trước khi dùng trong production
  addMedicineRequest: async (medicineData) => {
    console.log("TODO: Implement real API - Adding new medicine request");
    
    // Tạm thời throw error để tránh dùng mock data trong production
    throw {
      success: false,
      message: 'API chưa được implement cho chức năng thêm yêu cầu thuốc mới. Vui lòng liên hệ team phát triển.'
    };
    
    /* MOCK CODE - CHỈ DÙNG CHO DEVELOPMENT
    try {
      // Thử gọi API thật
      try {
        const response = await api.post('/create', medicineData);
        
        return response.data;
      } catch (apiError) {
        console.log("Không thể kết nối tới API thật để thêm yêu cầu, xử lý dữ liệu mẫu", apiError);
        
        // Xử lý trên dữ liệu mẫu
        const newId = Math.max(...mockMedicineRequests.map(item => item.id)) + 1;
        const newMedicineRequest = {
          id: newId,
          status: 0,
          ...medicineData,
          startDate: medicineData.startDate || new Date().toISOString().split('T')[0],
          endDate: medicineData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        
        mockMedicineRequests.push(newMedicineRequest);
        return { 
          success: true, 
          message: "Đã thêm yêu cầu thuốc mới thành công", 
          data: newMedicineRequest 
        };
      }
    } catch (error) {
      console.error("Lỗi khi thêm yêu cầu thuốc mới:", error);
      return { success: false, message: error.message };
    }
    */
  },
  
  // TODO: Chờ API - Cập nhật yêu cầu thuốc
  // CẢNH BÁO: Function này đang sử dụng mock data. Cần implement API thực tế trước khi dùng trong production
  updateMedicineRequest: async (id, medicineData) => {
    console.log("TODO: Implement real API - Updating medicine request");
    
    // Tạm thời throw error để tránh dùng mock data trong production
    throw {
      success: false,
      message: 'API chưa được implement cho chức năng cập nhật yêu cầu thuốc. Vui lòng liên hệ team phát triển.'
    };
    
    /* MOCK CODE - CHỈ DÙNG CHO DEVELOPMENT
    try {
      // Thử gọi API thật
      try {
        const data = await fetch(`/update/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(medicineData)
        });
        
        if (!data.ok) {
          throw new Error('Network response was not ok');
        }
        
        const responseData = await data.json();
        return responseData;
      } catch (apiError) {
        console.log(`Không thể kết nối tới API thật để cập nhật yêu cầu ${id}, xử lý dữ liệu mẫu`, apiError);
        
        // Xử lý trên dữ liệu mẫu
        const index = mockMedicineRequests.findIndex(req => req.id === Number(id));
        if (index !== -1) {
          mockMedicineRequests[index] = { 
            ...mockMedicineRequests[index], 
            ...medicineData,
            id: Number(id) // Đảm bảo ID không thay đổi
          };
          return { 
            success: true, 
            message: "Đã cập nhật yêu cầu thuốc thành công", 
            data: mockMedicineRequests[index] 
          };
        } else {
          throw new Error(`Không tìm thấy yêu cầu thuốc với ID ${id}`);
        }
      }
    } catch (error) {
      console.error(`Lỗi khi cập nhật thông tin thuốc với ID ${id}:`, error);
      return { success: false, message: error.message };
    }
    */
  },
  
  // Xử lý yêu cầu thuốc (phê duyệt/từ chối)
  processMedicineRequest: async (id, requestData) => {
    try {
      console.log(`Processing medicine request ${id} with data:`, requestData);
      
      // Format payload theo đúng yêu cầu API
      const payload = {
        decision: requestData.decision,
        ...(requestData.decision === 'REJECTED' && requestData.reason ? { reason: requestData.reason } : {})
      };
      
      console.log('Preparing payload for API:', payload);
      
      // Sử dụng axios qua instance api thay vì fetch để tận dụng interceptor
      const response = await api.put(`/nurse-medication-approvals/${id}/process`, payload);
      
      console.log('Response status:', response.status);
      console.log('API Response data:', response.data);
      
      return {
        success: true,
        message: `Đã ${requestData.decision === 'APPROVED' ? 'phê duyệt' : 'từ chối'} yêu cầu thuốc thành công`,
        data: response.data
      };
    } catch (error) {
      console.error(`Lỗi khi xử lý yêu cầu thuốc với ID ${id}:`, error);  
      
      // Ném lỗi thay vì dùng mock data
      throw {
        success: false,
        message: error.response?.data?.message || error.message || 'Không thể xử lý yêu cầu thuốc',
        status: error.response?.status
      };
    }
  },
  // TODO: Chờ API - Xóa yêu cầu thuốc
  // CẢNH BÁO: Function này đang sử dụng mock data. Cần implement API thực tế trước khi dùng trong production
  deleteMedicineRequest: async (id) => {
    console.log("TODO: Implement real API - Deleting medicine request");
    
    // Tạm thời throw error để tránh dùng mock data trong production
    throw {
      success: false,
      message: 'API chưa được implement cho chức năng xóa yêu cầu thuốc. Vui lòng liên hệ team phát triển.'
    };
    
    /* MOCK CODE - CHỈ DÙNG CHO DEVELOPMENT
    try {
      // Xử lý trực tiếp trên dữ liệu mẫu
      const index = mockMedicineRequests.findIndex(req => req.id === Number(id));
      if (index !== -1) {
        mockMedicineRequests.splice(index, 1);
        return { success: true, message: 'Đã xóa yêu cầu thuốc thành công' };
      } else {
        throw new Error(`Không tìm thấy yêu cầu thuốc với ID ${id}`);
      }
    } catch (error) {
      console.error(`Lỗi khi xóa yêu cầu thuốc với ID ${id}:`, error);
      return { success: false, message: error.message };
    }
    */
  },
  
  // TODO: Chờ API - Tìm kiếm thuốc từ phụ huynh theo các tiêu chí
  // CẢNH BÁO: Function này đang sử dụng mock data. Cần implement API thực tế trước khi dùng trong production
  searchMedicineRequests: async (filters) => {
    console.log("TODO: Implement real API - Searching medicine requests with filters");
    
    // Tạm thời throw error để tránh dùng mock data trong production
    throw {
      success: false,
      message: 'API chưa được implement cho chức năng tìm kiếm yêu cầu thuốc. Vui lòng liên hệ team phát triển.'
    };
    
    /* MOCK CODE - CHỈ DÙNG CHO DEVELOPMENT
    try {
      console.log("Tìm kiếm trên dữ liệu mẫu với các bộ lọc:", filters);
        
      // Tìm kiếm trên dữ liệu mẫu
      let filteredData = [...mockMedicineRequests];
        
      // Áp dụng các điều kiện lọc
      if (filters.studentId) {
        filteredData = filteredData.filter(item => 
          item.studentId.toLowerCase().includes(filters.studentId.toLowerCase())
        );
      }
        
      if (filters.studentName) {
        filteredData = filteredData.filter(item => 
          item.studentName.toLowerCase().includes(filters.studentName.toLowerCase())
        );
      }
        
      if (filters.medicineName && Array.isArray(filteredData[0]?.medicationDetails)) {
        filteredData = filteredData.filter(item => 
          item.medicationDetails.some(med => 
            med.name.toLowerCase().includes(filters.medicineName.toLowerCase())
          )
        );
      }
        
      if (filters.status !== undefined) {
        filteredData = filteredData.filter(item => 
          item.status === parseInt(filters.status)
        );
      }
        
      // Lọc theo ngày nếu có
      if (filters.fromDate) {
        const fromDate = new Date(filters.fromDate);
        filteredData = filteredData.filter(item => 
          new Date(item.startDate) >= fromDate
        );
      }
        
      if (filters.toDate) {
        const toDate = new Date(filters.toDate);
        filteredData = filteredData.filter(item => 
          new Date(item.endDate) <= toDate
        );
      }
        
      return filteredData;
    } catch (error) {
      console.error("Lỗi khi tìm kiếm thuốc từ phụ huynh:", error);
      // Trả về dữ liệu mẫu trong trường hợp xảy ra lỗi
      return [...mockMedicineRequests]; 
    }
    */
  },

  // Lấy lịch sử dùng thuốc gần đây - Function được gọi bởi MedicationHistory.jsx
  getRecentMedicationAdministrations: async (page = 1, size = 10) => {
    try {
      console.log(`🔄 Calling REAL API for medication administrations (page ${page}, size ${size})`);
      
      // Gọi API thật với pagination (1-based) và include images
      const response = await apiService1.get('/recent', {
        params: { 
          page: page, // API sử dụng 1-based index
          size: size,
          includeImages: true // Request to include image URLs in response
        }
      });
      
      console.log('✅ Real API Response for recent administrations:', response.data);
      console.log('🔍 DEBUG - Full response structure:', JSON.stringify(response.data, null, 2));
      
      // Check different possible response structures
      let actualData = [];
      let totalItems = 0;
      let totalPages = 0;
      
      if (response.data.data && response.data.data.content) {
        // Backend structure: { status: "success", data: { content: [...], totalElements: X } }
        actualData = response.data.data.content;
        totalItems = response.data.data.totalElements || 0;
        totalPages = response.data.data.totalPages || 0;
        console.log('🔍 Using backend nested structure (data.data.content)');
      } else if (response.data.content) {
        // Spring Boot pageable response structure
        actualData = response.data.content;
        totalItems = response.data.totalElements || 0;
        totalPages = response.data.totalPages || 0;
        console.log('🔍 Using Spring Boot pageable structure');
      } else if (response.data.data) {
        // Nested data structure
        actualData = response.data.data;
        totalItems = response.data.totalItems || actualData.length;
        totalPages = response.data.totalPages || Math.ceil(totalItems / size);
        console.log('🔍 Using nested data structure');
      } else if (Array.isArray(response.data)) {
        // Direct array response
        actualData = response.data;
        totalItems = actualData.length;
        totalPages = Math.ceil(totalItems / size);
        console.log('🔍 Using direct array structure');
      } else {
        console.log('🔍 Unknown response structure, checking all properties...');
        for (const [key, value] of Object.entries(response.data)) {
          console.log(`🔍 Property ${key}:`, value);
          if (Array.isArray(value)) {
            console.log(`🔍 Found array in property ${key} with ${value.length} items`);
            actualData = value;
            totalItems = value.length;
            totalPages = Math.ceil(totalItems / size);
            break;
          }
        }
      }
      
      // Process and enhance data to include image URLs if not present
      if (Array.isArray(actualData)) {
        actualData = actualData.map(item => {
          // Log each item to see its structure
          console.log('🔍 Processing administration item:', item);
          
          // Ensure imageUrl field exists - check various possible field names
          const imageUrl = item.imageUrl || 
                          item.confirmationImageUrl || 
                          item.image_url || 
                          item.confirmation_image_url ||
                          item.attachmentUrl ||
                          null;
          
          return {
            ...item,
            imageUrl: imageUrl
          };
        });
        
        console.log(`✅ Enhanced data with images: ${actualData.length} items`);
        // Log first item to see structure
        if (actualData.length > 0) {
          console.log('🔍 First item structure:', actualData[0]);
        }
      }
      
      console.log(`✅ Final extracted data: ${actualData.length} items`);
      console.log(`✅ Total items: ${totalItems}, Total pages: ${totalPages}`);
      
      // Ensure we always return an array
      if (!Array.isArray(actualData)) {
        console.log('⚠️ WARNING - actualData is not an array, forcing to empty array');
        actualData = [];
      }
      
      return {
        success: true,
        data: actualData,
        totalItems: totalItems,
        totalPages: totalPages,
        currentPage: page
      };
    } catch (error) {
      console.error("❌ Error in getRecentMedicationAdministrations:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error data:", error.response?.data);
      
      // Return error without fallback to mock data
      return {
        success: false,
        data: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: page,
        message: error.response?.data?.message || error.message || "Không thể tải lịch sử dùng thuốc - vui lòng kiểm tra backend server"
      };
    }
  },

  // Tạo bản ghi cung cấp thuốc mới - Function được gọi bởi MedicationAdministration.jsx
  createMedicationAdministration: async (data) => {
    try {
      console.log('🔄 Creating new medication administration via REAL API:', data);
      console.log('🔄 Using API endpoint:', apiService1.defaults.baseURL);
      
      // Gọi API thật với endpoint chính xác
      const response = await apiService1.post('', data);
      
      console.log('✅ Real API Response for create:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: "Đã tạo bản ghi cung cấp thuốc thành công"
      };
    } catch (error) {
      console.error("❌ Error in createMedicationAdministration:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error data:", error.response?.data);
      
      // Enhanced error handling for different HTTP status codes
      let errorMessage = "Không thể tạo bản ghi cung cấp thuốc";
      
      if (!error.response) {
        errorMessage = "Không thể kết nối tới server. Vui lòng kiểm tra xem backend có đang chạy không?";
      } else {
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.message || "Dữ liệu không hợp lệ";
            break;
          case 401:
            errorMessage = "Không có quyền truy cập. Vui lòng đăng nhập lại.";
            break;
          case 403:
            errorMessage = "Không có quyền thực hiện thao tác này";
            break;
          case 404:
            errorMessage = "Endpoint API không tồn tại";
            break;
          case 422:
            errorMessage = error.response.data?.message || "Dữ liệu không thể xử lý";
            break;
          case 500:
          default:
            errorMessage = error.response.data?.message || "Lỗi server nội bộ";
            break;
        }
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // Upload ảnh xác nhận - Function được gọi bởi MedicationAdministration.jsx
  uploadConfirmationImage: async (administrationId, imageFile) => {
    try {
      console.log(`Uploading confirmation image for administration ${administrationId}`);
      
      // Tạo FormData để upload file
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // Gọi API thật với endpoint chính xác
      const response = await apiService1.post(`/${administrationId}/upload-confirmation-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('API Response for image upload:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: "Đã tải lên ảnh xác nhận thành công"
      };
    } catch (error) {
      console.error("Error in uploadConfirmationImage:", error);
      console.error("Error response:", error.response);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Không thể tải lên ảnh xác nhận"
      };
    }
  },

  // API để lấy tất cả lịch sử dùng thuốc
  getAllMedicationAdministrations: async (page = 1, size = 10) => {
    try {
      console.log('🔍 Calling getAllMedicationAdministrations API...');
      console.log('API URL:', `${BASE_URL1}/all`);
      
      // Gọi API thật với endpoint /all
      const response = await apiService1.get('/all');
      
      console.log('✅ API Response:', response.data);
      
      // Kiểm tra format response
      if (response.data && response.data.status === 'success') {
        const allData = response.data.data || [];
        const totalItems = response.data.count || allData.length;
        
        // Thực hiện phân trang trên client side
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const paginatedData = allData.slice(startIndex, endIndex);
        const totalPages = Math.ceil(totalItems / size);
        
        return {
          status: 'success',
          data: {
            posts: paginatedData,
            totalItems: totalItems,
            totalPages: totalPages,
            currentPage: page
          }
        };
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error("❌ Error in getAllMedicationAdministrations:", error);
      console.error("❌ Error response:", error.response);
      
      // Return error without fallback to mock data
      throw {
        success: false,
        message: error.response?.data?.message || error.message || "Không thể tải lịch sử dùng thuốc - vui lòng kiểm tra backend server"
      };
    }
  },
  
  // Note: Add, Edit, Delete functions removed - Medication History is now read-only
  // Only view and search functionality is available for Lịch Sử Dùng Thuốc
};

export default receiveMedicineService;
