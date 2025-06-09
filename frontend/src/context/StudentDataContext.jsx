import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

// API URLs
const API_URL = "https://68425631e1347494c31c7892.mockapi.io/api/vi";
const HEALTH_API =
  "https://684684387dbda7ee7aaf4ac1.mockapi.io/api/v1/khaibaosuckhoe/khaibaosuckhoehosinh";

const StudentDataContext = createContext();

export function useStudentData() {
  return useContext(StudentDataContext);
}

export const StudentDataProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [healthDeclarations, setHealthDeclarations] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { currentUser } = useAuth();

  // Lấy danh sách học sinh của phụ huynh
  useEffect(() => {
    const fetchStudents = async () => {
      if (!currentUser) {
        setStudents([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Gọi API để lấy danh sách học sinh
        const response = await axios.get(`${API_URL}/hocsinh/hocsinh`);

        // Lọc học sinh theo parentId nếu đang đăng nhập là phụ huynh
        let studentsList = response.data;

        if (currentUser.role === "parent") {
          studentsList = studentsList.filter(
            (student) => student.parentId === currentUser.id
          );
        }

        setStudents(studentsList);
      } catch (err) {
        console.error("Error fetching student data:", err);
        setError("Không thể tải thông tin học sinh. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [currentUser]);

  // Lấy dữ liệu sức khỏe từ API mới
  useEffect(() => {
    const fetchHealthData = async () => {
      if (!currentUser || students.length === 0) {
        setHealthDeclarations([]);
        setMedicalRecords([]);
        return;
      }

      try {
        // Lấy tất cả dữ liệu từ API sức khỏe
        const response = await axios.get(HEALTH_API);
        const allHealthData = response.data;

        if (Array.isArray(allHealthData)) {
          // Phân loại dữ liệu thành khai báo sức khỏe và hồ sơ bệnh án
          const declarations = allHealthData.filter(
            (item) =>
              item.type === "declaration" || // Nếu có trường type
              (item.temperature && !item.bmi) // Nếu có trường temperature và không có BMI thì xem là khai báo
          );

          const records = allHealthData.filter(
            (item) =>
              item.type === "medical_record" || // Nếu có trường type
              (item.height && item.weight && item.bmi) // Nếu có các trường của hồ sơ bệnh án
          );

          setHealthDeclarations(declarations);
          setMedicalRecords(records);
        }
      } catch (err) {
        console.error("Error fetching health data:", err);
        // Không set error để tránh ảnh hưởng đến hiển thị chung
      }
    };

    fetchHealthData();
  }, [currentUser, students]);

  // Hàm lấy thông tin chi tiết của học sinh
  const getStudentDetails = async (studentId) => {
    try {
      const response = await axios.get(
        `${API_URL}/hocsinh/hocsinh/${studentId}`
      );
      return response.data;
    } catch (err) {
      console.error(`Error fetching details for student ${studentId}:`, err);
      throw new Error("Không thể lấy thông tin chi tiết học sinh");
    }
  };

  // Hàm lấy hồ sơ y tế của học sinh từ API mới
  const getMedicalRecords = async (studentId) => {
    try {
      // Lọc từ state nếu đã có dữ liệu
      let studentRecords = medicalRecords.filter(
        (record) => record.studentId === studentId
      );

      // Nếu không có dữ liệu trong state, thử lấy từ API
      if (studentRecords.length === 0) {
        const response = await axios.get(
          `${HEALTH_API}?studentId=${studentId}`
        );
        const allData = response.data;

        // Lọc lấy hồ sơ y tế từ dữ liệu API
        studentRecords = allData.filter(
          (item) =>
            item.type === "medical_record" ||
            (item.height && item.weight && item.bmi)
        );
      }

      // Nếu vẫn không có dữ liệu, trả về dữ liệu mẫu
      if (studentRecords.length === 0) {
        const heightValue = 145 + Math.floor(Math.random() * 25);
        const weightValue = 40 + Math.floor(Math.random() * 15);
        const heightInMeter = heightValue / 100;
        const bmiValue = +(
          weightValue /
          (heightInMeter * heightInMeter)
        ).toFixed(2);

        studentRecords = [
          {
            id: `MR-${studentId}`,
            studentId: studentId,
            schoolYear: "2023-2024",
            height: heightValue,
            weight: weightValue,
            bmi: bmiValue,
            bloodType: ["A+", "B+", "O+", "AB+"][Math.floor(Math.random() * 4)],
            visionLeft: ["1.0", "0.8", "0.9", "0.7"][
              Math.floor(Math.random() * 4)
            ],
            visionRight: ["1.0", "0.8", "0.9", "0.7"][
              Math.floor(Math.random() * 4)
            ],
            allergies: Math.random() > 0.5 ? ["Bụi", "Phấn hoa"] : [],
            chronicConditions: Math.random() > 0.7 ? ["Viêm mũi dị ứng"] : [],
            medications: [],
            vaccinations: [
              {
                name: "Sởi-Rubella",
                date: "2022-05-15",
              },
              {
                name: "Viêm não Nhật Bản",
                date: "2021-07-22",
              },
            ],
            notes: "Thể chất khỏe mạnh, không có vấn đề đáng kể",
            lastUpdated: new Date().toISOString(),
            updatedBy: "Trần Thị Hương - Y tá trường",
          },
        ];
      }

      return studentRecords;
    } catch (err) {
      console.error(
        `Error fetching medical records for student ${studentId}:`,
        err
      );

      // Trả về dữ liệu mẫu khi có lỗi
      console.log("Returning mock data for medical records");
      const heightValue = 145 + Math.floor(Math.random() * 25);
      const weightValue = 40 + Math.floor(Math.random() * 15);
      const heightInMeter = heightValue / 100;
      const bmiValue = +(weightValue / (heightInMeter * heightInMeter)).toFixed(
        2
      );

      return [
        {
          id: `MR-${studentId}`,
          studentId: studentId,
          schoolYear: "2023-2024",
          height: heightValue,
          weight: weightValue,
          bmi: bmiValue,
          bloodType: ["A+", "B+", "O+", "AB+"][Math.floor(Math.random() * 4)],
          visionLeft: ["1.0", "0.8", "0.9", "0.7"][
            Math.floor(Math.random() * 4)
          ],
          visionRight: ["1.0", "0.8", "0.9", "0.7"][
            Math.floor(Math.random() * 4)
          ],
          allergies: Math.random() > 0.5 ? ["Bụi", "Phấn hoa"] : [],
          chronicConditions: Math.random() > 0.7 ? ["Viêm mũi dị ứng"] : [],
          medications: [],
          vaccinations: [
            {
              name: "Sởi-Rubella",
              date: "2022-05-15",
            },
            {
              name: "Viêm não Nhật Bản",
              date: "2021-07-22",
            },
          ],
          notes: "Thể chất khỏe mạnh, không có vấn đề đáng kể",
          lastUpdated: new Date().toISOString(),
          updatedBy: "Trần Thị Hương - Y tá trường",
        },
      ];
    }
  };

  // Hàm lấy lịch sử khai báo sức khỏe của học sinh từ API mới
  const getHealthDeclarations = async (studentId) => {
    try {
      // Lấy khai báo sức khỏe từ state đã lưu và lọc theo studentId
      const studentDeclarations = healthDeclarations.filter(
        (declaration) => declaration.studentId === studentId
      );
      return studentDeclarations;
    } catch (err) {
      console.error(
        `Error fetching declarations for student ${studentId}:`,
        err
      );
      throw new Error("Không thể lấy lịch sử khai báo sức khỏe");
    }
  };

  // Hàm lấy tất cả dữ liệu sức khỏe từ API mới (refresh data)
  const getAllHealthData = async () => {
    try {
      const response = await axios.get(HEALTH_API);
      const allHealthData = response.data;

      if (Array.isArray(allHealthData)) {
        // Phân loại dữ liệu thành khai báo sức khỏe và hồ sơ bệnh án
        const declarations = allHealthData.filter(
          (item) =>
            item.type === "declaration" || (item.temperature && !item.bmi)
        );

        const records = allHealthData.filter(
          (item) =>
            item.type === "medical_record" ||
            (item.height && item.weight && item.bmi)
        );

        setHealthDeclarations(declarations);
        setMedicalRecords(records);
      }

      return allHealthData;
    } catch (err) {
      console.error("Error fetching all health data:", err);
      throw new Error("Không thể lấy dữ liệu sức khỏe");
    }
  };

  // Giữ nguyên các hàm CRUD cho khai báo sức khỏe
  const createHealthDeclaration = async (declarationData) => {
    try {
      const response = await axios.post(HEALTH_API, declarationData);

      // Cập nhật state sau khi tạo thành công
      setHealthDeclarations((prevDeclarations) => [
        ...prevDeclarations,
        response.data,
      ]);

      return response.data;
    } catch (err) {
      console.error("Error creating health declaration:", err);
      throw new Error("Không thể tạo khai báo sức khỏe mới");
    }
  };

  const updateHealthDeclaration = async (id, declarationData) => {
    try {
      const response = await axios.put(`${HEALTH_API}/${id}`, declarationData);

      // Cập nhật state sau khi sửa thành công
      setHealthDeclarations((prevDeclarations) =>
        prevDeclarations.map((decl) => (decl.id === id ? response.data : decl))
      );

      return response.data;
    } catch (err) {
      console.error(`Error updating health declaration ${id}:`, err);
      throw new Error("Không thể cập nhật khai báo sức khỏe");
    }
  };

  const deleteHealthDeclaration = async (id) => {
    try {
      await axios.delete(`${HEALTH_API}/${id}`);

      // Cập nhật state sau khi xóa thành công
      setHealthDeclarations((prevDeclarations) =>
        prevDeclarations.filter((decl) => decl.id !== id)
      );

      return true;
    } catch (err) {
      console.error(`Error deleting health declaration ${id}:`, err);
      throw new Error("Không thể xóa khai báo sức khỏe");
    }
  };

  // Giá trị cung cấp cho context
  const value = {
    students,
    healthDeclarations,
    medicalRecords,
    isLoading,
    error,
    getStudentDetails,
    getMedicalRecords,
    getHealthDeclarations,
    getAllHealthData,
    createHealthDeclaration,
    updateHealthDeclaration,
    deleteHealthDeclaration,
  };

  return (
    <StudentDataContext.Provider value={value}>
      {children}
    </StudentDataContext.Provider>
  );
};

export default StudentDataContext;
