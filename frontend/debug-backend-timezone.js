/**
 * Debug script to test backend timezone handling
 * Run this in browser console to test what backend receives
 */

async function testBackendTimezone() {
    console.log('🔍 TESTING BACKEND TIMEZONE HANDLING');
    console.log('===================================');
    
    // Test different date formats
    const testDates = [
        // Current approach
        '2025-07-23T14:30:00.000Z',
        
        // Alternative formats
        '2025-07-23T14:30:00',
        '2025-07-23T14:30',
        
        // With timezone info
        '2025-07-23T14:30:00+07:00',
        '2025-07-23T14:30:00.000+07:00',
        
        // Local time as if it's UTC
        '2025-07-23T07:30:00.000Z'  // 14:30 VN time = 07:30 UTC
    ];
    
    console.log('📅 Testing different date formats:');
    testDates.forEach((dateStr, index) => {
        console.log(`${index + 1}. ${dateStr}`);
        console.log(`   Parsed: ${new Date(dateStr).toString()}`);
        console.log(`   Local: ${new Date(dateStr).toLocaleString('vi-VN')}`);
        console.log('');
    });
}

// Test what our current conversion produces
function testCurrentConversion() {
    console.log('🧪 TESTING CURRENT CONVERSION');
    console.log('=============================');
    
    const input = '2025-07-23T14:30';  // User input
    
    // Our current method
    const [datePart, timePart] = input.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    const localDate = new Date(year, month - 1, day, hour, minute);
    const isoString = localDate.toISOString();
    
    console.log('📋 Conversion details:');
    console.log('Input:', input);
    console.log('Parsed components:', { year, month, day, hour, minute });
    console.log('Local date object:', localDate.toString());
    console.log('ISO string output:', isoString);
    console.log('Backend will parse as:', new Date(isoString).toString());
    console.log('');
    
    // What we want vs what we get
    console.log('🎯 Expected vs Actual:');
    console.log('User wants: 23/07/2025 14:30 (VN time)');
    console.log('Backend gets:', new Date(isoString).toLocaleString('vi-VN'));
    console.log('');
    
    // Check if backend LocalDateTime handles this correctly
    console.log('🖥️ Backend LocalDateTime behavior:');
    console.log('ISO string sent:', isoString);
    console.log('Should be parsed as local time in backend timezone');
    console.log('If backend is in VN timezone, it should show:', input);
}

// Test alternative approach - send as local time string
function testAlternativeApproach() {
    console.log('💡 TESTING ALTERNATIVE APPROACH');
    console.log('===============================');
    
    const input = '2025-07-23T14:30';
    
    // Approach 1: Send exactly as user typed (no conversion)
    console.log('Approach 1 - Send as-is:');
    console.log('Send:', input);
    console.log('Backend LocalDateTime should parse as local time');
    console.log('');
    
    // Approach 2: Add timezone offset
    const now = new Date();
    const offset = -now.getTimezoneOffset();
    const offsetHours = Math.floor(offset / 60);
    const offsetMinutes = offset % 60;
    const offsetString = `${offsetHours >= 0 ? '+' : '-'}${String(Math.abs(offsetHours)).padStart(2, '0')}:${String(Math.abs(offsetMinutes)).padStart(2, '0')}`;
    const withTimezone = `${input}:00${offsetString}`;
    
    console.log('Approach 2 - Add timezone:');
    console.log('Send:', withTimezone);
    console.log('Parsed:', new Date(withTimezone).toString());
    console.log('');
    
    // Approach 3: Convert to backend timezone
    const vnTime = `${input}:00+07:00`;
    console.log('Approach 3 - VN timezone:');
    console.log('Send:', vnTime);
    console.log('Parsed:', new Date(vnTime).toString());
}

// Test actual API call with different formats
async function testAPIWithDifferentFormats() {
    console.log('🌐 TESTING API WITH DIFFERENT FORMATS');
    console.log('=====================================');
    
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.log('❌ No auth token found');
        return;
    }
    
    // Test data with different date formats
    const testFormats = [
        {
            name: 'Current ISO format',
            date: '2025-07-23T07:30:00.000Z'  // 14:30 VN = 07:30 UTC
        },
        {
            name: 'Local time without timezone',
            date: '2025-07-23T14:30:00'
        },
        {
            name: 'Local time with VN timezone',
            date: '2025-07-23T14:30:00+07:00'
        }
    ];
    
    for (const format of testFormats) {
        console.log(`\n🧪 Testing: ${format.name}`);
        console.log(`📅 Date: ${format.date}`);
        
        const testData = {
            healthProfileId: 6,
            vaccineId: 4,  // HPV
            vaccinationPlanId: 2,
            vaccinationDate: format.date,
            administeredAt: 'Test timezone',
            notes: `Test ${format.name}`
        };
        
        try {
            const response = await fetch('http://localhost:8080/api/v1/vaccinations/record', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(testData)
            });
            
            console.log(`📊 Response: ${response.status}`);
            
            if (response.ok) {
                console.log('✅ Success - check database for stored time');
            } else {
                const error = await response.text();
                console.log('❌ Error:', error);
            }
            
        } catch (error) {
            console.error('🚨 Network error:', error);
        }
        
        // Wait between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Check backend timezone configuration
function checkBackendTimezone() {
    console.log('🌍 BACKEND TIMEZONE CHECK');
    console.log('=========================');
    
    console.log('💡 Questions to verify:');
    console.log('1. What timezone is the backend server running in?');
    console.log('2. How is LocalDateTime configured in Spring Boot?');
    console.log('3. Is there any timezone conversion in the service layer?');
    console.log('4. What timezone is the database configured for?');
    console.log('');
    
    console.log('🔧 Possible solutions:');
    console.log('1. Send date without timezone info: "2025-07-23T14:30:00"');
    console.log('2. Configure backend to use VN timezone');
    console.log('3. Add @JsonFormat annotation to handle timezone');
    console.log('4. Use ZonedDateTime instead of LocalDateTime');
}

// Main test function
function runBackendTimezoneTests() {
    console.log('🚀 RUNNING BACKEND TIMEZONE TESTS');
    console.log('=================================');
    
    testBackendTimezone();
    console.log('');
    
    testCurrentConversion();
    console.log('');
    
    testAlternativeApproach();
    console.log('');
    
    checkBackendTimezone();
    console.log('');
    
    console.log('🧪 Next steps:');
    console.log('1. Run: testAPIWithDifferentFormats() to test API');
    console.log('2. Check database after each test');
    console.log('3. Verify which format gives correct time');
}

// Export functions
window.testBackendTimezone = testBackendTimezone;
window.testCurrentConversion = testCurrentConversion;
window.testAlternativeApproach = testAlternativeApproach;
window.testAPIWithDifferentFormats = testAPIWithDifferentFormats;
window.checkBackendTimezone = checkBackendTimezone;
window.runBackendTimezoneTests = runBackendTimezoneTests;

console.log('🕐 Backend Timezone Debug Script Loaded');
console.log('📝 Run: runBackendTimezoneTests() to start debugging');
