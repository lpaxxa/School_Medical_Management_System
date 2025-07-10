// Test với dữ liệu có thể có trong hệ thống
async function testWithValidData() {
    try {
        console.log('Testing with potentially valid data...');
        
        // Test vaccination plans với studentId 101
        console.log('\n--- Testing vaccination plans for student 101 ---');
        let response = await fetch('http://localhost:8080/api/v1/vaccination-plans/students/101');
        console.log('Plans response status:', response.status);
        
        if (response.ok) {
            const plans = await response.json();
            console.log('Plans found:', plans.length);
            
            if (plans.length > 0) {
                console.log('First plan:', plans[0]);
                
                // Nếu có plan, test confirmation với notificationRecipientId thật
                const plan = plans[0];
                if (plan.notificationRecipientId) {
                    console.log('\n--- Testing confirmation with real notificationRecipientId ---');
                    
                    const confirmData = {
                        notificationRecipientId: plan.notificationRecipientId,
                        confirmations: [
                            {
                                vaccineId: plan.vaccines?.[0]?.id || 1,
                                response: "ACCEPTED",
                                parentNotes: "Test from parent"
                            }
                        ]
                    };
                    
                    console.log('Confirmation data:', confirmData);
                    
                    const confirmResponse = await fetch('http://localhost:8080/api/v1/notification-recipient-vaccines/create', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(confirmData)
                    });
                    
                    console.log('Confirmation response status:', confirmResponse.status);
                    
                    if (confirmResponse.ok) {
                        const result = await confirmResponse.json();
                        console.log('Confirmation success:', result);
                    } else {
                        console.log('Confirmation error:', await confirmResponse.text());
                    }
                }
            } else {
                console.log('No vaccination plans found for student 101');
            }
        } else {
            console.log('Plans error:', await response.text());
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testWithValidData();
