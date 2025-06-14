import React, { createContext, useState, useContext, useEffect } from "react";

import axios from "axios";

// Exact API URL for authentication
const API_URL = "http://localhost:8080/api/v1/auth/login";


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


  // Hàm đăng nhập sử dụng exact API URL

  const login = async (username, password) => {
    try {
      setAuthError(null);


      // Gọi API thực tế để đăng nhập với exact URL
      const response = await axios.post(API_URL, {
        username,
        password,
      });

      // Xử lý phản hồi từ API
      const userData = response.data;

      if (userData && userData.token) {
        // Tạo object user từ dữ liệu response
        const user = {
          id: userData.memberId,
          email: userData.email,
          role: userData.role.toLowerCase(), // Chuyển về lowercase để phù hợp với các role đã định nghĩa
          phoneNumber: userData.phoneNumber,
        };

        // Lưu thông tin đăng nhập
        localStorage.setItem("authToken", userData.token);
        localStorage.setItem("userData", JSON.stringify(user));

        // Cập nhật state
        setCurrentUser(user);
        return user;
      } else {
        throw new Error("Đăng nhập thất bại, không nhận được token");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Tên đăng nhập hoặc mật khẩu không đúng";
      setAuthError(errorMsg);
      throw new Error(errorMsg);

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
