/**
 * Quick Load Test - Test concurrent access to the application
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Configuration
const FRONTEND_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:8080';
const CONCURRENT_USERS = 20; // Start with 20 users
const TEST_DURATION = 30000; // 30 seconds
const REQUEST_INTERVAL = 2000; // 2 seconds between requests

// Statistics
let stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  errors: [],
  startTime: Date.now()
};

// Make HTTP request
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 10000
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test frontend access
async function testFrontend(userId) {
  const start = Date.now();
  try {
    const response = await makeRequest(FRONTEND_URL);
    const responseTime = Date.now() - start;
    
    recordStats(responseTime, response.status === 200);
    console.log(`🌐 User ${userId}: Frontend loaded (${responseTime}ms) - Status: ${response.status}`);
    
    return response.status === 200;
  } catch (error) {
    const responseTime = Date.now() - start;
    recordStats(responseTime, false);
    console.log(`❌ User ${userId}: Frontend failed (${responseTime}ms) - Error: ${error.message}`);
    return false;
  }
}

// Test backend API
async function testBackendAPI(userId) {
  const start = Date.now();
  try {
    // Test health endpoint or students endpoint
    const response = await makeRequest(`${BACKEND_URL}/api/v1/students`);
    const responseTime = Date.now() - start;
    
    const success = response.status === 200 || response.status === 401; // 401 is expected without auth
    recordStats(responseTime, success);
    console.log(`🔧 User ${userId}: Backend API (${responseTime}ms) - Status: ${response.status}`);
    
    return success;
  } catch (error) {
    const responseTime = Date.now() - start;
    recordStats(responseTime, false);
    console.log(`❌ User ${userId}: Backend API failed (${responseTime}ms) - Error: ${error.message}`);
    return false;
  }
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
}

// Simulate user activity
async function simulateUser(userId) {
  console.log(`👤 User ${userId} started`);
  
  const interval = setInterval(async () => {
    try {
      // Randomly test frontend or backend
      if (Math.random() > 0.5) {
        await testFrontend(userId);
      } else {
        await testBackendAPI(userId);
      }
    } catch (error) {
      console.error(`💥 User ${userId} error:`, error.message);
      stats.errors.push({
        userId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }, REQUEST_INTERVAL + Math.random() * 1000); // Add some randomness

  // Stop after test duration
  setTimeout(() => {
    clearInterval(interval);
    console.log(`🛑 User ${userId} finished`);
  }, TEST_DURATION);
}

// Print real-time statistics
function printRealTimeStats() {
  const elapsed = (Date.now() - stats.startTime) / 1000;
  const avgResponseTime = stats.responseTimes.length > 0 ? 
    (stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length).toFixed(2) : 0;
  const successRate = stats.totalRequests > 0 ? 
    ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2) : 0;
  
  console.log(`\n📊 [${elapsed.toFixed(1)}s] Stats: ${stats.totalRequests} total, ${stats.successfulRequests} success, ${stats.failedRequests} failed, ${successRate}% success rate, ${avgResponseTime}ms avg`);
}

// Print final statistics
function printFinalStats() {
  const totalTime = (Date.now() - stats.startTime) / 1000;
  const avgResponseTime = stats.responseTimes.length > 0 ? 
    (stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length).toFixed(2) : 0;
  const successRate = stats.totalRequests > 0 ? 
    ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2) : 0;
  const requestsPerSecond = (stats.totalRequests / totalTime).toFixed(2);
  
  console.log('\n🎯 FINAL LOAD TEST RESULTS:');
  console.log('================================');
  console.log(`👥 Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`⏱️  Total Test Time: ${totalTime.toFixed(2)} seconds`);
  console.log(`📈 Total Requests: ${stats.totalRequests}`);
  console.log(`✅ Successful Requests: ${stats.successfulRequests}`);
  console.log(`❌ Failed Requests: ${stats.failedRequests}`);
  console.log(`📊 Success Rate: ${successRate}%`);
  console.log(`⚡ Average Response Time: ${avgResponseTime}ms`);
  console.log(`🚀 Requests per Second: ${requestsPerSecond}`);
  
  if (stats.responseTimes.length > 0) {
    const sortedTimes = stats.responseTimes.sort((a, b) => a - b);
    const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
    
    console.log(`📈 Response Time Percentiles:`);
    console.log(`   50th percentile: ${p50}ms`);
    console.log(`   95th percentile: ${p95}ms`);
    console.log(`   99th percentile: ${p99}ms`);
    console.log(`   Min: ${Math.min(...stats.responseTimes)}ms`);
    console.log(`   Max: ${Math.max(...stats.responseTimes)}ms`);
  }
  
  if (stats.errors.length > 0) {
    console.log(`\n❌ Errors (${stats.errors.length} total):`);
    stats.errors.slice(0, 5).forEach((error, index) => {
      console.log(`   ${index + 1}. User ${error.userId}: ${error.error}`);
    });
    if (stats.errors.length > 5) {
      console.log(`   ... and ${stats.errors.length - 5} more errors`);
    }
  }
  
  // Performance assessment
  console.log('\n🎯 PERFORMANCE ASSESSMENT:');
  if (successRate >= 95 && avgResponseTime <= 1000) {
    console.log('🟢 EXCELLENT: System handles load very well!');
  } else if (successRate >= 90 && avgResponseTime <= 2000) {
    console.log('🟡 GOOD: System handles load reasonably well');
  } else if (successRate >= 80 && avgResponseTime <= 5000) {
    console.log('🟠 FAIR: System shows some stress under load');
  } else {
    console.log('🔴 POOR: System struggles under this load');
  }
  
  console.log(`\n💡 RECOMMENDATION:`);
  if (successRate >= 95) {
    console.log(`   ✅ Current load (${CONCURRENT_USERS} users) is well supported`);
    console.log(`   🚀 Try increasing to ${CONCURRENT_USERS * 2} users for next test`);
  } else {
    console.log(`   ⚠️  Current load (${CONCURRENT_USERS} users) causes issues`);
    console.log(`   🔧 Consider optimizing before increasing load`);
  }
}

// Main test function
async function runLoadTest() {
  console.log('🚀 STARTING QUICK LOAD TEST');
  console.log('============================');
  console.log(`👥 Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`⏱️  Test Duration: ${TEST_DURATION / 1000} seconds`);
  console.log(`🎯 Frontend Target: ${FRONTEND_URL}`);
  console.log(`🔧 Backend Target: ${BACKEND_URL}`);
  console.log(`📊 Request Interval: ${REQUEST_INTERVAL}ms`);
  console.log('============================\n');
  
  // Start real-time stats display
  const statsInterval = setInterval(printRealTimeStats, 5000);
  
  // Start all users
  for (let i = 1; i <= CONCURRENT_USERS; i++) {
    setTimeout(() => simulateUser(i), i * 100); // Stagger starts by 100ms
  }
  
  // Stop test after duration
  setTimeout(() => {
    clearInterval(statsInterval);
    setTimeout(() => {
      printFinalStats();
      process.exit(0);
    }, 2000); // Wait 2 seconds for final requests to complete
  }, TEST_DURATION);
}

// Run the test
console.log('🧪 Quick Load Test Starting...\n');
runLoadTest().catch(error => {
  console.error('💥 Load test failed:', error);
  process.exit(1);
});
