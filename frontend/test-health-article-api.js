// Test script để debug Health Article API
// Chạy trong browser console để test API endpoint

const testHealthArticleAPI = async () => {
  console.log('=== TESTING HEALTH ARTICLE API ===');
  
  // Get auth info
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  const currentUserId = localStorage.getItem('currentUserId');
  
  console.log('Auth info:', {
    hasToken: !!token,
    userRole,
    currentUserId,
    tokenLength: token?.length
  });
  
  if (!token) {
    console.error('❌ No auth token found. Please login first.');
    return;
  }
  
  // Test data - minimal structure
  const testData1 = {
    title: 'Test Article 1',
    summary: 'Test summary',
    content: 'Test content',
    category: 'Phòng bệnh',
    tags: []
  };
  
  // Test data - with string tags
  const testData2 = {
    title: 'Test Article 2',
    summary: 'Test summary',
    content: 'Test content',
    category: 'Phòng bệnh',
    tags: 'test, health'
  };
  
  // Test data - with array tags
  const testData3 = {
    title: 'Test Article 3',
    summary: 'Test summary',
    content: 'Test content',
    category: 'Phòng bệnh',
    tags: ['test', 'health']
  };
  
  const baseURL = 'https://medically-backend.southeastasia.cloudapp.azure.com/api/health-articles';
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-User-Role': userRole,
    'X-User-ID': currentUserId
  };
  
  console.log('Request headers:', headers);
  
  // Test 1: Empty tags array
  try {
    console.log('\n🧪 Test 1: Empty tags array');
    console.log('Data:', testData1);
    
    const response1 = await fetch(baseURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(testData1)
    });
    
    console.log('Response status:', response1.status);
    const result1 = await response1.text();
    console.log('Response body:', result1);
    
    if (response1.ok) {
      console.log('✅ Test 1 PASSED');
      return JSON.parse(result1);
    } else {
      console.log('❌ Test 1 FAILED');
    }
  } catch (error) {
    console.error('❌ Test 1 ERROR:', error);
  }
  
  // Test 2: String tags
  try {
    console.log('\n🧪 Test 2: String tags');
    console.log('Data:', testData2);
    
    const response2 = await fetch(baseURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(testData2)
    });
    
    console.log('Response status:', response2.status);
    const result2 = await response2.text();
    console.log('Response body:', result2);
    
    if (response2.ok) {
      console.log('✅ Test 2 PASSED');
      return JSON.parse(result2);
    } else {
      console.log('❌ Test 2 FAILED');
    }
  } catch (error) {
    console.error('❌ Test 2 ERROR:', error);
  }
  
  // Test 3: Array tags
  try {
    console.log('\n🧪 Test 3: Array tags');
    console.log('Data:', testData3);
    
    const response3 = await fetch(baseURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(testData3)
    });
    
    console.log('Response status:', response3.status);
    const result3 = await response3.text();
    console.log('Response body:', result3);
    
    if (response3.ok) {
      console.log('✅ Test 3 PASSED');
      return JSON.parse(result3);
    } else {
      console.log('❌ Test 3 FAILED');
    }
  } catch (error) {
    console.error('❌ Test 3 ERROR:', error);
  }
  
  console.log('\n❌ All tests failed. Check backend API or authentication.');
};

// Test GET endpoint
const testGetHealthArticles = async () => {
  console.log('\n=== TESTING GET HEALTH ARTICLES ===');
  
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  const currentUserId = localStorage.getItem('currentUserId');
  
  const baseURL = 'https://medically-backend.southeastasia.cloudapp.azure.com/api/health-articles';
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'X-User-Role': userRole,
    'X-User-ID': currentUserId
  };
  
  try {
    const response = await fetch(baseURL, {
      method: 'GET',
      headers: headers
    });
    
    console.log('GET Response status:', response.status);
    const result = await response.text();
    console.log('GET Response body:', result);
    
    if (response.ok) {
      console.log('✅ GET request PASSED');
      const articles = JSON.parse(result);
      console.log('Number of articles:', articles.length);
      if (articles.length > 0) {
        console.log('Sample article structure:', articles[0]);
      }
    } else {
      console.log('❌ GET request FAILED');
    }
  } catch (error) {
    console.error('❌ GET request ERROR:', error);
  }
};

// Run tests
console.log('To run tests, execute:');
console.log('testGetHealthArticles()');
console.log('testHealthArticleAPI()');

// Auto-run GET test
testGetHealthArticles();
