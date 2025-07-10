// Test script để kiểm tra API mới
async function testNewAPI() {
    try {
        console.log('Testing new health profile API...');
        
        const response = await fetch('http://localhost:8080/api/v1/health-profiles/getStudentProfileByID/HS001');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        // Kiểm tra structure
        if (data.healthProfile) {
            console.log('✅ Health Profile found:', data.healthProfile);
        }
        
        if (data.vaccinations) {
            console.log('✅ Vaccinations found:', data.vaccinations.length, 'records');
        }
        
    } catch (error) {
        console.error('❌ API Test failed:', error);
    }
}

// Gọi test
testNewAPI();
