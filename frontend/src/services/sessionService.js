/**
 * Enhanced Session Management Service
 * Handles token storage, validation, expiration, and security
 */

class SessionService {
  constructor() {
    this.TOKEN_KEY = 'authToken';
    this.USER_DATA_KEY = 'userData';
    this.REFRESH_TOKEN_KEY = 'refreshToken';
    this.SESSION_TIMEOUT_KEY = 'sessionTimeout';
    this.REMEMBER_ME_KEY = 'rememberMe';
    this.SAVED_USERNAME_KEY = 'savedUsername';
    
    // Session timeout: 24 hours for remember me, 8 hours for normal session
    this.SESSION_DURATION = {
      NORMAL: 8 * 60 * 60 * 1000, // 8 hours
      REMEMBER_ME: 24 * 60 * 60 * 1000, // 24 hours
    };
    
    // Warning time before session expires (15 minutes)
    this.WARNING_TIME = 15 * 60 * 1000;
    
    this.sessionWarningCallbacks = [];
    this.sessionExpiredCallbacks = [];

    // Track last extension time to prevent too frequent extensions
    this.lastExtensionTime = 0;
    this.EXTENSION_COOLDOWN = 5 * 60 * 1000; // 5 minutes cooldown

    // Start session monitoring
    this.startSessionMonitoring();

    // Listen for storage changes across tabs
    this.setupCrossTabSync();
  }

  /**
   * Store authentication data securely
   */
  setAuthData(token, userData, rememberMe = false, refreshToken = null) {
    try {
      // Validate token format
      if (!this.isValidJWT(token)) {
        throw new Error('Invalid token format');
      }

      // Calculate session timeout
      const sessionDuration = rememberMe 
        ? this.SESSION_DURATION.REMEMBER_ME 
        : this.SESSION_DURATION.NORMAL;
      
      const sessionTimeout = Date.now() + sessionDuration;

      // Store data
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
      localStorage.setItem(this.SESSION_TIMEOUT_KEY, sessionTimeout.toString());
      
      if (refreshToken) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      }
      
      if (rememberMe) {
        localStorage.setItem(this.REMEMBER_ME_KEY, 'true');
        localStorage.setItem(this.SAVED_USERNAME_KEY, userData.email || userData.username || '');
      }

      // Only log in development mode
      if (import.meta.env.DEV) {
        console.log('✅ Session data stored successfully');
        console.log('🕒 Session expires at:', new Date(sessionTimeout).toLocaleString());
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error storing auth data:', error);
      return false;
    }
  }

  /**
   * Get current authentication token with enhanced backward compatibility
   */
  getToken() {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);

      if (!token) {
        return null;
      }

      // For backward compatibility, if session timeout is not set, just return the token
      const sessionTimeout = localStorage.getItem(this.SESSION_TIMEOUT_KEY);
      if (!sessionTimeout) {
        // This is likely an old session, validate only JWT expiration if possible
        try {
          if (this.isTokenExpired(token)) {
            if (import.meta.env.DEV) {
              console.warn('⚠️ Token is expired, clearing session');
            }
            this.clearSession();
            return null;
          }
        } catch (error) {
          // If JWT validation fails, still return the token for backward compatibility
          if (import.meta.env.DEV) {
            console.warn('⚠️ JWT validation failed, returning token anyway for compatibility:', error);
          }
        }
        return token;
      }

      // Check if token is expired
      try {
        if (this.isTokenExpired(token)) {
          if (import.meta.env.DEV) {
            console.warn('⚠️ Token is expired, clearing session');
          }
          this.clearSession();
          return null;
        }
      } catch (error) {
        // If JWT validation fails, check session timeout only
        if (import.meta.env.DEV) {
          console.warn('⚠️ JWT validation failed, checking session timeout only:', error);
        }
      }

      // Check session timeout
      if (this.isSessionExpired()) {
        if (import.meta.env.DEV) {
          console.warn('⚠️ Session timeout reached, clearing session');
        }
        this.clearSession();
        return null;
      }

