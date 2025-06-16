// Mock student data for development
export const MOCK_STUDENTS = [
  {
    id: 101,
    name: "Trần Minh An",
    class: "3A",
    parentId: 3,
    dateOfBirth: "2015-03-15",
    gender: "Nam",
    bloodType: "A+",
    homeRoomTeacher: "Nguyễn Thị Mai",
    lastUpdated: "2023-09-01",
    status: "Đã hoàn thành",
    imageUrl: "https://via.placeholder.com/150",
    allergies: ["Đậu phộng", "Sữa"],
    medicalConditions: [],
    emergencyContact: {
      parentName: "Trần Văn An",
      phone: "0901234567",
      relationship: "Cha"
    },
    healthIndices: {
      height: 135,
      weight: 32,
      bmi: 17.6,
      vision: "10/10",
      hearing: "Bình thường",
      bloodPressure: "90/60"
    },
    medicalHistory: {
      allergies: "Đậu phộng, Sữa",
      chronicDiseases: "Không có",
      medicalHistory: "Từng phẫu thuật ruột thừa năm 2021"
    },
    healthRecords: [
      {
        date: "2023-05-15",
        height: 132,
        weight: 30,
        bmi: 17.2
      },
      {
        date: "2023-09-01",
        height: 135,
        weight: 32,
        bmi: 17.6
      }
    ],
    notes: [
      {
        id: 1,
        date: "2023-05-15",
        content: "Học sinh có biểu hiện mệt mỏi trong giờ thể dục, đã cho nghỉ ngơi và theo dõi.",
        author: "Y tá"
      },
      {
        id: 2,
        date: "2023-09-01",
        content: "Đã khám sức khỏe định kỳ, các chỉ số đều trong ngưỡng bình thường.",
        author: "Bác sĩ Nguyễn Văn B"
      }
    ]
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