import axios from 'axios';

// Base API URL for your backend
const API_URL = "http://localhost:8080/api/v1";

// Create axios instance with timeout to prevent hanging
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Lỗi từ phản hồi server
      console.error("API Error Response:", error.response);
      
      // Kiểm tra mã lỗi
      if (error.response.status === 401) {
        // Unauthorized - Có thể làm mới token hoặc đăng xuất người dùng
        console.warn("Authentication error, redirecting to login...");
        // Có thể gọi hàm logout ở đây
      } 
      
      // Tùy chỉnh thông báo lỗi dựa trên response từ server
      if (error.response.data && error.response.data.message) {
        error.message = error.response.data.message;
      }
    } else if (error.request) {
      // Đã gửi request nhưng không nhận được response
      console.error("No response received:", error.request);
      error.message = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
    } else {
      // Lỗi trong quá trình thiết lập request
      console.error("Request error:", error.message);
      error.message = "Đã xảy ra lỗi khi gửi yêu cầu.";
    }
    
    return Promise.reject(error);
  }
);

// Thêm hàm tiện ích để xử lý dữ liệu trả về
const processResponseData = (response) => {
  // Nếu là dữ liệu JSON, đảm bảo tất cả các trường đều nhất quán
  if (response && response.data) {
    if (Array.isArray(response.data)) {
      // Nếu là mảng, xử lý từng phần tử
      response.data = response.data.map(item => {
        // Đảm bảo các trường thời gian nhất quán
        if (item.receivedDate && !item.createdAt) {
          item.createdAt = item.receivedDate;
        }
        return item;
      });
    } else if (typeof response.data === 'object') {
      // Nếu là object đơn lẻ, đảm bảo các trường thời gian
      if (response.data.receivedDate && !response.data.createdAt) {
        response.data.createdAt = response.data.receivedDate;
      }
    }
  }
  return response;
};

// Thêm vào interceptor response
api.interceptors.response.use(
  (response) => processResponseData(response),
  (error) => {
    // ... phần xử lý lỗi giữ nguyên
    return Promise.reject(error);
  }
);

// Define specific API endpoints
const endpoints = {
  login: `${API_URL}/auth/login`,
  getStudents: `${API_URL}/parents/my-students`,
  
  // Health profile endpoints
  healthProfiles: {
    getByStudentId: (studentId) => `${API_URL}/health-profiles/${studentId}`,
    submitDeclaration: `${API_URL}/health-profiles`
  },
  
  // Medical checkups endpoints
  medicalCheckups: {
    getByStudentId: (studentId) => `${API_URL}/medical-checkups/student/${studentId}`
  },
  
  // Medication requests endpoints
  medicationRequests: {
    getMyRequests: `${API_URL}/parent-medication-requests/my-requests`,
    submitRequest: `${API_URL}/parent-medication-requests/submit-request`,
    updateRequest: (id) => `${API_URL}/parent-medication-requests/${id}`,
    deleteRequest: (id) => `${API_URL}/parent-medication-requests/${id}`
  },

  // Notifications endpoints - Cập nhật cho đúng với API trong Notifications.jsx
  notifications: {
    // Lấy danh sách tiêu đề thông báo
    getTitles: (parentId) => `${API_URL}/notifications/getTitlesByParentId/${parentId}`,
    
    // Lấy chi tiết thông báo
    getDetail: (notificationId, parentId) => `${API_URL}/notifications/getDetail/${notificationId}/${parentId}`,
    
    // Phản hồi thông báo (Xác nhận/Từ chối)
    respond: (notificationId, parentId) => `${API_URL}/notifications/respond/${notificationId}/${parentId}`
  }
};

export { endpoints };

export default api;