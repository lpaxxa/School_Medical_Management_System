import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";
import api from "../services/api";

const StudentDataContext = createContext();

// API URLs
const STUDENTS_API_URL = "http://localhost:8080/api/v1/parents/my-students";
const PARENT_API_URL = "http://localhost:8080/api/v1/parents/";

export function useStudentData() {
  return useContext(StudentDataContext);
}

export const StudentDataProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [parentInfo, setParentInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingParent, setIsLoadingParent] = useState(false);
  const [error, setError] = useState(null);
  const [parentError, setParentError] = useState(null);
  const [healthProfiles, setHealthProfiles] = useState({});
  const [isLoadingHealthProfiles, setIsLoadingHealthProfiles] = useState(false);
  const { currentUser } = useAuth();

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!currentUser || currentUser.role !== "parent") {
        setStudents([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get token from localStorage
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        // Call the exact API URL with the JWT token
        const response = await axios.get(STUDENTS_API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Student data received:", response.data);
        const studentsData = response.data || [];
        setStudents(studentsData);

        // If students data is available, fetch parent info
        if (studentsData.length > 0) {
          fetchParentInfo(studentsData[0].parentId);
        }
      } catch (err) {
        console.error("Error fetching student data:", err);
        setError(err.message || "Failed to fetch student data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [currentUser]);

  // Function to fetch parent information
  const fetchParentInfo = async (parentId) => {
    if (!parentId) return;

    try {
      setIsLoadingParent(true);
      setParentError(null);

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.get(`${PARENT_API_URL}${parentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Parent data received:", response.data);
      setParentInfo(response.data);
    } catch (err) {
      console.error("Error fetching parent info:", err);
      setParentError(err.message || "Failed to fetch parent information");
    } finally {
      setIsLoadingParent(false);
    }
  };

  const refreshStudents = async () => {
    if (!currentUser || currentUser.role !== "parent") return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(STUDENTS_API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStudents(response.data || []);
      setError(null);

      // Refresh parent info too
      if (response.data && response.data.length > 0) {
        fetchParentInfo(response.data[0].parentId);
      }
    } catch (err) {
      console.error("Error refreshing student data:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch students with timeout
  const fetchStudents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Sử dụng Promise.race để thiết lập timeout
      const timeoutPromise = new Promise(
        (_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 10000) // 10 giây timeout
      );

      const token = localStorage.getItem("authToken");
      const response = await Promise.race([
        axios.get(STUDENTS_API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        timeoutPromise,
      ]);

      if (response.data) {
        setStudents(response.data);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Không thể tải thông tin học sinh. Vui lòng thử lại sau.");
      // Hiển thị thông báo lỗi cho người dùng
    } finally {
      setIsLoading(false);
    }
  };

  // Thêm function để fetch và cập nhật health profile
  const fetchHealthProfile = async (studentId) => {
    if (!studentId) return null;

    setIsLoadingHealthProfiles(true);
    try {
      const response = await api.get(`/health-profiles/student/${studentId}`);

      // Cập nhật dữ liệu trong context
      setHealthProfiles((prev) => ({
        ...prev,
        [studentId]: response.data,
      }));

      return response.data;
    } catch (error) {
      console.error("Error fetching health profile:", error);
      return null;
    } finally {
      setIsLoadingHealthProfiles(false);
    }
  };

  // Thêm function để cập nhật health profile
  const updateHealthProfile = async (profileData) => {
    try {
      const response = await api.post("/health-profiles", profileData);

      // Cập nhật dữ liệu cache trong context
      setHealthProfiles((prev) => ({
        ...prev,
        [profileData.id]: response.data,
      }));

      return response.data;
    } catch (error) {
      console.error("Error updating health profile:", error);
      throw error;
    }
  };

  const value = {
    students,
    parentInfo,
    isLoading,
    error,
    refreshStudents,
    fetchParentInfo, // Đảm bảo hàm này nằm trong value
    healthProfiles,
    isLoadingHealthProfiles,
    fetchHealthProfile,
    updateHealthProfile,
  };

  return (
    <StudentDataContext.Provider value={value}>
      {children}
    </StudentDataContext.Provider>
  );
};

export default StudentDataContext;
