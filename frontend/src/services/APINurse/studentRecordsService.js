import axios from 'axios';

// Base API URL
const API_URL = 'http://localhost:8080/api/v1'; // Đảm bảo đúng URL

// Tạo instance axios với URL cơ sở
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Thêm interceptor để gắn token vào mỗi request
axiosInstance.interceptors.request.use(
  (config) => {
    // Sử dụng token từ AuthContext thông qua localStorage
    const token = localStorage.getItem('authToken');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.log('No authentication token available');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý response errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Nếu token hết hạn (401) hoặc không có quyền (403)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error('Authentication error:', error.response.data);
      // Có thể redirect đến trang login hoặc hiển thị thông báo
    }
    return Promise.reject(error);
  }
);

// Dữ liệu mẫu để sử dụng khi API không hoạt động
const mockStudents = [
  {
    id: 1,
    fullName: 'Nguyễn Văn A',
    studentId: 'SV001',
    dateOfBirth: '2010-05-15',
    gender: 'Nam',
    className: '6A1',
    gradeLevel: '6',
    schoolYear: '2023-2024',
    imageUrl: 'https://via.placeholder.com/150?text=NVA',
    healthProfileId: 'HP001',
    parentId: 'P001'
  },
  {
    id: 2,
    fullName: 'Trần Thị B',
    studentId: 'SV002',
    dateOfBirth: '2010-03-22',
    gender: 'Nữ',
    className: '6A2',
    gradeLevel: '6',
    schoolYear: '2023-2024',
    imageUrl: 'https://via.placeholder.com/150?text=TTB',
    healthProfileId: 'HP002',
    parentId: 'P002'
  }
];

