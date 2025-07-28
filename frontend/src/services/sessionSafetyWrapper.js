/**
 * Session Safety Wrapper
 * Provides a safe interface to sessionService with fallbacks to prevent API breakage
 */

import sessionService from './sessionService';

/**
 * Safe wrapper for sessionService.getToken()
 * Falls back to direct localStorage access if sessionService fails
 */
export const safeGetToken = () => {
  try {
    return sessionService.getToken();
  } catch (error) {
    console.warn('SessionService.getToken() failed, using fallback:', error);
    return localStorage.getItem('authToken');
  }
};

/**
 * Safe wrapper for sessionService.isAuthenticated()
 * Falls back to checking localStorage directly
 */
export const safeIsAuthenticated = () => {
  try {
    return sessionService.isAuthenticated();
  } catch (error) {
    console.warn('SessionService.isAuthenticated() failed, using fallback:', error);
    return !!localStorage.getItem('authToken');
  }
};

/**
 * Safe wrapper for sessionService.extendSession()
 * Silently fails if sessionService is not available
 */
export const safeExtendSession = () => {
  try {
    sessionService.extendSession();
  } catch (error) {
    // Silently fail - session extension is not critical for API functionality
    if (import.meta.env.DEV) {
      console.warn('SessionService.extendSession() failed:', error);
    }
  }
};

/**
 * Safe wrapper for sessionService.clearSession()
 * Falls back to manual localStorage cleanup
 */
export const safeClearSession = () => {
  try {
    sessionService.clearSession();
  } catch (error) {
    console.warn('SessionService.clearSession() failed, using fallback:', error);
    // Manual cleanup as fallback
    const keysToRemove = [
      'authToken',
      'userData',
      'refreshToken',
      'sessionTimeout'
    ];
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`Failed to remove ${key}:`, e);
      }
    });
  }
};

/**
 * Safe wrapper for sessionService.getUserData()
 * Falls back to direct localStorage access
 */
export const safeGetUserData = () => {
  try {
    return sessionService.getUserData();
  } catch (error) {
    console.warn('SessionService.getUserData() failed, using fallback:', error);
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (parseError) {
      console.warn('Failed to parse userData from localStorage:', parseError);
      return null;
    }
  }
};

/**
 * Create safe auth headers for API requests
 * This is the most critical function for API compatibility
 */
export const createSafeAuthHeaders = () => {
  const token = safeGetToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    // Try to extend session, but don't fail if it doesn't work
    safeExtendSession();
  }
  
  return headers;
};

/**
 * Safe request interceptor function
 * Can be used as a drop-in replacement for existing interceptors
 */
export const safeRequestInterceptor = (config) => {
  try {
    const token = safeGetToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      safeExtendSession();
    }
    return config;
  } catch (error) {
    console.warn('Safe request interceptor failed:', error);
    // Return config unchanged to prevent request failure
    return config;
  }
};

/**
 * Safe response interceptor function for 401 handling
 */
export const safeResponseInterceptor = (error) => {
  try {
    if (error.response?.status === 401) {
      safeClearSession();
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  } catch (interceptorError) {
    console.warn('Safe response interceptor failed:', interceptorError);
  }
  
  // Always reject the original error
  return Promise.reject(error);
};

/**
 * Validate that sessionService is working properly
 * Returns true if safe to use, false if should use fallbacks
 */
export const validateSessionService = () => {
  try {
    // Test basic functionality
    sessionService.getToken();
    sessionService.isAuthenticated();
    return true;
  } catch (error) {
    console.warn('SessionService validation failed:', error);
    return false;
  }
};

/**
 * Initialize safety checks and provide compatibility report
 */
export const initializeSafetyWrapper = () => {
  const isSessionServiceWorking = validateSessionService();
  
  if (!isSessionServiceWorking) {
    console.warn('⚠️ SessionService not working properly, using fallback methods');
  }
  
  return {
    sessionServiceWorking: isSessionServiceWorking,
    fallbackActive: !isSessionServiceWorking,
    safeToUse: true // Always safe because we have fallbacks
  };
};

// Export all safe methods as default
export default {
  getToken: safeGetToken,
  isAuthenticated: safeIsAuthenticated,
  extendSession: safeExtendSession,
  clearSession: safeClearSession,
  getUserData: safeGetUserData,
  createAuthHeaders: createSafeAuthHeaders,
  requestInterceptor: safeRequestInterceptor,
  responseInterceptor: safeResponseInterceptor,
  validate: validateSessionService,
  initialize: initializeSafetyWrapper
};
