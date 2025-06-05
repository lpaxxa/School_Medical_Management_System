import React, { createContext, useState, useContext, useEffect } from "react";
// Import data từ mockData
import { mockUsers, mockLogin } from "../mockData/users";
import { getStudentsByParentId } from "../mockData/students";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have a token in localStorage
    const authToken = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    const initializeAuth = async () => {
      if (authToken && userData) {
        try {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Parse stored user data
          const parsedUserData = JSON.parse(userData);
          setCurrentUser(parsedUserData);
          console.log("Auth initialized with user:", parsedUserData);
        } catch (error) {
          console.error("Token validation failed:", error);
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function using mockLogin from users.js
  const login = async (username, password) => {
    try {
      // Sử dụng mockLogin từ users.js
      const response = await mockLogin(username, password);

      if (response.success) {
        const { user, token } = response.data;

        // Nếu user là parent, lấy thông tin về con cái
        let enhancedUser = { ...user };

        if (user.role === "parent") {
          // Nếu dữ liệu con đã có trong mockUsers, không cần lấy thêm
          if (!user.children) {
            const children = getStudentsByParentId(user.id);
            enhancedUser = {
              ...user,
              children,
            };
          }
        }

        // Store token and user data
        localStorage.setItem("authToken", token);
        localStorage.setItem("userData", JSON.stringify(enhancedUser));

        // Set current user
        setCurrentUser(enhancedUser);

        console.log("Login successful:", enhancedUser);
        return enhancedUser;
      } else {
        throw new Error(response.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    console.log("Logout successful");
  };

  // Function to get current user
  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No token found");
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      const userData = localStorage.getItem("userData");
      if (userData) {
        return JSON.parse(userData);
      } else {
        throw new Error("User data not found");
      }
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  };

  // Hàm để lấy thông tin học sinh từ id
  const getChildrenData = async (parentId) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      return getStudentsByParentId(parentId);
    } catch (error) {
      console.error("Error fetching children data:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    getCurrentUser,
    getChildrenData,
    loading,
    // Cung cấp một danh sách user đơn giản cho mục đích debug (chỉ tên và vai trò)
    availableUsers: mockUsers.map(({ username, role, name }) => ({
      username,
      role,
      name,
    })),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
