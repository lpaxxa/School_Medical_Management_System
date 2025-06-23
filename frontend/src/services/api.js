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


// Define specific API endpoints
const endpoints = {
  login: "http://localhost:8080/api/v1/auth/login",
  getStudents: "http://localhost:8080/api/v1/parents/my-students",
  
  // Health profile endpoints
  healthProfiles: {
    getByStudentId: (studentId) => `${API_URL}/health-profiles/student/${studentId}`,
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

  // Notifications endpoints
  notifications: {
    getNotifications: (parentId) => `/notifications/getTitlesByParentId/${parentId}`,
    getNotificationDetail: (notificationId, parentId) => `/notifications/getDetail/${notificationId}/${parentId}`,
    respondToNotification: (notificationId, parentId) => `/notifications/respond/${notificationId}/${parentId}`,
  }
};

export { endpoints };

export default api;