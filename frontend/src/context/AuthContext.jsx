import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";

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

  // Hàm đăng nhập sử dụng backend API
  const login = async (username, password) => {
    try {
      setAuthError(null);

      // Gọi API đăng nhập của backend
      const response = await api.post("/auth/login", {
        username,
        password
      });

      const authData = response.data;
      
      if (authData && authData.token) {
        // Lưu token và thông tin user
        localStorage.setItem("authToken", authData.token);
        localStorage.setItem("userData", JSON.stringify(authData));

        // Cập nhật state với thông tin user
        setCurrentUser(authData);
        return authData;
      } else {
        throw new Error("Phản hồi không hợp lệ từ server");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.statusText || 
                          error.message || 
                          "Đăng nhập thất bại";
      setAuthError(errorMessage);
      throw new Error(errorMessage);
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
