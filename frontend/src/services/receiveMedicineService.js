import api from './api';

// Function to transform backend MedicationInstructionDTO to frontend format
const transformMedicationRequestFromBackend = (backendData) => {
  if (!backendData) return null;
  
  return {
    id: backendData.id,
    // Map backend fields to frontend expected fields
    studentId: backendData.studentId || `HS${String(backendData.id).padStart(3, '0')}`, // Use actual studentId from backend
    studentName: backendData.studentName,
    parentName: backendData.requestedBy,
    medicineName: backendData.medicationName,
    quantity: backendData.dosageInstructions || 'Theo đơn', // Use dosage as quantity if available
    frequency: backendData.frequencyPerDay,
    instructions: backendData.specialInstructions,
    startDate: backendData.startDate,
    endDate: backendData.endDate,
    notes: backendData.specialInstructions,
    class: backendData.studentClass || 'Chưa có', // Use actual class from backend
    
    // Status mapping - backend uses enum values
    status: backendData.status, // PENDING_APPROVAL, APPROVED, REJECTED
    approvalStatus: backendData.status,
    
    // Date fields
    submittedAt: backendData.submittedAt,
    approvedDate: backendData.responseDate ? backendData.responseDate.split('T')[0] : null,
    receivedDate: backendData.responseDate ? backendData.responseDate.split('T')[0] : null, // Legacy support
    
    // Approval/rejection details
    approvalReason: backendData.approvalReason || '',
    rejectionReason: backendData.rejectionReason,
    approvedBy: backendData.approvedBy,
    
    // Additional backend fields
    healthProfileId: backendData.healthProfileId,
    parentProvided: backendData.parentProvided,
    requestedByAccountId: backendData.requestedByAccountId,
    timeOfDay: backendData.timeOfDay
  };
};

// Function to transform frontend data to backend format for API calls
const transformMedicationRequestToBackend = (frontendData) => {
  // Handle studentId conversion
  let studentId = null;
  if (frontendData.studentId) {
    if (typeof frontendData.studentId === 'string' && frontendData.studentId.startsWith('HS')) {
      // Extract numeric part from "HS001" format
      studentId = parseInt(frontendData.studentId.replace('HS', ''));
    } else {
      // Already numeric or can be parsed as number
      studentId = parseInt(frontendData.studentId);
    }
  }

  const backendData = {
    studentId: studentId,
    medicineName: frontendData.medicineName,
    dosage: frontendData.quantity || frontendData.dosageInstructions || frontendData.instructions,
    frequency: frontendData.frequency,
    startDate: frontendData.startDate,
    endDate: frontendData.endDate,
    timeToTake: frontendData.timeOfDay ? 
      (Array.isArray(frontendData.timeOfDay) ? frontendData.timeOfDay : JSON.parse(frontendData.timeOfDay || '["morning"]')) 
      : ['morning'],
    notes: frontendData.notes || frontendData.specialInstructions || ''
  };

  // Add prescription image if available
  if (frontendData.prescriptionImageBase64) {
    backendData.prescriptionImageBase64 = frontendData.prescriptionImageBase64;
  }
  if (frontendData.prescriptionImageType) {
    backendData.prescriptionImageType = frontendData.prescriptionImageType;
  }

  return backendData;
};

