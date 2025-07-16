import axios from 'axios';

// Base API URL for your backend
const API_URL =import.meta.env.VITE_API_BASE_URL;

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
  login: `/auth/login`,
  getStudents: `/parents/my-students`,
  
  // Health profile endpoints
  healthProfiles: {
    getByStudentId: (studentId) => `/health-profiles/student/${studentId}`,
    submitDeclaration: `/health-profiles`
  },
  
  // Medical checkups endpoints
  medicalCheckups: {
    getByStudentId: (studentId) => `/medical-checkups/student/${studentId}`
  },
  
  // Medication requests endpoints
  medicationRequests: {
    getMyRequests: `/parent-medication-requests/my-requests`,
    submitRequest: `/parent-medication-requests/submit-request`,
    updateRequest: (id) => `/parent-medication-requests/${id}`,
    deleteRequest: (id) => `/parent-medication-requests/${id}`
  },

  // Notifications endpoints - Cập nhật cho đúng với API trong Notifications.jsx
  notifications: {
    // Lấy danh sách tiêu đề thông báo
    getTitles: (parentId) => `/notifications/getTitlesByParentId/${parentId}`,
    
    // Lấy chi tiết thông báo
    getDetail: (notificationId, parentId) => `/notifications/getDetail/${notificationId}/${parentId}`,
    
    // Phản hồi thông báo (Xác nhận/Từ chối)
    respond: (notificationId, parentId) => `/notifications/respond/${notificationId}/${parentId}`
  }
};

export { endpoints };

export default api;