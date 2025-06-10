// Mock student data for development
export const MOCK_STUDENTS = [
  {
    id: 101,
    name: "Trần Minh An",
    class: "3A",
    parentId: 3,
    dateOfBirth: "2015-03-15",
    bloodType: "A+",
    allergies: ["Đậu phộng", "Sữa"],
    medicalConditions: [],
    emergencyContact: {
      name: "Trần Văn An",
      phone: "0901234567",
      relationship: "Cha"
    }
  },
  {
    id: 102,
    name: "Trần Minh Châu",
    class: "1B",
    parentId: 3,
    dateOfBirth: "2017-08-22",
    bloodType: "A+",
    allergies: [],
    medicalConditions: ["Hen suyễn nhẹ"],
    emergencyContact: {
      name: "Trần Văn An",
      phone: "0901234567",
      relationship: "Cha"
    }
  },
  {
    id: 103,
    name: "Lê Ngọc Bảo",
    class: "5A",
    parentId: 4,
    dateOfBirth: "2013-12-10",
    bloodType: "O+",
    allergies: [],
    medicalConditions: [],
    emergencyContact: {
      name: "Lê Thị Bình",
      phone: "0909876543",
      relationship: "Mẹ"
    }
  },
  {
    id: 104,
    name: "Nguyễn Gia Huy",
    class: "2C",
    parentId: 99, // Google user
    dateOfBirth: "2016-05-18",
    bloodType: "B+",
    allergies: ["Hải sản"],
    medicalConditions: [],
    emergencyContact: {
      name: "Người dùng Google",
      phone: "0912345678",
      relationship: "Mẹ"
    }
  }
];

export const getStudentsByParentId = (parentId) => {
  return MOCK_STUDENTS.filter(student => student.parentId === parentId);
};

export const getStudentById = (studentId) => {
  return MOCK_STUDENTS.find(student => student.id === studentId);
};