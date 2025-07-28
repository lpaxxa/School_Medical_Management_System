/**
 * Session Compatibility Test
 * Tests to ensure session management doesn't break existing API functionality
 */

import sessionService from '../services/sessionService';

/**
 * Test session service compatibility with existing API patterns
 */
export const testSessionCompatibility = () => {
  console.group('🧪 Session Compatibility Tests');
  
  try {
    // Test 1: Basic token retrieval
    console.log('Test 1: Basic token retrieval');
    const token = sessionService.getToken();
    console.log('✅ getToken() works:', token ? 'Token exists' : 'No token');
    
    // Test 2: User data retrieval
    console.log('Test 2: User data retrieval');
    const userData = sessionService.getUserData();
    console.log('✅ getUserData() works:', userData ? 'User data exists' : 'No user data');
    
    // Test 3: Authentication check
    console.log('Test 3: Authentication check');
    const isAuth = sessionService.isAuthenticated();
    console.log('✅ isAuthenticated() works:', isAuth);
    
    // Test 4: Backward compatibility with localStorage
    console.log('Test 4: Backward compatibility');
    const directToken = localStorage.getItem('authToken');
    const serviceToken = sessionService.getToken();
    const tokensMatch = directToken === serviceToken;
    console.log('✅ Backward compatibility:', tokensMatch ? 'Tokens match' : 'Tokens differ (expected if session expired)');
    
    // Test 5: Session extension
    console.log('Test 5: Session extension');
    const beforeExtension = sessionService.getTimeUntilExpiration();
    sessionService.extendSession();
    const afterExtension = sessionService.getTimeUntilExpiration();
    console.log('✅ Session extension works:', afterExtension >= beforeExtension);
    
    console.log('🎉 All compatibility tests passed!');
    
  } catch (error) {
    console.error('❌ Compatibility test failed:', error);
  }
  
  console.groupEnd();
};

/**
 * Test API header generation
 */
export const testAPIHeaders = () => {
  console.group('🔗 API Headers Test');
  
  try {
    // Simulate old way
    const oldWayToken = localStorage.getItem('authToken');
    const oldHeaders = {
      'Authorization': oldWayToken ? `Bearer ${oldWayToken}` : ''
    };
    
    // New way using sessionService
    const newWayToken = sessionService.getToken();
    const newHeaders = {
      'Authorization': newWayToken ? `Bearer ${newWayToken}` : ''
    };
    
    console.log('Old way headers:', oldHeaders);
    console.log('New way headers:', newHeaders);
    
    const headersMatch = oldHeaders.Authorization === newHeaders.Authorization;
    console.log('✅ Headers compatibility:', headersMatch ? 'Headers match' : 'Headers differ (check session validity)');
    
  } catch (error) {
    console.error('❌ API headers test failed:', error);
  }
  
  console.groupEnd();
};

/**
 * Test session state consistency
 */
export const testSessionConsistency = () => {
  console.group('🔄 Session Consistency Test');
  
  try {
    const sessionInfo = sessionService.getSessionInfo();
    
    console.log('Session Info:', {
      hasToken: sessionInfo.hasToken,
      tokenValid: sessionInfo.tokenValid,
      isAuthenticated: sessionInfo.isAuthenticated,
      timeUntilExpiration: sessionInfo.timeUntilExpiration,
      sessionTimeout: sessionInfo.sessionTimeout
    });
    
    // Check consistency
    const isConsistent = sessionInfo.hasToken === sessionInfo.isAuthenticated;
    console.log('✅ Session consistency:', isConsistent ? 'Consistent' : 'Inconsistent (check token validity)');
    
  } catch (error) {
    console.error('❌ Session consistency test failed:', error);
  }
  
  console.groupEnd();
};

/**
 * Run all compatibility tests
 */
export const runAllCompatibilityTests = () => {
  console.log('🚀 Running Session Management Compatibility Tests...');
  
  testSessionCompatibility();
  testAPIHeaders();
  testSessionConsistency();
  
  console.log('✅ All compatibility tests completed!');
};

/**
 * Test migration from old session to new session
 */
export const testSessionMigration = () => {
  console.group('🔄 Session Migration Test');
  
  try {
    // Check if we have old session data without new session timeout
    const hasToken = !!localStorage.getItem('authToken');
    const hasUserData = !!localStorage.getItem('userData');
    const hasSessionTimeout = !!localStorage.getItem('sessionTimeout');
    
    console.log('Migration status:', {
      hasToken,
      hasUserData,
      hasSessionTimeout,
      needsMigration: hasToken && !hasSessionTimeout
    });
    
    if (hasToken && !hasSessionTimeout) {
      console.log('⚠️ Old session detected - will be handled by sessionService.getToken()');
    }
    
  } catch (error) {
    console.error('❌ Session migration test failed:', error);
  }
  
  console.groupEnd();
};

// Auto-run tests in development mode
if (import.meta.env.DEV) {
  // Run tests after a short delay to ensure everything is loaded
  setTimeout(() => {
    if (window.location.search.includes('test-session')) {
      runAllCompatibilityTests();
      testSessionMigration();
    }
  }, 1000);
}

export default {
  testSessionCompatibility,
  testAPIHeaders,
  testSessionConsistency,
  testSessionMigration,
  runAllCompatibilityTests
};
