/**
 * Test file for Community date handling fixes
 * Run this in browser console to verify date utilities work correctly
 */

import { 
  formatDate, 
  safeParseDate, 
  areDatesDifferent, 
  formatRelativeTime,
  isValidDate,
  sortByDate 
} from './utils/dateUtils.js';

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
  '1990-01-01'
];

console.log('=== Testing Date Utilities ===');

// Test safeParseDate
console.log('\n1. Testing safeParseDate:');
testCases.forEach((testCase, index) => {
  try {
    const result = safeParseDate(testCase);
    console.log(`Test ${index + 1}:`, testCase, '=>', result, `(Valid: ${!isNaN(result.getTime())})`);
  } catch (error) {
    console.error(`Test ${index + 1} failed:`, testCase, error);
  }
});

// Test formatDate
console.log('\n2. Testing formatDate:');
testCases.forEach((testCase, index) => {
  try {
    const result = formatDate(testCase);
    console.log(`Test ${index + 1}:`, testCase, '=>', result);
  } catch (error) {
    console.error(`Test ${index + 1} failed:`, testCase, error);
  }
});

// Test areDatesDifferent
console.log('\n3. Testing areDatesDifferent:');
const dateComparisons = [
  ['2023-05-15T08:30:00', '2023-05-15T08:30:00'], // same
  ['2023-05-15T08:30:00', '2023-05-15T09:30:00'], // different
  [null, '2023-05-15T08:30:00'], // null vs valid
  ['invalid', '2023-05-15T08:30:00'], // invalid vs valid
];

dateComparisons.forEach(([date1, date2], index) => {
  try {
    const result = areDatesDifferent(date1, date2);
    console.log(`Test ${index + 1}:`, date1, 'vs', date2, '=>', result);
  } catch (error) {
    console.error(`Test ${index + 1} failed:`, date1, date2, error);
  }
});

// Test sortByDate
console.log('\n4. Testing sortByDate:');
const testPosts = [
  { id: 1, createdAt: '2023-05-15T08:30:00', title: 'Post 1' },
  { id: 2, createdAt: null, title: 'Post 2' },
  { id: 3, createdAt: '2023-05-10T08:30:00', title: 'Post 3' },
  { id: 4, createdAt: 'invalid-date', title: 'Post 4' },
  { id: 5, createdAt: '2023-05-20T08:30:00', title: 'Post 5' },
];

try {
  const sortedDesc = sortByDate(testPosts, 'createdAt', 'desc');
  console.log('Sorted DESC:', sortedDesc.map(p => ({ id: p.id, createdAt: p.createdAt })));
  
  const sortedAsc = sortByDate(testPosts, 'createdAt', 'asc');
  console.log('Sorted ASC:', sortedAsc.map(p => ({ id: p.id, createdAt: p.createdAt })));
} catch (error) {
  console.error('Sort test failed:', error);
}

// Test formatRelativeTime
console.log('\n5. Testing formatRelativeTime:');
const now = new Date();
const relativeTestCases = [
  new Date(now.getTime() - 1000 * 30).toISOString(), // 30 seconds ago
  new Date(now.getTime() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
  new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
  new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30 * 2).toISOString(), // 2 months ago
  null,
  'invalid-date'
];

relativeTestCases.forEach((testCase, index) => {
  try {
    const result = formatRelativeTime(testCase);
    console.log(`Test ${index + 1}:`, testCase, '=>', result);
  } catch (error) {
    console.error(`Test ${index + 1} failed:`, testCase, error);
  }
});

console.log('\n=== All tests completed ===');

// Export for manual testing
window.dateUtilsTest = {
  formatDate,
  safeParseDate,
  areDatesDifferent,
  formatRelativeTime,
  isValidDate,
  sortByDate,
  testCases,
  testPosts
};
