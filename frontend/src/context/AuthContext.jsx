import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { mockUsers } from "../mockData/users";

// Fallback to local mock data since API might not be working
// API URL từ mockapi.io
const API_URL = "https://68419fdad48516d1d35c4cf6.mockapi.io/api/login/v1";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);
  // Hàm đăng nhập sử dụng mockAPI.io hoặc local data
  const login = async (username, password) => {
    try {
      let users = [];
      
      try {
        // Gọi API để lấy danh sách users
        const response = await axios.get(`${API_URL}/users`);
        users = response.data;
      } catch (apiError) {
        console.log("API không có sẵn, chuyển sang dùng local mock data");
        users = mockUsers;
      }

      // Tìm user phù hợp với thông tin đăng nhập
      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        // Loại bỏ mật khẩu khỏi object user
        const { password, ...userWithoutPassword } = user;

        // Tạo token mô phỏng
        const token = `mock-jwt-${Date.now()}`;

        // Lưu thông tin đăng nhập
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(userWithoutPassword));

        // Cập nhật state
        setCurrentUser(userWithoutPassword);
        return userWithoutPassword;
      } else {
        throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
      }
    } catch (error) {
      setError(error.message || "Đăng nhập thất bại");
      throw error;
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("user");
  };

  const value = {
    currentUser,
    login,
    logout,
    error,
    setError,
    isAdmin: currentUser?.role === "admin",
    isNurse: currentUser?.role === "nurse",
    isParent: currentUser?.role === "parent",
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
