import api from './api';

// Service API cho sự kiện y tế
const medicalEventsService = {  // Lấy tất cả sự kiện
  getAllEvents: async () => {
    try {
      const response = await api.get(`/medical-incidents`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sự kiện y tế:", error);
      throw error;
    }
  },  // Lấy danh sách loại sự kiện
  getEventTypes: async () => {
    try {
      const response = await api.get(`/medical-incidents/types`);
      return response.data || [];
    } catch (error) {
      console.error("Lỗi khi lấy danh sách loại sự kiện:", error);
      return [];
    }
  },

  // Lấy danh sách mức độ nghiêm trọng
  getSeverityLevels: async () => {
    try {
      const response = await api.get(`/medical-incidents/severity-levels`);
      return response.data || [];
    } catch (error) {
      console.error("Lỗi khi lấy danh sách mức độ nghiêm trọng:", error);
      return [];
    }
  },  // Lấy sự kiện theo ID
  getEventById: async (id) => {
    try {
      const response = await api.get(`/medical-incidents/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy sự kiện y tế với ID ${id}:`, error);
      throw new Error("Không tìm thấy sự kiện y tế");
    }
  },
  // Tìm kiếm sự kiện
  searchEvents: async (filters) => {
    try {
      // Prepare query parameters for API call
      const queryParams = new URLSearchParams();
      
      if (filters.studentId) queryParams.append('studentId', filters.studentId);
      if (filters.incidentType) queryParams.append('incidentType', filters.incidentType);
      if (filters.severityLevel) queryParams.append('severityLevel', filters.severityLevel);
      if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
      if (filters.toDate) queryParams.append('toDate', filters.toDate);
      if (filters.parentNotified !== undefined && filters.parentNotified !== '') 
        queryParams.append('parentNotified', filters.parentNotified);
      if (filters.requiresFollowUp !== undefined && filters.requiresFollowUp !== '') 
        queryParams.append('requiresFollowUp', filters.requiresFollowUp);
        const url = `/medical-incidents/search?${queryParams.toString()}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sự kiện y tế:", error);
      throw error;
    }
  },    // Thêm sự kiện mới
  addEvent: async (eventData) => {
    try {
      const response = await api.post(`/medical-incidents`, eventData);
      return { success: true, event: response.data };
    } catch (error) {
      console.error("Lỗi khi thêm sự kiện y tế mới:", error);
      throw error;
    }
  },
  // Cập nhật sự kiện
  updateEvent: async (id, eventData) => {
    try {
      const response = await api.put(`/medical-incidents/${id}`, eventData);
      return { success: true, event: response.data };
    } catch (error) {
      console.error(`Lỗi khi cập nhật sự kiện y tế với ID ${id}:`, error);
      throw error;
    }
  },
  // Xóa sự kiện
  deleteEvent: async (id) => {
    try {
      await api.delete(`/medical-incidents/${id}`);
      return { success: true, message: "Xóa thành công" };
    } catch (error) {
      console.error(`Lỗi khi xóa sự kiện y tế với ID ${id}:`, error);
      throw error;
    }
  }
};

export default medicalEventsService;