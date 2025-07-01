// Service API cho quản lý thuốc từ phụ huynh
import api from './../api.js';

// URL cơ sở cho tất cả API gọi
const BASE_URL = "http://localhost:8080/api/v1/nurse-medication-approvals";

// Lưu trữ mock data cho các chức năng chưa có API
const mockMedicineRequests = [
  {
    id: 1,
    studentId: 'HS001',
    studentName: 'Nguyễn Văn A',
    requestedBy: 'Nguyễn Thị B (Phụ huynh)',
    startDate: '2025-06-18',
    endDate: '2025-06-25',
    status: 0, // 0: chờ phê duyệt, 1: đã duyệt, 2: từ chối, 3: đã hủy
    notes: 'Thuốc hạ sốt Paracetamol, 3 lần/ngày sau bữa ăn',
    class: '10A1',
    medicationDetails: [
      { name: 'Paracetamol', dosage: '500mg', frequency: '3 lần/ngày', time: 'Sau ăn' }
    ],
    reason: 'Trẻ có dấu hiệu sốt nhẹ'
  },
  {
    id: 2,
    studentId: 'HS002',
    studentName: 'Trần Thị C',
    requestedBy: 'Trần Văn D (Phụ huynh)',
    startDate: '2025-06-17',
    endDate: '2025-06-24',
    status: 1,
    notes: 'Thuốc kháng sinh theo đơn của bác sĩ',
    class: '11B2',
    medicationDetails: [
      { name: 'Amoxicillin', dosage: '250mg', frequency: '2 lần/ngày', time: 'Sáng - Tối' }
    ],
    reason: 'Đang điều trị viêm họng'
  },
  {
    id: 3,
    studentId: 'HS003',
    studentName: 'Lê Văn E',
    requestedBy: 'Lê Thị F (Phụ huynh)',
    startDate: '2025-06-19',
    endDate: '2025-07-03',
    status: 0,
    notes: 'Vitamin tổng hợp để tăng cường sức đề kháng',
    class: '9A3',
    medicationDetails: [
      { name: 'Vitamin C', dosage: '500mg', frequency: '1 lần/ngày', time: 'Sau ăn sáng' },
      { name: 'Vitamin D', dosage: '400 IU', frequency: '1 lần/ngày', time: 'Sau ăn trưa' }
    ],
    reason: 'Tăng cường sức đề kháng trong mùa thi'
  },
  {
    id: 4,
    studentId: 'HS004',
    studentName: 'Phạm Thị G',
    requestedBy: 'Phạm Văn H (Phụ huynh)',
    startDate: '2025-06-15',
    endDate: '2025-06-20',
    status: 2,
    notes: 'Thuốc chống dị ứng, cần uống sau bữa sáng',
    class: '10A2',
    medicationDetails: [
      { name: 'Loratadine', dosage: '10mg', frequency: '1 lần/ngày', time: 'Sau ăn sáng' }
    ],
    reason: 'Dị ứng phấn hoa mùa hè',
    rejectionReason: 'Cần bổ sung thêm đơn thuốc từ bác sĩ'
  },
  {
    id: 5,
    studentId: 'HS005',
    studentName: 'Hoàng Văn I',
    requestedBy: 'Hoàng Thị K (Phụ huynh)',
    startDate: '2025-06-16',
    endDate: '2025-06-30',
    status: 1,
    notes: 'Thuốc điều trị hen suyễn, cần sử dụng khi có dấu hiệu khó thở',
    class: '12A1',
    medicationDetails: [
      { name: 'Ventolin', dosage: '2 nhát', frequency: 'Khi cần', time: 'Khi có triệu chứng' }
    ],
    reason: 'Học sinh bị hen suyễn, cần thuốc dự phòng'
  },
  {
    id: 6,
    studentId: 'HS006',
    studentName: 'Đặng Văn L',
    requestedBy: 'Đặng Thị M (Phụ huynh)',
    startDate: '2025-06-20',
    endDate: '2025-06-27',
    status: 0,
    notes: 'Thuốc kháng histamine điều trị viêm mũi dị ứng',
    class: '11A3',
    medicationDetails: [
      { name: 'Cetirizine', dosage: '10mg', frequency: '1 lần/ngày', time: 'Trước khi đi ngủ' }
    ],
    reason: 'Viêm mũi dị ứng theo mùa'
  },
  {
    id: 7,
    studentId: 'HS007',
    studentName: 'Vũ Thị N',
    requestedBy: 'Vũ Văn P (Phụ huynh)',
    startDate: '2025-06-14',
    endDate: '2025-06-21',
    status: 3,
    notes: 'Thuốc giảm đau cho đau bụng kinh',
    class: '11A1',
    medicationDetails: [
      { name: 'Ibuprofen', dosage: '400mg', frequency: 'Khi cần', time: 'Khi đau' }
    ],
    reason: 'Đau bụng kinh'
  },
  {
    id: 8,
    studentId: 'HS008',
    studentName: 'Ngô Văn Q',
    requestedBy: 'Ngô Thị R (Phụ huynh)',
    startDate: '2025-06-19',
    endDate: '2025-06-26',
    status: 0,
    notes: 'Probiotics để cải thiện hệ tiêu hóa',
    class: '10B2',
    medicationDetails: [
      { name: 'Probiotics', dosage: '1 gói', frequency: '2 lần/ngày', time: 'Sau ăn sáng và tối' }
    ],
    reason: 'Đang điều trị rối loạn tiêu hóa'
  }
];
// Mock data cho lịch sử dùng thuốc - Updated to match API format
const mockMedicationAdministrations = [
  {
    id: 1,
    medicationInstructionId: 1,
    medicationName: "Paracetamol 500mg",
    studentName: "Nguyễn Minh An",
    administeredAt: "2024-03-09T08:00:00",
    administeredBy: "Nguyễn Thị Lan Anh",
    administrationStatus: "SUCCESSFUL",
    notes: "Đã cho uống 1 viên khi sốt 38.7°C",
    confirmationImageUrl: "https://schoolmed.com/images/admin-001.jpg"
  },
  {
    id: 2,
    medicationInstructionId: 2,
    medicationName: "Ventolin Inhaler",
    studentName: "Nguyễn Minh Tuấn",
    administeredAt: "2024-12-30T10:00:00",
    administeredBy: "Nguyễn Thị Lan Anh",
    administrationStatus: "SUCCESSFUL",
    notes: "Đã xịt 2 nhát khi học sinh khó thở.",
    confirmationImageUrl: "https://schoolmed.com/images/admin-002.jpg"
  },
  {
    id: 3,
    medicationInstructionId: 3,
    medicationName: "Amoxicillin 500mg",
    studentName: "Lê Bảo Ngọc",
    administeredAt: "2024-03-10T07:30:00",
    administeredBy: "Nguyễn Thị Lan Anh",
    administrationStatus: "SUCCESSFUL",
    notes: "Cho uống 1 viên sáng và 1 viên tối.",
    confirmationImageUrl: "https://schoolmed.com/images/admin-003.jpg"
  },
  {
    id: 4,
    medicationInstructionId: 4,
    medicationName: "Vitamin C 500mg",
    studentName: "Lê Bảo Minh",
    administeredAt: "2024-04-02T08:00:00",
    administeredBy: "Nguyễn Thị Lan Anh",
    administrationStatus: "SUCCESSFUL",
    notes: "Uống 1 viên vào buổi sáng như chỉ định.",
    confirmationImageUrl: "https://schoolmed.com/images/admin-004.jpg"
  },
  {
    id: 5,
    medicationInstructionId: 5,
    medicationName: "ORS (Oresol)",
    studentName: "Phạm Minh Thư",
    administeredAt: "2024-03-18T11:45:00",
    administeredBy: "Nguyễn Thị Lan Anh",
    administrationStatus: "SUCCESSFUL",
    notes: "Học sinh uống 1 gói Oresol pha loãng với 200ml nước.",
    confirmationImageUrl: "https://schoolmed.com/images/admin-005.jpg"
  },
  {
    id: 6,
    medicationInstructionId: 106,
    medicationName: "Cetirizine",
    studentName: "Đặng Văn F",
    administeredAt: "2025-06-24T08:45:00",
    administeredBy: "Y tá Ngọc",
    administrationStatus: "REFUSED",
    notes: "Học sinh từ chối uống thuốc"
  },
  {
    id: 7,
    medicationInstructionId: 107,
    medicationName: "Ibuprofen",
    studentName: "Phạm Thị Mai",
    administeredAt: "2025-06-24T09:30:00",
    administeredBy: "Y tá Lan",
    administrationStatus: "PARTIAL",
    notes: "Học sinh chỉ uống một phần thuốc"
  }
];

