/**
 * Error handler utility for SendMedicine component
 */

/**
 * Handle API errors and return user-friendly messages
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  // Network errors
  if (!error.response) {
    return "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
  }
  
  // HTTP status errors
  const status = error.response?.status;
  const message = error.response?.data?.message;
  
  switch (status) {
    case 400:
      return message || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
    case 401:
      return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    case 403:
      return "Bạn không có quyền thực hiện thao tác này.";
    case 404:
      return "Không tìm thấy dữ liệu yêu cầu.";
    case 500:
      return "Lỗi server. Vui lòng thử lại sau.";
    default:
      return message || "Đã xảy ra lỗi không xác định. Vui lòng thử lại.";
  }
};

/**
 * Handle form validation errors
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation errors object
 */
export const validateMedicineForm = (formData) => {
  const errors = {};
  
  if (!formData.studentId) {
    errors.studentId = "Vui lòng chọn học sinh";
  }
  
  if (!formData.medicineName?.trim()) {
    errors.medicineName = "Vui lòng nhập tên thuốc";
  }
  
  if (!formData.dosage?.trim()) {
    errors.dosage = "Vui lòng nhập liều lượng";
  }
  
  if (!formData.frequency || isNaN(Number(formData.frequency)) || Number(formData.frequency) < 1) {
    errors.frequency = "Vui lòng nhập số lần dùng thuốc hợp lệ";
  }
  
  if (!formData.startDate) {
    errors.startDate = "Vui lòng chọn ngày bắt đầu";
  }
  
  if (!formData.endDate) {
    errors.endDate = "Vui lòng chọn ngày kết thúc";
  }
  
  if (formData.startDate && formData.endDate) {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (startDate > endDate) {
      errors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }
  }
  
  if (!formData.timeToTake || formData.timeToTake.length === 0) {
    errors.timeToTake = "Vui lòng chọn thời điểm uống thuốc";
  }
  
  return errors;
};

/**
 * Handle image upload validation
 * @param {File} file - Image file to validate
 * @returns {string|null} Error message or null if valid
 */
export const validateImageFile = (file) => {
  if (!file) return null;
  
  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return "File không được vượt quá 5MB";
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    return "Chỉ chấp nhận file ảnh (JPEG, PNG, JPG)";
  }
  
  return null;
};

/**
 * Format date for display
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
export const formatDisplayDate = (dateString) => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "N/A";
  }
};

/**
 * Format date for API submission
 * @param {string} dateString - Date string to format
 * @returns {string} API-formatted date string
 */
export const formatApiDate = (dateString) => {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error("Error formatting API date:", error);
    return "";
  }
};

/**
 * Get status display info
 * @param {string} status - Status string
 * @returns {Object} Status display info with label and class
 */
export const getStatusInfo = (status) => {
  const statusMap = {
    PENDING_APPROVAL: {
      label: "Chờ duyệt",
      class: "pending"
    },
    APPROVED: {
      label: "Đã duyệt",
      class: "approved"
    },
    REJECTED: {
      label: "Từ chối",
      class: "rejected"
    },
    FULLY_TAKEN: {
      label: "Đã uống đủ",
      class: "completed"
    },
    PARTIALLY_TAKEN: {
      label: "Uống một phần",
      class: "partial"
    },
    CANCELLED: {
      label: "Đã hủy",
      class: "cancelled"
    }
  };
  
  return statusMap[status] || {
    label: status || "Không xác định",
    class: "unknown"
  };
};
