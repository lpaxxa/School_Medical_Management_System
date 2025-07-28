import React, { createContext, useState, useContext, useEffect } from "react";

import axios from "axios";
import googleAuthService from "../services/googleAuthService";
import sessionService from "../services/sessionService";

// Base API URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Comprehensive API endpoints configuration
const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: `${BASE_URL}/auth/login`,
    logout: `${BASE_URL}/auth/logout`,
    refresh: `${BASE_URL}/auth/refresh-token`,
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

  // Medication administrations (confirmation data)
  medicationAdministrations: {
    getById: (id) => `${BASE_URL}/medication-administrations/${id}`,
    getAll: `${BASE_URL}/medication-administrations`,
    getByMedicationInstructionId: (instructionId) =>
      `${BASE_URL}/medication-administrations/all/medication-instruction/${instructionId}`,
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

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  // Removed reference to mockUserData as we're using real API now

  // Kiểm tra nếu người dùng đã đăng nhập (sử dụng sessionService)
  useEffect(() => {
    const checkLoggedInUser = () => {
      const userData = sessionService.getUserData();

      if (userData && sessionService.isAuthenticated()) {
        setCurrentUser(userData);
        console.log("✅ User session restored:", userData);
      } else {
        console.log("ℹ️ No valid session found");
      }

      setLoading(false);
    };

    checkLoggedInUser();

    // Setup session callbacks
    const handleSessionExpired = () => {
      console.log("🔔 Session expired, logging out user");
      setCurrentUser(null);
      setAuthError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    };

    const handleSessionWarning = (timeLeft) => {
      const minutes = Math.floor(timeLeft / (1000 * 60));
      console.log(`⚠️ Session expires in ${minutes} minutes`);
      // You can show a warning modal here
    };

    sessionService.onSessionExpired(handleSessionExpired);
    sessionService.onSessionWarning(handleSessionWarning);

    // Cleanup callbacks on unmount
    return () => {
      sessionService.removeCallback(handleSessionExpired);
      sessionService.removeCallback(handleSessionWarning);
    };
  }, []);

  // Hàm đăng nhập sử dụng exact API URL

  const login = async (username, password, rememberMe = false) => {
    try {
      setAuthError(null);
      console.log("🔑 Attempting login with username:", username);

      // Gọi API thực tế để đăng nhập với exact URL
      const response = await axios.post(API_URL, {
        username,
        password,
      });

      // Log response để debug
      console.log("✅ Login API response:", response.data);

      // Xử lý phản hồi từ API
      const userData = response.data;

      if (userData && userData.token) {
        // Tạo object user từ dữ liệu response
        const user = {
          id: userData.memberId,
          email: userData.email,
          role: userData.role.toLowerCase(), // Chuyển về lowercase để phù hợp với các role đã định nghĩa
          phoneNumber: userData.phoneNumber,
          // Thêm các thông tin khác nếu cần
          fullName: userData.fullName || userData.name,
          originalRole: userData.role, // Lưu role gốc để debug
        };

        console.log("👤 User object created:", user);
        console.log(
          "🎫 Token received:",
          userData.token.substring(0, 20) + "..."
        );

        // Lưu thông tin đăng nhập sử dụng sessionService
        const success = sessionService.setAuthData(
          userData.token,
          user,
          rememberMe,
          userData.refreshToken // if available
        );

        if (success) {
          // Cập nhật state
          setCurrentUser(user);
          return user;
        } else {
          throw new Error("Không thể lưu thông tin đăng nhập");
        }
      } else {
        console.error("❌ Login response missing token:", userData);
        throw new Error("Đăng nhập thất bại, không nhận được token");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      console.error("❌ Login error response:", error.response?.data);

      const errorMsg =
        error.response?.data?.message ||
        "Tên đăng nhập hoặc mật khẩu không đúng";
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Hàm đăng nhập với Google
  const loginWithGoogle = () => {
    try {
      setAuthError(null);
      googleAuthService.initiateGoogleLogin();
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  // Hàm để set user từ OAuth2
  const setUser = (user) => {
    setCurrentUser(user);
  };

  // Hàm để set auth token (deprecated, use sessionService instead)
  const setAuthToken = (token) => {
    console.warn(
      "⚠️ setAuthToken is deprecated, use sessionService.setAuthData instead"
    );
    // Use sessionService instead of direct localStorage
    sessionService.setAuthData(token, currentUser || {}, false);
  };

  // Hàm đăng xuất
  const logout = () => {
    sessionService.clearSession();
    setCurrentUser(null);
    setAuthError(null);
    googleAuthService.logout();
    console.log("👋 User logged out successfully");
  };

  const value = {
    currentUser,
    login,
    loginWithGoogle,
    logout,
    setUser,
    setAuthToken,
    authError,
    API_ENDPOINTS, // Make API endpoints available throughout the app
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
