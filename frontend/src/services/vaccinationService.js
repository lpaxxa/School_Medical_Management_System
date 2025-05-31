// Cấu hình sử dụng dữ liệu giả hay API thật
const config = {
  useMockData: true, // Mặc định sử dụng dữ liệu giả
  apiUrl: 'https://api.example.com/vaccination' // URL API thật khi cần thay đổi
};

// Dữ liệu mẫu - trong thực tế, dữ liệu này sẽ được lấy từ backend API
const mockVaccines = [
  {
    id: 1,
    code: 'BCG',
    name: 'Vaccine BCG',
    recommendedAge: 0,
    dosages: 1,
    interval: null,
    mandatory: true,
    active: true,
    description: 'Phòng bệnh lao. Tiêm 1 mũi duy nhất ngay sau khi sinh.',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    code: 'HepB',
    name: 'Vaccine viêm gan B',
    recommendedAge: 0,
    dosages: 3,
    interval: 2,
    mandatory: true,
    active: true,
    description: 'Phòng bệnh viêm gan siêu vi B.',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    code: 'OPV',
    name: 'Vaccine bại liệt uống',
    recommendedAge: 2,
    dosages: 3,
    interval: 2,
    mandatory: true,
    active: true,
    description: 'Phòng bệnh bại liệt.',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    code: 'DTP',
    name: 'Vaccine bạch hầu - uốn ván - ho gà',
    recommendedAge: 2,
    dosages: 3,
    interval: 2,
    mandatory: true,
    active: true,
    description: 'Phòng bệnh bạch hầu, uốn ván và ho gà.',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 5,
    code: 'Hib',
    name: 'Vaccine Hib',
    recommendedAge: 2,
    dosages: 3,
    interval: 2,
    mandatory: false,
    active: true,
    description: 'Phòng bệnh viêm màng não mủ, viêm phổi, viêm tai giữa do vi khuẩn Hib.',
    createdAt: '2024-01-01T00:00:00Z'
  },
];

const mockStudents = [
  {
    id: 1,
    studentCode: 'HS001',
    name: 'Nguyễn Văn An',
    dateOfBirth: '2012-05-15',
    gender: 'M',
    className: '6A1',
    grade: 6,
    parentPhone: '0901234567',
    parentName: 'Nguyễn Văn Bình',
    address: '123 Nguyễn Trãi, Quận 1, TP.HCM'
  },
  {
    id: 2,
    studentCode: 'HS002',
    name: 'Trần Thị Bình',
    dateOfBirth: '2012-08-20',
    gender: 'F',
    className: '6A2',
    grade: 6,
    parentPhone: '0909876543',
    parentName: 'Trần Văn Cường',
    address: '456 Lê Lai, Quận 3, TP.HCM'
  },
  {
    id: 3,
    studentCode: 'HS003',
    name: 'Lê Hoàng Công',
    dateOfBirth: '2011-03-10',
    gender: 'M',
    className: '7B1',
    grade: 7,
    parentPhone: '0977123456',
    parentName: 'Lê Văn Dũng',
    address: '789 Trần Hưng Đạo, Quận 5, TP.HCM'
  },
  {
    id: 4,
    studentCode: 'HS004',
    name: 'Phạm Thị Diệu',
    dateOfBirth: '2011-11-25',
    gender: 'F',
    className: '7B2',
    grade: 7,
    parentPhone: '0988654321',
    parentName: 'Phạm Thị Em',
    address: '246 Nguyễn Du, Quận 1, TP.HCM'
  },
  {
    id: 5,
    studentCode: 'HS005',
    name: 'Hoàng Văn Duy',
    dateOfBirth: '2010-07-30',
    gender: 'M',
    className: '8C1',
    grade: 8,
    parentPhone: '0966789123',
    parentName: 'Hoàng Thị Giang',
    address: '357 Lê Lợi, Quận 1, TP.HCM'
  }
];

