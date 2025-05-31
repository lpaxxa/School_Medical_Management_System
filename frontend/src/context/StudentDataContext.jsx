import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "./AuthContext";

// Tạo context
const StudentDataContext = createContext();

export const useStudentData = () => useContext(StudentDataContext);

export const StudentDataProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [healthMetrics, setHealthMetrics] = useState({});
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Chỉ tải dữ liệu khi người dùng đã đăng nhập
    if (currentUser) {
      fetchStudentData();
    }
  }, [currentUser]);

  const fetchStudentData = async () => {
    setIsLoading(true);
    try {
      // Thực tế sẽ gọi API thật
      // fetch(`/api/parents/${currentUser.id}/students`)

      // Mock data cho phát triển
      setTimeout(() => {
        // Danh sách học sinh của phụ huynh
        const mockStudents = [
          {
            id: "ST001",
            name: "Nguyễn Văn An",
            class: "3A",
            age: 9,
            gender: "Nam",
            dob: "2014-08-15",
            classTeacher: "Nguyễn Thị Hương",
            parentPhone: "0901234567",
            address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
          },
          {
            id: "ST002",
            name: "Nguyễn Thảo Vy",
            class: "5B",
            age: 11,
            gender: "Nữ",
            dob: "2012-03-20",
            classTeacher: "Trần Văn Minh",
            parentPhone: "0901234567",
            address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
          },
        ];

        // Dữ liệu chỉ số sức khỏe
        const mockHealthMetrics = {
          ST001: {
            height: [
              { date: "2022-09-05", value: 130 },
              { date: "2023-01-10", value: 132 },
              { date: "2023-05-10", value: 134 },
            ],
            weight: [
              { date: "2022-09-05", value: 28 },
              { date: "2023-01-10", value: 29 },
              { date: "2023-05-10", value: 30 },
            ],
            vision: [
              { date: "2022-09-05", left: "10/10", right: "10/10" },
              { date: "2023-05-10", left: "10/10", right: "10/10" },
            ],
            bmi: [
              { date: "2022-09-05", value: 16.6, status: "Bình thường" },
              { date: "2023-01-10", value: 16.7, status: "Bình thường" },
              { date: "2023-05-10", value: 16.7, status: "Bình thường" },
            ],
            allergies: ["Không có"],
            chronicConditions: ["Không có"],
            bloodType: "A+",
            immunizations: [
              {
                name: "Vắc-xin COVID-19",
                date: "2022-12-10",
                status: "Hoàn thành",
              },
              {
                name: "Vắc-xin Viêm gan B",
                date: "2018-05-15",
                status: "Hoàn thành",
              },
            ],
          },
          ST002: {
            height: [
              { date: "2022-09-05", value: 140 },
              { date: "2023-01-10", value: 142 },
              { date: "2023-05-10", value: 143 },
            ],
            weight: [
              { date: "2022-09-05", value: 35 },
              { date: "2023-01-10", value: 36 },
              { date: "2023-05-10", value: 37 },
            ],
            vision: [
              { date: "2022-09-05", left: "10/10", right: "10/10" },
              { date: "2023-05-10", left: "9/10", right: "9/10" },
            ],
            bmi: [
              { date: "2022-09-05", value: 17.9, status: "Bình thường" },
              { date: "2023-01-10", value: 17.9, status: "Bình thường" },
              { date: "2023-05-10", value: 18.1, status: "Bình thường" },
            ],
            allergies: ["Phấn hoa"],
            chronicConditions: ["Không có"],
            bloodType: "B+",
            immunizations: [
              {
                name: "Vắc-xin COVID-19",
                date: "2022-12-15",
                status: "Hoàn thành",
              },
              {
                name: "Vắc-xin Sởi-Quai bị-Rubella",
                date: "2019-07-20",
                status: "Hoàn thành",
              },
            ],
          },
        };

        // Dữ liệu bệnh án
        const mockMedicalRecords = [
          {
            id: "MR001",
            studentId: "ST001",
            date: "2023-05-10",
            type: "examination",
            title: "Khám sức khỏe định kỳ",
            description: "Khám sức khỏe tổng quát định kỳ học kỳ 1",
            notes: "Học sinh khỏe mạnh, không phát hiện vấn đề",
            doctor: "Bác sĩ Nguyễn Văn Khoa",
            attachments: ["health_report_ST001_20230510.pdf"],
          },
          {
            id: "MR002",
            studentId: "ST001",
            date: "2023-04-15",
            type: "illness",
            title: "Cảm cúm",
            description: "Học sinh có triệu chứng sốt, ho",
            treatment: "Thuốc hạ sốt, nghỉ ngơi",
            notes: "Cho học sinh nghỉ học 2 ngày",
            doctor: "Bác sĩ Lê Thị Hà",
            attachments: [],
          },
          {
            id: "MR003",
            studentId: "ST001",
            date: "2023-03-20",
            type: "vaccination",
            title: "Tiêm chủng định kỳ",
            description: "Tiêm vắc-xin phòng ngừa theo lịch",
            notes: "Đã tiêm đủ mũi theo quy định",
            doctor: "Y tá Phạm Thu Thủy",
            attachments: ["vaccination_cert_ST001.pdf"],
          },
          {
            id: "MR004",
            studentId: "ST002",
            date: "2023-05-12",
            type: "examination",
            title: "Khám sức khỏe định kỳ",
            description: "Khám sức khỏe tổng quát định kỳ học kỳ 1",
            notes: "Phát hiện cận thị nhẹ, cần theo dõi",
            doctor: "Bác sĩ Nguyễn Văn Khoa",
            attachments: ["health_report_ST002_20230512.pdf"],
          },
          {
            id: "MR005",
            studentId: "ST002",
            date: "2023-02-05",
            type: "injury",
            title: "Tai nạn nhẹ",
            description: "Trầy xước đầu gối khi chơi thể thao",
            treatment: "Vệ sinh vết thương, băng kín",
            notes: "Vết thương nhẹ, đã sơ cứu tại trường",
            doctor: "Y tá Trần Minh Tuấn",
            attachments: [],
          },
        ];

        setStudents(mockStudents);
        setHealthMetrics(mockHealthMetrics);
        setMedicalRecords(mockMedicalRecords);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu học sinh:", error);
      setIsLoading(false);
    }
  };

  const addMedicalRecord = (newRecord) => {
    setMedicalRecords((prev) => [...prev, newRecord]);
  };

  const updateHealthMetric = (studentId, metricType, newData) => {
    setHealthMetrics((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [metricType]: [...(prev[studentId][metricType] || []), newData],
      },
    }));
  };

  const getStudentById = (id) => {
    return students.find((student) => student.id === id);
  };

  const getMedicalRecordsByStudentId = (studentId) => {
    return medicalRecords.filter((record) => record.studentId === studentId);
  };

  return (
    <StudentDataContext.Provider
      value={{
        students,
        healthMetrics,
        medicalRecords,
        isLoading,
        addMedicalRecord,
        updateHealthMetric,
        getStudentById,
        getMedicalRecordsByStudentId,
        refreshData: fetchStudentData,
      }}
    >
      {children}
    </StudentDataContext.Provider>
  );
};
