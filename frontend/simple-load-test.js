/**
 * Simple Load Test Script
 * Test concurrent users accessing the application
 */

const axios = require('axios');

// Configuration
const BACKEND_URL = 'http://localhost:8080';
const FRONTEND_URL = 'http://localhost:5173';
const CONCURRENT_USERS = 50; // Start with 50 concurrent users
const TEST_DURATION = 60000; // 60 seconds
const REQUEST_INTERVAL = 1000; // 1 second between requests

// Test credentials
const TEST_CREDENTIALS = {
  username: 'admin@school.com',
  password: 'admin123'
};

// Statistics
let stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
  responseTimes: [],
  errors: []
};

// Simulate a single user session
async function simulateUser(userId) {
  console.log(`👤 User ${userId} started`);
  
  try {
    // Login
    const loginStart = Date.now();
    const loginResponse = await axios.post(`${BACKEND_URL}/api/v1/auth/login`, TEST_CREDENTIALS);
    const loginTime = Date.now() - loginStart;
    
    if (loginResponse.status === 200) {
      const token = loginResponse.data.token;
      console.log(`✅ User ${userId} logged in (${loginTime}ms)`);
      
      // Simulate user activities
      const interval = setInterval(async () => {
        try {
          await performUserActivity(userId, token);
        } catch (error) {
          console.error(`❌ User ${userId} activity error:`, error.message);
          stats.failedRequests++;
          stats.errors.push({
            userId,
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }, REQUEST_INTERVAL);
      
      // Stop after test duration
      setTimeout(() => {
        clearInterval(interval);
        console.log(`🛑 User ${userId} session ended`);
      }, TEST_DURATION);
      
    } else {
      throw new Error(`Login failed with status ${loginResponse.status}`);
    }
    
  } catch (error) {
    console.error(`❌ User ${userId} login failed:`, error.message);
    stats.failedRequests++;
    stats.errors.push({
      userId,
      error: `Login failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
}

// Perform random user activities
async function performUserActivity(userId, token) {
  const activities = [
    () => getStudentsList(userId, token),
    () => getSpecificStudent(userId, token),
    () => getFrontendPage(userId),
    () => getReportsPage(userId, token)
  ];
  
  // Pick random activity
  const activity = activities[Math.floor(Math.random() * activities.length)];
  await activity();
}

// Get students list
async function getStudentsList(userId, token) {
  const start = Date.now();
  const response = await axios.get(`${BACKEND_URL}/api/v1/students`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 10000
  });
  
  const responseTime = Date.now() - start;
  recordStats(responseTime, response.status === 200);
  console.log(`📋 User ${userId} got students list (${responseTime}ms)`);
}

// Get specific student
async function getSpecificStudent(userId, token) {
  const studentId = Math.floor(Math.random() * 100) + 1;
  const start = Date.now();
  
  try {
    const response = await axios.get(`${BACKEND_URL}/api/v1/students/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000
    });
    
    const responseTime = Date.now() - start;
    recordStats(responseTime, response.status === 200);
    console.log(`👤 User ${userId} got student ${studentId} (${responseTime}ms)`);
  } catch (error) {
    const responseTime = Date.now() - start;
    recordStats(responseTime, false);
    if (error.response?.status !== 404) {
      throw error; // Re-throw if not 404 (student not found is expected)
    }
  }
}

// Get frontend page
async function getFrontendPage(userId) {
  const start = Date.now();
  const response = await axios.get(FRONTEND_URL, { timeout: 10000 });
  
  const responseTime = Date.now() - start;
  recordStats(responseTime, response.status === 200);
  console.log(`🌐 User ${userId} loaded frontend (${responseTime}ms)`);
}

// Get reports page
async function getReportsPage(userId, token) {
  const start = Date.now();
  const response = await axios.get(`${BACKEND_URL}/api/v1/reports/students`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 10000
  });
  
  const responseTime = Date.now() - start;
  recordStats(responseTime, response.status === 200);
  console.log(`📊 User ${userId} got reports (${responseTime}ms)`);
}

// Record statistics
function recordStats(responseTime, success) {
  stats.totalRequests++;
  stats.responseTimes.push(responseTime);
  
  if (success) {
    stats.successfulRequests++;
  } else {
    stats.failedRequests++;
  }
  
  // Calculate average response time
  stats.averageResponseTime = stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length;
}

// Print statistics
function printStats() {
  console.log('\n📊 LOAD TEST STATISTICS:');
  console.log('========================');
  console.log(`👥 Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`⏱️  Test Duration: ${TEST_DURATION / 1000} seconds`);
  console.log(`📈 Total Requests: ${stats.totalRequests}`);
  console.log(`✅ Successful Requests: ${stats.successfulRequests}`);
  console.log(`❌ Failed Requests: ${stats.failedRequests}`);
  console.log(`📊 Success Rate: ${((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2)}%`);
  console.log(`⚡ Average Response Time: ${stats.averageResponseTime.toFixed(2)}ms`);
  console.log(`🐌 Slowest Response: ${Math.max(...stats.responseTimes)}ms`);
  console.log(`🚀 Fastest Response: ${Math.min(...stats.responseTimes)}ms`);
  
  if (stats.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    stats.errors.slice(0, 10).forEach((error, index) => {
      console.log(`${index + 1}. User ${error.userId}: ${error.error}`);
    });
    if (stats.errors.length > 10) {
      console.log(`... and ${stats.errors.length - 10} more errors`);
    }
  }
}

// Main test function
async function runLoadTest() {
  console.log(`🚀 Starting load test with ${CONCURRENT_USERS} concurrent users`);
  console.log(`⏱️  Test duration: ${TEST_DURATION / 1000} seconds`);
  console.log(`🎯 Target: ${BACKEND_URL}`);
  console.log('========================\n');
  
  // Start all users simultaneously
  const userPromises = [];
  for (let i = 1; i <= CONCURRENT_USERS; i++) {
    userPromises.push(simulateUser(i));
  }
  
  // Wait for test to complete
  setTimeout(() => {
    printStats();
    process.exit(0);
  }, TEST_DURATION + 5000); // Extra 5 seconds for cleanup
  
  // Wait for all users to start
  await Promise.allSettled(userPromises);
}

// Run the test
runLoadTest().catch(error => {
  console.error('💥 Load test failed:', error);
  process.exit(1);
});

module.exports = { runLoadTest, simulateUser };
