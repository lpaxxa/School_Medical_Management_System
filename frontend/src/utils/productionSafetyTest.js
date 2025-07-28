/**
 * Production Safety Test
 * Quick tests to ensure session management works in production
 * Can be run safely without affecting user sessions
 */

/**
 * Test basic session functionality without affecting current session
 */
export const testBasicFunctionality = () => {
  const results = [];
  
  try {
    // Test 1: Can we import sessionService?
    const sessionService = require('../services/sessionService').default;
    results.push('✅ SessionService import successful');
    
    // Test 2: Can we call getToken without errors?
    const token = sessionService.getToken();
    results.push('✅ getToken() executed without errors');
    
    // Test 3: Can we call isAuthenticated?
    const isAuth = sessionService.isAuthenticated();
    results.push('✅ isAuthenticated() executed without errors');
    
    // Test 4: Can we get session info?
    const info = sessionService.getSessionInfo();
    results.push('✅ getSessionInfo() executed without errors');
    
  } catch (error) {
    results.push(`❌ Basic functionality test failed: ${error.message}`);
  }
  
  return results;
};

/**
 * Test API header generation
 */
export const testAPIHeaders = () => {
  const results = [];
  
  try {
    // Test different ways of getting auth headers
    const methods = [
      {
        name: 'sessionService.getToken()',
        getToken: () => {
          const sessionService = require('../services/sessionService').default;
          return sessionService.getToken();
        }
      },
      {
        name: 'localStorage direct',
        getToken: () => localStorage.getItem('authToken')
      },
      {
        name: 'safety wrapper',
        getToken: () => {
          const safetyWrapper = require('../services/sessionSafetyWrapper').default;
          return safetyWrapper.getToken();
        }
      }
    ];
    
    methods.forEach(method => {
      try {
        const token = method.getToken();
        const headers = {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        };
        results.push(`✅ ${method.name}: Headers generated successfully`);
      } catch (error) {
        results.push(`❌ ${method.name}: Failed - ${error.message}`);
      }
    });
    
  } catch (error) {
    results.push(`❌ API headers test failed: ${error.message}`);
  }
  
  return results;
};

/**
 * Test backward compatibility
 */
export const testBackwardCompatibility = () => {
  const results = [];
  
  try {
    // Save current state
    const originalToken = localStorage.getItem('authToken');
    const originalTimeout = localStorage.getItem('sessionTimeout');
    
    // Test old session format (no sessionTimeout)
    if (originalToken) {
      localStorage.removeItem('sessionTimeout');
      
      const sessionService = require('../services/sessionService').default;
      const token = sessionService.getToken();
      
      if (token === originalToken) {
        results.push('✅ Backward compatibility: Old session format handled correctly');
      } else {
        results.push('⚠️ Backward compatibility: Token mismatch (may be expired)');
      }
      
      // Restore original state
      if (originalTimeout) {
        localStorage.setItem('sessionTimeout', originalTimeout);
      }
    } else {
      results.push('ℹ️ Backward compatibility: No existing session to test');
    }
    
  } catch (error) {
    results.push(`❌ Backward compatibility test failed: ${error.message}`);
  }
  
  return results;
};

/**
 * Test error handling and fallbacks
 */
export const testErrorHandling = () => {
  const results = [];
  
  try {
    // Test safety wrapper fallbacks
    const safetyWrapper = require('../services/sessionSafetyWrapper').default;
    
    // These should never throw errors
    const token = safetyWrapper.getToken();
    const isAuth = safetyWrapper.isAuthenticated();
    const userData = safetyWrapper.getUserData();
    const headers = safetyWrapper.createAuthHeaders();
    
    results.push('✅ Safety wrapper: All methods executed without errors');
    
    // Test request interceptor
    const mockConfig = { headers: {} };
    const processedConfig = safetyWrapper.requestInterceptor(mockConfig);
    
    if (processedConfig && typeof processedConfig === 'object') {
      results.push('✅ Safety wrapper: Request interceptor works');
    } else {
      results.push('❌ Safety wrapper: Request interceptor failed');
    }
    
  } catch (error) {
    results.push(`❌ Error handling test failed: ${error.message}`);
  }
  
  return results;
};

/**
 * Run all production safety tests
 */
export const runProductionSafetyTests = () => {
  console.log('🏭 Running Production Safety Tests...');
  
  const allResults = [];
  
  // Run all tests
  const tests = [
    { name: 'Basic Functionality', test: testBasicFunctionality },
    { name: 'API Headers', test: testAPIHeaders },
    { name: 'Backward Compatibility', test: testBackwardCompatibility },
    { name: 'Error Handling', test: testErrorHandling }
  ];
  
  tests.forEach(({ name, test }) => {
    console.log(`\n🧪 Testing: ${name}`);
    const results = test();
    results.forEach(result => {
      console.log(result);
      allResults.push(result);
    });
  });
  
  // Summary
  const passed = allResults.filter(r => r.startsWith('✅')).length;
  const warnings = allResults.filter(r => r.startsWith('⚠️')).length;
  const failed = allResults.filter(r => r.startsWith('❌')).length;
  
  console.log('\n📊 Production Safety Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`⚠️ Warnings: ${warnings}`);
  console.log(`❌ Failed: ${failed}`);
  
  const isProductionSafe = failed === 0;
  console.log(`\n🎯 Production Safety: ${isProductionSafe ? '✅ SAFE' : '❌ UNSAFE'}`);
  
  return {
    safe: isProductionSafe,
    passed,
    warnings,
    failed,
    details: allResults
  };
};

/**
 * Quick health check that can be run anytime
 */
export const quickHealthCheck = () => {
  try {
    // Test the most critical functionality
    const sessionService = require('../services/sessionService').default;
    const token = sessionService.getToken();
    const isAuth = sessionService.isAuthenticated();
    
    return {
      healthy: true,
      hasToken: !!token,
      isAuthenticated: isAuth,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Make tests available globally for console access
if (typeof window !== 'undefined') {
  window.sessionSafetyTests = {
    runAll: runProductionSafetyTests,
    quickCheck: quickHealthCheck,
    basic: testBasicFunctionality,
    headers: testAPIHeaders,
    compatibility: testBackwardCompatibility,
    errorHandling: testErrorHandling
  };
}

export default {
  runProductionSafetyTests,
  quickHealthCheck,
  testBasicFunctionality,
  testAPIHeaders,
  testBackwardCompatibility,
  testErrorHandling
};
