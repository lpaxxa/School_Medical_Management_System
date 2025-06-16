import axios from 'axios';

// Base API URL for your backend
const API_URL = "http://localhost:8080";

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
  getStudents: "http://localhost:8080/api/parents/my-students",
  
  // Health profile endpoints
  healthProfiles: {
    getByStudentId: (studentId) => `${API_URL}/api/health-profiles/student/${studentId}`
  },
  
  // Medical checkups endpoints
  medicalCheckups: {
    getByStudentId: (studentId) => `${API_URL}/api/medical-checkups/student/${studentId}`
  }
};

export { endpoints };

export default api;