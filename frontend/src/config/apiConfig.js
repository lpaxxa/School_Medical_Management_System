/**
 * Centralized API Configuration
 * This file manages all API endpoints and base URLs for the application
 */

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

// Google OAuth Configuration
const GOOGLE_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id',
  redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/oauth2/callback',
  backendUrl: BACKEND_URL
};

// API Endpoints Configuration
export const API_ENDPOINTS = {
  // Base URLs
  BASE_URL: API_BASE_URL,
  BACKEND_URL: BACKEND_URL,
  
  // Authentication
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REFRESH: `${API_BASE_URL}/auth/refresh-token`,
    OAUTH_CALLBACK: `${BACKEND_URL}/auth/oauth2/callback`
  },
  
  // User Management
  USERS: {
    GET_ALL: `${API_BASE_URL}/account-members`,
    GET_BY_ID: (id) => `${API_BASE_URL}/account-members/${id}`,
    CREATE: `${API_BASE_URL}/account-members`,
    UPDATE: (id) => `${API_BASE_URL}/account-members/update/${id}`,
    DELETE: (id) => `${API_BASE_URL}/account-members/${id}`,
    SEND_EMAIL: (id) => `${API_BASE_URL}/account-members/${id}/send-email`
  },
  
  // Student Management
  STUDENTS: {
    GET_ALL: `${API_BASE_URL}/students`,
    GET_BY_ID: (id) => `${API_BASE_URL}/students/${id}`,
    GET_BY_PARENT: `${API_BASE_URL}/students/parent`,
    CREATE: `${API_BASE_URL}/students`,
    UPDATE: (id) => `${API_BASE_URL}/students/${id}`,
    DELETE: (id) => `${API_BASE_URL}/students/${id}`
  },
  
  // Health Profiles
  HEALTH_PROFILES: {
    GET_BY_STUDENT_ID: (studentId) => `${API_BASE_URL}/health-profiles/student/${studentId}`,
    GET_BY_STUDENT_CODE: (studentCode) => `${API_BASE_URL}/health-profiles/getStudentProfileByID/${studentCode}`,
    SUBMIT_DECLARATION: `${API_BASE_URL}/health-profiles`,
    UPDATE: (studentId) => `${API_BASE_URL}/health-profiles/student/${studentId}`
  },
  
  // Medical Checkups
  MEDICAL_CHECKUPS: {
    GET_ALL: `${API_BASE_URL}/medical-checkups`,
    GET_BY_ID: (id) => `${API_BASE_URL}/medical-checkups/${id}`,
    GET_BY_STUDENT_ID: (studentId) => `${API_BASE_URL}/medical-checkups/student/${studentId}`,
    CREATE: `${API_BASE_URL}/medical-checkups`,
    UPDATE: (id) => `${API_BASE_URL}/medical-checkups/${id}`
  },
  
  // Vaccination
  VACCINATION: {
    PLANS: {
      GET_ALL: `${API_BASE_URL}/vaccination-plans/getAllVaccinationPlans`,
      GET_BY_ID: (id) => `${API_BASE_URL}/vaccination-plans/getDetailsVaccinePlanById/${id}`,
      CREATE: `${API_BASE_URL}/vaccination-plans`,
      UPDATE: (id) => `${API_BASE_URL}/vaccination-plans/${id}`
    },
    VACCINES: {
      GET_ALL: `${API_BASE_URL}/vaccines/getAllVaccine`,
      GET_BY_ID: (id) => `${API_BASE_URL}/vaccines/${id}`
    },
    RECORDS: {
      CREATE: `${API_BASE_URL}/vaccinations/record`,
      GET_BY_HEALTH_PROFILE: (healthProfileId) => `${API_BASE_URL}/vaccinations/getAllVaccinationByHeathProfileId/${healthProfileId}`,
      UPDATE_NOTE: (vaccinationId) => `${API_BASE_URL}/vaccinations/${vaccinationId}/note`
    }
  },
  
  // Medication
  MEDICATION: {
    REQUESTS: {
      GET_MY_REQUESTS: `${API_BASE_URL}/parent-medication-requests/my-requests`,
      SUBMIT_REQUEST: `${API_BASE_URL}/parent-medication-requests/submit-request`,
      UPDATE: (id) => `${API_BASE_URL}/parent-medication-requests/${id}`,
      CANCEL: (id) => `${API_BASE_URL}/parent-medication-requests/cancel-request/${id}`
    },
    ADMINISTRATIONS: {
      GET_ALL: `${API_BASE_URL}/medication-administrations`,
      GET_BY_ID: (id) => `${API_BASE_URL}/medication-administrations/${id}`,
      GET_BY_INSTRUCTION_ID: (instructionId) => `${API_BASE_URL}/medication-administrations/all/medication-instruction/${instructionId}`
    },
    ITEMS: {
      GET_ALL: `${API_BASE_URL}/medication-items/get-all`,
      GET_BY_ID: (id) => `${API_BASE_URL}/medication-items/${id}`,
      CREATE: `${API_BASE_URL}/medication-items`,
      UPDATE: (id) => `${API_BASE_URL}/medication-items/${id}`
    },
    APPROVALS: {
      GET_ALL: `${API_BASE_URL}/nurse-medication-approvals`,
      APPROVE: (id) => `${API_BASE_URL}/nurse-medication-approvals/${id}/approve`,
      REJECT: (id) => `${API_BASE_URL}/nurse-medication-approvals/${id}/reject`
    }
  },
  
  // Health Campaigns
  HEALTH_CAMPAIGNS: {
    GET_ALL: `${API_BASE_URL}/health-campaigns`,
    GET_BY_ID: (id) => `${API_BASE_URL}/health-campaigns/${id}`,
    CREATE: `${API_BASE_URL}/health-campaigns`,
    UPDATE: (id) => `${API_BASE_URL}/health-campaigns/${id}`
  },
  
  // Medical Incidents
  MEDICAL_INCIDENTS: {
    GET_ALL: `${API_BASE_URL}/medical-incidents`,
    GET_BY_ID: (id) => `${API_BASE_URL}/medical-incidents/${id}`,
    CREATE: `${API_BASE_URL}/medical-incidents`,
    UPDATE: (id) => `${API_BASE_URL}/medical-incidents/${id}`
  },
  
  // Notifications
  NOTIFICATIONS: {
    GET_TITLES: (parentId) => `${API_BASE_URL}/notifications/getTitlesByParentId/${parentId}`,
    GET_DETAIL: (notificationId, parentId) => `${API_BASE_URL}/notifications/getDetail/${notificationId}/${parentId}`,
    RESPOND: (notificationId, parentId) => `${API_BASE_URL}/notifications/respond/${notificationId}/${parentId}`
  },
  
  // Health Articles
  HEALTH_ARTICLES: {
    GET_ALL: `${BACKEND_URL}/api/health-articles`,
    GET_BY_ID: (id) => `${BACKEND_URL}/api/health-articles/${id}`,
    CREATE: `${BACKEND_URL}/api/health-articles`,
    UPDATE: (id) => `${BACKEND_URL}/api/health-articles/${id}`
  },
  
  // Community
  COMMUNITY: {
    POSTS: {
      GET_ALL: `${API_BASE_URL}/community/posts`,
      GET_BY_ID: (id) => `${API_BASE_URL}/community/posts/${id}`,
      CREATE: `${API_BASE_URL}/community/posts`,
      UPDATE: (id) => `${API_BASE_URL}/community/posts/${id}`,
      DELETE: (id) => `${API_BASE_URL}/community/posts/${id}`,
      LIKE: (id) => `${API_BASE_URL}/community/posts/${id}/like`,
      BOOKMARK: (id) => `${API_BASE_URL}/community/posts/${id}/bookmark`,
      GET_BOOKMARKED: `${API_BASE_URL}/community/posts/bookmarked`
    },
    COMMENTS: {
      GET_BY_POST: (postId) => `${API_BASE_URL}/community/posts/${postId}/comments`,
      CREATE: `${API_BASE_URL}/community/comments`,
      UPDATE: (id) => `${API_BASE_URL}/community/comments/${id}`,
      DELETE: (id) => `${API_BASE_URL}/community/comments/${id}`,
      LIKE: (id) => `${API_BASE_URL}/community/comments/${id}/like`
    }
  },
  
  // File Upload
  UPLOAD: {
    TEMP_IMAGE: `${BACKEND_URL}/api/upload-temp-image`,
    PRESCRIPTION: `${API_BASE_URL}/upload/prescription`
  }
};

// Google OAuth Configuration
export const GOOGLE_OAUTH_CONFIG = GOOGLE_CONFIG;

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Helper function to get auth headers for multipart/form-data
export const getAuthHeadersMultipart = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Environment check helper
export const isProduction = () => import.meta.env.NODE_ENV === 'production';
export const isDevelopment = () => import.meta.env.NODE_ENV === 'development';

// Export the base URL for backward compatibility
export default API_BASE_URL;
