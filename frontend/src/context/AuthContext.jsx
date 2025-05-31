import React, { createContext, useState, useContext, useEffect } from "react";

// Mock users data (trong thực tế sẽ thay bằng API calls)
const mockUsers = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    name: "Admin Hệ thống",
    role: "admin",
    email: "admin@school.edu.vn",
  },
  {
    id: 2,
    username: "parent",
    password: "parent123",
    name: "Nguyễn Văn A",
    role: "parent",
    email: "parent@example.com",
  },
  {
    id: 3,
    username: "nurse",
    password: "nurse123",
    name: "Y tá Trường",
    role: "nurse",
    email: "nurse@school.edu.vn",
  },
];

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

  // Hàm đăng nhập
  const login = async (username, password) => {
    return new Promise((resolve, reject) => {
      // Mô phỏng API call
      setTimeout(() => {
        const user = mockUsers.find(
          (u) => u.username === username && u.password === password
        );

        if (user) {
          // Không lưu mật khẩu vào state và localStorage
          const { password, ...userWithoutPassword } = user;
          setCurrentUser(userWithoutPassword);
          localStorage.setItem("user", JSON.stringify(userWithoutPassword));
          resolve(userWithoutPassword);
        } else {
          reject({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
        }
      }, 800);
    });
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
