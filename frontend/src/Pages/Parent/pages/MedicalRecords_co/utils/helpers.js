/**
 * Cache data in localStorage with expiration
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} expiryInMinutes - Expiration time in minutes
 */
export const cacheData = (key, data, expiryInMinutes = 30) => {
  const cacheItem = {
    data,
    timestamp: Date.now(),
    expiry: Date.now() + (expiryInMinutes * 60 * 1000)
  };
  localStorage.setItem(key, JSON.stringify(cacheItem));
};

/**
 * Get cached data if not expired
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if expired/not found
 */
export const getCachedData = (key) => {
  const cachedItem = localStorage.getItem(key);
  if (!cachedItem) return null;
  
  try {
    const parsedItem = JSON.parse(cachedItem);
    if (Date.now() > parsedItem.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return parsedItem.data;
  } catch (err) {
    localStorage.removeItem(key);
    return null;
  }
};

/**
 * Get BMI status based on BMI value
 * @param {number} bmi - BMI value
 * @returns {string} - BMI status
 */
export const getBMIStatus = (bmi) => {
  if (!bmi || bmi === 0 || isNaN(bmi)) return "Chưa có dữ liệu";

  const bmiValue = parseFloat(bmi);
  if (isNaN(bmiValue)) return "Chưa có dữ liệu";

  if (bmiValue < 18.5) return "Thiếu cân";
  if (bmiValue < 25) return "Bình thường";
  if (bmiValue < 30) return "Thừa cân";
  return "Béo phì";
};

/**
 * Modal class names used throughout the app
 */
export const modalClasses = {
  modalOverlayClass: "medical-modal-overlay",
  modalContentClass: "medical-modal-content",
  modalHeaderClass: "modal-header",
  modalBodyClass: "modal-body",
  closeModalBtnClass: "close-modal-btn",
  modalSectionClass: "modal-section"
};