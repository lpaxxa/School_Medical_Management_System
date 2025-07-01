// Service API cho sự kiện y tế
// Sử dụng axios thông qua api.js instance để tận dụng cấu hình chung
import api from './../api.js';

// Mock data cho trường hợp API fail
const mockMedicalEvents = [
  {
    incidentId: 1,
    studentId: 'STU2024001',
    studentName: 'Nguyễn Văn A',
    dateTime: '2025-06-15T10:30:00',
    incidentType: 'ILLNESS',
    description: 'Sốt nhẹ 38 độ C, đau đầu',
    severityLevel: 'MILD',
    parentNotified: true,
    requiresFollowUp: false,
    followUpNotes: '',
    treatment: 'Cho uống thuốc hạ sốt và nghỉ ngơi tại phòng y tế'
  },
  {
    incidentId: 2,
    studentId: 'STU2024002',
    studentName: 'Trần Thị B',
    dateTime: '2025-06-16T14:15:00',
    incidentType: 'INJURY',
    description: 'Té ngã trên sân trường, bị trầy xước đầu gối',
    severityLevel: 'MODERATE',
    parentNotified: true,
    requiresFollowUp: true,
    followUpNotes: 'Kiểm tra vết thương sau 2 ngày',
    treatment: 'Làm sạch vết thương, băng bó và theo dõi'
  },
  {
    incidentId: 3,
    studentId: 'STU2024003', 
    studentName: 'Lê Hoàng Minh',
    dateTime: '2025-06-17T11:45:00',
    incidentType: 'ALLERGY',
    description: 'Phản ứng dị ứng với thức ăn',
    severityLevel: 'MILD',
    parentNotified: true,
    requiresFollowUp: false,
    followUpNotes: '',
    treatment: 'Uống thuốc chống dị ứng'
  },
  {
    incidentId: 4,
    studentId: 'STU2024004',
    studentName: 'Hoàng Văn Đức',
    dateTime: '2025-06-18T09:20:00',
    incidentType: 'INJURY',
    description: 'Bị thương ở chân khi chơi bóng đá',
    severityLevel: 'MODERATE',
    parentNotified: true,
    requiresFollowUp: true,
    followUpNotes: 'Cần kiểm tra lại sau 1 tuần',
    treatment: 'Băng bó và nghỉ ngơi'
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
      
      // Đảm bảo trả về đúng format dữ liệu như API
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
        
        // Luôn luôn trả về mock data thay vì throw error
        console.warn("API lỗi, trả về mock data");
      } else {
        console.warn("Không có response từ server, trả về mock data");
      }
      
      // Luôn trả về mock data khi có lỗi
      console.warn("Trả về mock data do API không hoạt động");
      const mockEvent = {
        incidentId: parseInt(id) || 1,
        incidentType: "Té ngã sân chơi",
        dateTime: "2024-03-18T10:30:00",
        description: "Học sinh té ngã khi chơi xích đu, trầy xước đầu gối",
        symptoms: "Đau đầu gối, chảy máu nhẹ",
        severityLevel: "Nhẹ",
        treatment: "Rửa vết thương, băng gạc, dán băng keo",
        parentNotified: true,
        requiresFollowUp: false,
        followUpNotes: "",
        staffId: 1,
        staffName: "Nguyễn Thị Lan Anh",
        parentID: 1,
        imgUrl: "/images/students/nguyen_minh_an.jpg",
        studentId: "HS001",
        studentName: "Nguyễn Minh An",
        medicationsUsed: "Betadine 10% (1), Băng gạc y tế (2)"
      };
      
      return mockEvent;
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
      
      // Format medications data correctly for ADD - Backend expects STRING format
      let medicationsUsed = '';
      if (eventData.medicationsUsed) {
        if (Array.isArray(eventData.medicationsUsed)) {
          // Convert array to string format "Medication Name (quantity)"
          medicationsUsed = eventData.medicationsUsed
            .map(med => `${med.name || 'Unknown'} (${med.quantity || med.quantityUsed || 1})`)
            .join(', ');
        } else if (typeof eventData.medicationsUsed === 'string') {
          // If already string, use as is
          medicationsUsed = eventData.medicationsUsed;
        }
      }

      // Format data for backend
      const formattedData = {
        ...eventData,
        medicationsUsed: medicationsUsed  // Send as string like "Betadine 10% (10)"
      };
      
      console.log('Formatted ADD data for API (medicationsUsed as string):', formattedData);
      
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
      
      // For UPDATE: Backend expects medicationsUsed as ARRAY format
      let medicationsUsed = [];
      if (eventData.medicationsUsed) {
        if (Array.isArray(eventData.medicationsUsed)) {
          // Keep as array - backend expects: [{itemID, quantityUsed}]
          medicationsUsed = eventData.medicationsUsed;
        } else if (typeof eventData.medicationsUsed === 'string') {
          // If string, convert to empty array (should not happen for update)
          console.warn('Update received string medicationsUsed, expected array');
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
        medicationsUsed: medicationsUsed  // Send as array: [{itemID, quantityUsed}]
      };
      
      console.log('Formatted UPDATE data for API (medicationsUsed as array):', formattedData);
      
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
    }
  },
  
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
  },

  // Thêm mới: Tìm kiếm sự kiện theo tên học sinh
  searchByStudentName: async (name) => {
    console.log("=== SERVICE: searchByStudentName ===");
    console.log("Input name:", name);
    console.log("API URL will be:", `/medical-incidents/student/name/${encodeURIComponent(name)}`);
    
    try {
      console.log('Gọi API tìm kiếm sự kiện y tế theo tên học sinh:', name);
      const response = await api.get(`/medical-incidents/student/name/${encodeURIComponent(name)}`);
      console.log('Kết quả tìm kiếm theo tên học sinh:', response.data);
      console.log("=== END SERVICE: searchByStudentName SUCCESS ===");
      
      // Đảm bảo trả về array
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
        return response.data.content;
      } else {
        return [response.data].filter(Boolean);
      }
    } catch (error) {
      console.error("=== SERVICE ERROR: searchByStudentName ===");
      console.error("Lỗi khi tìm kiếm sự kiện y tế theo tên học sinh:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Filter mock data nếu API lỗi
      console.warn("API lỗi, trả về mock data filtered");
      const filteredMockData = mockMedicalEvents.filter(event => 
        event.studentName && event.studentName.toLowerCase().includes(name.toLowerCase())
      );
      console.log("Filtered mock data:", filteredMockData);
      console.log("=== END SERVICE: searchByStudentName ERROR ===");
      return filteredMockData;
    }
  },

  // Thêm mới: Tìm kiếm sự kiện theo trạng thái follow-up
  searchByFollowUpStatus: async (requiresFollowUp) => {
    console.log("=== SERVICE: searchByFollowUpStatus ===");
    console.log("Input requiresFollowUp:", requiresFollowUp);
    console.log("API URL will be:", `/medical-incidents/follow-up-notes/${requiresFollowUp}`);
    
    try {
      console.log('Gọi API tìm kiếm sự kiện y tế theo trạng thái follow-up:', requiresFollowUp);
      const response = await api.get(`/medical-incidents/follow-up-notes/${requiresFollowUp}`);
      console.log('Kết quả tìm kiếm theo follow-up:', response.data);
      console.log("=== END SERVICE: searchByFollowUpStatus SUCCESS ===");
      
      // Đảm bảo trả về array
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
        return response.data.content;
      } else {
        return [response.data].filter(Boolean);
      }
    } catch (error) {
      console.error("=== SERVICE ERROR: searchByFollowUpStatus ===");
      console.error("Lỗi khi tìm kiếm sự kiện y tế theo follow-up:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Filter mock data nếu API lỗi
      console.warn("API lỗi, trả về mock data filtered");
      const needsFollowUp = requiresFollowUp === true || requiresFollowUp === 'true';
      const filteredMockData = mockMedicalEvents.filter(event => 
        event.requiresFollowUp === needsFollowUp
      );
      console.log("Follow-up filter value:", needsFollowUp);
      console.log("Filtered mock data:", filteredMockData);
      console.log("=== END SERVICE: searchByFollowUpStatus ERROR ===");
      return filteredMockData;
    }
  }
};

export default medicalEventsService;