// Thay thế hàm checkAuthToken hiện tại
const checkAuthToken = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    console.log(`Token exists: ${token.substring(0, 15)}...`);
    
    // Kiểm tra định dạng JWT
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Token không có định dạng JWT hợp lệ!');
      return false;
    }
    
    // Kiểm tra thời hạn token
    try {
      const payload = JSON.parse(atob(parts[1]));
      const expiration = payload.exp * 1000; // Chuyển đổi từ giây sang mili giây
      const now = Date.now();
      
      if (expiration < now) {
        console.warn('Token đã hết hạn!');
        return false;
      }
      
      console.log('Token hợp lệ và chưa hết hạn.');
      return true;
    } catch (err) {
      console.warn('Không thể giải mã JWT payload:', err);
      return false;
    }
  } else {
    console.warn('No authentication token found in localStorage');
    return false;
  }
};

// Gọi hàm để kiểm tra
const tokenValid = checkAuthToken();
console.log('Token valid:', tokenValid);

const receiveMedicineService = {
  // Test server connectivity - Function để kiểm tra kết nối server
  testServerConnection: async () => {
    try {
      console.log('🔍 Testing server connection...');
      console.log('🔍 API Service 1 Base URL:', apiService1.defaults.baseURL);
      
      // Test with a simple GET request to a known endpoint
      const response = await apiService1.get('/recent?page=1&size=1');
      console.log('✅ Server connection successful:', response.status);
      return {
        success: true,
        message: "Server connection successful",
        status: response.status
      };
    } catch (error) {
      console.error('❌ Server connection failed:', error);
      return {
        success: false,
        message: "Server connection failed",
        error: error.message,
        status: error.response?.status
      };
    }
  },

  // API thật để lấy tất cả yêu cầu thuốc
  getAllMedicineRequests: async () => {
    try {
      try {
        // Sử dụng axios thay vì fetch để có headers và interceptors tự động
        const response = await api.get('/nurse-medication-approvals/all-requests');
        
        console.log('API getAllMedicineRequests response:', response.data);
        
        if (!response.data) {
          throw new Error('Không có dữ liệu từ API');
        }
        
        return response.data;
      } catch (apiError) {
        console.error("API call failed, fallback to mock data:", apiError);
        // Log chi tiết hơn về lỗi API để debug
        if (apiError.response) {
          // Server trả về lỗi
          console.error('Error response:', {
            status: apiError.response.status,
            headers: apiError.response.headers,
            data: apiError.response.data
          });
        } else if (apiError.request) {
          // Request được gửi nhưng không nhận được response
          console.error('Error request:', apiError.request);
        } else {
          // Lỗi khác khi cài đặt request
          console.error('Error message:', apiError.message);
        }
        
        // Fallback to mock data
        return [...mockMedicineRequests];
      }
    } catch (error) {
      console.error("Error in getAllMedicineRequests:", error);
      // Luôn trả về mock data để tránh lỗi
      return [...mockMedicineRequests];
    }
  },

  // TODO: Chờ API - Tìm kiếm thuốc theo tên
  searchMedicationByName: async (searchTerm) => {
    console.log("TODO: Implement real API - Searching medication by name:", searchTerm);
    
    // Dữ liệu mẫu cho các mục thuốc
    const mockMedicationItems = [
      { id: 1, name: "Paracetamol", dosage: "500mg", quantity: 120, expiryDate: "2026-05-20" },
      { id: 2, name: "Amoxicillin", dosage: "250mg", quantity: 60, expiryDate: "2026-03-15" },
      { id: 3, name: "Cetirizine", dosage: "10mg", quantity: 90, expiryDate: "2026-10-10" },
      { id: 4, name: "Vitamin C", dosage: "500mg", quantity: 200, expiryDate: "2027-01-30" },
      { id: 5, name: "Loratadine", dosage: "10mg", quantity: 50, expiryDate: "2026-08-12" }
    ];
    
    // Lọc theo từ khóa tìm kiếm nếu có
    if (searchTerm && searchTerm.trim() !== '') {
      return mockMedicationItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return mockMedicationItems;
  },
  // TODO: Chờ API - Lấy chi tiết yêu cầu thuốc theo ID
  getMedicineRequestById: async (id) => {
    console.log("TODO: Implement real API - Getting medicine request by ID:", id);
    const mockRequest = mockMedicineRequests.find(req => req.id === Number(id));
    
    if (mockRequest) {
      return {...mockRequest};
    } else {
      throw new Error(`Không tìm thấy yêu cầu thuốc với ID ${id}`);
    }
  },
  // TODO: Chờ API - Thêm yêu cầu thuốc mới
  addMedicineRequest: async (medicineData) => {
    console.log("TODO: Implement real API - Adding new medicine request");
    try {
      // Thử gọi API thật
      try {
        const data = await fetch(`${BASE_URL}/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(medicineData)
        });
        
        if (!data.ok) {
          throw new Error('Network response was not ok');
        }
        
        const responseData = await data.json();
        return responseData;
      } catch (apiError) {
        console.log("Không thể kết nối tới API thật để thêm yêu cầu, xử lý dữ liệu mẫu", apiError);
        
        // Xử lý trên dữ liệu mẫu
        const newId = Math.max(...mockMedicineRequests.map(item => item.id)) + 1;
        const newMedicineRequest = {
          id: newId,
          status: 0, // Mặc định là chờ phê duyệt
          ...medicineData,
          startDate: medicineData.startDate || new Date().toISOString().split('T')[0],
          endDate: medicineData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        
        mockMedicineRequests.push(newMedicineRequest);
        return { 
          success: true, 
          message: "Đã thêm yêu cầu thuốc mới thành công", 
          data: newMedicineRequest 
        };
      }
    } catch (error) {
      console.error("Lỗi khi thêm yêu cầu thuốc mới:", error);
      return { success: false, message: error.message };
    }
  },
  
  // TODO: Chờ API - Cập nhật yêu cầu thuốc
  updateMedicineRequest: async (id, medicineData) => {
    console.log("TODO: Implement real API - Updating medicine request");
    try {
      // Thử gọi API thật
      try {
        const data = await fetch(`${BASE_URL}/update/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(medicineData)
        });
        
        if (!data.ok) {
          throw new Error('Network response was not ok');
        }
        
        const responseData = await data.json();
        return responseData;
      } catch (apiError) {
        console.log(`Không thể kết nối tới API thật để cập nhật yêu cầu ${id}, xử lý dữ liệu mẫu`, apiError);
        
        // Xử lý trên dữ liệu mẫu
        const index = mockMedicineRequests.findIndex(req => req.id === Number(id));
        if (index !== -1) {
          mockMedicineRequests[index] = { 
            ...mockMedicineRequests[index], 
            ...medicineData,
            id: Number(id) // Đảm bảo ID không thay đổi
          };
          return { 
            success: true, 
            message: "Đã cập nhật yêu cầu thuốc thành công", 
            data: mockMedicineRequests[index] 
          };
        } else {
          throw new Error(`Không tìm thấy yêu cầu thuốc với ID ${id}`);
        }
      }
    } catch (error) {
      console.error(`Lỗi khi cập nhật thông tin thuốc với ID ${id}:`, error);
      return { success: false, message: error.message };
    }
  },  // Xử lý yêu cầu thuốc (phê duyệt/từ chối)
  processMedicineRequest: async (id, requestData) => {
    try {
      console.log(`Processing medicine request ${id} with data:`, requestData);
      
      // Format payload theo đúng yêu cầu API
      const payload = {
        decision: requestData.decision,
        ...(requestData.decision === 'REJECTED' && requestData.reason ? { reason: requestData.reason } : {})
      };
      
      console.log('Preparing payload for API:', payload);
      
      try {
        // Sử dụng axios qua instance api thay vì fetch để tận dụng interceptor
        const response = await api.put(`/nurse-medication-approvals/${id}/process`, payload);
        
        console.log('Response status:', response.status);
        console.log('API Response data:', response.data);
        
        return {
          success: true,
          message: `Đã ${requestData.decision === 'APPROVED' ? 'phê duyệt' : 'từ chối'} yêu cầu thuốc thành công`,
          data: response.data
        };      } catch (apiError) {
        console.log('API call failed, fallback to mock data', apiError);
        
        // Log chi tiết hơn về lỗi API để debug
        if (apiError.response) {
          // Server trả về lỗi
          console.error('Error response:', {
            status: apiError.response.status,
            headers: apiError.response.headers,
            data: apiError.response.data
          });
        } else if (apiError.request) {
          // Request được gửi nhưng không nhận được response
          console.error('Error request:', apiError.request);
        } else {
          // Lỗi khác khi cài đặt request
          console.error('Error message:', apiError.message);
        }
        
        // FALLBACK: Sử dụng mock data khi API thất bại
        // Tìm request trong mock data
        const index = mockMedicineRequests.findIndex(req => req.id === Number(id));
        if (index !== -1) {
          // Cập nhật trạng thái theo quyết định
          const newStatus = requestData.decision === 'APPROVED' ? 1 : 2;
          
          // Cập nhật mock data
          mockMedicineRequests[index] = {
            ...mockMedicineRequests[index],
            status: newStatus,
            ...(requestData.decision === 'REJECTED' && { 
              rejectionReason: requestData.reason || 'Không đáp ứng yêu cầu' 
            })
          };
          
          console.log(`Mock: Updated request ${id} status to ${newStatus}`);
          
          return {
            success: true,
            message: `Đã ${requestData.decision === 'APPROVED' ? 'phê duyệt' : 'từ chối'} yêu cầu thuốc thành công (dữ liệu mẫu)`,
            data: mockMedicineRequests[index]
          };
        } else {
          throw new Error(`Không tìm thấy yêu cầu thuốc với ID ${id}`);
        }
      }
    } catch (error) {
      console.error(`Lỗi khi xử lý yêu cầu thuốc với ID ${id}:`, error);
      return { 
        success: false, 
        message: error.message || 'Không thể xử lý yêu cầu thuốc'
      };
    }
  },
  // TODO: Chờ API - Xóa yêu cầu thuốc
  deleteMedicineRequest: async (id) => {
    console.log("TODO: Implement real API - Deleting medicine request");
    try {
      // Xử lý trực tiếp trên dữ liệu mẫu
      const index = mockMedicineRequests.findIndex(req => req.id === Number(id));
      if (index !== -1) {
        mockMedicineRequests.splice(index, 1);
        return { success: true, message: 'Đã xóa yêu cầu thuốc thành công' };
      } else {
        throw new Error(`Không tìm thấy yêu cầu thuốc với ID ${id}`);
      }
    } catch (error) {
      console.error(`Lỗi khi xóa yêu cầu thuốc với ID ${id}:`, error);
      return { success: false, message: error.message };
    }
  },
  
  // TODO: Chờ API - Tìm kiếm thuốc từ phụ huynh theo các tiêu chí
  searchMedicineRequests: async (filters) => {
    console.log("TODO: Implement real API - Searching medicine requests with filters");
    try {
      console.log("Tìm kiếm trên dữ liệu mẫu với các bộ lọc:", filters);
        
      // Tìm kiếm trên dữ liệu mẫu
      let filteredData = [...mockMedicineRequests];
        
      // Áp dụng các điều kiện lọc
      if (filters.studentId) {
        filteredData = filteredData.filter(item => 
          item.studentId.toLowerCase().includes(filters.studentId.toLowerCase())
        );
      }
        
      if (filters.studentName) {
        filteredData = filteredData.filter(item => 
          item.studentName.toLowerCase().includes(filters.studentName.toLowerCase())
        );
      }
        
      if (filters.medicineName && Array.isArray(filteredData[0]?.medicationDetails)) {
        filteredData = filteredData.filter(item => 
          item.medicationDetails.some(med => 
            med.name.toLowerCase().includes(filters.medicineName.toLowerCase())
          )
        );
      }
        
      if (filters.status !== undefined) {
        filteredData = filteredData.filter(item => 
          item.status === parseInt(filters.status)
        );
      }
        
      // Lọc theo ngày nếu có
      if (filters.fromDate) {
        const fromDate = new Date(filters.fromDate);
        filteredData = filteredData.filter(item => 
          new Date(item.startDate) >= fromDate
        );
      }
        
      if (filters.toDate) {
        const toDate = new Date(filters.toDate);
        filteredData = filteredData.filter(item => 
          new Date(item.endDate) <= toDate
        );
      }
        
      return filteredData;
    } catch (error) {
      console.error("Lỗi khi tìm kiếm thuốc từ phụ huynh:", error);
      // Trả về dữ liệu mẫu trong trường hợp xảy ra lỗi
      return [...mockMedicineRequests]; 
    }
  },

  // Lấy lịch sử dùng thuốc gần đây - Function được gọi bởi MedicationHistory.jsx
  getRecentMedicationAdministrations: async (page = 1, size = 10) => {
    try {
      console.log(`Getting recent medication administrations with images (page ${page}, size ${size})`);
      
      // Gọi API thật với pagination (1-based) và include images
      const response = await apiService1.get('/recent', {
        params: { 
          page: page, // API sử dụng 1-based index
          size: size,
          includeImages: true // Request to include image URLs in response
        }
      });
      
      console.log('API Response for recent administrations:', response.data);
      console.log('🔍 DEBUG - Full response structure:', JSON.stringify(response.data, null, 2));
      console.log('🔍 DEBUG - Response.data type:', typeof response.data);
      console.log('🔍 DEBUG - Response.data keys:', Object.keys(response.data));
      
      // Check different possible response structures
      let actualData = [];
      let totalItems = 0;
      let totalPages = 0;
      
      if (response.data.data && response.data.data.content) {
        // Backend structure: { status: "success", data: { content: [...], totalElements: X } }
        actualData = response.data.data.content;
        totalItems = response.data.data.totalElements || 0;
        totalPages = response.data.data.totalPages || 0;
        console.log('🔍 Using backend nested structure (data.data.content)');
      } else if (response.data.content) {
        // Spring Boot pageable response structure
        actualData = response.data.content;
        totalItems = response.data.totalElements || 0;
        totalPages = response.data.totalPages || 0;
        console.log('🔍 Using Spring Boot pageable structure');
      } else if (response.data.data) {
        // Nested data structure
        actualData = response.data.data;
        totalItems = response.data.totalItems || actualData.length;
        totalPages = response.data.totalPages || Math.ceil(totalItems / size);
        console.log('🔍 Using nested data structure');
      } else if (Array.isArray(response.data)) {
        // Direct array response
        actualData = response.data;
        totalItems = actualData.length;
        totalPages = Math.ceil(totalItems / size);
        console.log('🔍 Using direct array structure');
      } else {
        console.log('🔍 Unknown response structure, checking all properties...');
        for (const [key, value] of Object.entries(response.data)) {
          console.log(`🔍 Property ${key}:`, value);
          if (Array.isArray(value)) {
            console.log(`🔍 Found array in property ${key} with ${value.length} items`);
            actualData = value;
            totalItems = value.length;
            totalPages = Math.ceil(totalItems / size);
            break;
          }
        }
      }
      
      // Process and enhance data to include image URLs if not present
      if (Array.isArray(actualData)) {
        actualData = actualData.map(item => {
          // Log each item to see its structure
          console.log('🔍 Processing administration item:', item);
          
          // Ensure imageUrl field exists - check various possible field names
          const imageUrl = item.imageUrl || 
                          item.confirmationImageUrl || 
                          item.image_url || 
                          item.confirmation_image_url ||
                          item.attachmentUrl ||
                          null;
          
          return {
            ...item,
            imageUrl: imageUrl
          };
        });
        
        console.log(`🔍 DEBUG - Enhanced data with images: ${actualData.length} items`);
        // Log first item to see structure
        if (actualData.length > 0) {
          console.log('🔍 DEBUG - First item structure:', actualData[0]);
        }
      }
      
      console.log(`🔍 DEBUG - Extracted data: ${actualData.length} items`);
      console.log(`🔍 DEBUG - Total items: ${totalItems}, Total pages: ${totalPages}`);
      
      // Ensure we always return an array
      if (!Array.isArray(actualData)) {
        console.log('🔍 WARNING - actualData is not an array, forcing to empty array');
        actualData = [];
      }
      
      return {
        success: true,
        data: actualData,
        totalItems: totalItems,
        totalPages: totalPages,
        currentPage: page
      };
    } catch (error) {
      console.error("Error in getRecentMedicationAdministrations:", error);
      console.error("API call failed, attempting fallback to mock data with images");
      
      // Fallback to enhanced mock data with sample images
      const enhancedMockData = mockMedicationAdministrations.map(item => ({
        ...item,
        imageUrl: item.id % 3 === 0 ? `https://via.placeholder.com/400x300?text=Medication+${item.id}` : null
      }));
      
      // Apply pagination to mock data
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      const paginatedData = enhancedMockData.slice(startIndex, endIndex);
      
      return {
        success: false,
        data: paginatedData,
        totalItems: enhancedMockData.length,
        totalPages: Math.ceil(enhancedMockData.length / size),
        currentPage: page,
        message: error.response?.data?.message || error.message || "Sử dụng dữ liệu mẫu - không thể kết nối API"
      };
    }
  },

  // Tạo bản ghi cung cấp thuốc mới - Function được gọi bởi MedicationAdministration.jsx
  createMedicationAdministration: async (data) => {
    try {
      console.log('Creating new medication administration:', data);
      console.log('Using API endpoint:', apiService1.defaults.baseURL);
      console.log('Request config:', {
        method: 'POST',
        url: apiService1.defaults.baseURL,
        data: data,
        headers: apiService1.defaults.headers
      });
      
      // Gọi API thật với endpoint chính xác
      const response = await apiService1.post('', data);
      
      console.log('✅ API Response for create:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: "Đã tạo bản ghi cung cấp thuốc thành công"
      };
    } catch (error) {
      console.error("❌ Error in createMedicationAdministration:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error config:", error.config);
      console.error("❌ Request URL:", error.config?.url);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error data:", error.response?.data);
      
      // Check if it's a network error (server not running)
      if (!error.response) {
        console.log("🔍 Network error detected - server might not be running");
        return {
          success: false,
          message: "Không thể kết nối tới server. Vui lòng kiểm tra xem backend có đang chạy không?"
        };
      }
      
      // Check if it's a 404 error (endpoint not found)
      if (error.response?.status === 404) {
        console.log("🔍 404 error - endpoint not found");
        return {
          success: false,
          message: "Endpoint API không tồn tại. Vui lòng kiểm tra server backend."
        };
      }
      
      // Check if it's an auth error
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log("🔍 Authentication error detected");
        return {
          success: false,
          message: "Lỗi xác thực. Vui lòng đăng nhập lại."
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Không thể tạo bản ghi cung cấp thuốc"
      };
    }
  },

  // Upload ảnh xác nhận - Function được gọi bởi MedicationAdministration.jsx
  uploadConfirmationImage: async (administrationId, imageFile) => {
    try {
      console.log(`Uploading confirmation image for administration ${administrationId}`);
      
      // Tạo FormData để upload file
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // Gọi API thật với endpoint chính xác
      const response = await apiService1.post(`/${administrationId}/upload-confirmation-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('API Response for image upload:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: "Đã tải lên ảnh xác nhận thành công"
      };
    } catch (error) {
      console.error("Error in uploadConfirmationImage:", error);
      console.error("Error response:", error.response);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Không thể tải lên ảnh xác nhận"
      };
    }
  },

  // API để lấy tất cả lịch sử dùng thuốc
  getAllMedicationAdministrations: async (page = 1, size = 10) => {
    try {
      console.log('🔍 Calling getAllMedicationAdministrations API...');
      console.log('API URL:', `${BASE_URL1}/all`);
      
      // Gọi API thật với endpoint /all
      const response = await apiService1.get('/all');
      
      console.log('✅ API Response:', response.data);
      
      // Kiểm tra format response
      if (response.data && response.data.status === 'success') {
        const allData = response.data.data || [];
        const totalItems = response.data.count || allData.length;
        
        // Thực hiện phân trang trên client side
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const paginatedData = allData.slice(startIndex, endIndex);
        const totalPages = Math.ceil(totalItems / size);
        
        return {
          status: 'success',
          data: {
            posts: paginatedData,
            totalItems: totalItems,
            totalPages: totalPages,
            currentPage: page
          }
        };
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error("❌ Error in getAllMedicationAdministrations:", error);
      console.error("❌ Error response:", error.response);
      
      // Fallback to mock data if API fails
      console.log("🔄 API failed, using mock data as fallback");
      console.log("📊 Mock data count:", mockMedicationAdministrations.length);
      
      const allData = mockMedicationAdministrations;
      const totalItems = allData.length;
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      const paginatedData = allData.slice(startIndex, endIndex);
      const totalPages = Math.ceil(totalItems / size);
      
      console.log('📄 Paginated mock data:', {
        totalItems,
        totalPages,
        currentPage: page,
        startIndex,
        endIndex,
        paginatedDataLength: paginatedData.length
      });
      
      return {
        status: 'success',
        data: {
          posts: paginatedData,
          totalItems: totalItems,
          totalPages: totalPages,
          currentPage: page
        }
      };
    }
  },
  
  // Thêm mới lịch sử dùng thuốc
  addMedicationAdministration: async (data) => {
    try {
      // Gọi API thật bằng instance đúng baseURL1
      const response = await apiService1.post('', data);
      return response.data;
    } catch (error) {
      console.error("Error in addMedicationAdministration:", error);
      throw new Error(error.response?.data?.message || error.message || "Không thể thêm mới lịch sử dùng thuốc");
    }
  },
  
  // Cập nhật lịch sử dùng thuốc
  updateMedicationAdministration: async (id, data) => {
    try {
      // Gọi API thật bằng instance đúng baseURL1
      const response = await apiService1.put(`/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error in updateMedicationAdministration:", error);
      throw new Error(error.response?.data?.message || error.message || "Không thể cập nhật lịch sử dùng thuốc");
    }
  },
  
  // Xóa lịch sử dùng thuốc
  deleteMedicationAdministration: async (id) => {
    try {
      // Gọi API thật bằng instance đúng baseURL1
      await apiService1.delete(`/${id}`);
      return { success: true };
    } catch (error) {
      console.error("Error in deleteMedicationAdministration:", error);
      throw new Error(error.response?.data?.message || error.message || "Không thể xóa lịch sử dùng thuốc");
    }
  },

};

export default receiveMedicineService;