      return token;
    } catch (error) {
      // Ultimate fallback - return token directly from localStorage
      if (import.meta.env.DEV) {
        console.error('⚠️ SessionService error, falling back to direct localStorage access:', error);
      }
      return localStorage.getItem(this.TOKEN_KEY);
    }
  }

  /**
   * Get current user data
   */
  getUserData() {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    const userData = localStorage.getItem(this.USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.getToken() !== null;
  }

  /**
   * Validate JWT token format
   */
  isValidJWT(token) {
    if (!token || typeof token !== 'string') {
      return false;
    }

    const parts = token.split('.');
    return parts.length === 3;
  }

  /**
   * Check if JWT token is expired
   */
  isTokenExpired(token) {
    try {
      if (!this.isValidJWT(token)) {
        return true;
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      
      return expiration < now;
    } catch (error) {
      console.error('❌ Error checking token expiration:', error);
      return true;
    }
  }

  /**
   * Check if session timeout is reached
   */
  isSessionExpired() {
    const sessionTimeout = localStorage.getItem(this.SESSION_TIMEOUT_KEY);
    if (!sessionTimeout) {
      return true;
    }

    return Date.now() > parseInt(sessionTimeout);
  }

  /**
   * Get time until session expires (in milliseconds)
   */
  getTimeUntilExpiration() {
    const sessionTimeout = localStorage.getItem(this.SESSION_TIMEOUT_KEY);
    if (!sessionTimeout) {
      return 0;
    }

    const timeLeft = parseInt(sessionTimeout) - Date.now();
    return Math.max(0, timeLeft);
  }

  /**
   * Extend session timeout (with cooldown to prevent too frequent extensions)
   */
  extendSession() {
    const now = Date.now();

    // Check cooldown period
    if (now - this.lastExtensionTime < this.EXTENSION_COOLDOWN) {
      return; // Skip extension if within cooldown period
    }

    const rememberMe = localStorage.getItem(this.REMEMBER_ME_KEY) === 'true';
    const sessionDuration = rememberMe
      ? this.SESSION_DURATION.REMEMBER_ME
      : this.SESSION_DURATION.NORMAL;

    const newTimeout = now + sessionDuration;
    localStorage.setItem(this.SESSION_TIMEOUT_KEY, newTimeout.toString());
    this.lastExtensionTime = now;

    // Only log in development mode
    if (import.meta.env.DEV) {
      console.log('🔄 Session extended until:', new Date(newTimeout).toLocaleString());
    }
  }

  /**
   * Clear all session data
   */
  clearSession() {
    const keysToRemove = [
      this.TOKEN_KEY,
      this.USER_DATA_KEY,
      this.REFRESH_TOKEN_KEY,
      this.SESSION_TIMEOUT_KEY
    ];

    // Keep remember me settings if they exist
    const rememberMe = localStorage.getItem(this.REMEMBER_ME_KEY) === 'true';
    if (!rememberMe) {
      keysToRemove.push(this.REMEMBER_ME_KEY, this.SAVED_USERNAME_KEY);
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Only log in development mode
    if (import.meta.env.DEV) {
      console.log('🧹 Session cleared');
    }
    
    // Notify all callbacks
    this.sessionExpiredCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('❌ Error in session expired callback:', error);
      }
    });
  }

  /**
   * Get remember me settings
   */
  getRememberMeSettings() {
    return {
      rememberMe: localStorage.getItem(this.REMEMBER_ME_KEY) === 'true',
      savedUsername: localStorage.getItem(this.SAVED_USERNAME_KEY) || ''
    };
  }

  /**
   * Start monitoring session expiration
   */
  startSessionMonitoring() {
    // Check every minute
    setInterval(() => {
      if (!this.isAuthenticated()) {
        return;
      }

      const timeLeft = this.getTimeUntilExpiration();
      
      // Show warning 15 minutes before expiration
      if (timeLeft <= this.WARNING_TIME && timeLeft > 0) {
        this.sessionWarningCallbacks.forEach(callback => {
          try {
            callback(timeLeft);
          } catch (error) {
            console.error('❌ Error in session warning callback:', error);
          }
        });
      }
      
      // Session expired
      if (timeLeft <= 0) {
        this.clearSession();
      }
    }, 60000); // Check every minute
  }

  /**
   * Setup cross-tab session synchronization
   */
  setupCrossTabSync() {
    window.addEventListener('storage', (event) => {
      // If auth token was removed in another tab, clear session in this tab
      if (event.key === this.TOKEN_KEY && !event.newValue) {
        console.log('🔄 Session cleared in another tab, syncing...');
        this.clearSession();
      }
      
      // If session timeout was updated in another tab, sync it
      if (event.key === this.SESSION_TIMEOUT_KEY && event.newValue) {
        console.log('🔄 Session timeout updated in another tab, syncing...');
      }
    });
  }

  /**
   * Register callback for session warning
   */
  onSessionWarning(callback) {
    this.sessionWarningCallbacks.push(callback);
  }

  /**
   * Register callback for session expired
   */
  onSessionExpired(callback) {
    this.sessionExpiredCallbacks.push(callback);
  }

  /**
   * Remove callback
   */
  removeCallback(callback) {
    this.sessionWarningCallbacks = this.sessionWarningCallbacks.filter(cb => cb !== callback);
    this.sessionExpiredCallbacks = this.sessionExpiredCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Get session info for debugging
   */
  getSessionInfo() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const sessionTimeout = localStorage.getItem(this.SESSION_TIMEOUT_KEY);
    
    return {
      hasToken: !!token,
      tokenValid: token ? !this.isTokenExpired(token) : false,
      sessionTimeout: sessionTimeout ? new Date(parseInt(sessionTimeout)) : null,
      timeUntilExpiration: this.getTimeUntilExpiration(),
      isAuthenticated: this.isAuthenticated(),
      rememberMe: this.getRememberMeSettings()
    };
  }
}

// Export singleton instance
const sessionService = new SessionService();
export default sessionService;
