// Test script để kiểm tra định dạng ngày tháng
// Chạy script này trong browser console để test

// Helper function để đảm bảo định dạng ngày tháng đúng YYYY-MM-DD
const formatDateToYYYYMMDD = (date) => {
  if (!date) return new Date().toLocaleDateString("en-CA");
  
  // Nếu đã là string với định dạng YYYY-MM-DD
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  
  // Nếu là Date object hoặc string khác
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return new Date().toLocaleDateString("en-CA");
    }
    return dateObj.toLocaleDateString("en-CA");
  } catch (error) {
    console.error("Error formatting date:", error);
    return new Date().toLocaleDateString("en-CA");
  }
};

// Test cases
console.log("=== TEST DATE FORMATTING ===");

// Test 1: Current date
console.log("Current date:", formatDateToYYYYMMDD());

// Test 2: Valid date string
console.log("Valid date string:", formatDateToYYYYMMDD("2025-07-24"));

// Test 3: ISO string
console.log("ISO string:", formatDateToYYYYMMDD(new Date().toISOString()));

// Test 4: Date object
console.log("Date object:", formatDateToYYYYMMDD(new Date()));

// Test 5: Invalid date
console.log("Invalid date:", formatDateToYYYYMMDD("invalid-date"));

// Test 6: Empty/null
console.log("Empty:", formatDateToYYYYMMDD(""));
console.log("Null:", formatDateToYYYYMMDD(null));

// Test 7: Problematic format that was causing issues
const problematicDate = "2025,7,24";
console.log("Problematic format '2025,7,24':", formatDateToYYYYMMDD(problematicDate));

console.log("=== END TEST ===");

// Verify the format matches expected pattern
const testResult = formatDateToYYYYMMDD();
const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(testResult);
console.log("Format validation:", isValidFormat ? "PASS" : "FAIL");
console.log("Result:", testResult);
