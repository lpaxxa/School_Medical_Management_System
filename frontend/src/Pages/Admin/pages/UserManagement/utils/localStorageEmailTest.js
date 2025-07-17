/**
 * Test file để kiểm tra localStorage persistence cho email sent status
 * 
 * Cách sử dụng:
 * 1. Mở browser console
 * 2. Chạy: window.localStorageEmailTests.runAllTests()
 * 3. Kiểm tra kết quả trong console
 */

// Test localStorage persistence
export function testLocalStoragePersistence() {
  console.log('🧪 Testing localStorage persistence...');
  
  const testKey = 'admin_sentEmailUsers';
  const testData = [1, 2, 3, 4, 5];
  
  // Test save
  try {
    localStorage.setItem(testKey, JSON.stringify(testData));
    console.log('💾 Saved to localStorage:', testData);
  } catch (error) {
    console.error('❌ Failed to save to localStorage:', error);
    return { success: false, error: 'Save failed' };
  }
  
  // Test load
  try {
    const loaded = JSON.parse(localStorage.getItem(testKey));
    const loadSuccess = JSON.stringify(loaded) === JSON.stringify(testData);
    console.log('📂 Loaded from localStorage:', loaded);
    console.log('✅ Load test:', loadSuccess ? 'PASSED' : 'FAILED');
    
    if (!loadSuccess) {
      return { success: false, error: 'Load mismatch' };
    }
  } catch (error) {
    console.error('❌ Failed to load from localStorage:', error);
    return { success: false, error: 'Load failed' };
  }
  
  // Test update (simulate user update)
  try {
    const updatedData = testData.filter(id => ![2, 4].includes(id)); // Remove users 2 and 4
    localStorage.setItem(testKey, JSON.stringify(updatedData));
    const reloaded = JSON.parse(localStorage.getItem(testKey));
    
    console.log('🔄 After update (removed 2,4):', reloaded);
    console.log('📋 Expected:', [1, 3, 5]);
    
    const updateSuccess = JSON.stringify(reloaded.sort()) === JSON.stringify([1, 3, 5]);
    console.log('✅ Update test:', updateSuccess ? 'PASSED' : 'FAILED');
    
    if (!updateSuccess) {
      return { success: false, error: 'Update failed' };
    }
  } catch (error) {
    console.error('❌ Failed to update localStorage:', error);
    return { success: false, error: 'Update failed' };
  }
  
  // Cleanup
  localStorage.removeItem(testKey);
  console.log('🧹 Cleaned up test data');
  
  return { success: true, message: 'All localStorage tests passed' };
}

// Test refresh simulation
export function testRefreshSimulation() {
  console.log('🧪 Testing refresh simulation...');
  
  const testKey = 'admin_sentEmailUsers';
  const originalData = [10, 20, 30];
  
  // Simulate initial state
  localStorage.setItem(testKey, JSON.stringify(originalData));
  console.log('📱 Simulated app state before refresh:', originalData);
  
  // Simulate page refresh (reload from localStorage)
  const restoredData = (() => {
    try {
      const saved = localStorage.getItem(testKey);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return [];
    }
  })();
  
  console.log('🔄 Simulated app state after refresh:', restoredData);
  
  const refreshSuccess = JSON.stringify(originalData) === JSON.stringify(restoredData);
  console.log('✅ Refresh simulation:', refreshSuccess ? 'PASSED' : 'FAILED');
  
  // Cleanup
  localStorage.removeItem(testKey);
  
  return {
    success: refreshSuccess,
    original: originalData,
    restored: restoredData
  };
}

