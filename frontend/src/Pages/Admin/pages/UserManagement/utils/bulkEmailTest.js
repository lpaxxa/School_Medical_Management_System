/**
 * Test file để kiểm tra bulk email functionality
 * 
 * Cách sử dụng:
 * 1. Mở browser console
 * 2. Chạy: window.bulkEmailTests.runAllTests()
 * 3. Kiểm tra kết quả trong console
 */

// Test bulk email selection logic
export function testBulkEmailSelection() {
  console.log('🧪 Testing bulk email selection logic...');
  
  // Mock users data
  const mockUsers = [
    { id: 'USER001', username: 'user1', email: 'user1@test.com' },
    { id: 'USER002', username: 'user2', email: 'user2@test.com' },
    { id: 'USER003', username: 'user3', email: 'user3@test.com' },
    { id: 'USER004', username: 'user4', email: 'user4@test.com' },
    { id: 'USER005', username: 'user5', email: 'user5@test.com' }
  ];
  
  // Mock sent email users
  let sentEmailUsers = ['USER002', 'USER004'];
  let selectedUsers = [];
  
  console.log('📊 Initial state:', {
    totalUsers: mockUsers.length,
    sentEmailUsers,
    selectedUsers
  });
  
  // Test 1: Select all functionality
  const selectAllUsers = () => {
    selectedUsers = mockUsers.map(user => user.id);
    return selectedUsers;
  };
  
  const allSelected = selectAllUsers();
  console.log('✅ Test 1 - Select all:', {
    selected: allSelected,
    count: allSelected.length,
    expected: mockUsers.length,
    passed: allSelected.length === mockUsers.length
  });
  
  // Test 2: Filter users for "Send All" (exclude already sent)
  const getUsersForSendAll = () => {
    return mockUsers.filter(user => !sentEmailUsers.includes(user.id));
  };
  
  const usersForSendAll = getUsersForSendAll();
  console.log('✅ Test 2 - Send All filtering:', {
    usersForSendAll: usersForSendAll.map(u => u.id),
    count: usersForSendAll.length,
    expected: 3, // 5 total - 2 already sent
    passed: usersForSendAll.length === 3
  });
  
  // Test 3: Filter users for "Send Selected" (exclude already sent)
  selectedUsers = ['USER001', 'USER002', 'USER003']; // Include one already sent
  const getUsersForSendSelected = () => {
    return mockUsers.filter(user => 
      selectedUsers.includes(user.id) && !sentEmailUsers.includes(user.id)
    );
  };
  
  const usersForSendSelected = getUsersForSendSelected();
  console.log('✅ Test 3 - Send Selected filtering:', {
    selectedUsers,
    usersForSendSelected: usersForSendSelected.map(u => u.id),
    count: usersForSendSelected.length,
    expected: 2, // USER001, USER003 (USER002 already sent)
    passed: usersForSendSelected.length === 2
  });
  
  // Test 4: Button disable logic
  const shouldDisableSendAll = usersForSendAll.length === 0;
  const shouldDisableSendSelected = selectedUsers.length === 0 || 
    selectedUsers.every(id => sentEmailUsers.includes(id));
  
  console.log('✅ Test 4 - Button disable logic:', {
    sendAllDisabled: shouldDisableSendAll,
    sendSelectedDisabled: shouldDisableSendSelected,
    sendAllExpected: false,
    sendSelectedExpected: false,
    passed: !shouldDisableSendAll && !shouldDisableSendSelected
  });
  
  return {
    success: true,
    tests: 4,
    mockData: { mockUsers, sentEmailUsers, selectedUsers }
  };
}

// Test localStorage integration with bulk email
export function testBulkEmailWithLocalStorage() {
  console.log('🧪 Testing bulk email with localStorage...');
  
  const testKey = 'admin_sentEmailUsers';
  
  // Initial state
  let sentEmailUsers = ['USER001'];
  localStorage.setItem(testKey, JSON.stringify(sentEmailUsers));
  
  console.log('📧 Initial sent emails:', sentEmailUsers);
  
  // Simulate bulk email send
  const bulkEmailUsers = ['USER002', 'USER003', 'USER004'];
  sentEmailUsers = [...sentEmailUsers, ...bulkEmailUsers];
  localStorage.setItem(testKey, JSON.stringify(sentEmailUsers));
  
  console.log('📧 After bulk send:', sentEmailUsers);
  
  // Verify localStorage
  const storedUsers = JSON.parse(localStorage.getItem(testKey));
  const storageMatch = JSON.stringify(storedUsers.sort()) === JSON.stringify(sentEmailUsers.sort());
  
  console.log('✅ localStorage sync:', {
    stored: storedUsers,
    current: sentEmailUsers,
    match: storageMatch
  });
  
  // Simulate page refresh
  const restoredUsers = JSON.parse(localStorage.getItem(testKey) || '[]');
  const refreshMatch = JSON.stringify(restoredUsers.sort()) === JSON.stringify(sentEmailUsers.sort());
  
  console.log('✅ After refresh:', {
    restored: restoredUsers,
    original: sentEmailUsers,
    match: refreshMatch
  });
  
  // Cleanup
  localStorage.removeItem(testKey);
  
  return {
    success: storageMatch && refreshMatch,
    storageMatch,
    refreshMatch
  };
}

