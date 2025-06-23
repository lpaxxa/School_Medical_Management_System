import React, { createContext, useState, useEffect, useContext } from 'react';
import receiveMedicineService from '../../services/receiveMedicineService';

// Create context
export const MedicineApprovalContext = createContext();

// Custom hook to use the context
export const useMedicineApproval = () => useContext(MedicineApprovalContext);

export const MedicineApprovalProvider = ({ children }) => {
  // States
  const [medicineRequests, setMedicineRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Fetch all medicine requests - Using real API
  const fetchMedicineRequests = async () => {
    try {
      setLoading(true);
      const data = await receiveMedicineService.getAllMedicineRequests();
      setMedicineRequests(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching medicine requests:', err);
      setError('Không thể tải danh sách yêu cầu thuốc');
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

  // Context value
  const value = {
    medicineRequests,
    loading,
    error,
    selectedRequest,
    fetchMedicineRequests,
    processMedicineRequest,
    getMedicineRequestById,
    getStatusInfo
  };

  return (
    <MedicineApprovalContext.Provider value={value}>
      {children}
    </MedicineApprovalContext.Provider>
  );
};
