import api from './api';

// Service API cho quản lý thuốc từ phụ huynh
const receiveMedicineService = {  // Tìm kiếm thuốc theo tên
  searchMedicationByName: async (searchTerm) => {
    try {
      const encodedTerm = encodeURIComponent(searchTerm);
      const response = await api.get(`/api/v1/medication-items/get-by-name/${encodedTerm}`);
      return response.data || [];
    } catch (error) {
      console.error("Lỗi khi tìm kiếm thuốc:", error);
      return [];
    }
  },
    // Lấy danh sách thuốc từ phụ huynh
  getAllMedicineRequests: async () => {
    try {
      const response = await api.get('/api/v1/receive-medicine/all');
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thuốc từ phụ huynh:", error);
      throw error;
    }
  },
    // Lấy chi tiết yêu cầu thuốc theo ID
  getMedicineRequestById: async (id) => {
    try {
      const response = await api.get(`/api/v1/receive-medicine/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin thuốc với ID ${id}:`, error);
      throw error;
    }
  },
  
  // Thêm yêu cầu thuốc mới
  addMedicineRequest: async (medicineData) => {
    try {
      const response = await api.post('/api/v1/receive-medicine/create', medicineData);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi thêm yêu cầu thuốc mới:", error);
      throw error;
    }
  },
  
  // Cập nhật yêu cầu thuốc
  updateMedicineRequest: async (id, medicineData) => {
    try {
      const response = await api.put(`/api/v1/receive-medicine/update/${id}`, medicineData);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật thông tin thuốc với ID ${id}:`, error);
      throw error;
    }
  },
    // Xác nhận đã nhận thuốc
  confirmReceiveMedicine: async (id) => {
    try {
      const response = await api.put(`/api/v1/receive-medicine/confirm/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xác nhận đã nhận thuốc với ID ${id}:`, error);
      throw error;
    }
  },
  
  // Xóa yêu cầu thuốc
  deleteMedicineRequest: async (id) => {
    try {
      await api.delete(`/api/v1/receive-medicine/delete/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Lỗi khi xóa yêu cầu thuốc với ID ${id}:`, error);
      throw error;
    }
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
      
      const url = `/api/v1/receive-medicine/search?${queryParams.toString()}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tìm kiếm thuốc từ phụ huynh:", error);
      throw error;
    }
  }
};

export default receiveMedicineService;
