/**
 * Test file để kiểm tra date parsing fixes
 * Run trong browser console để test các date format khác nhau
 */

// Import hoặc copy safeParseDate function để test
const safeParseDate = (dateInput) => {
  if (!dateInput) {
    console.warn('Date input is null/undefined, using current date');
    return new Date();
  }

  // If it's already a Date object, check if it's valid
  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) {
      console.warn('Invalid Date object detected:', dateInput, 'using current date instead');
      return new Date();
    }
    return dateInput;
  }

  // Handle array format [year, month, day, hour, minute, second, millisecond]
  if (Array.isArray(dateInput)) {
    try {
      // Convert array to Date - JavaScript months are 0-based
      const [year, month, day, hour = 0, minute = 0, second = 0, millisecond = 0] = dateInput;
      
      // Validate array components
      if (year < 1970 || year > 3000 || month < 1 || month > 12 || day < 1 || day > 31) {
        console.warn('Invalid date array components:', dateInput, 'using current date instead');
        return new Date();
      }
      
      const date = new Date(year, month - 1, day, hour, minute, second, millisecond);
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date created from array:', dateInput, 'using current date instead');
        return new Date();
      }
      
      return date;
    } catch (error) {
      console.warn('Error parsing date array:', dateInput, error, 'using current date instead');
      return new Date();
    }
  }
  
  // Handle string format
  try {
    const date = new Date(dateInput);
    
    // Check if date is invalid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date detected:', dateInput, 'using current date instead');
      return new Date();
    }
    
    return date;
  } catch (error) {
    console.warn('Error parsing date string:', dateInput, error, 'using current date instead');
    return new Date();
  }
};

// Test cases for date parsing
const testDateParsing = () => {
  console.log('🧪 Testing Date Parsing Fixes');
  console.log('================================');

  const testCases = [
    // Normal string dates
    "2023-05-15T08:30:00",
    "2023-05-14T10:15:00Z", 
    "2025-01-15T14:30:00.000Z",
    
    // Array format (như trong console warning)
    [2025, 7, 5, 22, 1, 49, 66667000],
    [2023, 5, 15, 8, 30, 0, 0],
    [2024, 12, 25],
    
    // Invalid cases
    "invalid-date",
    null,
    undefined,
    [],
    [9999, 99, 99],
    "not a date at all",
    
    // Edge cases
    new Date(),
    new Date("invalid"),
    "2023-02-29", // Invalid leap year date
  ];

  testCases.forEach((testCase, index) => {
    console.log(`\n📝 Test Case ${index + 1}:`, testCase);
    try {
      const result = safeParseDate(testCase);
      console.log(`✅ Result:`, result);
      console.log(`📅 Formatted:`, result.toLocaleDateString("vi-VN"));
    } catch (error) {
      console.error(`❌ Error:`, error);
    }
  });
};

// Test array date format specifically (từ API response)
const testArrayDateFormat = () => {
  console.log('\n🔧 Testing Array Date Format');
  console.log('==============================');
  
  // Format từ console warning: [2025, 7, 5, 22, 1, 49, 66667000]
  const apiDateArray = [2025, 7, 5, 22, 1, 49, 66667000];
  
  console.log('Original API array:', apiDateArray);
  
  // Test với safeParseDate
  const parsedDate = safeParseDate(apiDateArray);
  console.log('Parsed date:', parsedDate);
  console.log('Formatted (vi-VN):', parsedDate.toLocaleDateString("vi-VN"));
  console.log('ISO string:', parsedDate.toISOString());
  
  // Test manual construction
  const [year, month, day, hour, minute, second, millisecond] = apiDateArray;
  const manualDate = new Date(year, month - 1, day, hour, minute, second, Math.floor(millisecond / 1000));
  console.log('Manual construction:', manualDate);
  console.log('Manual formatted:', manualDate.toLocaleDateString("vi-VN"));
};

// Simulate real API response structure
const testRealAPIResponse = () => {
  console.log('\n🌐 Testing Real API Response Structure');
  console.log('=====================================');
  
  const mockPost = {
    id: 1,
    title: "Test Post",
    content: "Test content",
    createdAt: [2025, 7, 5, 22, 1, 49, 66667000],
    updatedAt: [2025, 7, 5, 22, 1, 49, 66667000],
    likes: 5,
    liked: false
  };
  
  console.log('Mock post:', mockPost);
  
  // Test date parsing
  const createdDate = safeParseDate(mockPost.createdAt);
  const updatedDate = safeParseDate(mockPost.updatedAt);
  
  console.log('Parsed createdAt:', createdDate);
  console.log('Parsed updatedAt:', updatedDate);
  
  // Test sorting function
  const posts = [
    {...mockPost, id: 1, createdAt: [2025, 7, 5, 22, 1, 49]},
    {...mockPost, id: 2, createdAt: [2025, 7, 4, 15, 30, 0]},
    {...mockPost, id: 3, createdAt: [2025, 7, 6, 9, 0, 0]},
  ];
  
  const sortedPosts = posts.sort((a, b) => {
    const dateA = safeParseDate(a.createdAt);
    const dateB = safeParseDate(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });
  
  console.log('Sorted posts:', sortedPosts.map(p => ({
    id: p.id,
    createdAt: p.createdAt,
    parsedDate: safeParseDate(p.createdAt).toISOString()
  })));
};

// Run all tests
console.log('🚀 Starting Date Fixes Tests...');
testDateParsing();
testArrayDateFormat();
testRealAPIResponse();

console.log('\n✅ Date Fixes Tests Complete!');
console.log('Copy and paste this code into browser console to run tests.');
