/**
 * Format date for display
 * @param {string|Array} dateString - Date string or array to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return "Không có dữ liệu";
  try {
    let date;
    
    // Check if it's an array (Java LocalDateTime/LocalDate format)
    if (Array.isArray(dateString) && dateString.length >= 3) {
      // Format: [year, month, day, ...] 
      const [year, month, day] = dateString;
      // Note: month in Java is 1-based, but JavaScript Date expects 0-based month
      date = new Date(year, month - 1, day);
    } else {
      // Handle as string
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) return "Không có dữ liệu";

    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch (err) {
    console.error("Error formatting date:", err);
    return "Không có dữ liệu";
  }
};

/**
 * Format date with time for display
 * @param {string|Array} dateTimeString - Date time string or array to format
 * @returns {string} - Formatted date time string
 */
export const formatDateTime = (dateTimeString) => {
  console.log("formatDateTime input:", dateTimeString);
  console.log("formatDateTime input type:", typeof dateTimeString);
  console.log("formatDateTime input isArray:", Array.isArray(dateTimeString));
  
  if (!dateTimeString) return "Chưa cập nhật";

  try {
    let date;
    
    // Check if it's an array (Java LocalDateTime format)
    if (Array.isArray(dateTimeString)) {
      console.log("formatDateTime: Processing as array");
      if (dateTimeString.length >= 5) {
        // Format: [year, month, day, hour, minute, second, nanosecond]
        // Minimum required: [year, month, day, hour, minute]
        const [year, month, day, hour, minute, second = 0] = dateTimeString;
        console.log("formatDateTime extracted values:", { year, month, day, hour, minute, second });
        // Note: month in Java is 1-based, but JavaScript Date expects 0-based month
        date = new Date(year, month - 1, day, hour, minute, second);
        console.log("formatDateTime created date from array:", date);
      } else {
        console.log("formatDateTime: Array too short, need at least 5 elements");
        return "Định dạng không hợp lệ";
      }
    } else {
      console.log("formatDateTime: Processing as string");
      // Handle as string
      date = new Date(dateTimeString);
      console.log("formatDateTime created date from string:", date);
    }
    
    if (isNaN(date.getTime())) {
      console.log("formatDateTime: Invalid date");
      return "Định dạng không hợp lệ";
    }

    const options = {
      year: "numeric",
      month: "long", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    const result = date.toLocaleDateString("vi-VN", options);
    console.log("formatDateTime result:", result);
    return result;
  } catch (error) {
    console.error("Error formatting datetime:", error);
    return "Định dạng không hợp lệ";
  }
};

/**
 * Format time only
 * @param {string} dateTimeString - Date time string to format
 * @returns {string} - Formatted time string
 */
export const formatTimeOnly = (dateTimeString) => {
  if (!dateTimeString) return "00:00";
  try {
    const dateTime = new Date(dateTimeString);
    if (isNaN(dateTime.getTime())) return "00:00";

    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateTime);
  } catch (err) {
    console.error("Error formatting time:", err);
    return "00:00";
  }
};

/**
 * Format date only
 * @param {string} dateTimeString - Date time string to format
 * @returns {string} - Formatted date string
 */
export const formatDateOnly = (dateTimeString) => {
  if (!dateTimeString) return "Không có dữ liệu";
  try {
    const dateTime = new Date(dateTimeString);
    if (isNaN(dateTime.getTime())) return "Không có dữ liệu";

    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(dateTime);
  } catch (err) {
    console.error("Error formatting date:", err);
    return "Không có dữ liệu";
  }
};

/**
 * Format temperature - ensure it shows with one decimal place
 * @param {number} temp - Temperature value
 * @returns {string} - Formatted temperature
 */
export const formatTemperature = (temp) => {
  if (temp === undefined || temp === null) return "N/A";
  return Number(temp).toFixed(1) + "°C";
};