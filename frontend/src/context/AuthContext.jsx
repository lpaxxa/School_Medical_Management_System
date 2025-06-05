import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

// API URL từ mockapi.io
const API_URL = "https://68419fdad48516d1d35c4cf6.mockapi.io/api/login/v1";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Kiểm tra nếu người dùng đã đăng nhập (từ localStorage)
  useEffect(() => {
    const checkLoggedInUser = () => {
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("userData");

      if (token && userData) {
        setCurrentUser(JSON.parse(userData));
      }

      setLoading(false);
    };

    checkLoggedInUser();
  }, []);

  // Hàm đăng nhập sử dụng mockAPI.io
  const login = async (username, password) => {
    try {
      setAuthError(null);

      // Gọi API để lấy danh sách users
      const response = await axios.get(`${API_URL}/users`);
      const users = response.data;

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
        localStorage.setItem("userData", JSON.stringify(userWithoutPassword));

        // Cập nhật state
        setCurrentUser(userWithoutPassword);
        return userWithoutPassword;
      } else {
        throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
      }
    } catch (error) {
      setAuthError(error.message || "Đăng nhập thất bại");
      throw error;
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    logout,
    authError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
