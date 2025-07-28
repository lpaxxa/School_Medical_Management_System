# Enhanced Session Management System

## Overview

This enhanced session management system provides secure, robust, and user-friendly session handling for the School Medical Management System. It replaces the basic localStorage approach with a comprehensive solution that includes token validation, automatic expiration handling, cross-tab synchronization, and user experience improvements.

## Key Features

### 🔐 **Security Enhancements**

- JWT token validation and expiration checking
- Secure token storage with automatic cleanup
- Session timeout management
- Cross-tab session synchronization

### 👤 **User Experience**

- Session warning notifications before expiration
- Automatic session extension on user activity
- Remember me functionality
- Graceful session expiration handling

### 🛠️ **Developer Tools**

- Session debugging utilities
- Development mode debug panel
- Session monitoring and cleanup tools
- Comprehensive logging

## Core Components

### 1. SessionService (`sessionService.js`)

The main service that handles all session-related operations:

```javascript
import sessionService from "../services/sessionService";

// Check if user is authenticated
const isAuthenticated = sessionService.isAuthenticated();

// Get current token (automatically validates expiration)
const token = sessionService.getToken();

// Get user data
const userData = sessionService.getUserData();

// Extend session
sessionService.extendSession();

// Clear session
sessionService.clearSession();
```

### 2. SessionWarningModal (`SessionWarningModal.jsx`)

Displays a modal warning users when their session is about to expire:

- Shows countdown timer
- Allows session extension
- Provides logout option

### 3. Session Utilities (`sessionUtils.js`)

Helper functions for debugging and monitoring:

```javascript
import sessionUtils from "../utils/sessionUtils";

// Debug session information
sessionUtils.debug.logSessionStatus();

// Monitor session health
const health = sessionUtils.monitor.getSessionHealth();

// Cleanup expired data
sessionUtils.cleanup.cleanupExpiredSessions();
```

### 4. SessionDebugPanel (`SessionDebugPanel.jsx`)

Development-only component for real-time session monitoring:

- Real-time session status
- Storage usage information
- Testing utilities (simulate expiration, extend session)

## Usage Guide

### Setting Up Authentication

```javascript
// In your login component
import { useAuth } from "../context/AuthContext";

const { login } = useAuth();

// Login with remember me option
const handleLogin = async () => {
  try {
    await login(username, password, rememberMe);
    // Session is automatically managed
  } catch (error) {
    console.error("Login failed:", error);
  }
};
```

### API Integration

The session service automatically integrates with axios interceptors:

```javascript
// Request interceptor automatically adds token
api.interceptors.request.use((config) => {
  const token = sessionService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    sessionService.extendSession(); // Extend on activity
  }
  return config;
});

// Response interceptor handles 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionService.clearSession();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### Session Monitoring

```javascript
// Register callbacks for session events
sessionService.onSessionWarning((timeLeft) => {
  console.log(`Session expires in ${timeLeft}ms`);
});

sessionService.onSessionExpired(() => {
  console.log("Session expired");
  // Handle logout
});
```

## Configuration

### Session Timeouts

```javascript
// In sessionService.js
SESSION_DURATION: {
  NORMAL: 8 * 60 * 60 * 1000,     // 8 hours
  REMEMBER_ME: 24 * 60 * 60 * 1000, // 24 hours
}

// Warning time before expiration
WARNING_TIME: 15 * 60 * 1000 // 15 minutes
```

### Storage Keys

```javascript
TOKEN_KEY: "authToken";
USER_DATA_KEY: "userData";
REFRESH_TOKEN_KEY: "refreshToken";
SESSION_TIMEOUT_KEY: "sessionTimeout";
REMEMBER_ME_KEY: "rememberMe";
SAVED_USERNAME_KEY: "savedUsername";
```

## Migration Guide

### From Old System

If you're migrating from the old localStorage-based system:

1. **Replace direct localStorage calls:**

   ```javascript
   // Old way
   const token = localStorage.getItem("authToken");

   // New way
   const token = sessionService.getToken();
   ```

2. **Update API services:**

   ```javascript
   // Old way
   const token = localStorage.getItem("authToken");
   config.headers.Authorization = `Bearer ${token}`;

   // New way
   const token = sessionService.getToken();
   if (token) {
     config.headers.Authorization = `Bearer ${token}`;
     sessionService.extendSession();
   }
   ```

3. **Update authentication logic:**

   ```javascript
   // Old way
   localStorage.setItem("authToken", token);
   localStorage.setItem("userData", JSON.stringify(user));

   // New way
   sessionService.setAuthData(token, user, rememberMe);
   ```

## Development Tools

### Debug Panel

In development mode, a debug panel appears in the bottom-right corner:

- 🟢 Green: Session healthy
- 🟡 Yellow: Session warning
- 🔴 Red: Session expired/invalid

### Console Commands

```javascript
// Log session information
sessionUtils.debug.logSessionStatus();

// Get session health
sessionUtils.monitor.getSessionHealth();

// Simulate expiration (dev only)
sessionUtils.dev.simulateExpiration();

// Extend session for testing (dev only)
sessionUtils.dev.extendSessionForTesting(2); // 2 hours
```

## Best Practices

1. **Always use sessionService methods** instead of direct localStorage access
2. **Handle session expiration gracefully** in your components
3. **Extend sessions on user activity** (automatically handled by API interceptors)
4. **Monitor session health** in critical user flows
5. **Test session expiration scenarios** using development tools

## Testing API Compatibility

### Compatibility Tests

To ensure the session management doesn't break existing API functionality:

```javascript
// Import test utilities
import sessionCompatibilityTest from "../utils/sessionCompatibilityTest";

// Run all compatibility tests
sessionCompatibilityTest.runAllCompatibilityTests();

// Or run individual tests
sessionCompatibilityTest.testSessionCompatibility();
sessionCompatibilityTest.testAPIHeaders();
sessionCompatibilityTest.testSessionConsistency();
```

### Auto-testing

Add `?test-session` to your URL in development mode to automatically run compatibility tests:

```
http://localhost:3000?test-session
```

## Troubleshooting

### Common Issues

1. **Session expires unexpectedly:**

   - Check if token is valid JWT format
   - Verify session timeout configuration
   - Check for clock synchronization issues

2. **Cross-tab sync not working:**

   - Ensure localStorage events are properly set up
   - Check browser compatibility

3. **API calls fail with 401:**

   - Verify token is being added to headers
   - Check if session has expired
   - Ensure proper error handling in interceptors

4. **Migration from old session:**
   - Old sessions without sessionTimeout are automatically handled
   - sessionService.getToken() provides backward compatibility
   - No manual migration required

### Debug Commands

```javascript
// Check session status
sessionService.getSessionInfo();

// Test compatibility
import sessionTest from "../utils/sessionCompatibilityTest";
sessionTest.runAllCompatibilityTests();

// Monitor storage usage
sessionUtils.cleanup.getStorageInfo();

// Clean up expired data
sessionUtils.cleanup.cleanupExpiredSessions();
```

## Security Considerations

1. **Token Storage:** Tokens are stored in localStorage with automatic validation
2. **Session Timeout:** Configurable timeouts prevent indefinite sessions
3. **Cross-tab Sync:** Prevents multiple active sessions
4. **Automatic Cleanup:** Expired data is automatically removed
5. **HTTPS Only:** Ensure production uses HTTPS for token security

## Future Enhancements

- Refresh token implementation
- Biometric authentication support
- Session analytics and monitoring
- Advanced security features (device fingerprinting)
- Offline session management