const mockVaccinationRecords = [
  {
    id: 1,
    studentId: 1,
    studentName: 'Nguyễn Văn An',
    studentCode: 'HS001',
    className: '6A1',
    vaccineId: 1,
    vaccineName: 'Vaccine BCG',
    vaccineCode: 'BCG',
    dose: 1,
    dateAdministered: '2012-05-20',
    administrator: 'Bs. Nguyễn Thị Hoa',
    status: 'Hoàn thành',
    nextDoseDate: null,
    sideEffects: 'Không',
    notes: 'Tiêm sau sinh 5 ngày',
    consented: true
  },
  {
    id: 2,
    studentId: 1,
    studentName: 'Nguyễn Văn An',
    studentCode: 'HS001',
    className: '6A1',
    vaccineId: 2,
    vaccineName: 'Vaccine viêm gan B',
    vaccineCode: 'HepB',
    dose: 1,
    dateAdministered: '2012-05-20',
    administrator: 'Bs. Nguyễn Thị Hoa',
    status: 'Hoàn thành',
    nextDoseDate: '2012-07-20',
    sideEffects: 'Không',
    notes: 'Tiêm cùng ngày với BCG',
    consented: true
  },
  {
    id: 3,
    studentId: 1,
    studentName: 'Nguyễn Văn An',
    studentCode: 'HS001',
    className: '6A1',
    vaccineId: 2,
    vaccineName: 'Vaccine viêm gan B',
    vaccineCode: 'HepB',
    dose: 2,
    dateAdministered: '2012-07-22',
    administrator: 'Bs. Trần Văn Bình',
    status: 'Hoàn thành',
    nextDoseDate: '2012-09-22',
    sideEffects: 'Sốt nhẹ',
    notes: '',
    consented: true
  },
  {
    id: 4,
    studentId: 1,
    studentName: 'Nguyễn Văn An',
    studentCode: 'HS001',
    className: '6A1',
    vaccineId: 2,
    vaccineName: 'Vaccine viêm gan B',
    vaccineCode: 'HepB',
    dose: 3,
    dateAdministered: null,
    administrator: null,
    status: 'Dự kiến',
    nextDoseDate: null,
    sideEffects: null,
    notes: 'Dự kiến tiêm trong đợt tiêm chủng sắp tới',
    consented: false
  },
  {
    id: 5,
    studentId: 2,
    studentName: 'Trần Thị Bình',
    studentCode: 'HS002',
    className: '6A2',
    vaccineId: 1,
    vaccineName: 'Vaccine BCG',
    vaccineCode: 'BCG',
    dose: 1,
    dateAdministered: '2012-08-25',
    administrator: 'Bs. Nguyễn Thị Hoa',
    status: 'Hoàn thành',
    nextDoseDate: null,
    sideEffects: 'Không',
    notes: 'Tiêm sau sinh 5 ngày',
    consented: true
  },
];

