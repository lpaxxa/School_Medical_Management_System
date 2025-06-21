import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";

const StudentDataContext = createContext();

// API URLs
const STUDENTS_API_URL = "http://localhost:8080/api/parents/my-students";
const PARENT_API_URL = "http://localhost:8080/api/parents/";

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

  // Sửa hàm fetchHealthProfile để sử dụng đúng endpoint
  const fetchHealthProfile = async (studentId) => {
    if (!studentId) return null;

    setIsLoadingHealthProfiles(true);
    try {
      // SỬA: Sử dụng đúng endpoint API với student ID
      const response = await api.get(
        `/health-profiles/student/${studentId}`
      );

      console.log("Health profile data received:", response.data);
      // In chi tiết các trường dữ liệu
      console.log("dietaryRestrictions:", response.data.dietaryRestrictions);
      console.log("immunizationStatus:", response.data.immunizationStatus);
      console.log("emergencyContactInfo:", response.data.emergencyContactInfo);

      // Cập nhật dữ liệu trong context
      setHealthProfiles((prev) => ({
        ...prev,
        [studentId]: response.data,
      }));

      return response.data;
    } catch (error) {
      console.error("Error fetching health profile:", error);

      // Nếu không tìm thấy hồ sơ (404), trả về null thay vì throw error
      if (error.response?.status === 404) {
        console.log("No health profile found for student:", studentId);
        return null;
      }

      throw error;
    } finally {
      setIsLoadingHealthProfiles(false);
    }
  };

  // Sửa hàm updateHealthProfile để sử dụng đúng endpoint
  const updateHealthProfile = async (healthProfileData) => {
    try {
      // Kiểm tra token trước khi gửi
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }

      // Chuẩn bị dữ liệu gửi API (đảm bảo format đúng)
      const apiData = {
        id: healthProfileData.id,
        bloodType: healthProfileData.bloodType || "Chưa cập nhật",
        height: healthProfileData.height || 0,
        weight: healthProfileData.weight || 0,
        allergies: healthProfileData.allergies || "Không",
        chronicDiseases: healthProfileData.chronicDiseases || "Không",
        visionLeft: healthProfileData.visionLeft || "Bình thường",
        visionRight: healthProfileData.visionRight || "Bình thường",
        hearingStatus: healthProfileData.hearingStatus || "Bình thường",
        dietaryRestrictions: healthProfileData.dietaryRestrictions || "Không",
        emergencyContactInfo:
          healthProfileData.emergencyContactInfo || "Không có",
        immunizationStatus: healthProfileData.immunizationStatus || "Không",
        lastPhysicalExamDate:
          healthProfileData.lastPhysicalExamDate ||
          new Date().toISOString().split("T")[0],
        specialNeeds: healthProfileData.specialNeeds || "Không",
      };

      console.log("Sending health profile data to API:", apiData);

      // SỬA: Sử dụng đúng endpoint API
      const response = await api.post("/health-profiles", apiData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("API response received:", response.data);

      // Cập nhật dữ liệu trong context với response từ server
      const responseData = response.data;
      setHealthProfiles((prev) => ({
        ...prev,
        [responseData.id]: { ...responseData },
      }));

      // Trả về dữ liệu từ server (bao gồm BMI và lastUpdated)
      return response.data;
    } catch (error) {
      console.error("Error updating health profile:", error);

      // Log chi tiết lỗi để debug
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      }

      throw error;
    }
  };

  const value = {
    students,
    parentInfo,
    isLoading,
    isLoadingParent,
    error,
    parentError,
    refreshStudents,
    fetchParentInfo,
  };

  return (
    <StudentDataContext.Provider value={value}>
      {children}
    </StudentDataContext.Provider>
  );
};

export default StudentDataContext;
