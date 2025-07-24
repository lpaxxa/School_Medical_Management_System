/**
 * Quick test to compare different timezone approaches
 * Run this in browser console
 */

function quickTimezoneTest() {
    console.log('⚡ QUICK TIMEZONE TEST');
    console.log('=====================');
    
    const userInput = '2025-07-23T14:30';  // User wants 2:30 PM on July 23
    
    console.log('👤 User input:', userInput);
    console.log('🎯 User expects: July 23, 2025 at 2:30 PM');
    console.log('');
    
    // Approach 1: Current ISO conversion (problematic)
    const [datePart, timePart] = userInput.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    const localDate = new Date(year, month - 1, day, hour, minute);
    const isoString = localDate.toISOString();
    
    console.log('📅 Approach 1 - ISO conversion:');
    console.log('  Send to backend:', isoString);
    console.log('  Backend receives:', new Date(isoString).toString());
    console.log('  Result in VN time:', new Date(isoString).toLocaleString('vi-VN'));
    console.log('');
    
    // Approach 2: Send as local datetime string (new approach)
    const localString = userInput.length === 16 ? `${userInput}:00` : userInput;
    
    console.log('📅 Approach 2 - Local datetime string:');
    console.log('  Send to backend:', localString);
    console.log('  Backend should parse as local time');
    console.log('  Expected result: July 23, 2025 at 2:30 PM (local)');
    console.log('');
    
    // Approach 3: Add VN timezone
    const vnTimezone = `${userInput}:00+07:00`;
    
    console.log('📅 Approach 3 - With VN timezone:');
    console.log('  Send to backend:', vnTimezone);
    console.log('  Backend receives:', new Date(vnTimezone).toString());
    console.log('  Result in VN time:', new Date(vnTimezone).toLocaleString('vi-VN'));
    console.log('');
    
    console.log('🎯 RECOMMENDATION:');
    console.log('Try Approach 2 first - send as local datetime string');
    console.log('Backend LocalDateTime should parse it correctly');
}

// Test what happens in database
function testDatabaseStorage() {
    console.log('💾 DATABASE STORAGE TEST');
    console.log('========================');
    
    console.log('🔍 Check these scenarios:');
    console.log('');
    
    console.log('Scenario 1: Send "2025-07-23T14:30:00"');
    console.log('  Expected in DB: 2025-07-23 14:30:00 (local time)');
    console.log('  If wrong: Backend is converting timezone');
    console.log('');
    
    console.log('Scenario 2: Send "2025-07-23T14:30:00+07:00"');
    console.log('  Expected in DB: 2025-07-23 14:30:00 (after timezone conversion)');
    console.log('  If wrong: Backend timezone handling issue');
    console.log('');
    
    console.log('Scenario 3: Send "2025-07-23T07:30:00.000Z"');
    console.log('  Expected in DB: 2025-07-23 14:30:00 (if backend converts UTC to local)');
    console.log('  Current result: 2025-07-22 17:00:00 (wrong!)');
    console.log('');
    
    console.log('💡 The issue might be:');
    console.log('1. Backend server timezone is not VN timezone');
    console.log('2. LocalDateTime is not handling timezone correctly');
    console.log('3. Database timezone configuration');
}

// Quick API test
async function quickAPITest() {
    console.log('🌐 QUICK API TEST');
    console.log('=================');
    
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.log('❌ No auth token');
        return;
    }
    
    // Test with local datetime string
    const testData = {
        healthProfileId: 6,
        vaccineId: 4,
        vaccinationPlanId: 2,
        vaccinationDate: '2025-07-23T14:30:00',  // Local datetime string
        administeredAt: 'Quick test',
        notes: 'Testing local datetime string'
    };
    
    console.log('📤 Sending:', testData);
    
    try {
        const response = await fetch('http://localhost:8080/api/v1/vaccinations/record', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(testData)
        });
        
        console.log('📊 Response:', response.status);
        
        if (response.ok) {
            console.log('✅ Success! Check database for stored time');
            console.log('Expected: 2025-07-23 14:30:00');
        } else {
            const error = await response.text();
            console.log('❌ Error:', error);
        }
        
    } catch (error) {
        console.error('🚨 Error:', error);
    }
}

// Main function
function runQuickTest() {
    console.log('🚀 RUNNING QUICK TIMEZONE TEST');
    console.log('==============================');
    
    quickTimezoneTest();
    console.log('');
    
    testDatabaseStorage();
    console.log('');
    
    console.log('🧪 Next: Run quickAPITest() to test API');
}

// Export functions
window.quickTimezoneTest = quickTimezoneTest;
window.testDatabaseStorage = testDatabaseStorage;
window.quickAPITest = quickAPITest;
window.runQuickTest = runQuickTest;

console.log('⚡ Quick Timezone Test Script Loaded');
console.log('📝 Run: runQuickTest() to start');
