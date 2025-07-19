// QUICK TEST - Chạy trong browser console để test ngay
// Copy và paste toàn bộ code này vào browser console

const quickTestHealthArticleAPI = async () => {
  console.log('🚀 QUICK TEST HEALTH ARTICLE API');
  
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  const currentUserId = localStorage.getItem('currentUserId');
  
  console.log('Auth info:', { hasToken: !!token, userRole, currentUserId });
  
  if (!token) {
    console.error('❌ No token found');
    return;
  }
  
  const testData = {
    title: 'Quick Test',
    summary: 'Quick test summary',
    content: 'Quick test content',
    category: 'Phòng bệnh'
  };
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-User-Role': userRole,
    'X-User-ID': currentUserId
  };
  
  // Test 1: Current endpoint
  try {
    console.log('\n🧪 Test 1: Current endpoint');
    const url1 = 'https://medically-backend.southeastasia.cloudapp.azure.com/api/health-articles';
    console.log('URL:', url1);
    
    const response1 = await fetch(url1, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(testData)
    });
    
    console.log('Status:', response1.status);
    const result1 = await response1.text();
    console.log('Response:', result1);
    
    if (response1.ok) {
      console.log('✅ SUCCESS with current endpoint!');
      return;
    }
  } catch (error) {
    console.error('❌ Current endpoint error:', error);
  }
  
  // Test 2: V1 endpoint
  try {
    console.log('\n🧪 Test 2: V1 endpoint');
    const url2 = 'https://medically-backend.southeastasia.cloudapp.azure.com/api/v1/health-articles';
    console.log('URL:', url2);
    
    const response2 = await fetch(url2, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(testData)
    });
    
    console.log('Status:', response2.status);
    const result2 = await response2.text();
    console.log('Response:', result2);
    
    if (response2.ok) {
      console.log('✅ SUCCESS with V1 endpoint!');
      return;
    }
  } catch (error) {
    console.error('❌ V1 endpoint error:', error);
  }
  
  // Test 3: With author field
  try {
    console.log('\n🧪 Test 3: With author field');
    const testDataWithAuthor = {
      ...testData,
      author: 'NURSE001',
      authorId: currentUserId
    };
    
    const url3 = 'https://medically-backend.southeastasia.cloudapp.azure.com/api/health-articles';
    console.log('URL:', url3);
    console.log('Data:', testDataWithAuthor);
    
    const response3 = await fetch(url3, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(testDataWithAuthor)
    });
    
    console.log('Status:', response3.status);
    const result3 = await response3.text();
    console.log('Response:', result3);
    
    if (response3.ok) {
      console.log('✅ SUCCESS with author field!');
      return;
    }
  } catch (error) {
    console.error('❌ Author field error:', error);
  }
  
  // Test 4: Check if GET works
  try {
    console.log('\n🧪 Test 4: GET endpoint');
    const url4 = 'https://medically-backend.southeastasia.cloudapp.azure.com/api/health-articles';
    
    const response4 = await fetch(url4, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-Role': userRole,
        'X-User-ID': currentUserId
      }
    });
    
    console.log('GET Status:', response4.status);
    const result4 = await response4.text();
    console.log('GET Response:', result4);
    
    if (response4.ok) {
      console.log('✅ GET works - API is accessible');
      const articles = JSON.parse(result4);
      if (articles.length > 0) {
        console.log('Sample article structure:', articles[0]);
      }
    } else {
      console.log('❌ GET also fails - authentication issue?');
    }
  } catch (error) {
    console.error('❌ GET error:', error);
  }
  
  console.log('\n❌ All POST tests failed. Possible issues:');
  console.log('1. Backend expects different data structure');
  console.log('2. Authentication/authorization issue');
  console.log('3. Different endpoint required');
  console.log('4. Backend validation rules');
};

// Auto run
quickTestHealthArticleAPI();