// Lấy danh sách tất cả học sinh
const getAllStudents = async () => {
  try {
    // Sử dụng trực tiếp fetch để tránh xác thực phức tạp
    const response = await fetch(`${API_URL}/students`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    console.log('API response data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching students:', error);
    // Fallback to mock data
    return mockStudents;
  }
};

// Lấy chi tiết một học sinh dựa vào ID
const getStudentById = async (studentId) => {
  try {
    // Sửa lại endpoint đúng để lấy thông tin học sinh
    const response = await axiosInstance.get(`/students/${studentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching student with ID ${studentId}:`, error);
    // Tìm học sinh trong dữ liệu mẫu
    const student = mockStudents.find(s => s.id === parseInt(studentId) || s.studentId === studentId);
    if (student) return student;
    throw error;
  }
};

// Tìm kiếm học sinh theo các điều kiện
const searchStudents = async (criteria) => {
  try {
    // Tạo params cho request
    const params = {};
    
    if (criteria.keyword) {
      params.keyword = criteria.keyword;
    }
    
    if (criteria.class) {
      params.class = criteria.class;
    }
    
    if (criteria.grade) {
      params.grade = criteria.grade;
    }
    
    if (criteria.bloodType) {
      params.bloodType = criteria.bloodType;
    }
    
    if (criteria.healthIssue) {
      params.healthIssue = criteria.healthIssue;
    }
    
    const response = await axiosInstance.get('/students/search', { params });
    return response.data;
  } catch (error) {
    // Nếu API search chưa hoạt động, quay lại filter từ tất cả học sinh
    console.warn('Search API failed, falling back to client-side filtering:', error);
    
    // Sử dụng getAllStudents để filter trên toàn bộ danh sách
    let results = await getAllStudents();
    
    if (criteria.keyword) {
      const keyword = criteria.keyword.toLowerCase();
      results = results.filter(student => 
        (student.fullName && student.fullName.toLowerCase().includes(keyword)) || 
        (student.name && student.name.toLowerCase().includes(keyword)) ||
        (student.studentId && student.studentId.toLowerCase().includes(keyword))
      );
    }
    
    if (criteria.class) {
      const className = criteria.class.toLowerCase();
      results = results.filter(student => {
        const studentClass = (student.className || student.class || '').toLowerCase();
        return studentClass.includes(className);
      });
    }
    
    if (criteria.grade) {
      results = results.filter(student => {
        const className = student.className || student.class || '';
        // Lấy số khối từ tên lớp (ví dụ: 12A1 -> 12, 3B2 -> 3)
        const classGrade = className.match(/^(\d+)/);
        return classGrade && classGrade[1] === criteria.grade;
      });
    }
    
    return results;
  }
};

// Cập nhật thông tin học sinh
const updateStudentRecord = async (studentId, updateData) => {
  try {
    const response = await axiosInstance.put(`/students/${studentId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Error updating student with ID ${studentId}:`, error);
    throw error;
  }
};

// Thêm ghi chú cho học sinh
const addStudentNote = async (studentId, note) => {
  try {
    console.log(`Adding note to student ${studentId}:`, note);
    
    // Gọi API để thêm ghi chú
    const response = await fetch(`${API_URL}/students/${studentId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(note)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const updatedStudent = await response.json();
    return updatedStudent;
  } catch (error) {
    console.error('Error adding student note:', error);
    
    // Mock response cho trường hợp API lỗi
    const student = mockStudents.find(s => s.id === parseInt(studentId));
    if (!student) {
      throw new Error('Student not found');
    }
    
    // Thêm ghi chú vào mock data
    if (!student.notes) {
      student.notes = [];
    }
    student.notes.push({
      ...note,
      id: Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString()
    });
    
    return student;
  }
};

// Lấy danh sách tất cả lớp học
const getClassList = async () => {
  try {
    // Vì không có API riêng cho lớp học, lấy từ danh sách học sinh
    const studentsData = await getAllStudents();
    
    // Kiểm tra dữ liệu học sinh
    if (!Array.isArray(studentsData)) return [];
    
    // Trích xuất danh sách lớp học từ dữ liệu học sinh
    const classNames = [...new Set(studentsData
      .map(student => student?.className || student?.class || '')
      .filter(Boolean)
    )];
    
    return classNames;
  } catch (error) {
    console.warn('Error generating class list:', error);
    return []; // Trả về mảng rỗng nếu có lỗi
  }
};

// Thêm hàm mới: Lấy danh sách các khối
const getGradeList = async () => {
  try {
    const studentsData = await getAllStudents();
    if (!Array.isArray(studentsData)) return [];
    
    const gradeLevels = [...new Set(studentsData
      .map(student => student?.gradeLevel)
      .filter(Boolean)
    )];
    
    // Sắp xếp các khối học
    return gradeLevels.sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  } catch (error) {
    console.warn('Error generating grade list:', error);
    return [];
  }
};

// Lấy danh sách các nhóm máu
const getBloodTypes = async () => {
  // Bỏ qua việc gọi API và trả về dữ liệu mẫu trực tiếp
  return ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
};

// Tính toán chỉ số BMI và phân loại
const calculateBMICategory = (bmi) => {
  if (bmi < 16) {
    return { category: "Thiếu cân nặng", color: "#ff9800" };
  } else if (bmi >= 16 && bmi < 18.5) {
    return { category: "Gầy", color: "#ffeb3b" };
  } else if (bmi >= 18.5 && bmi < 25) {
    return { category: "Bình thường", color: "#4caf50" };
  } else if (bmi >= 25 && bmi < 30) {
    return { category: "Thừa cân", color: "#ff9800" };
  } else {
    return { category: "Béo phì", color: "#f44336" };
  }
};

// Lấy chuẩn BMI dựa trên tuổi và giới tính
const getBMIStandardByAgeGender = (age, gender) => {
  // Đây là ví dụ đơn giản, trong thực tế sẽ phức tạp hơn dựa trên nghiên cứu y tế
  if (age < 13) {
    return { min: 15, max: 21 };
  } else if (age < 18) {
    if (gender === "Nam" || gender === "Male") {
      return { min: 16, max: 23 };
    } else {
      return { min: 15, max: 22 };
    }
  } else {
    if (gender === "Nam" || gender === "Male") {
      return { min: 18.5, max: 25 };
    } else {
      return { min: 18.5, max: 24 };
    }
  }
};

// Cải thiện hàm lấy health profile với API mới
const getStudentHealthProfile = async (studentId) => {
  if (!studentId) {
    console.warn('Không có ID học sinh');
    return {};
  }

  console.log('Fetching health profile for student ID:', studentId);

  try {
    console.log('===== HEALTH PROFILE API CALL =====');
    console.log('Calling new API endpoint with student ID:', studentId);
    
    // Sử dụng API mới
    const response = await axiosInstance.get(`/health-profiles/getStudentProfileByID/${studentId}`);
    
    console.log('API response successful. Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching health profile:', error);
    console.log('Error details:', error.response?.data || error.message);
    // Sử dụng mock data khi API lỗi
    return getMockHealthProfile(studentId);
  }
};

// Tách riêng logic mock data để dễ quản lý
const getMockHealthProfile = (studentId) => {
  return {
    healthProfile: {
      id: 1,
      bloodType: "O+",
      height: 120.5,
      bmi: 17.3,
      weight: 25.2,
      allergies: "Không có",
      chronicDiseases: "Không có",
      visionLeft: "10/10",
      visionRight: "10/10",
      hearingStatus: "Bình thường",
      dietaryRestrictions: "Không có",
      emergencyContactInfo: "Liên hệ: 0901234572",
      immunizationStatus: "Đầy đủ",
      lastPhysicalExamDate: "2024-01-15",
      specialNeeds: "Không có",
      lastUpdated: "2024-01-20T10:30:00",
      checkupStatus: null
    },
    vaccinations: [
      {
        id: 1,
        doseNumber: 1,
        vaccineName: "Vaccine Sởi - Quai bị - Rubella (MMR)",
        vaccinationDate: "2024-03-15",
        administeredAt: "Phòng y tế trường",
        notes: "không có phản ứng phụ",
        parentNotes: "Học sinh tiêm bình thường, không có phản ứng phụ",
        nextDoseDate: "2025-03-15",
        vaccinationType: "SCHOOL_PLAN"
      },
      {
        id: 11,
        doseNumber: 2,
        vaccineName: "Vaccine Sởi - Quai bị - Rubella (MMR)",
        vaccinationDate: "2025-07-08",
        administeredAt: "lukat",
        notes: "chet roi",
        parentNotes: null,
        nextDoseDate: null,
        vaccinationType: "SCHOOL_PLAN"
      },
      {
        id: 12,
        doseNumber: 1,
        vaccineName: "Vaccine Bại liệt (OPV)",
        vaccinationDate: "2025-07-08",
        administeredAt: "Phòng y tế trường",
        notes: "gần đi rồi ",
        parentNotes: null,
        nextDoseDate: "2025-09-06",
        vaccinationType: "SCHOOL_PLAN"
      },
      {
        id: 20,
        doseNumber: 1,
        vaccineName: "Vaccine HPV",
        vaccinationDate: "2025-07-08",
        administeredAt: "Phòng y tế trường",
        notes: "không có phản ứng phụ",
        parentNotes: null,
        nextDoseDate: "2026-01-04",
        vaccinationType: "SCHOOL_PLAN"
      }
    ]
  };
};

// Thêm đoạn code này vào đầu file để test connection
const testBackendConnection = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/v1/students');
    console.log('Backend connection successful:', response.status);
    return true;
  } catch (error) {
    console.error('Backend connection failed:', error.message);
    return false;
  }
};

// Thêm vào file studentRecordsService.js
const debugAuthToken = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    console.log('Auth token exists:', token.substring(0, 15) + '...');
    return true;
  } else {
    console.warn('No authentication token found');
    return false;
  }
};

// Gọi hàm này khi khởi tạo service
debugAuthToken();

testBackendConnection();

// Cuối file, trong export statement
export {
  getAllStudents,
  getStudentById,
  searchStudents,
  updateStudentRecord,
  addStudentNote,  // Đảm bảo hàm này được export
  getClassList,
  getGradeList, // Export hàm mới
  getBloodTypes,
  calculateBMICategory,
  getBMIStandardByAgeGender,
  getStudentHealthProfile
};
