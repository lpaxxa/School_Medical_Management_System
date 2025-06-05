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
  const [error, setError] = useState("");
  const [mockUsers, setMockUsers] = useState([]); // Lưu trữ danh sách người dùng từ API

  // Tải danh sách user từ mockapi.io khi khởi tạo
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await axios.get(`${API_URL}/users`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Lưu danh sách user không chứa mật khẩu để hiển thị trên UI
        const usersForUI = response.data.map(({ password, ...user }) => user);
        setMockUsers(usersForUI);
        console.log("Mock API connected successfully");
      } catch (err) {
        console.error("Error fetching users from mockapi.io:", err);
        console.log("Using fallback mock users");

        // Dữ liệu dự phòng nếu API không hoạt động
        const fallbackUsers = [
          {
            id: "1",
            username: "admin",
            name: "Admin Hệ thống",
            role: "admin",
          },
          {
            id: "2",
            username: "phuhuynh1",
            name: "Nguyễn Văn A",
            role: "parent",
          },
          {
            id: "3",
            username: "yta1",
            name: "Y Tá Trường",
            role: "nurse",
          },
        ];

        setMockUsers(fallbackUsers);
      }
    };

    fetchUsers();
  }, []);

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("userData");

    if (storedToken && storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Hàm đăng nhập
  const login = async (username, password) => {
    try {
      // Gọi API từ mockapi.io để lấy danh sách người dùng
      const response = await axios.get(`${API_URL}/users`);
      const users = response.data;

      // Tìm user tương ứng với username và password đã nhập
      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        // Không lưu mật khẩu vào state và localStorage
        const { password, ...userWithoutPassword } = user;

        // Tạo token giả lập
        const token = `mock-jwt-${Date.now()}`;

        // Lưu token và thông tin người dùng
        localStorage.setItem("authToken", token);
        localStorage.setItem("userData", JSON.stringify(userWithoutPassword));

        // Cập nhật state
        setCurrentUser(userWithoutPassword);

        return userWithoutPassword;
      } else {
        throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  };

  // Hàm tạo user mới (nếu cần)
  const registerUser = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/users`, userData);
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    registerUser,
    error,
    setError,
    mockUsers, // Cung cấp danh sách người dùng cho UI
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

export default AuthContext;
