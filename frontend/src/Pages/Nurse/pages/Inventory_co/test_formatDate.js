// Test file for formatDate function
// Run this in browser console to test the function

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    console.log('formatDate input:', dateString, 'type:', typeof dateString);
    
    let date;
    
    // Handle Date objects
    if (dateString instanceof Date) {
      date = dateString;
    }
    // Handle timestamps (numbers)
    else if (typeof dateString === 'number') {
      date = new Date(dateString);
    }
    // Handle string formats
    else if (typeof dateString === 'string') {
      if (dateString.includes('T')) {
        // ISO format: "2023-07-01T01:00:00.000+00:00"
        date = new Date(dateString);
      } else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // YYYY-MM-DD format
        const [year, month, day] = dateString.split('-');
        date = new Date(year, month - 1, day);
      } else if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        // DD/MM/YYYY format
        const [day, month, year] = dateString.split('/');
        date = new Date(year, month - 1, day);
      } else if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
        // DD-MM-YYYY format
        const [day, month, year] = dateString.split('-');
        date = new Date(year, month - 1, day);
      } else if (dateString.match(/^\d{8}$/)) {
        // YYYYMMDD format
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        date = new Date(year, month - 1, day);
      } else {
        // Try to parse as is
        date = new Date(dateString);
      }
    } else {
      console.warn('Unknown date format:', dateString);
      return dateString;
    }
    
    // Validate date
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateString);
      return dateString;
    }
    
    // Format as DD/MM/YYYY
    const formatted = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    console.log('formatDate result:', formatted);
    return formatted;
  } catch (err) {
    console.error('Error formatting date:', err, 'Input:', dateString);
    return dateString;
  }
};

// Test cases
console.log('=== TESTING formatDate FUNCTION ===');

const testCases = [
  '2025-12-31',           // YYYY-MM-DD
  '2023-07-01T01:00:00.000+00:00', // ISO format
  '31/12/2025',           // DD/MM/YYYY
  '31-12-2025',           // DD-MM-YYYY
  '20251231',             // YYYYMMDD
  1703980800000,          // Timestamp
  new Date('2025-12-31'), // Date object
  null,                   // null
  undefined,              // undefined
  '',                     // empty string
  'invalid-date',         // invalid string
  // NEW: Test cases for the problematic formats from the image
  202611,                 // YYYYMM (number) - 2026-11
  2025315,                // YYYYMMD (number) - 2025-3-15
  202721,                 // YYYYMMD (number) - 2027-2-1
  2025410,                // YYYYMMD (number) - 2025-4-10
  2025520,                // YYYYMMD (number) - 2025-5-20
  202661,                 // YYYYMMD (number) - 2026-6-1
  2025810,                // YYYYMMD (number) - 2025-8-10
  2025901,                // YYYYMMD (number) - 2025-9-1
  2025111,                // YYYYMMD (number) - 2025-11-1
  '202611',               // YYYYMM (string)
  '2025315',              // YYYYMMD (string)
];

testCases.forEach((testCase, index) => {
  console.log(`\n--- Test ${index + 1}: ${testCase} ---`);
  const result = formatDate(testCase);
  console.log(`Result: ${result}`);
});

console.log('\n=== TESTING COMPLETE ===');
