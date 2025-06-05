import React, { createContext, useState, useContext, useEffect } from "react";
// import axios from "axios"; // Comment out axios for now

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Mock user data for testing
const MOCK_USERS = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    name: "Quản trị viên",
    email: "admin@school.edu.vn",
    role: "admin",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    permissions: ["all"],
  },
  {
    id: 2,
    username: "nurse1",
    password: "nurse123",
    name: "Y tá Nguyễn Thị Hoa",
    email: "nurse1@school.edu.vn",
    role: "nurse",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    permissions: ["health_records", "medical_reports", "notifications"],
  },
  {
    id: 3,
    username: "parent1",
    password: "parent123",
    name: "Phụ huynh Trần Văn An",
    email: "parent1@gmail.com",
    role: "parent",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    studentIds: [101, 102], // IDs of their children
    permissions: ["view_child_health", "submit_health_declaration"],
  },
  {
    id: 4,
    username: "parent2",
    password: "parent123",
    name: "Phụ huynh Lê Thị Bình",
    email: "parent2@gmail.com",
    role: "parent",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    studentIds: [103],
    permissions: ["view_child_health", "submit_health_declaration"],
  },
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock API URL - commented out for now
  // const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

  useEffect(() => {
    // Check if we have a mock token in localStorage
    const mockToken = localStorage.getItem("mockAuthToken");
    const mockUser = localStorage.getItem("mockUser");

    const initializeAuth = async () => {
      if (mockToken && mockUser) {
        try {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Parse stored user data
          const userData = JSON.parse(mockUser);
          setCurrentUser(userData);
          console.log("Mock auth initialized with user:", userData);
        } catch (error) {
          console.error("Mock token validation failed:", error);
          localStorage.removeItem("mockAuthToken");
          localStorage.removeItem("mockUser");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Mock login function
  const login = async (username, password) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Find user in mock data
      const user = MOCK_USERS.find(
        (u) => u.username === username && u.password === password
      );

      if (!user) {
        throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác");
      }

      // Create mock token
      const mockToken = `mock_jwt_token_${user.id}_${Date.now()}`;

      // Remove password from user data before storing
      const userDataToStore = {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        permissions: user.permissions,
        studentIds: user.studentIds || [],
      };

      // Store mock token and user data
      localStorage.setItem("mockAuthToken", mockToken);
      localStorage.setItem("mockUser", JSON.stringify(userDataToStore));

      // Set current user
      setCurrentUser(userDataToStore);

      console.log("Mock login successful:", userDataToStore);
      return userDataToStore;
    } catch (error) {
      console.error("Mock login error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("mockAuthToken");
    localStorage.removeItem("mockUser");
    console.log("Mock logout successful");
  };

  // Mock function to get current user (simulate API call)
  const getCurrentUser = async () => {
    try {
      const mockToken = localStorage.getItem("mockAuthToken");
      if (!mockToken) {
        throw new Error("No token found");
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      const mockUser = localStorage.getItem("mockUser");
      if (mockUser) {
        return JSON.parse(mockUser);
      } else {
        throw new Error("User data not found");
      }
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    getCurrentUser,
    loading,
    // Add mock users for testing purposes (remove in production)
    mockUsers: MOCK_USERS.map((user) => ({
      username: user.username,
      role: user.role,
      name: user.name,
    })),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
