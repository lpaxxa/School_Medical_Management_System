// Test API my-students
async function testMyStudentsAPI() {
    try {
        console.log('Testing my-students API...');
        
        // Giả sử ta có token (trong thực tế lấy từ localStorage)
        const token = "dummy-token";
        
        const response = await fetch('http://localhost:8080/api/v1/parents/my-students', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('My Students API Response:', data);
        
        // Kiểm tra xem có studentId không
        if (Array.isArray(data) && data.length > 0) {
            data.forEach((student, index) => {
                console.log(`Student ${index + 1}:`, {
                    id: student.id,
                    studentId: student.studentId,
                    fullName: student.fullName,
                    className: student.className
                });
            });
        }
        
    } catch (error) {
        console.error('❌ My Students API Test failed:', error);
    }
}

// Gọi test
testMyStudentsAPI();
