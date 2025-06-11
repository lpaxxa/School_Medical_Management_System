import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

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
        
        // Gọi API để lấy danh sách học sinh từ backend
        const response = await api.get('/students');
        
        // Lọc học sinh theo parentId nếu đang đăng nhập là phụ huynh
        let studentsList = response.data;
        
        if (currentUser.role === 'parent') {
          studentsList = studentsList.filter(
            student => student.parentId === currentUser.memberId
          );
        }
        
        setStudents(studentsList);
      } catch (err) {
        console.error("Error fetching student data:", err);
        // Don't show error for now, just set empty array
        setStudents([]);
        setError(null); // Temporarily disable error to prevent blocking
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to prevent blocking initial render
    const timeoutId = setTimeout(fetchStudents, 100);
    return () => clearTimeout(timeoutId);
  }, [currentUser]);

  // Hàm lấy thông tin chi tiết của học sinh
  const getStudentDetails = async (studentId) => {
    try {
      const response = await api.get(`/students/${studentId}`);
      return response.data;
    } catch (err) {
      console.error(`Error fetching details for student ${studentId}:`, err);
      throw new Error("Không thể lấy thông tin chi tiết học sinh");
    }
  };

  // Hàm lấy hồ sơ y tế của học sinh
  const getMedicalRecords = async (studentId) => {
    try {
      const response = await api.get(`/medical-records?studentId=${studentId}`);
      return response.data;
    } catch (err) {
      console.error(`Error fetching medical records for student ${studentId}:`, err);
      throw new Error("Không thể lấy hồ sơ y tế");
    }
  };

  // Hàm lấy lịch sử khai báo sức khỏe của học sinh
  const getHealthDeclarations = async (studentId) => {
    try {
      const response = await api.get(`/health-declarations?studentId=${studentId}`);
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