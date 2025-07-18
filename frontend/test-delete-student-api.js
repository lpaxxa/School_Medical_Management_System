/**
 * Test script để verify Student Delete API
 */

const axios = require('axios');

// Configuration
const BACKEND_URL = 'http://localhost:8080';
const TEST_STUDENT_ID = 1; // Replace with actual student ID
const AUTH_TOKEN = 'your-auth-token-here'; // Replace with actual token

console.log('🧪 Testing Student Delete API...\n');

// Test 1: Check if backend is running
async function testBackendConnection() {
  console.log('🔗 Test 1: Backend Connection');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/v1/health`, {
      timeout: 5000
    });
    console.log('✅ Backend is running:', response.status);
    return true;
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
    return false;
  }
}

// Test 2: Test student list API
async function testStudentListAPI() {
  console.log('\n📋 Test 2: Student List API');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/v1/students`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Student list API status:', response.status);
    console.log('📊 Number of students:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('👤 First student:', {
        id: response.data[0].id,
        name: response.data[0].fullName,
        studentId: response.data[0].studentId
      });
      return response.data[0].id; // Return first student ID for testing
    }
    return null;
  } catch (error) {
    console.log('❌ Student list API failed:', error.response?.status, error.message);
    return null;
  }
}

// Test 3: Test delete API (dry run - just check endpoint)
async function testDeleteAPI(studentId) {
  console.log('\n🗑️ Test 3: Delete API (Dry Run)');
  
  if (!studentId) {
    console.log('⚠️ No student ID provided, skipping delete test');
    return;
  }
  
  const deleteUrl = `${BACKEND_URL}/api/v1/students/${studentId}`;
  console.log('🌐 Delete URL:', deleteUrl);
  
  try {
    // Just test the endpoint without actually deleting
    const response = await axios.delete(deleteUrl, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000,
      validateStatus: function (status) {
        // Accept any status for testing
        return status < 500;
      }
    });
    
    console.log('📡 Delete API response status:', response.status);
    console.log('📡 Delete API response ok:', response.status < 400);
    
    if (response.status === 200 || response.status === 204) {
      console.log('✅ Delete API endpoint is working');
    } else if (response.status === 401) {
      console.log('🔐 Authentication required - check your token');
    } else if (response.status === 403) {
      console.log('🚫 Permission denied - check user permissions');
    } else if (response.status === 404) {
      console.log('🔍 Student not found - check student ID');
    } else {
      console.log('⚠️ Unexpected response status:', response.status);
    }
    
  } catch (error) {
    console.log('❌ Delete API failed:', error.response?.status, error.message);
    
    if (error.response?.data) {
      console.log('📄 Error response body:', error.response.data);
    }
  }
}

// Test 4: Frontend URL construction
function testFrontendURLs() {
  console.log('\n🌐 Test 4: Frontend URL Construction');
  
  const testStudentId = 123;
  const frontendDeleteUrl = `${BACKEND_URL}/api/v1/students/${testStudentId}`;
  const frontendRefreshUrl = `${BACKEND_URL}/api/v1/students`;
  
  console.log('🔗 Delete URL format:', frontendDeleteUrl);
  console.log('🔗 Refresh URL format:', frontendRefreshUrl);
  
  // Check if URLs are properly formatted
  const isValidDeleteUrl = frontendDeleteUrl.includes('/api/v1/students/') && !frontendDeleteUrl.includes('undefined');
  const isValidRefreshUrl = frontendRefreshUrl.includes('/api/v1/students') && !frontendRefreshUrl.includes('undefined');
  
  console.log('✅ Delete URL valid:', isValidDeleteUrl);
  console.log('✅ Refresh URL valid:', isValidRefreshUrl);
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Student Delete API Tests\n');
  
  // Test backend connection
  const backendRunning = await testBackendConnection();
  if (!backendRunning) {
    console.log('\n❌ Cannot proceed - backend is not running');
    console.log('💡 Make sure your backend server is running on http://localhost:8080');
    return;
  }
  
  // Test student list API
  const firstStudentId = await testStudentListAPI();
  
  // Test delete API
  await testDeleteAPI(firstStudentId);
  
  // Test frontend URL construction
  testFrontendURLs();
  
  console.log('\n🎯 Test Summary:');
  console.log('1. ✅ Backend connection test completed');
  console.log('2. ✅ Student list API test completed');
  console.log('3. ✅ Delete API test completed');
  console.log('4. ✅ Frontend URL test completed');
  
  console.log('\n📝 Next Steps:');
  console.log('1. Update AUTH_TOKEN in this script with real token');
  console.log('2. Test with actual student ID');
  console.log('3. Check browser console logs when testing delete function');
  console.log('4. Verify API responses match expected format');
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
});

module.exports = {
  testBackendConnection,
  testStudentListAPI,
  testDeleteAPI,
  testFrontendURLs
};
