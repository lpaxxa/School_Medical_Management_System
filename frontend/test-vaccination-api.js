// Test script for vaccination confirmation API
// Run with: node test-vaccination-api.js

const axios = require('axios');

const BASE_URL = 'https://medical-backend-production.up.railway.app';

async function testVaccinationAPI() {
  try {
    console.log('Testing vaccination plans API...');
    
    // Test with a valid student ID
    const studentId = 1; // Change this to a valid student ID
    
    console.log(`\n1. Fetching vaccination plans for student ${studentId}:`);
    const plansResponse = await axios.get(`${BASE_URL}/vaccination-plans/students/${studentId}`);
    console.log('Plans received:', JSON.stringify(plansResponse.data, null, 2));
    
    // Find a plan with WAITING_PARENT status
    const waitingPlan = plansResponse.data.find(plan => plan.status === 'WAITING_PARENT');
    
    if (waitingPlan) {
      console.log('\n2. Found waiting plan:', waitingPlan.name);
      console.log('Notification Recipient ID:', waitingPlan.notificationRecipientId);
      console.log('Vaccines:', waitingPlan.vaccines.map(v => ({ id: v.id, name: v.name })));
      
      if (waitingPlan.notificationRecipientId && waitingPlan.vaccines.length > 0) {
        console.log('\n3. Testing confirmation API...');
        
        // Create test confirmation data
        const confirmationData = {
          notificationRecipientId: waitingPlan.notificationRecipientId,
          confirmations: waitingPlan.vaccines.map(vaccine => ({
            vaccineId: vaccine.id,
            response: "ACCEPTED", // Change to "REJECTED" to test rejection
            parentNotes: "Test confirmation from parent"
          }))
        };
        
        console.log('Confirmation data:', JSON.stringify(confirmationData, null, 2));
        
        // NOTE: Uncomment the lines below to actually send the confirmation
        // const confirmResponse = await axios.post(`${BASE_URL}/notification-recipient-vaccines/create`, confirmationData);
        // console.log('Confirmation response:', confirmResponse.data);
        
        console.log('\n⚠️  API test ready. Uncomment the axios.post call to actually send confirmation.');
      } else {
        console.log('❌ Plan missing notificationRecipientId or vaccines');
      }
    } else {
      console.log('❌ No plans with WAITING_PARENT status found');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.response?.data || error.message);
  }
}

testVaccinationAPI();
        console.log('Response status (string code):', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Vaccination plans (string code):', data);
        } else {
            console.log('Error response (string code):', await response.text());
        }
        
    } catch (error) {
        console.error('❌ Vaccination Plans API Test failed:', error);
    }
}

// Test confirmation API
async function testConfirmationAPI() {
    try {
        console.log('\n--- Testing confirmation API ---');
        
        const testData = {
            notificationRecipientId: 1,
            confirmations: [
                {
                    vaccineId: 1,
                    response: "ACCEPTED",
                    parentNotes: "Test confirmation"
                }
            ]
        };
        
        console.log('Test confirmation data:', testData);
        
        const response = await fetch('http://localhost:8080/api/v1/notification-recipient-vaccines/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        console.log('Confirmation response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Confirmation response:', data);
        } else {
            console.log('Confirmation error:', await response.text());
        }
        
    } catch (error) {
        console.error('❌ Confirmation API Test failed:', error);
    }
}

// Gọi test
testVaccinationPlansAPI();
testConfirmationAPI();
