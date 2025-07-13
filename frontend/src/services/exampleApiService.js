/**
 * Example service demonstrating how to use the new API configuration
 * This service can be used as a template for updating existing services
 */

import { API_ENDPOINTS, getAuthHeaders, getAuthHeadersMultipart } from '../config/apiConfig';
import axios from 'axios';

// Create axios instance with centralized configuration
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Example API Service using the new configuration
 */
export const exampleApiService = {
  /**
   * Get all students
   * @returns {Promise<Array>} Array of students
   */
  getAllStudents: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.STUDENTS.GET_ALL);
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  /**
   * Get student by ID
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Student object
   */
  getStudentById: async (studentId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.STUDENTS.GET_BY_ID(studentId));
      return response.data;
    } catch (error) {
      console.error(`Error fetching student ${studentId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new student
   * @param {Object} studentData - Student data
   * @returns {Promise<Object>} Created student
   */
  createStudent: async (studentData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.STUDENTS.CREATE, studentData);
      return response.data;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  /**
   * Update student
   * @param {string} studentId - Student ID
   * @param {Object} studentData - Updated student data
   * @returns {Promise<Object>} Updated student
   */
  updateStudent: async (studentId, studentData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.STUDENTS.UPDATE(studentId), studentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating student ${studentId}:`, error);
      throw error;
    }
  },

  /**
   * Delete student
   * @param {string} studentId - Student ID
   * @returns {Promise<void>}
   */
  deleteStudent: async (studentId) => {
    try {
      await apiClient.delete(API_ENDPOINTS.STUDENTS.DELETE(studentId));
    } catch (error) {
      console.error(`Error deleting student ${studentId}:`, error);
      throw error;
    }
  },

  /**
   * Get health profile by student ID
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Health profile
   */
  getHealthProfile: async (studentId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HEALTH_PROFILES.GET_BY_STUDENT_ID(studentId));
      return response.data;
    } catch (error) {
      console.error(`Error fetching health profile for student ${studentId}:`, error);
      throw error;
    }
  },

  /**
   * Submit medication request
   * @param {Object} requestData - Medication request data
   * @returns {Promise<Object>} Submitted request
   */
  submitMedicationRequest: async (requestData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.MEDICATION.REQUESTS.SUBMIT_REQUEST, requestData);
      return response.data;
    } catch (error) {
      console.error('Error submitting medication request:', error);
      throw error;
    }
  },

  /**
   * Upload prescription image
   * @param {File} file - Image file
   * @returns {Promise<string>} Image URL
   */
  uploadPrescriptionImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiClient.post(
        API_ENDPOINTS.UPLOAD.PRESCRIPTION,
        formData,
        {
          headers: getAuthHeadersMultipart()
        }
      );

      return response.data.imageUrl;
    } catch (error) {
      console.error('Error uploading prescription image:', error);
      throw error;
    }
  },

  /**
   * Get vaccination plans
   * @returns {Promise<Array>} Array of vaccination plans
   */
  getVaccinationPlans: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.VACCINATION.PLANS.GET_ALL);
      return response.data;
    } catch (error) {
      console.error('Error fetching vaccination plans:', error);
      throw error;
    }
  },

  /**
   * Get community posts with pagination
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @param {string} category - Category filter
   * @param {string} search - Search query
   * @returns {Promise<Object>} Paginated posts
   */
  getCommunityPosts: async (page = 1, size = 10, category = null, search = null) => {
    try {
      let url = `${API_ENDPOINTS.COMMUNITY.POSTS.GET_ALL}?page=${page}&size=${size}`;
      
      if (category) url += `&category=${encodeURIComponent(category)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching community posts:', error);
      throw error;
    }
  }
};

/**
 * Alternative approach using fetch API
 */
export const exampleFetchService = {
  /**
   * Get all students using fetch
   * @returns {Promise<Array>} Array of students
   */
  getAllStudents: async () => {
    try {
      const response = await fetch(API_ENDPOINTS.STUDENTS.GET_ALL, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  /**
   * Create student using fetch
   * @param {Object} studentData - Student data
   * @returns {Promise<Object>} Created student
   */
  createStudent: async (studentData) => {
    try {
      const response = await fetch(API_ENDPOINTS.STUDENTS.CREATE, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(studentData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }
};

export default exampleApiService;
