import axios from 'axios';

/**
 * Service for medication request operations
 */
const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1/parent-medication-requests`;

/**
 * Get auth token from localStorage
 * @returns {string|null} The auth token
 */
const getAuthToken = () => localStorage.getItem('authToken');

/**
 * Get request headers with authentication
 * @returns {Object} Headers object
 */
const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch medication request history for the logged-in parent
 * @returns {Promise<Array>} Promise resolving to array of medication requests
 */
export const fetchMedicationHistory = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/my-requests`,
      getHeaders()
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching medication history:', error);
    throw error;
  }
};

/**
 * Convert an image file to Base64 format
 * @param {File} imageFile - The image file to convert
 * @returns {Promise<string>} Promise resolving to base64 string
 */
export const convertImageToBase64 = (imageFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);

    reader.onload = () => {
      // Extract the base64 data from the data URL
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
};

/**
 * Submit a new medication request
 * @param {Object} requestData - The medication request data
 * @returns {Promise<Object>} Promise resolving to the API response
 */
export const submitMedicationRequest = async (requestData) => {
  try {
    // Prepare data in the format expected by the API
    const payload = {
      studentId: parseInt(requestData.studentId),
      medicineName: requestData.medicineName,
      dosage: requestData.dosage,
      frequency: parseInt(requestData.frequency) || 1,
      startDate: requestData.startDate,
      endDate: requestData.endDate,
      timeToTake: requestData.timeToTake,
      notes: requestData.notes || '',
      prescriptionImageBase64: null
    };

    // Process prescription image if provided
    if (requestData.prescriptionImage) {
      const base64Image = await convertImageToBase64(requestData.prescriptionImage);
      payload.prescriptionImageBase64 = base64Image;
    }

    const response = await axios.post(
      `${BASE_URL}/submit-request`,
      payload,
      getHeaders()
    );
    
    return response.data;
  } catch (error) {
    console.error('Error submitting medication request:', error);
    throw error;
  }
};

/**
 * Parse timeOfDay string to array
 * @param {string|array} timeOfDay - The time of day string or array
 * @returns {Array} Array of time strings
 */
const parseTimeOfDay = (timeOfDay) => {
  // If it's already an array, return it
  if (Array.isArray(timeOfDay)) {
    return timeOfDay;
  }
  
  // If it's a string, try to parse it
  if (typeof timeOfDay === 'string') {
    try {
      // First try direct JSON parse
      return JSON.parse(timeOfDay);
    } catch (e) {
      // If that fails, try to extract from string format ["08:00", "13:00"]
      try {
        const matches = timeOfDay.match(/"([^"]*)"/g);
        if (matches) {
          return matches.map(m => m.replace(/"/g, ''));
        }
      } catch (e2) {
        console.error("Error parsing timeOfDay:", e2);
      }
    }
  }
  
  // Default empty array if all parsing fails
  return [];
};

/**
 * Update an existing medication request
 * @param {number} requestId - The ID of the request to update
 * @param {Object} requestData - The updated medication request data
 * @returns {Promise<Object>} Promise resolving to the API response
 */
export const updateMedicationRequest = async (requestId, requestData) => {
  try {
    // Create payload based on the exact JSON structure required by the API
    const payload = {
      // Required fields with correct names
      studentId: parseInt(requestData.studentId),
      medicineName: requestData.medicationName || requestData.medicineName, // Use medicationName from history or medicineName
      dosage: requestData.dosageInstructions || requestData.dosage, // Use dosageInstructions from history or dosage
      frequency: parseInt(requestData.frequencyPerDay || requestData.frequency) || 1, // Use frequencyPerDay from history or frequency
      startDate: requestData.startDate,
      endDate: requestData.endDate,
      
      // Convert timeOfDay to timeToTake array if needed
      timeToTake: requestData.timeToTake || parseTimeOfDay(requestData.timeOfDay) || [],
      
      // Additional info
      notes: requestData.specialInstructions || requestData.notes || "",
      
      // Optional image
      prescriptionImageBase64: requestData.prescriptionImageBase64 || null
    };
    
    console.log('Update payload:', payload);
    
    const response = await axios.put(
      `${BASE_URL}/${requestId}`,
      payload,
      getHeaders()
    );
    
    return response.data;
  } catch (error) {
    console.error('Error updating medication request:', error);
    throw error;
  }
};

/**
 * Cancel/delete a medication request
 * @param {number} requestId - The ID of the request to cancel
 * @returns {Promise<Object>} Promise resolving to the API response
 */
export const cancelMedicationRequest = async (requestId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/cancel-request/${requestId}`,
      getHeaders()
    );
    
    return response.data;
  } catch (error) {
    console.error('Error canceling medication request:', error);
    throw error;
  }
};

/**
 * Get medication administration details
 * @param {number} requestId - The ID of the medication request
 * @param {Object} apiEndpoints - API endpoints configuration object
 * @returns {Promise<Object>} Promise resolving to administration details
 */
export const getMedicationAdministrationDetails = async (requestId, apiEndpoints) => {
  try {
    const token = getAuthToken();
    let response;

    // Try different endpoints in sequence until one works
    try {
      // Try endpoint 1: Get by medication instruction ID
      const endpoint = apiEndpoints?.medicationAdministrations?.getByMedicationInstructionId(requestId);
      if (endpoint) {
        response = await axios.get(endpoint, getHeaders());
        const apiResponse = response.data;

        if (apiResponse.status === "success" && Array.isArray(apiResponse.data)) {
          if (apiResponse.data.length > 0) {
            // Sort by administered date (newest first) and return the most recent
            return apiResponse.data.sort((a, b) => 
              new Date(b.administeredAt) - new Date(a.administeredAt)
            )[0];
          }
        } else if (apiResponse.data) {
          return apiResponse.data;
        }
      }
    } catch (error1) {
      console.error('Failed with first endpoint:', error1);
      
      // Try endpoint 2: Get by ID directly
      try {
        const endpoint = apiEndpoints?.medicationAdministrations?.getById(requestId);
        if (endpoint) {
          response = await axios.get(endpoint, getHeaders());
          return response.data;
        }
      } catch (error2) {
        console.error('Failed with second endpoint:', error2);
        
        // Try endpoint 3: Get all and filter
        try {
          const endpoint = apiEndpoints?.medicationAdministrations?.getAll;
          if (endpoint) {
            response = await axios.get(endpoint, getHeaders());
            
            let administrations = response.data;
            if (administrations?.data) {
              administrations = administrations.data;
            }
            
            const allAdministrations = Array.isArray(administrations) 
              ? administrations 
              : [administrations];
              
            const matchingAdmin = allAdministrations.find(
              (admin) => admin.medicationInstructionId == requestId
            );
            
            if (matchingAdmin) {
              return matchingAdmin;
            }
          }
        } catch (error3) {
          console.error('Failed with third endpoint:', error3);
        }
      }
    }
    
    throw new Error('Could not retrieve medication administration details');
  } catch (error) {
    console.error('Error fetching medication administration details:', error);
    throw error;
  }
};

export default {
  fetchMedicationHistory,
  submitMedicationRequest,
  updateMedicationRequest,
  cancelMedicationRequest,
  getMedicationAdministrationDetails,
  convertImageToBase64
}; 