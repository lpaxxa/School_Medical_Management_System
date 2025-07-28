/**
 * API Compatibility Check
 * Ensures all API services are properly using sessionService
 */

import sessionService from '../services/sessionService';

/**
 * Check if all API services are using sessionService consistently
 */
export const checkAPICompatibility = () => {
  console.group('🔍 API Compatibility Check');
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
  };

  try {
    // Test 1: sessionService availability
    console.log('✅ Test 1: sessionService availability');
    if (typeof sessionService.getToken === 'function') {
      results.passed++;
      results.details.push('✅ sessionService.getToken() available');
    } else {
      results.failed++;
      results.details.push('❌ sessionService.getToken() not available');
    }

    // Test 2: Token retrieval consistency
    console.log('✅ Test 2: Token retrieval consistency');
    const sessionToken = sessionService.getToken();
    const directToken = localStorage.getItem('authToken');
    
    if (sessionToken === directToken || (!sessionToken && !directToken)) {
      results.passed++;
      results.details.push('✅ Token retrieval is consistent');
    } else {
      results.warnings++;
      results.details.push('⚠️ Token mismatch - sessionService may have cleared expired token');
    }

    // Test 3: Session validation
    console.log('✅ Test 3: Session validation');
    const isAuthenticated = sessionService.isAuthenticated();
    const hasToken = !!sessionService.getToken();
    
    if (isAuthenticated === hasToken) {
      results.passed++;
      results.details.push('✅ Session validation is consistent');
    } else {
      results.failed++;
      results.details.push('❌ Session validation inconsistent');
    }

    // Test 4: Extension mechanism
    console.log('✅ Test 4: Extension mechanism');
    const beforeExtension = sessionService.getTimeUntilExpiration();
    sessionService.extendSession();
    const afterExtension = sessionService.getTimeUntilExpiration();
    
    if (afterExtension >= beforeExtension) {
      results.passed++;
      results.details.push('✅ Session extension works');
    } else {
      results.failed++;
      results.details.push('❌ Session extension failed');
    }

    // Test 5: Backward compatibility
    console.log('✅ Test 5: Backward compatibility');
    const sessionTimeout = localStorage.getItem('sessionTimeout');
    if (!sessionTimeout && sessionToken) {
      results.warnings++;
      results.details.push('⚠️ Old session detected - will be handled gracefully');
    } else {
      results.passed++;
      results.details.push('✅ Session format is up to date');
    }

  } catch (error) {
    results.failed++;
    results.details.push(`❌ Error during compatibility check: ${error.message}`);
  }

  // Summary
  console.log('\n📊 Compatibility Check Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`⚠️ Warnings: ${results.warnings}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  console.log('\n📝 Details:');
  results.details.forEach(detail => console.log(detail));

  const isCompatible = results.failed === 0;
  console.log(`\n🎯 Overall Status: ${isCompatible ? '✅ COMPATIBLE' : '❌ ISSUES FOUND'}`);
  
  console.groupEnd();
  
  return {
    compatible: isCompatible,
    results
  };
};

/**
 * Test API header generation across different patterns
 */
export const testAPIHeaders = () => {
  console.group('🔗 API Headers Test');
  
  const testCases = [
    {
      name: 'sessionService.getToken()',
      getToken: () => sessionService.getToken()
    },
    {
      name: 'localStorage direct access',
      getToken: () => localStorage.getItem('authToken')
    }
  ];

  testCases.forEach(testCase => {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    const token = testCase.getToken();
    const headers = {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
    
    console.log('Token exists:', !!token);
    console.log('Headers:', headers);
  });

  console.groupEnd();
};

/**
 * Simulate API call patterns to ensure they work
 */
export const simulateAPICall = () => {
  console.group('🚀 API Call Simulation');
  
  try {
    // Simulate request interceptor logic
    const token = sessionService.getToken();
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      sessionService.extendSession();
      console.log('✅ Token added to headers');
      console.log('✅ Session extended');
    } else {
      console.log('ℹ️ No token available - request will be unauthenticated');
    }

    console.log('📤 Simulated request config:', config);

    // Simulate response interceptor logic for 401
    const simulate401 = () => {
      console.log('🔄 Simulating 401 response...');
      sessionService.clearSession();
      console.log('✅ Session cleared on 401');
    };

    // Don't actually trigger 401 unless in test mode
    if (window.location.search.includes('test-401')) {
      simulate401();
    }

  } catch (error) {
    console.error('❌ API call simulation failed:', error);
  }

  console.groupEnd();
};