// Delay giả lập API
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Service API 
const vaccinationService = {
  // Lấy tất cả vaccine
  getAllVaccines: async () => {
    await delay(500);
    return [...mockVaccines];
  },

  // Lấy vaccine theo ID
  getVaccineById: async (id) => {
    await delay(300);
    const vaccine = mockVaccines.find(v => v.id === id);
    if (!vaccine) throw new Error("Không tìm thấy vaccine");
    return { ...vaccine };
  },

  // Thêm vaccine mới
  addVaccine: async (vaccineData) => {
    await delay(600);
    const newVaccine = {
      id: Math.max(...mockVaccines.map(v => v.id)) + 1,
      code: vaccineData.code || `V${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      ...vaccineData
    };
    
    mockVaccines.push(newVaccine);
    return newVaccine;
  },

  // Cập nhật vaccine
  updateVaccine: async (id, vaccineData) => {
    await delay(500);
    const index = mockVaccines.findIndex(v => v.id === id);
    if (index === -1) throw new Error('Vaccine not found');
    
    mockVaccines[index] = {
      ...mockVaccines[index],
      ...vaccineData,
      updatedAt: new Date().toISOString()
    };
    
    return mockVaccines[index];
  },

  // Xóa vaccine
  deleteVaccine: async (id) => {
    await delay(500);
    const initialLength = mockVaccines.length;
    const updatedVaccines = mockVaccines.filter(v => v.id !== id);
    
    if (updatedVaccines.length === initialLength) {
      throw new Error("Không tìm thấy vaccine");
    }
    
    // Cập nhật mảng mockVaccines
    mockVaccines.length = 0;
    mockVaccines.push(...updatedVaccines);
    
    return { success: true, message: "Xóa thành công" };
  },

  // Lấy tất cả học sinh
  getAllStudents: async () => {
    await delay(700);
    return [...mockStudents];
  },
  
  // Tìm kiếm học sinh
  searchStudents: async (filters) => {
    await delay(500);
    
    let filteredStudents = [...mockStudents];
    
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filteredStudents = filteredStudents.filter(student => 
        student.name.toLowerCase().includes(keyword) ||
        student.studentCode.toLowerCase().includes(keyword)
      );
    }
    
    if (filters.className) {
      const className = filters.className.toLowerCase();
      filteredStudents = filteredStudents.filter(student => 
        student.className.toLowerCase().includes(className)
      );
    }
    
    if (filters.grade) {
      filteredStudents = filteredStudents.filter(student => 
        student.grade === parseInt(filters.grade)
      );
    }
    
    return filteredStudents;
  },
  
  // Lấy thông tin học sinh theo ID
  getStudentById: async (id) => {
    await delay(300);
    const student = mockStudents.find(s => s.id === id);
    if (!student) throw new Error("Không tìm thấy học sinh");
    return { ...student };
  },

  // Lấy hồ sơ tiêm chủng của học sinh
  getStudentVaccinationHistory: async (studentId) => {
    await delay(600);
    return mockVaccinationRecords.filter(record => record.studentId === studentId);
  },
  
  // Lấy tất cả bản ghi tiêm chủng
  getAllVaccinationRecords: async () => {
    await delay(800);
    return [...mockVaccinationRecords];
  },
  
  // Tìm kiếm bản ghi tiêm chủng
  searchVaccinationRecords: async (filters) => {
    await delay(600);
    
    let filteredRecords = [...mockVaccinationRecords];
    
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filteredRecords = filteredRecords.filter(record => 
        record.studentName.toLowerCase().includes(keyword) ||
        record.studentCode.toLowerCase().includes(keyword) ||
        record.vaccineName.toLowerCase().includes(keyword) ||
        record.vaccineCode.toLowerCase().includes(keyword)
      );
    }
    
    if (filters.status) {
      filteredRecords = filteredRecords.filter(record => 
        record.status === filters.status
      );
    }
    
    if (filters.fromDate) {
      const fromDate = new Date(filters.fromDate);
      filteredRecords = filteredRecords.filter(record => 
        record.dateAdministered && new Date(record.dateAdministered) >= fromDate
      );
    }
    
    if (filters.toDate) {
      const toDate = new Date(filters.toDate);
      toDate.setHours(23, 59, 59, 999);
      filteredRecords = filteredRecords.filter(record => 
        record.dateAdministered && new Date(record.dateAdministered) <= toDate
      );
    }
    
    return filteredRecords;
  },
  
  // Thêm bản ghi tiêm chủng mới
  addVaccinationRecord: async (recordData) => {
    await delay(700);
    
    const newRecord = {
      id: Math.max(...mockVaccinationRecords.map(r => r.id)) + 1,
      createdAt: new Date().toISOString(),
      ...recordData
    };
    
    // Thêm thông tin học sinh và vaccine
    const student = mockStudents.find(s => s.id === parseInt(recordData.studentId));
    if (student) {
      newRecord.studentName = student.name;
      newRecord.studentCode = student.studentCode;
      newRecord.className = student.className;
    }
    
    const vaccine = mockVaccines.find(v => v.id === parseInt(recordData.vaccineId));
    if (vaccine) {
      newRecord.vaccineName = vaccine.name;
      newRecord.vaccineCode = vaccine.code;
    }
    
    mockVaccinationRecords.push(newRecord);
    return newRecord;
  },
  
  // Cập nhật bản ghi tiêm chủng
  updateVaccinationRecord: async (id, recordData) => {
    await delay(600);
    const index = mockVaccinationRecords.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Record not found');
    
    mockVaccinationRecords[index] = {
      ...mockVaccinationRecords[index],
      ...recordData,
      updatedAt: new Date().toISOString()
    };
    
    return mockVaccinationRecords[index];
  },
  
  // Lấy tất cả kế hoạch tiêm chủng
  getAllVaccinationPlans: async () => {
    await delay(500);
    const plans = mockVaccinationPlans.map(plan => {
      const vaccine = mockVaccines.find(v => v.id === plan.vaccineId);
      
      return {
        ...plan,
        vaccineName: vaccine ? vaccine.name : "Unknown",
        vaccineCode: vaccine ? vaccine.vaccineCode : "Unknown",
        progress: plan.totalStudents > 0 ? Math.round((plan.completedStudents / plan.totalStudents) * 100) : 0
      };
    });
    
    return plans;
  },

  // Tạo kế hoạch tiêm chủng mới
  createVaccinationPlan: async (planData) => {
    await delay(800);
    const newId = Math.max(...mockVaccinationPlans.map(p => p.id)) + 1;
    const planCode = `KH${new Date().getFullYear()}-${String(newId).padStart(2, '0')}`;
    const now = new Date().toISOString();
    
    const newPlan = {
      id: newId,
      planCode,
      ...planData,
      completedStudents: 0,
      createdAt: now
    };
    
    mockVaccinationPlans.push(newPlan);
    return { success: true, plan: newPlan };
  },

  // Cập nhật kế hoạch tiêm chủng
  updateVaccinationPlan: async (id, planData) => {
    await delay(700);
    const index = mockVaccinationPlans.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error("Không tìm thấy kế hoạch tiêm chủng");
    }
    
    mockVaccinationPlans[index] = {
      ...mockVaccinationPlans[index],
      ...planData
    };
    
    return { success: true, plan: mockVaccinationPlans[index] };
  },

  // Lấy dữ liệu thống kê
  getVaccinationStats: async () => {
    await delay(900);
    
    // Tổng số học sinh
    const totalStudents = mockStudents.length;
    
    // Tổng số học sinh đã tiêm ít nhất 1 mũi
    const studentsWithVaccination = new Set(mockVaccinationRecords
      .filter(r => r.status === "Hoàn thành")
      .map(r => r.studentId)
    ).size;
    
    // Tỷ lệ tiêm chủng theo loại vaccine
    const vaccineStats = mockVaccines.map(vaccine => {
      const records = mockVaccinationRecords.filter(r => r.vaccineId === vaccine.id && r.status === "Hoàn thành");
      const uniqueStudents = new Set(records.map(r => r.studentId)).size;
      
      return {
        vaccineId: vaccine.id,
        vaccineName: vaccine.name,
        vaccineCode: vaccine.vaccineCode,
        totalVaccinated: uniqueStudents,
        percentage: totalStudents > 0 ? Math.round((uniqueStudents / totalStudents) * 100) : 0,
        mandatory: vaccine.mandatory
      };
    });
    
    // Cảnh báo mũi tiêm sắp đến hạn (giả định)
    const upcomingVaccinations = [
      {
        id: 1,
        studentId: 5,
        studentName: "Vũ Minh Hiếu",
        className: "10A1",
        vaccineId: 2,
        vaccineName: "ComboVac 5 trong 1",
        dueDate: "2023-11-10",
        daysRemaining: 15
      },
      {
        id: 2,
        studentId: 4,
        studentName: "Phạm Thị Hà",
        className: "8A2",
        vaccineId: 4,
        vaccineName: "Sởi-Quai bị-Rubella",
        dueDate: "2023-12-05",
        daysRemaining: 40
      }
    ];
    
    return {
      totalStudents,
      studentsWithVaccination,
      studentsWithoutVaccination: totalStudents - studentsWithVaccination,
      percentageVaccinated: totalStudents > 0 ? Math.round((studentsWithVaccination / totalStudents) * 100) : 0,
      vaccineStats,
      upcomingVaccinations
    };
  },

  // Xuất báo cáo CSV
  exportVaccinationReport: async (type, filters) => {
    await delay(800);
    // Giả lập xuất báo cáo, trả về đường dẫn tới file CSV giả định
    return { 
      success: true, 
      fileUrl: 'data:text/csv;charset=UTF-8,' + encodeURIComponent('Mẫu dữ liệu CSV sẽ được xuất ở đây'),
      message: "Đã xuất báo cáo thành công"
    };
  }
};

export default vaccinationService;