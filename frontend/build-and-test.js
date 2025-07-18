/**
 * Script để build và test production configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🏗️  Building and Testing Production Configuration...\n');

// Check if environment files exist
const envFiles = ['.env', '.env.production', '.env.local'];
const missingFiles = [];

envFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    missingFiles.push(file);
  } else {
    console.log(`✅ Found ${file}`);
  }
});

if (missingFiles.length > 0) {
  console.log(`❌ Missing environment files: ${missingFiles.join(', ')}`);
} else {
  console.log('✅ All environment files present');
}

console.log('');

// Read and validate .env.production
if (fs.existsSync('.env.production')) {
  const envContent = fs.readFileSync('.env.production', 'utf8');
  console.log('📋 .env.production content:');
  console.log(envContent);
  
  // Check for localhost references
  if (envContent.includes('localhost')) {
    console.log('⚠️  Warning: .env.production still contains localhost references');
  } else {
    console.log('✅ No localhost references found in .env.production');
  }
  
  // Check required variables
  const requiredVars = [
    'VITE_API_BASE_URL',
    'VITE_BACKEND_URL', 
    'VITE_GOOGLE_REDIRECT_URI'
  ];
  
  const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
  
  if (missingVars.length > 0) {
    console.log(`❌ Missing required variables: ${missingVars.join(', ')}`);
  } else {
    console.log('✅ All required variables present');
  }
}

console.log('');

// Check key files
const keyFiles = [
  'src/services/googleAuthService.js',
  'src/components/OAuthCallback.jsx',
  'src/config/apiConfig.js'
];

keyFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ Found ${file}`);
    
    // Check for localhost in key files
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('localhost') && !content.includes('// localhost') && !content.includes('* localhost')) {
      console.log(`⚠️  Warning: ${file} may contain localhost references`);
    }
  } else {
    console.log(`❌ Missing ${file}`);
  }
});

console.log('');

// Generate build command
console.log('🚀 To deploy:');
console.log('1. Run: npm run build');
console.log('2. Commit and push changes');
console.log('3. Vercel will auto-deploy');
console.log('');

console.log('🔧 Backend configuration needed:');
console.log('- Accept redirect_uri parameter in OAuth endpoint');
console.log('- Configure CORS for frontend domain');
console.log('- Update Google OAuth Console with correct redirect URIs');
console.log('');

console.log('🧪 Test after deployment:');
console.log('- Visit: https://school-medical-management-system-red.vercel.app/login');
console.log('- Click "Đăng nhập với Google"');
console.log('- Verify redirect URLs in browser network tab');
console.log('- Complete OAuth flow and check for successful login');

console.log('\n✨ Configuration check completed!');
