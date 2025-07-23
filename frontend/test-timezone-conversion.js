/**
 * Test script for timezone conversion in vaccination record
 * Run this in browser console to test date handling
 */

// Helper function (same as in component)
function convertToISOWithoutTimezoneShift(datetimeLocal) {
    if (!datetimeLocal) return new Date().toISOString();
    
    // Parse the datetime-local string manually to avoid timezone conversion
    const [datePart, timePart] = datetimeLocal.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    
    // Create date in local timezone
    const localDate = new Date(year, month - 1, day, hour, minute);
    
    // Convert to ISO but keep the same date/time values
    const isoString = localDate.toISOString();
    
    console.log('🕐 Timezone conversion:', {
        input: datetimeLocal,
        parsed: { year, month, day, hour, minute },
        localDate: localDate.toString(),
        output: isoString
    });
    
    return isoString;
}

// Test different scenarios
function testTimezoneConversion() {
    console.log('🧪 TESTING TIMEZONE CONVERSION');
    console.log('==============================');
    
    // Test cases
    const testCases = [
        '2025-07-23T10:30',     // Morning
        '2025-07-23T14:45',     // Afternoon  
        '2025-07-23T23:59',     // Late night
        '2025-07-22T00:01',     // Early morning
        '2025-12-31T23:59',     // Year end
        '2025-01-01T00:01'      // Year start
    ];
    
    testCases.forEach(testCase => {
        console.log(`\n📅 Testing: ${testCase}`);
        
        // Old method (problematic)
        const oldMethod = new Date(testCase).toISOString();
        
        // New method (fixed)
        const newMethod = convertToISOWithoutTimezoneShift(testCase);
        
        // Compare
        const oldDate = new Date(oldMethod);
        const newDate = new Date(newMethod);
        
        console.log('❌ Old method:', {
            iso: oldMethod,
            date: oldDate.toLocaleDateString(),
            time: oldDate.toLocaleTimeString()
        });
        
        console.log('✅ New method:', {
            iso: newMethod,
            date: newDate.toLocaleDateString(),
            time: newDate.toLocaleTimeString()
        });
        
        // Check if dates match
        const inputDate = testCase.split('T')[0];
        const oldOutputDate = oldMethod.split('T')[0];
        const newOutputDate = newMethod.split('T')[0];
        
        console.log('🔍 Date preservation:');
        console.log(`  Input date: ${inputDate}`);
        console.log(`  Old output: ${oldOutputDate} ${inputDate === oldOutputDate ? '✅' : '❌'}`);
        console.log(`  New output: ${newOutputDate} ${inputDate === newOutputDate ? '✅' : '❌'}`);
    });
}

// Test current timezone info
function testTimezoneInfo() {
    console.log('\n🌍 TIMEZONE INFORMATION');
    console.log('=======================');
    
    const now = new Date();
    
    console.log('🕐 Current time info:', {
        local: now.toString(),
        utc: now.toUTCString(),
        iso: now.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        offset: now.getTimezoneOffset(),
        offsetHours: now.getTimezoneOffset() / 60
    });
    
    // Test specific date
    const testDate = '2025-07-23T14:30';
    console.log(`\n📅 Testing specific date: ${testDate}`);
    
    const directConversion = new Date(testDate);
    console.log('Direct conversion:', {
        toString: directConversion.toString(),
        toISOString: directConversion.toISOString(),
        getDate: directConversion.getDate(),
        getHours: directConversion.getHours()
    });
    
    // Manual parsing
    const [datePart, timePart] = testDate.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    const manualDate = new Date(year, month - 1, day, hour, minute);
    
    console.log('Manual parsing:', {
        parsed: { year, month, day, hour, minute },
        toString: manualDate.toString(),
        toISOString: manualDate.toISOString(),
        getDate: manualDate.getDate(),
        getHours: manualDate.getHours()
    });
}

// Test with real form data
function testWithFormData() {
    console.log('\n📝 TESTING WITH FORM DATA');
    console.log('=========================');
    
    // Simulate form data
    const formData = {
        vaccinationDate: '2025-07-23T14:30',
        administeredAt: 'Phòng y tế trường',
        notes: 'Test vaccination'
    };
    
    console.log('📋 Original form data:', formData);
    
    // Old conversion
    const oldSubmitData = {
        ...formData,
        vaccinationDate: formData.vaccinationDate ? 
            new Date(formData.vaccinationDate).toISOString() : 
            new Date().toISOString()
    };
    
    // New conversion
    const newSubmitData = {
        ...formData,
        vaccinationDate: convertToISOWithoutTimezoneShift(formData.vaccinationDate)
    };
    
    console.log('❌ Old submit data:', oldSubmitData);
    console.log('✅ New submit data:', newSubmitData);
    
    // Check what backend would receive
    console.log('\n🖥️ Backend would receive:');
    console.log('Old method date:', new Date(oldSubmitData.vaccinationDate).toString());
    console.log('New method date:', new Date(newSubmitData.vaccinationDate).toString());
}

// Main test function
function runTimezoneTests() {
    console.log('🚀 RUNNING TIMEZONE CONVERSION TESTS');
    console.log('====================================');
    
    testTimezoneInfo();
    testTimezoneConversion();
    testWithFormData();
    
    console.log('\n🎯 SUMMARY:');
    console.log('- Old method: Uses browser timezone, may shift dates');
    console.log('- New method: Preserves input date/time exactly');
    console.log('- Recommendation: Use new method for vaccination dates');
}

// Export functions
window.convertToISOWithoutTimezoneShift = convertToISOWithoutTimezoneShift;
window.testTimezoneConversion = testTimezoneConversion;
window.testTimezoneInfo = testTimezoneInfo;
window.testWithFormData = testWithFormData;
window.runTimezoneTests = runTimezoneTests;

console.log('🕐 Timezone Conversion Test Script Loaded');
console.log('📝 Run: runTimezoneTests() to start testing');