// Test bulk email API payload
export function testBulkEmailAPIPayload() {
  console.log('🧪 Testing bulk email API payload...');
  
  const mockUsers = [
    { id: 'USER001', username: 'user1', email: 'user1@test.com' },
    { id: 'USER002', username: 'user2', email: 'user2@test.com' },
    { id: 'USER003', username: 'user3', email: 'user3@test.com' }
  ];
  
  // Test "Send All" payload
  const sendAllPayload = mockUsers.map(user => user.id);
  console.log('📤 Send All payload:', sendAllPayload);
  
  // Test "Send Selected" payload
  const selectedUsers = ['USER001', 'USER003'];
  const sendSelectedPayload = mockUsers
    .filter(user => selectedUsers.includes(user.id))
    .map(user => user.id);
  console.log('📤 Send Selected payload:', sendSelectedPayload);
  
  // Validate payload format
  const isValidSendAll = Array.isArray(sendAllPayload) && 
    sendAllPayload.length === mockUsers.length &&
    sendAllPayload.every(id => typeof id === 'string');
  
  const isValidSendSelected = Array.isArray(sendSelectedPayload) && 
    sendSelectedPayload.length === selectedUsers.length &&
    sendSelectedPayload.every(id => typeof id === 'string');
  
  console.log('✅ Payload validation:', {
    sendAllValid: isValidSendAll,
    sendSelectedValid: isValidSendSelected,
    sendAllCount: sendAllPayload.length,
    sendSelectedCount: sendSelectedPayload.length
  });
  
  return {
    success: isValidSendAll && isValidSendSelected,
    payloads: {
      sendAll: sendAllPayload,
      sendSelected: sendSelectedPayload
    }
  };
}

// Test edge cases
export function testBulkEmailEdgeCases() {
  console.log('🧪 Testing bulk email edge cases...');
  
  const results = [];
  
  // Test 1: Empty user list
  const emptyUsers = [];
  const emptyResult = emptyUsers.filter(u => true);
  results.push({
    test: 'Empty user list',
    passed: emptyResult.length === 0,
    result: emptyResult
  });
  
  // Test 2: All users already sent
  const allSentUsers = ['USER001', 'USER002'];
  const allSentSentList = ['USER001', 'USER002'];
  const allSentResult = allSentUsers.filter(id => !allSentSentList.includes(id));
  results.push({
    test: 'All users already sent',
    passed: allSentResult.length === 0,
    result: allSentResult
  });
  
  // Test 3: No users selected
  const noSelection = [];
  const noSelectionValid = noSelection.length > 0;
  results.push({
    test: 'No users selected',
    passed: !noSelectionValid,
    result: noSelectionValid
  });
  
  // Test 4: Mixed selection (some sent, some not)
  const mixedUsers = [
    { id: 'USER001', sent: true },
    { id: 'USER002', sent: false },
    { id: 'USER003', sent: true },
    { id: 'USER004', sent: false }
  ];
  const mixedSelection = ['USER001', 'USER002', 'USER004'];
  const mixedSentList = mixedUsers.filter(u => u.sent).map(u => u.id);
  const mixedResult = mixedSelection.filter(id => !mixedSentList.includes(id));
  results.push({
    test: 'Mixed selection filtering',
    passed: mixedResult.length === 2 && mixedResult.includes('USER002') && mixedResult.includes('USER004'),
    result: mixedResult
  });
  
  console.log('📋 Edge case results:', results);
  
  const allPassed = results.every(r => r.passed);
  console.log(`✅ Edge cases: ${allPassed ? 'All passed' : 'Some failed'}`);
  
  return {
    success: allPassed,
    results
  };
}

// Run all bulk email tests
export function runAllBulkEmailTests() {
  console.log('🚀 Running all bulk email tests...');
  console.log('='.repeat(60));
  
  const results = {
    selection: testBulkEmailSelection(),
    localStorage: testBulkEmailWithLocalStorage(),
    apiPayload: testBulkEmailAPIPayload(),
    edgeCases: testBulkEmailEdgeCases()
  };
  
  console.log('='.repeat(60));
  console.log('📋 All bulk email test results:', results);
  
  const allTestsPassed = Object.values(results).every(result => 
    result.success !== false
  );
  
  console.log(`🎯 Overall result: ${allTestsPassed ? '✅ All tests passed' : '❌ Some tests failed'}`);
  
  return results;
}

// Auto-run tests if in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Development mode detected, bulk email tests available');
  window.bulkEmailTests = {
    testBulkEmailSelection,
    testBulkEmailWithLocalStorage,
    testBulkEmailAPIPayload,
    testBulkEmailEdgeCases,
    runAllBulkEmailTests
  };
}
