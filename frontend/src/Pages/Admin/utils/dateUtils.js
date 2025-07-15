/**
 * Safe date parsing utility for Admin pages
 * Handles both array format from Java backend and string format
 */

/**
 * Safely parse date from various formats
 * @param {string|Array|Date|null|undefined} dateInput - Date to parse
 * @returns {Date} - Valid Date object or current date as fallback
 */
export const safeParseDate = (dateInput) => {
  // Handle null, undefined, empty string
  if (!dateInput || dateInput === '') {
    console.warn('safeParseDate: Empty date input, using current date');
    return new Date();
  }

  // Handle Date object
  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) {
      console.warn('safeParseDate: Invalid Date object, using current date');
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
        console.warn('safeParseDate: Invalid date array components:', dateInput, 'using current date instead');
        return new Date();
      }
      
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
      console.warn('safeParseDate: Invalid date detected:', dateInput, 'using current date instead');
      return new Date();
    }
    
    return date;
  } catch (error) {
    console.warn('safeParseDate: Error parsing date string:', dateInput, error, 'using current date instead');
    return new Date();
  }
};

/**
 * Format date with Vietnamese locale and handle errors gracefully
 * @param {string|Array|Date} dateInput - Date to format
 * @param {Intl.DateTimeFormatOptions} customOptions - Custom formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateInput, customOptions = null) => {
  try {
    const defaultOptions = {
      year: "numeric",
      month: "2-digit", 
      day: "2-digit",
    };
    
    const options = customOptions || defaultOptions;
    const date = safeParseDate(dateInput);
    
    // Double check that the date is valid before formatting
    if (isNaN(date.getTime())) {
      console.warn('formatDate: received invalid date after safeParseDate:', dateInput);
      return 'Không có dữ liệu';
    }
    
    return new Intl.DateTimeFormat("vi-VN", options).format(date);
  } catch (error) {
    console.error('formatDate: Error formatting date:', dateInput, error);
    return 'Không có dữ liệu';
  }
};

/**
 * Format date with time
 * @param {string|Array|Date} dateInput - Date to format
 * @returns {string} Formatted date time string
 */
export const formatDateTime = (dateInput) => {
  try {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    
    const date = safeParseDate(dateInput);
    
    if (isNaN(date.getTime())) {
      console.warn('formatDateTime: received invalid date after safeParseDate:', dateInput);
      return 'Không có dữ liệu';
    }
    
    return new Intl.DateTimeFormat("vi-VN", options).format(date);
  } catch (error) {
    console.error('formatDateTime: Error formatting datetime:', dateInput, error);
    return 'Không có dữ liệu';
  }
};

/**
 * Format date for locale string
 * @param {string|Array|Date} dateInput - Date to format
 * @returns {string} Formatted date time string
 */
export const formatDateTimeLocale = (dateInput) => {
  try {
    const date = safeParseDate(dateInput);
    
    if (isNaN(date.getTime())) {
      console.warn('formatDateTimeLocale: received invalid date after safeParseDate:', dateInput);
      return 'Không có dữ liệu';
    }
    
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error('formatDateTimeLocale: Error formatting datetime:', dateInput, error);
    return 'Không có dữ liệu';
  }
};

/**
 * Check if date is valid
 * @param {any} date - Date to check
 * @returns {boolean} - True if valid date
 */
export const isValidDate = (date) => {
  try {
    const parsedDate = safeParseDate(date);
    return !isNaN(parsedDate.getTime());
  } catch (error) {
    return false;
  }
};

/**
 * Safe date comparison
 * @param {any} date1 - First date
 * @param {any} date2 - Second date
 * @returns {number} - Comparison result (-1, 0, 1)
 */
export const compareDates = (date1, date2) => {
  try {
    const d1 = safeParseDate(date1);
    const d2 = safeParseDate(date2);
    
    if (d1.getTime() < d2.getTime()) return -1;
    if (d1.getTime() > d2.getTime()) return 1;
    return 0;
  } catch (error) {
    console.error('compareDates: Error comparing dates:', error);
    return 0;
  }
};
