import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Mock users for testing
const mockUserData = [
  {
    id: "1",
    username: "admin",
    role: "admin",
    name: "Admin User",
    token: "mock-token-admin"
  },
  {
    id: "2", 
    username: "yta1",
    role: "nurse",
    name: "Y tá 1",
    token: "mock-token-nurse"
  },
  {
    id: "3",
    username: "phuhuynh",
    role: "parent",
    name: "Phụ huynh",
    token: "mock-token-parent"
  }
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [mockUsers, setMockUsers] = useState(mockUserData);

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

  // Hàm đăng nhập sử dụng mock data (tạm thời)
  const login = async (username, password) => {
    try {
      setAuthError(null);
      
      // Kiểm tra với mock data (để dùng tạm)
      const user = mockUserData.find(user => user.username === username);
      
      if (user && password === "123456") {
        // Tạo dữ liệu xác thực giả
        const authData = {
          ...user,
          token: `mock-token-${user.role}-${Date.now()}`
        };
        
        // Lưu token và thông tin user vào localStorage
        localStorage.setItem("authToken", authData.token);
        localStorage.setItem("userData", JSON.stringify(authData));
        
        // Cập nhật state
        setCurrentUser(authData);
        return authData;
      }
      
      // Nếu thông tin đăng nhập không đúng
      throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
      
      // Code gọi API thật (đã bị comment để sử dụng mock data tạm thời)
      /*
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
      */
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
    mockUsers  // Add mockUsers to the context value
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
