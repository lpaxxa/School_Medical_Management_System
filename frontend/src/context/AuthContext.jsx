import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import AuthService from "../services/authService";

// Base API URL
const BASE_URL = "http://localhost:8080/api/v1";

// Comprehensive API endpoints configuration
const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: `${BASE_URL}/auth/login`,
    logout: `${BASE_URL}/auth/logout`,
    refresh: `${BASE_URL}
    /auth/refresh-token`,
  },
  // Parent/Medication related
  parent: {
    submitMedicationRequest: `${BASE_URL}/parent-medication-requests/submit-request`,
    getMedicationRequests: `${BASE_URL}/parent-medication-requests/my-requests`,
    updateMedicationRequest: (id) =>
      `${BASE_URL}/parent-medication-requests/${id}`,
    deleteMedicationRequest: (id) =>
      `${BASE_URL}/parent-medication-requests/${id}`,
  },

  // Student related
  student: {
    getAll: `${BASE_URL}/students`,
    getById: `${BASE_URL}/students`,
    create: `${BASE_URL}/students`,
    update: `${BASE_URL}/students`,
    delete: `${BASE_URL}/students`,
    getByParent: `${BASE_URL}/students/parent`,
  },

  // Nurse/Medical related
  nurse: {
    getMedicationRequests: `${BASE_URL}/nurse/medication-requests`,
    approveMedicationRequest: `${BASE_URL}/nurse/medication-requests/approve`,
    rejectMedicationRequest: `${BASE_URL}/nurse/medication-requests/reject`,
    recordMedication: `${BASE_URL}/nurse/medication-records`,
  },

  // Health profiles
  healthProfiles: {
    getByStudentId: (studentId) =>
      `${BASE_URL}/health-profiles/student/${studentId}`,
    submitDeclaration: `${BASE_URL}/health-profiles`, // Thêm endpoint này để submit khai báo sức khỏe
  },

  // Medical checkups
  medicalCheckups: {
    getByStudentId: (studentId) =>
      `${BASE_URL}/medical-checkups/student/${studentId}`,
  },

  // Admin related
  admin: {
    getUsers: `${BASE_URL}/admin/users`,
    createUser: `${BASE_URL}/admin/users`,
    updateUser: `${BASE_URL}/admin/users`,
    deleteUser: `${BASE_URL}/admin/users`,
    getStatistics: `${BASE_URL}/admin/statistics`,
  },

  // Profile related
  profile: {
    get: `${BASE_URL}/profile`,
    update: `${BASE_URL}/profile`,
    changePassword: `${BASE_URL}/profile/change-password`,
  },
};

// Exact API URL for authentication (keeping for backward compatibility)
const API_URL = API_ENDPOINTS.auth.login;

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// // Mock users for testing
// const mockUserData = [
//   {
//     id: "1",
//     username: "admin",
//     role: "admin",
//     name: "Admin User",
//     token: "mock-token-admin"
//   },
//   {
//     id: "2",
//     username: "yta1",
//     role: "nurse",
//     name: "Y tá 1",
//     token: "mock-token-nurse"
//   },
//   {
//     id: "3",
//     username: "phuhuynh",
//     role: "parent",
//     name: "Phụ huynh",
//     token: "mock-token-parent"
//   }
// ];

const SKIP_TOKEN_VALIDATION = true; // Set là false nếu server đã hỗ trợ validate-token

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

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

  // Kiểm tra token khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("userData");

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      // Nếu bỏ qua validate, chỉ cần set state từ localStorage
      if (SKIP_TOKEN_VALIDATION) {
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setCurrentUser(parsedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
        setLoading(false);
        return;
      }

      // Phần còn lại giữ nguyên (code validate-token)
      try {
        const response = await axios.get(`${BASE_URL}/auth/validate-token`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.valid) {
          setIsAuthenticated(true);
          setUser(response.data.user);
        } else {
          // Token không hợp lệ, xóa khỏi localStorage
          localStorage.removeItem("authToken");
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        // Không xóa token nếu API lỗi để tránh tự đăng xuất
        // (Chỉ xóa khi server trả về token thực sự hết hạn)
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("authToken");
          setIsAuthenticated(false);
          setUser(null);
        }
        // Với các lỗi khác như 404, giữ nguyên trạng thái đăng nhập
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
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

  // Đảm bảo hai state user và currentUser luôn đồng bộ
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }
  }, [currentUser]);

  // Google login function
  const loginWithGoogle = () => {
    try {
      AuthService.initiateGoogleLogin();
    } catch (error) {
      console.error('Error initiating Google login:', error);
      setAuthError('Không thể khởi tạo đăng nhập Google. Vui lòng thử lại.');
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    loginWithGoogle, // Add Google login function
    authError,
    setCurrentUser, // Expose setCurrentUser for OAuth callback
    API_ENDPOINTS, // Make API endpoints available throughout the app
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