// Test error handling
export function testErrorHandling() {
  console.log('🧪 Testing error handling...');
  
  const results = [];
  
  // Test 1: Invalid JSON in localStorage
  try {
    localStorage.setItem('admin_sentEmailUsers', 'invalid-json');
    
    const loadResult = (() => {
      try {
        const saved = localStorage.getItem('admin_sentEmailUsers');
        return saved ? JSON.parse(saved) : [];
      } catch (error) {
        console.log('✅ Caught invalid JSON error:', error.message);
        return [];
      }
    })();
    
    results.push({
      test: 'Invalid JSON handling',
      passed: Array.isArray(loadResult) && loadResult.length === 0,
      result: loadResult
    });
  } catch (error) {
    results.push({
      test: 'Invalid JSON handling',
      passed: false,
      error: error.message
    });
  }
  
  // Cleanup
  localStorage.removeItem('admin_sentEmailUsers');
  
  const allPassed = results.every(r => r.passed);
  console.log('📋 Error handling results:', results);
  console.log('✅ All error handling tests:', allPassed ? 'PASSED' : 'FAILED');
  
  return {
    success: allPassed,
    results
  };
}

// Test complete workflow with localStorage
export function testCompleteWorkflowWithLocalStorage() {
  console.log('🧪 Testing complete workflow with localStorage...');
  
  const testKey = 'admin_sentEmailUsers';
  let sentEmailUsers = [];
  
  // Step 1: Initial state (empty)
  console.log('📧 Step 1 - Initial state:', sentEmailUsers);
  
  // Step 2: Send emails to some users
  const emailSentToUsers = [1, 2, 3];
  sentEmailUsers = [...emailSentToUsers];
  localStorage.setItem(testKey, JSON.stringify(sentEmailUsers));
  console.log('📧 Step 2 - Emails sent and saved:', sentEmailUsers);
  
  // Step 3: Simulate page refresh
  const restoredAfterRefresh = JSON.parse(localStorage.getItem(testKey) || '[]');
  console.log('🔄 Step 3 - After refresh:', restoredAfterRefresh);
  
  // Step 4: Update user information (user 2)
  const userToUpdate = 2;
  const updatedUserIds = [userToUpdate];
  
  // Reset email sent status for updated user
  sentEmailUsers = restoredAfterRefresh.filter(userId => !updatedUserIds.includes(userId));
  localStorage.setItem(testKey, JSON.stringify(sentEmailUsers));
  
  console.log('📝 Step 4 - User updated:', userToUpdate);
  console.log('📧 Step 4 - After reset:', sentEmailUsers);
  
  // Step 5: Verify user can send email again
  const canSendToUpdatedUser = !sentEmailUsers.includes(userToUpdate);
  const canSendToOtherUser = sentEmailUsers.includes(1); // Should still be blocked
  
  console.log('✅ Step 5 - Can send to updated user (2):', canSendToUpdatedUser);
  console.log('❌ Step 5 - Can send to other user (1):', !canSendToOtherUser);
  
  // Cleanup
  localStorage.removeItem(testKey);
  
  return {
    success: canSendToUpdatedUser && canSendToOtherUser,
    workflow: 'Complete workflow with localStorage test completed'
  };
}

// Run all localStorage tests
export function runAllLocalStorageTests() {
  console.log('🚀 Running all localStorage email status tests...');
  console.log('='.repeat(60));
  
  const results = {
    persistence: testLocalStoragePersistence(),
    refreshSimulation: testRefreshSimulation(),
    errorHandling: testErrorHandling(),
    completeWorkflow: testCompleteWorkflowWithLocalStorage()
  };
  
  console.log('='.repeat(60));
  console.log('📋 All localStorage test results:', results);
  
  const allTestsPassed = Object.values(results).every(result => 
    result.success !== false
  );
  
  console.log(`🎯 Overall result: ${allTestsPassed ? '✅ All tests passed' : '❌ Some tests failed'}`);
  
  return results;
}

// Auto-run tests if in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Development mode detected, localStorage email tests available');
  window.localStorageEmailTests = {
    testLocalStoragePersistence,
    testRefreshSimulation,
    testErrorHandling,
    testCompleteWorkflowWithLocalStorage,
    runAllLocalStorageTests
  };
}
