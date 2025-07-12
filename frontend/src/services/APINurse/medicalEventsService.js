// Service API cho sự kiện y tế
// Sử dụng axios thông qua api.js instance để tận dụng cấu hình chung
import api from './../api.js';

const medicalEventsService = {
  // Lấy tất cả sự kiện y tế  
  getAllEvents: async () => {
    try {
      console.log('Gọi API lấy tất cả sự kiện y tế');
      const response = await api.get('/medical-incidents');
      console.log('Kết quả API:', response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sự kiện y tế:", error);
      
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data
        });
      }
      
      throw error;
    }
  },
  
  // Lấy sự kiện theo ID
  getEventById: async (id) => {
    try {
      console.log(`Gọi API lấy sự kiện y tế ID: ${id}`);
      const response = await api.get(`/medical-incidents/${id}`);
      console.log('Kết quả API chi tiết:', response.data);
      
      // Trả về dữ liệu theo format mới
      if (response.data) {
        return response.data;
      } else {
        throw new Error('No data returned from API');
      }
    } catch (error) {
      console.error(`Lỗi khi lấy sự kiện y tế với ID ${id}:`, error);
      
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data
        });
      }
      
      throw error;
    }
  },
  
  // Tìm kiếm sự kiện
  searchEvents: async (filters) => {
    try {
      console.log('Tìm kiếm sự kiện y tế với filters:', filters);
      const response = await api.get('/medical-incidents/search', { params: filters });
      console.log('Kết quả tìm kiếm:', response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sự kiện y tế:", error);
      
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data
        });
      }
      
      throw error;
    }
  },
  
  // Hàm mới để tìm kiếm sự kiện theo loại (severity)
  searchByType: async (typeValue) => {
    try {
      console.log('Tìm kiếm sự kiện y tế theo loại:', typeValue);
      const response = await api.get(`/medical-incidents/types/${encodeURIComponent(typeValue)}`);
      console.log('Kết quả tìm kiếm theo loại:', response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sự kiện y tế theo loại:", error);
      
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data
        });
      }
      
      throw error;
    }
  },
  
  // Thêm sự kiện mới
  addEvent: async (eventData) => {
    try {
      console.log('Gọi API thêm sự kiện y tế mới với data:', eventData);
      
      // Format medications data correctly for ADD - Backend expects ARRAY format (like UPDATE)
      let medicationsUsed = [];
      if (eventData.medicationsUsed) {
        if (Array.isArray(eventData.medicationsUsed)) {
          // Keep as array - backend expects: [{itemID, quantityUsed}]
          medicationsUsed = eventData.medicationsUsed.map(med => ({
            itemID: med.itemID,
            quantityUsed: med.quantityUsed || med.quantity || 1
          }));
        } else if (typeof eventData.medicationsUsed === 'string') {
          // If string, convert to empty array (should not happen for add)
          console.warn('Add received string medicationsUsed, expected array');
          medicationsUsed = [];
        }
      }

      // Make sure we're sending data in the correct format for backend
      const formattedData = {
        incidentType: eventData.incidentType || '',
        description: eventData.description || '',
        symptoms: eventData.symptoms || '',
        severityLevel: eventData.severityLevel || '',
        treatment: eventData.treatment || '',
        parentNotified: Boolean(eventData.parentNotified),
        requiresFollowUp: Boolean(eventData.requiresFollowUp),
        followUpNotes: eventData.followUpNotes || '',
        handledById: parseInt(eventData.handledById) || 1,
        studentId: eventData.studentId || '',
        imageMedicalUrl: eventData.imageMedicalUrl || '',
        medicationsUsed: medicationsUsed  // Send as array: [{itemID, quantityUsed}]
      };
      
      console.log('Formatted ADD data for API (medicationsUsed as array):', formattedData);
      
      // Bỏ /api/v1 vì đã có trong baseURL
      const response = await api.post('/medical-incidents/create', formattedData);
      console.log('Kết quả thêm sự kiện:', response.data);
      return { success: true, event: response.data };
    } catch (error) {
      console.error("Lỗi khi thêm sự kiện y tế mới:", error);
      
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data
        });
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      
      throw error;
    }
  },
  
  // Cập nhật sự kiện
  updateEvent: async (id, eventData) => {
    try {
      console.log(`Gọi API cập nhật sự kiện y tế ID: ${id} với data:`, eventData);
      
      // Format data theo yêu cầu mới của API
      const formattedData = {
        incidentType: eventData.incidentType || '',
        description: eventData.description || '',
        symptoms: eventData.symptoms || '',
        severityLevel: eventData.severityLevel || '',
        treatment: eventData.treatment || '',
        parentNotified: Boolean(eventData.parentNotified),
        requiresFollowUp: Boolean(eventData.requiresFollowUp),
        followUpNotes: eventData.followUpNotes || '',
        handledById: parseInt(eventData.handledById) || 1,
        studentId: eventData.studentId || '',
        imageMedicalUrl: eventData.imageMedicalUrl || '',
        medicationsUsed: Array.isArray(eventData.medicationsUsed) 
          ? eventData.medicationsUsed.filter(med => med && med.itemID)
              .map(med => {
                // Đảm bảo cả hai giá trị đều là số nguyên 
                const itemID = typeof med.itemID === 'string' ? parseInt(med.itemID.trim(), 10) : parseInt(med.itemID, 10);
                const quantityUsed = typeof med.quantityUsed === 'string' ? parseInt(med.quantityUsed.trim(), 10) : parseInt(med.quantityUsed, 10);
                
                // Đảm bảo giá trị hợp lệ
                if (isNaN(itemID) || isNaN(quantityUsed)) {
                  console.warn(`Skip invalid medication: ${JSON.stringify(med)}`);
                  return null;
                }
                
                return {
                  itemID: itemID,
                  quantityUsed: quantityUsed < 1 ? 1 : quantityUsed // Đảm bảo số lượng tối thiểu là 1
                };
              }).filter(Boolean) // Loại bỏ các giá trị null/undefined
          : []
      };
      
      console.log('Formatted data for API:', formattedData);
      const response = await api.put(`/medical-incidents/update/${id}`, formattedData);
      
      console.log('Kết quả cập nhật sự kiện:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật sự kiện y tế với ID ${id}:`, error);
      
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data
        });
      }
      
      throw error;
    }  },

  // Xóa sự kiện
  deleteEvent: async (id) => {
    try {
      console.log(`Gọi API xóa sự kiện y tế ID: ${id}`);
      await api.delete(`/medical-incidents/delete/${id}`);
      console.log('Xóa sự kiện thành công');
      return { success: true, message: "Xóa thành công" };
    } catch (error) {
      console.error(`Lỗi khi xóa sự kiện y tế với ID ${id}:`, error);
      
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data
        });
      }
      
      throw error;
    }
  }
};

export default medicalEventsService;
