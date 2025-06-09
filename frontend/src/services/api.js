// Mock implementation - comment out real API calls for now
/*
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

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

export default api;
*/

// Mock API service for development
const mockApi = {
  // Simulate successful responses
  get: async (url) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { data: { message: 'Mock GET response', url } };
  },
  
  post: async (url, data) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: { message: 'Mock POST response', url, data } };
  },
  
  put: async (url, data) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return { data: { message: 'Mock PUT response', url, data } };
  },
  
  delete: async (url) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { data: { message: 'Mock DELETE response', url } };
  }
};

export default mockApi;