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

const receiveMedicineService = {  // API thật để lấy tất cả yêu cầu thuốc
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
  }
};

export default receiveMedicineService;
