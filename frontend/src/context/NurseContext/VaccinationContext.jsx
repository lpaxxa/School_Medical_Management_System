import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import vaccinationApiService from '../../services/APINurse/vaccinationApiService';
import { useAuth } from '../AuthContext'; // Import useAuth hook

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
  // Use auth context for token management
  const { currentUser } = useAuth ? useAuth() : { currentUser: null };
  
  // Thêm state cho thông báo tiêm chủng
  const [notifications, setNotifications] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  
  // Các state hiện tại
  const [vaccinations, setVaccinations] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // State cho kế hoạch tiêm chủng
  const [vaccinationPlans, setVaccinationPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

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

  // Fetch danh sách kế hoạch tiêm chủng
  const fetchVaccinationPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await vaccinationApiService.getVaccinationPlans();
      console.log('Vaccination plans data:', data);
      setVaccinationPlans(data);
      return data;
    } catch (error) {
      console.error('Error fetching vaccination plans:', error);
      setError('Không thể lấy danh sách kế hoạch tiêm chủng. Vui lòng thử lại sau.');
      // Sử dụng mock data khi API không hoạt động
      const mockData = vaccinationApiService.getVaccinationPlans();
      setVaccinationPlans(mockData);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch chi tiết kế hoạch tiêm chủng theo ID
  const getVaccinationPlanById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await vaccinationApiService.getVaccinationPlanById(id);
      console.log('Vaccination plan detail:', data);
      setSelectedPlan(data);
      return data;
    } catch (error) {
      console.error(`Error fetching vaccination plan with ID ${id}:`, error);
      setError('Không thể lấy chi tiết kế hoạch tiêm chủng. Vui lòng thử lại sau.');
      // Sử dụng mock data khi API không hoạt động
      const mockData = await vaccinationApiService.getVaccinationPlanById(id);
      setSelectedPlan(mockData);
      return mockData;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check authentication status
  const checkAuthentication = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      setError('Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      return false;
    }
    
    try {
      // Check if token is expired (if it's a JWT)
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expiry = tokenData.exp * 1000; // Convert to milliseconds
      
      if (Date.now() > expiry) {
        console.error('Token has expired');
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true; // Assume token is valid if we can't parse it
    }
  }, []);

  // Fetch danh sách bản ghi tiêm chủng từ API thật
  const fetchVaccinationRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Check authentication before making API call
    if (!checkAuthentication()) {
      setLoading(false);
      // Return mock data if authentication fails
      return vaccinationApiService.getMockVaccinationRecords();
    }
    
    try {
      // Get the authentication token from localStorage
      const token = localStorage.getItem('authToken');
      
      // Make the request with proper authorization header
      const response = await fetch(`${API_URL}/vaccinations`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Vaccination records from API:', data);
      return data;
    } catch (error) {
      console.error('Error fetching vaccination records from API:', error);
      setError('Không thể lấy danh sách bản ghi tiêm chủng từ API. Sử dụng dữ liệu mẫu.');
      
      // Trả về mock data thay vì throw error
      const mockData = vaccinationApiService.getMockVaccinationRecords();
      console.log('Using mock vaccination records:', mockData);
      return mockData;
    } finally {
      setLoading(false);
    }
  }, [checkAuthentication]);

  // Xóa bản ghi tiêm chủng qua API - cập nhật để sử dụng vaccinationApiService
  const deleteVaccinationRecordAPI = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Deleting vaccination record with ID: ${id}`);
      await vaccinationApiService.deleteVaccination(id);
      
      setSuccess('Đã xóa bản ghi tiêm chủng thành công!');
      return { success: true };
    } catch (error) {
      console.error('Error deleting vaccination record:', error);
      setError('Không thể xóa bản ghi tiêm chủng. Vui lòng thử lại sau.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật bản ghi tiêm chủng qua API - cập nhật để sử dụng vaccinationApiService
  const updateVaccinationRecordAPI = async (id, recordData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Updating vaccination record with ID: ${id}`, recordData);
      
      // Chuẩn bị dữ liệu theo format API yêu cầu
      const updatePayload = {
        administeredAt: recordData.administeredAt || "",
        doseNumber: parseInt(recordData.doseNumber) || 1,
        notes: recordData.notes || "",
        vaccineName: recordData.vaccineName || "",
        administeredBy: parseInt(recordData.administeredBy) || 1
      };
      
      const updatedRecord = await vaccinationApiService.updateVaccination(id, updatePayload);
      
      setSuccess('Đã cập nhật bản ghi tiêm chủng thành công!');
      return updatedRecord;
    } catch (error) {
      console.error('Error updating vaccination record:', error);
      setError('Không thể cập nhật bản ghi tiêm chủng. Vui lòng thử lại sau.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

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
      // Đảm bảo senderId là số nguyên và không phải null
      const senderId = notificationData.senderId ? parseInt(notificationData.senderId) : 1;
      
      // Chỉ gửi chính xác các trường mà API cần, loại bỏ trường date không cần thiết
      const dataToSend = {
        title: notificationData.title,
        message: notificationData.message,
        isRequest: notificationData.isRequest,
        senderId: senderId, // Đảm bảo senderId không null
        type: notificationData.type,
        receiverIds: notificationData.receiverIds.map(id => parseInt(id)) // Đảm bảo ID là số nguyên
      };
      
      console.log('Sending notification with payload:', JSON.stringify(dataToSend, null, 2));
      
      // Lấy token xác thực từ localStorage
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/notifications/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
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

  // Load dữ liệu khi component mount hoặc khi currentUser thay đổi
  useEffect(() => {
    if (currentUser) {
      fetchVaccinations();
      fetchParents();
    }
  }, [fetchVaccinations, fetchParents, currentUser]);

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
    vaccinationPlans,
    selectedPlan,
    fetchVaccinationPlans,
    getVaccinationPlanById,
    fetchVaccinationRecords,
    deleteVaccinationRecordAPI,
    updateVaccinationRecordAPI,
  };

  return (
    <VaccinationContext.Provider value={contextValue}>
      {children}
    </VaccinationContext.Provider>
  );
};

export default VaccinationContext;