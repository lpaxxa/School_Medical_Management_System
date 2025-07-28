/**
 * Session Utilities
 * Helper functions for session monitoring, cleanup, and debugging
 */

import sessionService from '../services/sessionService';

/**
 * Session Debug Utilities
 */
export const sessionDebug = {
  /**
   * Get comprehensive session information for debugging
   */
  getSessionInfo() {
    return sessionService.getSessionInfo();
  },

  /**
   * Log session status to console
   */
  logSessionStatus() {
    const info = sessionService.getSessionInfo();
    console.group('🔍 Session Debug Info');
    console.log('Has Token:', info.hasToken);
    console.log('Token Valid:', info.tokenValid);
    console.log('Is Authenticated:', info.isAuthenticated);
    console.log('Session Timeout:', info.sessionTimeout);
    console.log('Time Until Expiration:', this.formatDuration(info.timeUntilExpiration));
    console.log('Remember Me:', info.rememberMe);
    console.groupEnd();
  },

  /**
   * Format duration in milliseconds to human readable format
   */
  formatDuration(milliseconds) {
    if (milliseconds <= 0) return 'Expired';
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }
};

/**
 * Session Cleanup Utilities
 */
export const sessionCleanup = {
  /**
   * Clean up expired session data
   */
  cleanupExpiredSessions() {
    const keys = Object.keys(localStorage);
    let cleanedCount = 0;

    keys.forEach(key => {
      // Clean up old session data patterns
      if (key.startsWith('user_') || key.startsWith('token_') || key.startsWith('guest_')) {
        try {
          // Check if it's session-related data
          if (key.includes('_likedPosts') || key.includes('_sessionData')) {
            // You can add logic here to check if the session is expired
            // For now, we'll keep all user-specific data
          }
        } catch (error) {
          console.warn('Error checking session data:', key, error);
        }
      }
    });

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired session items`);
    }

    return cleanedCount;
  },

  /**
   * Clear all session-related data (nuclear option)
   */
  clearAllSessionData() {
    const sessionKeys = [
      'authToken',
      'userData',
      'refreshToken',
      'sessionTimeout',
      'rememberMe',
      'savedUsername'
    ];

    sessionKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // Also clear user-specific data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('user_') || key.startsWith('token_') || key.startsWith('guest_')) {
        localStorage.removeItem(key);
      }
    });

    console.log('🧹 All session data cleared');
  },

  /**
   * Get storage usage information
   */
  getStorageInfo() {
    const keys = Object.keys(localStorage);
    let totalSize = 0;
    const itemSizes = {};

    keys.forEach(key => {
      const value = localStorage.getItem(key);
      const size = new Blob([value]).size;
      totalSize += size;
      itemSizes[key] = size;
    });

    return {
      totalItems: keys.length,
      totalSize: totalSize,
      itemSizes: itemSizes,
      formattedSize: this.formatBytes(totalSize)
    };
  },

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

/**
 * Session Monitoring Utilities
 */
export const sessionMonitor = {
  /**
   * Start monitoring session and log warnings
   */
  startMonitoring() {
    const warningCallback = (timeLeft) => {
      const minutes = Math.floor(timeLeft / (1000 * 60));
      console.warn(`⚠️ Session expires in ${minutes} minutes`);
    };

    const expiredCallback = () => {
      console.error('❌ Session expired');
    };

    sessionService.onSessionWarning(warningCallback);
    sessionService.onSessionExpired(expiredCallback);

    console.log('👁️ Session monitoring started');

    return {
      stop: () => {
        sessionService.removeCallback(warningCallback);
        sessionService.removeCallback(expiredCallback);
        console.log('👁️ Session monitoring stopped');
      }
    };
  },

  /**
   * Check if session will expire soon
   */
  isSessionExpiringSoon(warningMinutes = 15) {
    const timeLeft = sessionService.getTimeUntilExpiration();
    return timeLeft <= (warningMinutes * 60 * 1000) && timeLeft > 0;
  },

  /**
   * Get session health status
   */
  getSessionHealth() {
    const info = sessionService.getSessionInfo();
    const timeLeft = info.timeUntilExpiration;
    
    let status = 'unknown';
    let color = '#666';
    
    if (!info.isAuthenticated) {
      status = 'not_authenticated';
      color = '#e74c3c';
    } else if (timeLeft <= 0) {
      status = 'expired';
      color = '#e74c3c';
    } else if (timeLeft <= 15 * 60 * 1000) { // 15 minutes
      status = 'expiring_soon';
      color = '#f39c12';
    } else if (timeLeft <= 60 * 60 * 1000) { // 1 hour
      status = 'warning';
      color = '#f1c40f';
    } else {
      status = 'healthy';
      color = '#27ae60';
    }

    return {
      status,
      color,
      timeLeft,
      formattedTimeLeft: sessionDebug.formatDuration(timeLeft),
      isAuthenticated: info.isAuthenticated,
      hasValidToken: info.tokenValid
    };
  }
};

/**
 * Development utilities (only for development mode)
 */
export const sessionDev = {
  /**
   * Simulate session expiration (for testing)
   */
  simulateExpiration() {
    if (import.meta.env.DEV) {
      localStorage.setItem('sessionTimeout', (Date.now() - 1000).toString());
      console.log('🧪 Session expiration simulated');
    } else {
      console.warn('Session simulation only available in development mode');
    }
  },

  /**
   * Extend session for testing
   */
  extendSessionForTesting(hours = 1) {
    if (import.meta.env.DEV) {
      const newTimeout = Date.now() + (hours * 60 * 60 * 1000);
      localStorage.setItem('sessionTimeout', newTimeout.toString());
      console.log(`🧪 Session extended by ${hours} hour(s) for testing`);
    } else {
      console.warn('Session extension only available in development mode');
    }
  }
};

// Export all utilities as default
export default {
  debug: sessionDebug,
  cleanup: sessionCleanup,
  monitor: sessionMonitor,
  dev: sessionDev
};
