// Service API cho sự kiện y tế
// Sử dụng axios thông qua api.js instance để tận dụng cấu hình chung
import api from './api.js';

// Mock data cho trường hợp API fail
const mockMedicalEvents = [
  {
    id: 1,
    studentId: 'STU2024001',
    studentName: 'Nguyễn Văn A',
    incidentDate: '2025-06-15T10:30:00',
    incidentType: 'ILLNESS',
    description: 'Sốt nhẹ 38 độ C, đau đầu',
    severityLevel: 'MILD',
    actionTaken: 'Cho uống thuốc hạ sốt và nghỉ ngơi tại phòng y tế',
    outcome: 'Đã hồi phục, quay lại lớp sau 1 giờ',
    parentNotified: true,
    notificationTime: '2025-06-15T10:45:00',
    notifiedBy: 'Nguyễn Thị Y Tá',
    requiresFollowUp: false,
    followUpNotes: '',
    class: '10A1'
  },
  {
    id: 2,
    studentId: 'STU2024002',
    studentName: 'Trần Thị B',
    incidentDate: '2025-06-16T14:15:00',
    incidentType: 'INJURY',
    description: 'Té ngã trên sân trường, bị trầy xước đầu gối',
    severityLevel: 'MODERATE',
    actionTaken: 'Làm sạch vết thương, băng bó và theo dõi',
    outcome: 'Đã xử lý vết thương, cần theo dõi thêm',
    parentNotified: true,
    notificationTime: '2025-06-16T14:30:00',
    notifiedBy: 'Nguyễn Thị Y Tá',
    requiresFollowUp: true,
    followUpNotes: 'Kiểm tra vết thương sau 2 ngày',
    class: '11B2'
  }
];

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
      
      // Fallback về mock data để không làm crash ứng dụng
      console.warn("Trả về mock data do lỗi API");
      return [...mockMedicalEvents];
    }
  },
  
  // Lấy sự kiện theo ID
  getEventById: async (id) => {
    try {
      console.log(`Gọi API lấy sự kiện y tế ID: ${id}`);
      const response = await api.get(`/medical-incidents/${id}`);
      console.log('Kết quả API chi tiết:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy sự kiện y tế với ID ${id}:`, error);
      
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data
        });
      }
      
      // Tìm trong mock data nếu API lỗi
      const mockEvent = mockMedicalEvents.find(event => event.id === parseInt(id));
      if (mockEvent) return {...mockEvent};
      
      throw new Error("Không tìm thấy sự kiện y tế");
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
      
      // Return mock data khi có lỗi
      return mockMedicalEvents.filter(event => {
        let match = true;
        // Lọc theo tất cả các trường filter nếu chúng được cung cấp
        if (filters.studentId && event.studentId !== filters.studentId) match = false;
        if (filters.incidentType && !event.incidentType.toLowerCase().includes(filters.incidentType.toLowerCase())) match = false;
        if (filters.severityLevel && !event.severityLevel.toLowerCase().includes(filters.severityLevel.toLowerCase())) match = false;
        return match;
      });
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
      
      // Return empty array on error
      return [];
    }
  },
  
  // Thêm sự kiện mới
  addEvent: async (eventData) => {
    try {
      console.log('Gọi API thêm sự kiện y tế mới với data:', eventData);
      // Bỏ /api/v1 vì đã có trong baseURL
      const response = await api.post('/medical-incidents/create', eventData);
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
      const response = await api.put(`/medical-incidents/${id}`, eventData);
      console.log('Kết quả cập nhật sự kiện:', response.data);
      return { success: true, event: response.data };
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
    }
  },
  
  // Xóa sự kiện
  deleteEvent: async (id) => {
    try {
      console.log(`Gọi API xóa sự kiện y tế ID: ${id}`);
      await api.delete(`/medical-incidents/${id}`);
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
  },

  // Thêm mới: Tìm kiếm sự kiện theo tên học sinh
  searchByStudentName: async (name) => {
    try {
      console.log('Tìm kiếm sự kiện y tế theo tên học sinh:', name);
      const response = await api.get(`/medical-incidents/student/name/${name}`);
      console.log('Kết quả tìm kiếm theo tên học sinh:', response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sự kiện y tế theo tên học sinh:", error);
      
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data
        });
      }
      
      // Filter mock data nếu API lỗi
      return mockMedicalEvents.filter(event => 
        event.studentName && event.studentName.toLowerCase().includes(name.toLowerCase())
      );
    }
  }
};

export default medicalEventsService;
