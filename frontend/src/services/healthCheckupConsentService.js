// Service cho quản lý consent kiểm tra sức khỏe định kỳ
import api from './api';

const BASE_URL = '/parent-consents';

const healthCheckupConsentService = {
  // Lấy chi tiết consent kiểm tra sức khỏe
  getConsentDetails: async (consentId) => {
    try {
      const response = await api.get(`${BASE_URL}/${consentId}/details`);
      return response.data;
    } catch (error) {
      console.error('Error fetching consent details:', error);
      throw error;
    }
  },

  // Gửi phản hồi consent từ phụ huynh
  submitConsent: async (consentId, consentData) => {
    try {
      const response = await api.put(`${BASE_URL}/${consentId}`, consentData);
      return response.data;
    } catch (error) {
      console.error('Error submitting consent:', error);
      throw error;
    }
  },

  // Lấy danh sách các consent pending cho parent
  getPendingConsents: async (parentId) => {
    try {
      const response = await api.get(`${BASE_URL}/parent/${parentId}/pending`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending consents:', error);
      throw error;
    }
  },

  // Lấy danh sách tất cả consent cho parent và tất cả con
  getAllConsents: async (parentId) => {
    try {
      const response = await api.get(`${BASE_URL}/parent/${parentId}/all-children`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all consents:', error);
      throw error;
    }
  }
};

export default healthCheckupConsentService;
