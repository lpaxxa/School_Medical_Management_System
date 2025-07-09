import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import vaccinationApiService from '../../services/APINurse/vaccinationApiService';

// Thêm vào đầu file VaccinationContext.jsx sau phần import
axios.interceptors.request.use(request => {
  console.log('Starting Request', request);
  return request;
}, error => {
  console.error('Request error', error);
  return Promise.reject(error);
});

axios.interceptors.response.use(response => {
  console.log('Response:', response);
  return response;
}, error => {
  console.error('Response error', error.response || error);
  return Promise.reject(error);
});

// Tạo context cho Vaccination
export const VaccinationContext = createContext();

// Custom hook để sử dụng context
export const useVaccination = () => useContext(VaccinationContext);

// Định nghĩa API URL
const API_URL = 'http://localhost:8080/api/v1';

export const VaccinationProvider = ({ children }) => {
  // Thêm state cho thông báo tiêm chủng
  const [notifications, setNotifications] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  
  // Các state hiện tại
  const [vaccinations, setVaccinations] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch danh sách tiêm chủng
  const fetchVaccinations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await vaccinationApiService.getAllVaccinations();
      console.log('Vaccinations data:', data);
      setVaccinations(data);
    } catch (error) {
      console.error('Error fetching vaccinations:', error);
      setError('Không thể lấy danh sách tiêm chủng. Vui lòng thử lại sau.');
      // Sử dụng mock data khi API không hoạt động
      setVaccinations(vaccinationApiService.getMockVaccinationRecords());
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch danh sách phụ huynh
  const fetchParents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await vaccinationApiService.getAllParents();
      console.log('Parents data:', data);
      setParents(data);
    } catch (error) {
      console.error('Error fetching parents:', error);
      setError('Không thể lấy danh sách phụ huynh. Vui lòng thử lại sau.');
      // Sử dụng mock data khi API không hoạt động
      setParents(vaccinationApiService.getMockParents());
    } finally {
      setLoading(false);
    }
  }, []);

  // Xóa bản ghi tiêm chủng
  const deleteVaccinationRecord = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.delete(`${API_URL}/vaccinations/${id}`);
      console.log('Deleted vaccination record:', id);
      setSuccess('Đã xóa bản ghi tiêm chủng thành công!');
      // Cập nhật danh sách tiêm chủng
      setVaccinations(vaccinations.filter(record => record.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting vaccination record:', error);
      setError('Không thể xóa bản ghi tiêm chủng. Vui lòng thử lại sau.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Gửi thông báo đến phụ huynh
  const sendNotification = async (notificationData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Chỉ gửi chính xác các trường mà API cần, loại bỏ trường date không cần thiết
      const dataToSend = {
        title: notificationData.title,
        message: notificationData.message,
        isRequest: notificationData.isRequest,
        senderId: notificationData.senderId,
        type: notificationData.type,
        receiverIds: notificationData.receiverIds
      };
      
      console.log('Sending notification with payload:', dataToSend);
      
      const response = await fetch(`${API_URL}/notifications/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      
      // Đọc response text trước
      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);
      
      // Kiểm tra response có phải JSON không
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (err) {
        console.error('Failed to parse response as JSON:', err);
        responseData = { message: responseText };
      }
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${responseText}`);
      }
      
      setSuccess('Đã gửi thông báo tiêm chủng thành công!');
      return responseData;
    } catch (error) {
      console.error('Error sending notification:', error);
      setError(`Không thể gửi thông báo: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Thêm phương thức fetch thông báo tiêm chủng
  const fetchNotificationsByType = useCallback(async (type = 'VACCINATION') => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await vaccinationApiService.getNotificationsByType(type);
      console.log('Notifications data:', data);
      setNotifications(data);
      return data;
    } catch (error) {
      console.error(`Error fetching notifications by type ${type}:`, error);
      setError('Không thể lấy danh sách thông báo. Vui lòng thử lại sau.');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Thêm phương thức fetch danh sách vaccine
  const fetchVaccines = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await vaccinationApiService.getVaccines();
      console.log('Vaccines data:', data);
      setVaccines(data);
      return data;
    } catch (error) {
      console.error('Error fetching vaccines:', error);
      setError('Không thể lấy danh sách vaccine. Vui lòng thử lại sau.');
      // Set mock data
      const mockVaccines = [
        { id: 1, name: 'Vắc xin COVID-19 Pfizer' },
        { id: 2, name: 'Vắc xin COVID-19 Moderna' },
        { id: 3, name: 'Vắc xin Cúm mùa' },
        { id: 4, name: 'Vắc xin Sởi-Quai bị-Rubella' },
        { id: 5, name: 'Vắc xin Bạch hầu-Ho gà-Uốn ván' }
      ];
      setVaccines(mockVaccines);
    } finally {
      setLoading(false);
    }
  }, []);

  // Thêm phương thức thêm mũi tiêm mới
  const addVaccinationRecord = async (vaccinationData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await vaccinationApiService.addVaccinationRecord(vaccinationData);
      console.log('Added vaccination record:', response);
      setSuccess('Đã thêm mũi tiêm thành công!');
      
      // Cập nhật danh sách tiêm chủng nếu cần
      fetchVaccinations();
      
      return response;
    } catch (error) {
      console.error('Error adding vaccination record:', error);
      setError('Không thể thêm mũi tiêm. Vui lòng thử lại sau.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Xóa thông báo thành công
  const clearSuccess = () => {
    setSuccess(null);
  };

  // Xóa thông báo lỗi
  const clearError = () => {
    setError(null);
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchVaccinations();
    fetchParents();
  }, [fetchVaccinations, fetchParents]);

  // Cập nhật contextValue để thêm các state và phương thức mới
  const contextValue = {
    vaccinations,
    parents,
    notifications,
    vaccines,
    loading,
    error,
    success,
    fetchVaccinations,
    fetchParents,
    fetchNotificationsByType,
    fetchVaccines,
    deleteVaccinationRecord,
    addVaccinationRecord,
    clearSuccess,
    clearError,
    sendNotification,
  };

  return (
    <VaccinationContext.Provider value={contextValue}>
      {children}
    </VaccinationContext.Provider>
  );
};

export default VaccinationContext;