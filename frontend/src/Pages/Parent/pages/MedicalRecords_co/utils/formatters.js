/**
 * Format date for display
 * @param {string} dateString - Date string to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return "Không có dữ liệu";
  try {
    const date = new Date(dateString);
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
 * @param {string} dateTimeString - Date time string to format
 * @returns {string} - Formatted date time string
 */
export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "Chưa cập nhật";

  try {
    const options = {
      year: "numeric",
      month: "long", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateTimeString).toLocaleDateString("vi-VN", options);
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