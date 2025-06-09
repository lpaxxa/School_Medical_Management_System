import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

// API URL từ mockapi.io của bạn
const API_URL = "https://68425631e1347494c31c7892.mockapi.io/api/vi";

const StudentDataContext = createContext();

export function useStudentData() {
  return useContext(StudentDataContext);
}

export const StudentDataProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
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
        // Giả sử API hocsinh của bạn là endpoint chính
        const response = await axios.get(`${API_URL}/hocsinh/hocsinh`);
        
        // Lọc học sinh theo parentId nếu đang đăng nhập là phụ huynh
        let studentsList = response.data;
        
        if (currentUser.role === 'parent') {
          studentsList = studentsList.filter(
            student => student.parentId === currentUser.id
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

  // Hàm lấy thông tin chi tiết của học sinh
  const getStudentDetails = async (studentId) => {
    try {
      const response = await axios.get(`${API_URL}/hocsinh/hocsinh/${studentId}`);
      return response.data;
    } catch (err) {
      console.error(`Error fetching details for student ${studentId}:`, err);
      throw new Error("Không thể lấy thông tin chi tiết học sinh");
    }
  };

  // Hàm lấy hồ sơ y tế của học sinh
  const getMedicalRecords = async (studentId) => {
    try {
      const response = await axios.get(`${API_URL}/medicalRecords?studentId=${studentId}`);
      return response.data;
    } catch (err) {
      console.error(`Error fetching medical records for student ${studentId}:`, err);
      throw new Error("Không thể lấy hồ sơ y tế");
    }
  };

  // Hàm lấy lịch sử khai báo sức khỏe của học sinh
  const getHealthDeclarations = async (studentId) => {
    try {
      const response = await axios.get(`${API_URL}/declarations?studentId=${studentId}`);
      return response.data;
    } catch (err) {
      console.error(`Error fetching declarations for student ${studentId}:`, err);
      throw new Error("Không thể lấy lịch sử khai báo sức khỏe");
    }
  };

  const value = {
    students,
    isLoading,
    error,
    getStudentDetails,
    getMedicalRecords,
    getHealthDeclarations
  };

  return (
    <StudentDataContext.Provider value={value}>
      {children}
    </StudentDataContext.Provider>
  );
};

export default StudentDataContext;