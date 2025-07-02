import React, { createContext, useState, useEffect, useContext } from 'react';
import receiveMedicineService from '../../services/APINurse/receiveMedicineService';

// Create context
export const MedicineApprovalContext = createContext();

// Custom hook to use the context
export const useMedicineApproval = () => useContext(MedicineApprovalContext);

// Create context for medication administration
export const MedicationAdministrationContext = createContext();

// Custom hook to use the medication administration context
export const useMedicationAdministration = () => useContext(MedicationAdministrationContext);

export const MedicineApprovalProvider = ({ children }) => {
  // States for medicine approvals
  const [medicineRequests, setMedicineRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Fetch all medicine requests - Using real API
  const fetchMedicineRequests = async () => {
    try {
      setLoading(true);
      
      // Kiểm tra token trước khi gọi API
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('Không có token xác thực!');
        setError('Vui lòng đăng nhập lại để tiếp tục.');
        return;
      }
      
      console.log('Đang gọi API lấy danh sách yêu cầu thuốc...');
      const data = await receiveMedicineService.getAllMedicineRequests();
      
      if (Array.isArray(data)) {
        console.log(`Nhận được ${data.length} yêu cầu thuốc`);
        setMedicineRequests(data);
        setError(null);
      } else {
        console.error('Dữ liệu trả về không phải là mảng:', data);
        setError('Định dạng dữ liệu không hợp lệ');
      }
    } catch (err) {
      console.error('Error fetching medicine requests:', err);
      setError('Không thể tải danh sách yêu cầu thuốc: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý yêu cầu thuốc (phê duyệt/từ chối)
  const processMedicineRequest = async (id, requestData) => {
    try {
      setLoading(true);
      
      // Gọi API thực tế từ service
      const result = await receiveMedicineService.processMedicineRequest(id, requestData);
      
      if (result.success) {
        // Cập nhật danh sách yêu cầu từ server thay vì chỉ cập nhật local
        await fetchMedicineRequests();
        setError(null);
      } else {
        throw new Error(result.message || 'Không thể xử lý yêu cầu');
      }
      
      return result;
    } catch (err) {
      console.error('Error processing medicine request:', err);
      setError('Không thể xử lý yêu cầu thuốc: ' + err.message);
      return { 
        success: false, 
        message: err.message || "Lỗi khi xử lý yêu cầu" 
      };
    } finally {
      setLoading(false);
    }
  };

  // TODO: Implement when API is available
  const getMedicineRequestById = async (id) => {
    try {
      setLoading(true);
      // Using mock data until API is available
      const mockRequest = medicineRequests.find(req => req.id === id);
      setSelectedRequest(mockRequest);
      setError(null);
      return mockRequest;
    } catch (err) {
      console.error('Error fetching medicine request details:', err);
      setError('Không thể tải thông tin chi tiết yêu cầu thuốc');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Utility function - Convert status from API to text and class
  const getStatusInfo = (status) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return {
          text: "Chờ phê duyệt",
          class: "status-pending"
        };
      case "APPROVED":
        return {
          text: "Đã duyệt",
          class: "status-approved"
        };
      case "REJECTED":
        return {
          text: "Từ chối",
          class: "status-rejected"
        };
      case "CANCELLED":
        return {
          text: "Đã hủy",
          class: "status-cancelled"
        };
      default:
        return {
          text: "Không xác định",
          class: "status-unknown"
        };
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchMedicineRequests();
  }, []);

  // Context value for medicine approvals
  const medicineApprovalValue = {
    medicineRequests,
    loading,
    error,
    selectedRequest,
    fetchMedicineRequests,
    processMedicineRequest,
    getMedicineRequestById,
    getStatusInfo
  };
  
  // States for medication administrations
  const [administrations, setAdministrations] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState(null);
  // Fetch all medication administrations
  const fetchMedicationAdministrations = async (page = 1, size = 10) => {
    setAdminLoading(true);
    console.log('🚀 Context: fetchMedicationAdministrations called with:', { page, size });
    try {
      const response = await receiveMedicineService.getAllMedicationAdministrations(page, size);
      console.log('✅ Context: API response received:', response);
      
      if (response && response.status === 'success') {
        console.log('✅ Context: Setting administrations data:', response.data.posts);
        setAdministrations(response.data.posts);
        setTotalItems(response.data.totalItems);
        setTotalPages(response.data.totalPages);
        setCurrentPage(page);
        setPageSize(size);
        setAdminError(null); // Clear any previous errors
      } else {
        console.warn('⚠️ Context: Invalid response format:', response);
        setAdminError('Định dạng phản hồi không hợp lệ');
      }
    } catch (err) {
      console.error('❌ Context: Error in fetchMedicationAdministrations:', err);
      setAdminError(`Lỗi: ${err.message || 'Đã xảy ra lỗi khi tải dữ liệu'}`);
    } finally {
      setAdminLoading(false);
    }
  };

  // Add new medication administration
  const addMedicationAdministration = async (data) => {
    setAdminLoading(true);
    try {
      const response = await receiveMedicineService.addMedicationAdministration(data);
      await fetchMedicationAdministrations(currentPage, pageSize);
      return { success: true, data: response };
    } catch (err) {
      setAdminError(`Lỗi: ${err.message || 'Đã xảy ra lỗi khi thêm mới'}`);
      return { success: false, error: err };
    } finally {
      setAdminLoading(false);
    }
  };

  // Update medication administration
  const updateMedicationAdministration = async (id, data) => {
    setAdminLoading(true);
    try {
      const response = await receiveMedicineService.updateMedicationAdministration(id, data);
      await fetchMedicationAdministrations(currentPage, pageSize);
      return { success: true, data: response };
    } catch (err) {
      setAdminError(`Lỗi: ${err.message || 'Đã xảy ra lỗi khi cập nhật'}`);
      return { success: false, error: err };
    } finally {
      setAdminLoading(false);
    }
  };

  // Delete medication administration
  const deleteMedicationAdministration = async (id) => {
    setAdminLoading(true);
    try {
      await receiveMedicineService.deleteMedicationAdministration(id);
      await fetchMedicationAdministrations(currentPage, pageSize);
      return { success: true };
    } catch (err) {
      setAdminError(`Lỗi: ${err.message || 'Đã xảy ra lỗi khi xóa'}`);
      return { success: false, error: err };
    } finally {
      setAdminLoading(false);
    }
  };

  // Clear errors
  const clearAdminError = () => {
    setAdminError(null);
  };

  // Load medication administrations data on initial mount
  useEffect(() => {
    fetchMedicationAdministrations(currentPage, pageSize);
  }, []);

  // Context value for medication administrations
  const medicationAdminValue = {
    administrations,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    loading: adminLoading,
    error: adminError,
    fetchMedicationAdministrations,
    addMedicationAdministration,
    updateMedicationAdministration,
    deleteMedicationAdministration,
    clearError: clearAdminError,
    // Add new functions for medication administration
    createMedicationAdministration: async (data) => {
      try {
        console.log('Creating medication administration via context:', data);
        const result = await receiveMedicineService.createMedicationAdministration(data);
        
        if (result.success) {
          // Refresh the administration list
          await fetchMedicationAdministrations(currentPage, pageSize);
        }
        
        return result;
      } catch (error) {
        console.error('Error in createMedicationAdministration context:', error);
        return {
          success: false,
          message: error.message || 'Không thể tạo bản ghi cung cấp thuốc'
        };
      }
    },
    uploadConfirmationImage: async (administrationId, imageFile) => {
      try {
        console.log('Uploading confirmation image via context:', administrationId);
        const result = await receiveMedicineService.uploadConfirmationImage(administrationId, imageFile);
        
        if (result.success) {
          // Refresh the administration list
          await fetchMedicationAdministrations(currentPage, pageSize);
        }
        
        return result;
      } catch (error) {
        console.error('Error in uploadConfirmationImage context:', error);
        return {
          success: false,
          message: error.message || 'Không thể tải lên ảnh xác nhận'
        };
      }
    },
    getRecentMedicationAdministrations: async (page = 1, size = 10) => {
      try {
        console.log(`Getting recent medication administrations via context (page ${page}, size ${size})`);
        const result = await receiveMedicineService.getRecentMedicationAdministrations(page, size);
        return result;
      } catch (error) {
        console.error('Error in getRecentMedicationAdministrations context:', error);
        return {
          success: false,
          message: error.message || 'Không thể lấy lịch sử dùng thuốc gần đây'
        };
      }
    }
  };

  return (
    <MedicineApprovalContext.Provider value={medicineApprovalValue}>
      <MedicationAdministrationContext.Provider value={medicationAdminValue}>
        {children}
      </MedicationAdministrationContext.Provider>
    </MedicineApprovalContext.Provider>
  );
};