// Service API cho quản lý thuốc từ phụ huynh
const receiveMedicineService = {
  // Tìm kiếm thuốc theo tên
  searchMedicationByName: async (searchTerm) => {
    try {
      const encodedTerm = encodeURIComponent(searchTerm);
      const response = await api.get(`/medication-items/get-by-name/${encodedTerm}`);
      return response.data || [];
    } catch (error) {
      console.error("Lỗi khi tìm kiếm thuốc:", error);
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền thực hiện chức năng này.');
      }
      throw new Error('Không thể tìm kiếm thuốc. Vui lòng thử lại sau.');
    }
  },

  // Lấy danh sách thuốc từ phụ huynh (for parent users)
  getParentMedicineRequests: async () => {
    try {
      const response = await api.get('/parent-medication-requests/my-requests');
      return response.data.map(transformMedicationRequestFromBackend);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách yêu cầu thuốc của phụ huynh:", error);
      throw error;
    }
  },

  // Lấy danh sách thuốc từ phụ huynh (for nurse users - all requests)
  getAllMedicineRequests: async () => {
    try {
      // For nurses to see all medication requests
      const response = await api.get('/nurse-medication-approvals/all-requests');
      return response.data.map(transformMedicationRequestFromBackend);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thuốc từ phụ huynh:", error);
      throw error;
    }
  },

  // Lấy chi tiết yêu cầu thuốc theo ID (works for both parent and nurse)
  getMedicineRequestById: async (id) => {
    try {
      // Try parent endpoint first, fallback to nurse endpoint
      let response;
      try {
        response = await api.get(`/parent-medication-requests/${id}`);
      } catch (parentError) {
        // If parent endpoint fails, try nurse endpoint
        response = await api.get(`/nurse-medication-approvals/${id}`);
      }
      return transformMedicationRequestFromBackend(response.data);
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin thuốc với ID ${id}:`, error);
      throw error;
    }
  },
  
  // Thêm yêu cầu thuốc mới (for parents)
  addMedicineRequest: async (medicineData) => {
    try {
      const backendData = transformMedicationRequestToBackend(medicineData);
      const response = await api.post('/parent-medication-requests/submit-request', backendData);
      return transformMedicationRequestFromBackend(response.data);
    } catch (error) {
      console.error("Lỗi khi thêm yêu cầu thuốc mới:", error);
      throw error;
    }
  },
  
  // Cập nhật yêu cầu thuốc (for parents)
  updateMedicineRequest: async (id, medicineData) => {
    try {
      const backendData = transformMedicationRequestToBackend(medicineData);
      const response = await api.put(`/parent-medication-requests/${id}`, backendData);
      return transformMedicationRequestFromBackend(response.data);
    } catch (error) {
      console.error(`Lỗi khi cập nhật thông tin thuốc với ID ${id}:`, error);
      throw error;
    }
  },

  // Xác nhận đã nhận thuốc - This might be a nurse-specific action
  confirmReceiveMedicine: async (id) => {
    try {
      // This endpoint might not exist yet - nurse confirms receipt
      const response = await api.put(`/nurse-medication-approvals/${id}/confirm-receipt`);
      return transformMedicationRequestFromBackend(response.data);
    } catch (error) {
      console.error(`Lỗi khi xác nhận đã nhận thuốc với ID ${id}:`, error);
      throw error;
    }
  },
  
  // Hủy yêu cầu thuốc (for parents)
  cancelMedicineRequest: async (id) => {
    try {
      await api.delete(`/parent-medication-requests/cancel-request/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Lỗi khi hủy yêu cầu thuốc với ID ${id}:`, error);
      throw error;
    }
  },

  // Legacy method for backward compatibility
  deleteMedicineRequest: async (id) => {
    return await receiveMedicineService.cancelMedicineRequest(id);
  },
  
  // Tìm kiếm thuốc từ phụ huynh theo các tiêu chí
  searchMedicineRequests: async (filters) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.studentId) queryParams.append('studentId', filters.studentId);
      if (filters.studentName) queryParams.append('studentName', filters.studentName);
      if (filters.medicineName) queryParams.append('medicineName', filters.medicineName);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
      if (filters.toDate) queryParams.append('toDate', filters.toDate);
      
      // Use the nurse endpoint for searching (includes all requests)
      const url = `/nurse-medication-approvals/all-requests?${queryParams.toString()}`;
      const response = await api.get(url);
      return response.data.map(transformMedicationRequestFromBackend);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm thuốc từ phụ huynh:", error);
      throw error;
    }
  },

  // ===================== NURSE MEDICATION APPROVAL FUNCTIONS =====================
  
  // Lấy danh sách yêu cầu thuốc đang chờ duyệt (cho y tá)
  getPendingMedicationRequests: async () => {
    try {
      // Try with the corrected endpoint name (no space)
      const response = await api.get('/nurse-medication-approvals/pending-requests');
      return response.data.map(transformMedicationRequestFromBackend);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách yêu cầu thuốc chờ duyệt:", error);
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền truy cập chức năng này. Chỉ y tá mới có thể duyệt thuốc.');
      } else if (error.response?.status === 404) {
        throw new Error('Endpoint /pending-requests không tồn tại. Vui lòng kiểm tra backend.');
      }
      throw new Error('Không thể tải danh sách yêu cầu thuốc. Vui lòng thử lại sau.');
    }
  },

  // Lấy danh sách yêu cầu thuốc đã được duyệt (cho y tá)
  getApprovedMedicationRequests: async () => {
    try {
      const response = await api.get('/nurse-medication-approvals/approved-requests');
      return response.data.map(transformMedicationRequestFromBackend);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách yêu cầu thuốc đã duyệt:", error);
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền truy cập chức năng này. Chỉ y tá mới có thể xem danh sách này.');
      }
      throw new Error('Không thể tải danh sách yêu cầu thuốc đã duyệt. Vui lòng thử lại sau.');
    }
  },

  // Lấy danh sách yêu cầu thuốc bị từ chối (cho y tá)
  getRejectedMedicationRequests: async () => {
    try {
      const response = await api.get('/nurse-medication-approvals/rejected-requests');
      return response.data.map(transformMedicationRequestFromBackend);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách yêu cầu thuốc bị từ chối:", error);
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền truy cập chức năng này. Chỉ y tá mới có thể xem danh sách này.');
      }
      throw new Error('Không thể tải danh sách yêu cầu thuốc bị từ chối. Vui lòng thử lại sau.');
    }
  },

  // Lấy tất cả yêu cầu thuốc (cho y tá)
  getAllMedicationRequestsForNurse: async () => {
    try {
      const response = await api.get('/nurse-medication-approvals/all-requests');
      return response.data.map(transformMedicationRequestFromBackend);
    } catch (error) {
      console.error("Lỗi khi lấy tất cả yêu cầu thuốc:", error);
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền truy cập chức năng này. Chỉ y tá mới có thể xem danh sách này.');
      }
      throw new Error('Không thể tải danh sách yêu cầu thuốc. Vui lòng thử lại sau.');
    }
  },

  // Helper function to get requests by status using appropriate endpoint
  getMedicationRequestsByStatus: async (status) => {
    try {
      switch (status) {
        case 'PENDING_APPROVAL':
        case 'pending':
          return await receiveMedicineService.getPendingMedicationRequests();
        case 'APPROVED':
        case 'approved':
          return await receiveMedicineService.getApprovedMedicationRequests();
        case 'REJECTED':
        case 'rejected':
          return await receiveMedicineService.getRejectedMedicationRequests();
        default:
          return await receiveMedicineService.getAllMedicationRequestsForNurse();
      }
    } catch (error) {
      console.error(`Lỗi khi lấy yêu cầu thuốc theo trạng thái ${status}:`, error);
      throw error;
    }
  },

  // Lấy chi tiết yêu cầu thuốc để duyệt (cho y tá)
  getMedicationRequestForReview: async (requestId) => {
    try {
      const response = await api.get(`/nurse-medication-approvals/${requestId}`);
      return transformMedicationRequestFromBackend(response.data);
    } catch (error) {
      console.error(`Lỗi khi lấy chi tiết yêu cầu thuốc ${requestId} để duyệt:`, error);
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền truy cập chi tiết này.');
      } else if (error.response?.status === 404) {
        throw new Error('Không tìm thấy yêu cầu thuốc này.');
      }
      throw new Error('Không thể tải chi tiết yêu cầu thuốc. Vui lòng thử lại sau.');
    }
  },

  // Duyệt hoặc từ chối yêu cầu thuốc (cho y tá)
  processApprovalRequest: async (requestId, approvalData) => {
    try {
      // Validate approval data
      if (!approvalData.decision || !['APPROVED', 'REJECTED'].includes(approvalData.decision)) {
        throw new Error('Decision must be APPROVED or REJECTED');
      }

      if (approvalData.decision === 'REJECTED' && !approvalData.reason?.trim()) {
        throw new Error('Reason is required for rejection');
      }

      const requestBody = {
        decision: approvalData.decision,
        reason: approvalData.reason || null
      };

      const response = await api.put(`/nurse-medication-approvals/${requestId}/process`, requestBody);
      return transformMedicationRequestFromBackend(response.data);
    } catch (error) {
      console.error(`Lỗi khi xử lý yêu cầu thuốc ${requestId}:`, error);
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền duyệt/từ chối yêu cầu này.');
      } else if (error.response?.status === 404) {
        throw new Error('Không tìm thấy yêu cầu thuốc này.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Dữ liệu yêu cầu không hợp lệ.');
      }
      throw error; // Re-throw for higher-level handling
    }
  },

  // Duyệt yêu cầu thuốc (helper function)
  approveMedicationRequest: async (requestId, reason = '') => {
    try {
      return await receiveMedicineService.processApprovalRequest(requestId, {
        decision: 'APPROVED',
        reason: reason
      });
    } catch (error) {
      console.error(`Lỗi khi duyệt yêu cầu thuốc ${requestId}:`, error);
      throw error;
    }
  },

  // Từ chối yêu cầu thuốc (helper function)
  rejectMedicationRequest: async (requestId, reason) => {
    try {
      if (!reason?.trim()) {
        throw new Error('Lý do từ chối là bắt buộc');
      }

      return await receiveMedicineService.processApprovalRequest(requestId, {
        decision: 'REJECTED',
        reason: reason
      });
    } catch (error) {
      console.error(`Lỗi khi từ chối yêu cầu thuốc ${requestId}:`, error);
      throw error;
    }
  },

  // ===================== MEDICATION HISTORY FUNCTIONS =====================
  
  // Lấy lịch sử dùng thuốc - Using all-requests endpoint as confirmed by backend team
  getMedicationHistory: async (filters = {}) => {
    try {
      // Use the all-requests endpoint which contains the complete medication history
      // This endpoint returns all medication requests regardless of status
      const response = await api.get('/nurse-medication-approvals/all-requests');
      let medicationHistory = response.data;
      
      // Apply filters if provided
      if (filters.studentId) {
        medicationHistory = medicationHistory.filter(med => 
          med.studentId && med.studentId.toString().includes(filters.studentId)
        );
      }
      
      if (filters.fromDate) {
        medicationHistory = medicationHistory.filter(med => 
          med.responseDate && new Date(med.responseDate) >= new Date(filters.fromDate)
        );
      }
      
      if (filters.toDate) {
        medicationHistory = medicationHistory.filter(med => 
          med.responseDate && new Date(med.responseDate) <= new Date(filters.toDate)
        );
      }
      
      if (filters.status) {
        medicationHistory = medicationHistory.filter(med => 
          med.status === filters.status
        );
      }
      
      // Transform backend data to medication history format
      return medicationHistory.map(med => ({
        id: `med${med.id}`,
        studentId: med.studentId || `HS${String(med.id).padStart(3, '0')}`,
        studentName: med.studentName,
        class: med.studentClass || 'Chưa có',
        medicineName: med.medicationName,
        dosage: med.dosageInstructions,
        administrationTime: med.responseDate || med.submittedAt, // When it was processed or submitted
        administeredBy: med.approvedBy || 'Chưa xử lý',
        status: med.status === 'APPROVED' ? 'completed' : (med.status === 'PENDING_APPROVAL' ? 'scheduled' : 'cancelled'),
        notes: med.specialInstructions || med.rejectionReason || ''
      }));
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử dùng thuốc:", error);
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền truy cập lịch sử dùng thuốc.');
      }
      throw new Error('Không thể tải lịch sử dùng thuốc. Vui lòng thử lại sau.');
    }
  },

  // Đánh dấu đã thực hiện dùng thuốc
  markMedicationAsCompleted: async (medicationId, notes = '') => {
    try {
      const response = await api.put(`/medication-history/${medicationId}/complete`, {
        notes: notes
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi đánh dấu thuốc ${medicationId} đã hoàn thành:`, error);
      throw error;
    }
  }
};

export default receiveMedicineService;
