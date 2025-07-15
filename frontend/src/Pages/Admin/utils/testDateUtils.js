/**
 * Test file for Admin date handling fixes
 * Run this in browser console to verify date utilities work correctly
 */

import { 
  formatDate, 
  formatDateTime,
  formatDateTimeLocale,
  safeParseDate, 
  isValidDate,
  compareDates 
} from './dateUtils.js';

// Test cases for invalid dates
const testCases = [
  null,
  undefined,
  '',
  'invalid-date',
  '2023-13-45', // invalid month/day
  '2023-05-15T08:30:00', // valid ISO
  '2023/05/15', // valid date
  new Date(), // Date object
  Date.now(), // timestamp
  '1990-01-01',
  [2023, 5, 15], // Array format from Java backend
  [2023, 5, 15, 14, 30], // Array with time
  [2023, 5, 15, 14, 30, 45], // Array with seconds
  [2023, 13, 45], // Invalid array
  [], // Empty array
  [2023], // Incomplete array
];

console.log('=== ADMIN DATE UTILS TEST ===');

testCases.forEach((testCase, index) => {
  console.log(`\n--- Test Case ${index + 1}: ${JSON.stringify(testCase)} ---`);
  
  try {
    const parsed = safeParseDate(testCase);
    console.log('safeParseDate:', parsed);
    
    const formatted = formatDate(testCase);
    console.log('formatDate:', formatted);
    
    const formattedDateTime = formatDateTime(testCase);
    console.log('formatDateTime:', formattedDateTime);
    
    const formattedLocale = formatDateTimeLocale(testCase);
    console.log('formatDateTimeLocale:', formattedLocale);
    
    const isValid = isValidDate(testCase);
    console.log('isValidDate:', isValid);
    
  } catch (error) {
    console.error('Error in test case:', error);
  }
});

// Test date comparison
console.log('\n=== DATE COMPARISON TESTS ===');
const date1 = [2023, 5, 15];
const date2 = [2023, 5, 16];
const date3 = '2023-05-15';

console.log('Compare [2023, 5, 15] vs [2023, 5, 16]:', compareDates(date1, date2));
console.log('Compare [2023, 5, 15] vs "2023-05-15":', compareDates(date1, date3));
console.log('Compare null vs undefined:', compareDates(null, undefined));

console.log('\n=== ADMIN DATE UTILS TEST COMPLETE ===');

// Export for use in other files
export { testCases };
