import axios from 'axios';

// Base API URL for your backend
const API_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
  getStudents: "http://localhost:8080/api/parents/my-students"
};

export { endpoints };

export default api;