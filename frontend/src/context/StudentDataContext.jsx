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