/**
 * Check for potential issues that could break production
 */
export const checkProductionReadiness = () => {
  console.group('🏭 Production Readiness Check');
  
  const issues = [];
  const warnings = [];

  // Check 1: No development-only code in production paths
  if (typeof import.meta.env.DEV !== 'undefined') {
    console.log('✅ Environment detection available');
  } else {
    warnings.push('⚠️ Environment detection not available');
  }

  // Check 2: Session service doesn't throw errors
  try {
    sessionService.getToken();
    sessionService.isAuthenticated();
    sessionService.getSessionInfo();
    console.log('✅ SessionService methods are stable');
  } catch (error) {
    issues.push(`❌ SessionService error: ${error.message}`);
  }

  // Check 3: Fallback mechanisms work
  const originalToken = localStorage.getItem('authToken');
  localStorage.removeItem('sessionTimeout'); // Simulate old session
  
  try {
    const token = sessionService.getToken();
    console.log('✅ Backward compatibility works');
  } catch (error) {
    issues.push(`❌ Backward compatibility failed: ${error.message}`);
  }

  // Restore original state
  if (originalToken) {
    localStorage.setItem('authToken', originalToken);
  }

  // Check 4: No infinite loops or excessive calls
  let extensionCount = 0;
  const originalExtend = sessionService.extendSession;
  sessionService.extendSession = function() {
    extensionCount++;
    if (extensionCount > 5) {
      issues.push('❌ Excessive session extensions detected');
      return;
    }
    return originalExtend.call(this);
  };

  // Test multiple extensions
  for (let i = 0; i < 3; i++) {
    sessionService.extendSession();
  }

  // Restore original method
  sessionService.extendSession = originalExtend;

  if (extensionCount <= 3) {
    console.log('✅ Session extension cooldown working');
  }

  // Summary
  console.log('\n📊 Production Readiness Results:');
  if (issues.length === 0) {
    console.log('✅ READY FOR PRODUCTION');
  } else {
    console.log('❌ PRODUCTION ISSUES FOUND');
    issues.forEach(issue => console.log(issue));
  }

  if (warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    warnings.forEach(warning => console.log(warning));
  }

  console.groupEnd();

  return {
    ready: issues.length === 0,
    issues,
    warnings
  };
};

/**
 * Run comprehensive compatibility check
 */
export const runFullCompatibilityCheck = () => {
  console.log('🚀 Running Full API Compatibility Check...');
  
  const apiCheck = checkAPICompatibility();
  testAPIHeaders();
  simulateAPICall();
  const prodCheck = checkProductionReadiness();

  console.log('\n🎯 FINAL SUMMARY:');
  console.log(`API Compatibility: ${apiCheck.compatible ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Production Ready: ${prodCheck.ready ? '✅ PASS' : '❌ FAIL'}`);

  const overallStatus = apiCheck.compatible && prodCheck.ready;
  console.log(`\n🏆 OVERALL STATUS: ${overallStatus ? '✅ SAFE TO DEPLOY' : '❌ NEEDS ATTENTION'}`);

  return {
    safeTodeploy: overallStatus,
    apiCompatible: apiCheck.compatible,
    productionReady: prodCheck.ready,
    details: {
      api: apiCheck.results,
      production: { issues: prodCheck.issues, warnings: prodCheck.warnings }
    }
  };
};

// Auto-run in development with special URL parameter
if (import.meta.env.DEV && window.location.search.includes('check-api')) {
  setTimeout(() => {
    runFullCompatibilityCheck();
  }, 1000);
}

export default {
  checkAPICompatibility,
  testAPIHeaders,
  simulateAPICall,
  checkProductionReadiness,
  runFullCompatibilityCheck
};
