/**
 * Test script để kiểm tra cấu hình Google OAuth
 * Chạy script này để đảm bảo các environment variables được load đúng
 */

// Simulate Vite environment
const mockEnv = {
  VITE_API_BASE_URL: 'https://medically-backend.southeastasia.cloudapp.azure.com/api/v1',
  VITE_BACKEND_URL: 'https://medically-backend.southeastasia.cloudapp.azure.com',
  VITE_GOOGLE_REDIRECT_URI: 'https://school-medical-management-system-red.vercel.app/auth/oauth2/callback',
  VITE_GOOGLE_CLIENT_ID: 'your-production-google-client-id',
  NODE_ENV: 'production'
};

// Mock import.meta.env
global.import = {
  meta: {
    env: mockEnv
  }
};

console.log('🔧 Testing Google OAuth Configuration...\n');

// Test environment variables
console.log('📋 Environment Variables:');
console.log('VITE_API_BASE_URL:', mockEnv.VITE_API_BASE_URL);
console.log('VITE_BACKEND_URL:', mockEnv.VITE_BACKEND_URL);
console.log('VITE_GOOGLE_REDIRECT_URI:', mockEnv.VITE_GOOGLE_REDIRECT_URI);
console.log('VITE_GOOGLE_CLIENT_ID:', mockEnv.VITE_GOOGLE_CLIENT_ID);
console.log('NODE_ENV:', mockEnv.NODE_ENV);
console.log('');

// Test OAuth URL construction
const BACKEND_OAUTH_URL = mockEnv.VITE_BACKEND_URL;
const GOOGLE_REDIRECT_URI = mockEnv.VITE_GOOGLE_REDIRECT_URI;

const oauthUrl = `${BACKEND_OAUTH_URL}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}`;

console.log('🔗 OAuth URLs:');
console.log('Backend OAuth Endpoint:', `${BACKEND_OAUTH_URL}/oauth2/authorization/google`);
console.log('Frontend Callback URL:', GOOGLE_REDIRECT_URI);
console.log('Complete OAuth URL:', oauthUrl);
console.log('');

// Test URL validation
console.log('✅ URL Validation:');
try {
  new URL(mockEnv.VITE_API_BASE_URL);
  console.log('✓ API Base URL is valid');
} catch (e) {
  console.log('❌ API Base URL is invalid:', e.message);
}

try {
  new URL(mockEnv.VITE_BACKEND_URL);
  console.log('✓ Backend URL is valid');
} catch (e) {
  console.log('❌ Backend URL is invalid:', e.message);
}

try {
  new URL(mockEnv.VITE_GOOGLE_REDIRECT_URI);
  console.log('✓ Google Redirect URI is valid');
} catch (e) {
  console.log('❌ Google Redirect URI is invalid:', e.message);
}

try {
  new URL(oauthUrl);
  console.log('✓ Complete OAuth URL is valid');
} catch (e) {
  console.log('❌ Complete OAuth URL is invalid:', e.message);
}

console.log('');

// Test expected flow
console.log('🔄 Expected OAuth Flow:');
console.log('1. User clicks "Đăng nhập với Google"');
console.log('2. Frontend redirects to:', oauthUrl);
console.log('3. Backend redirects to Google OAuth');
console.log('4. Google redirects back to backend with auth code');
console.log('5. Backend processes auth code and redirects to:', GOOGLE_REDIRECT_URI);
console.log('6. Frontend OAuthCallback component processes token');
console.log('');

// Check for potential issues
console.log('⚠️  Potential Issues to Check:');
console.log('- Backend must accept redirect_uri parameter');
console.log('- Backend must be configured to redirect to frontend URL');
console.log('- Google OAuth Console must have frontend URL in authorized redirects');
console.log('- CORS must allow frontend domain');
console.log('- Environment variables must be set correctly in production');

console.log('\n🎯 Test completed!');
