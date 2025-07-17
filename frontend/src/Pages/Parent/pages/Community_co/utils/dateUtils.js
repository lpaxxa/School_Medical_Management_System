/**
 * Date utility functions for Community components
 * Handles date parsing, formatting, and validation safely
 */

/**
 * Safely parse a date from various formats including Java LocalDateTime array
 * @param {string|Array|Date|null|undefined} dateInput - Date to parse
 * @returns {Date} Valid Date object
 */
export const safeParseDate = (dateInput) => {
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

  // Handle array format [year, month, day, hour, minute, second, nanosecond]
  // This is the format from Java LocalDateTime
  if (Array.isArray(dateInput)) {
    try {
      // Convert array to Date - JavaScript months are 0-based
      const [year, month, day, hour = 0, minute = 0, second = 0, nanosecond = 0] = dateInput;

      // Validate array components
      if (year < 1970 || year > 3000 || month < 1 || month > 12 || day < 1 || day > 31) {
        console.warn('safeParseDate: Invalid date array components:', dateInput, 'using current date instead');
        return new Date();
      }

      // Convert nanoseconds to milliseconds (nanosecond / 1,000,000)
      const millisecond = Math.floor(nanosecond / 1000000);

      const date = new Date(year, month - 1, day, hour, minute, second, millisecond);

      if (isNaN(date.getTime())) {
        console.warn('safeParseDate: Invalid date created from array:', dateInput, 'using current date instead');
        return new Date();
      }

      return date;
    } catch (error) {
      console.warn('safeParseDate: Error parsing date array:', dateInput, error, 'using current date instead');
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

/**
 * Format date with Vietnamese locale and handle errors gracefully
 * @param {string|Date} dateString - Date to format
 * @param {Intl.DateTimeFormatOptions} customOptions - Custom formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, customOptions = null) => {
  try {
    const defaultOptions = {
      year: "numeric",
      month: "long", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    
    const options = customOptions || defaultOptions;
    const date = safeParseDate(dateString);
    
    // Double check that the date is valid before formatting
    if (isNaN(date.getTime())) {
      console.warn('formatDate received invalid date after safeParseDate:', dateString);
      return 'Không xác định';
    }
    
    return date.toLocaleDateString("vi-VN", options);
  } catch (error) {
    console.error('Error formatting date:', error, 'for dateString:', dateString);
    return 'Không xác định';
  }
};

/**
 * Format date as relative time (e.g., "2 giờ trước", "3 ngày trước")
 * @param {string|Date} dateString - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (dateString) => {
  try {
    const date = safeParseDate(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    
    const seconds = Math.floor(diffInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (years > 0) {
      return `${years} năm trước`;
    } else if (months > 0) {
      return `${months} tháng trước`;
    } else if (days > 0) {
      return `${days} ngày trước`;
    } else if (hours > 0) {
      return `${hours} giờ trước`;
    } else if (minutes > 0) {
      return `${minutes} phút trước`;
    } else {
      return 'Vừa xong';
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Không xác định';
  }
};

/**
 * Check if two dates are different (useful for detecting edits)
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date
 * @returns {boolean} True if dates are different
 */
export const areDatesDifferent = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  try {
    const parsedDate1 = safeParseDate(date1);
    const parsedDate2 = safeParseDate(date2);
    
    return parsedDate1.getTime() !== parsedDate2.getTime();
  } catch (error) {
    console.error('Error comparing dates:', error);
    return false;
  }
};

/**
 * Sort array by date field
 * @param {Array} array - Array to sort
 * @param {string} dateField - Field name containing date
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
export const sortByDate = (array, dateField = 'createdAt', order = 'desc') => {
  if (!Array.isArray(array)) return [];
  
  return [...array].sort((a, b) => {
    const dateA = safeParseDate(a[dateField]);
    const dateB = safeParseDate(b[dateField]);
    
    if (order === 'desc') {
      return dateB.getTime() - dateA.getTime();
    } else {
      return dateA.getTime() - dateB.getTime();
    }
  });
};

/**
 * Validate if a string is a valid date
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Get start and end of day for a given date
 * @param {string|Date} dateInput - Date input
 * @returns {Object} Object with startOfDay and endOfDay
 */
export const getDateRange = (dateInput) => {
  const date = safeParseDate(dateInput);
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return { startOfDay, endOfDay };
};

/**
 * Check if date is today
 * @param {string|Date} dateInput - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (dateInput) => {
  const date = safeParseDate(dateInput);
  const today = new Date();
  
  return date.toDateString() === today.toDateString();
};

/**
 * Check if date is within last N days
 * @param {string|Date} dateInput - Date to check
 * @param {number} days - Number of days
 * @returns {boolean} True if within range
 */
export const isWithinDays = (dateInput, days) => {
  const date = safeParseDate(dateInput);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  
  return diffInDays <= days;
};
