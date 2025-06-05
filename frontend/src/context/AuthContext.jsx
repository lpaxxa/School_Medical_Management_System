import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fix this line - replace process.env with import.meta.env
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1/auth/login";

  useEffect(() => {
    // Check if we have a token in localStorage
    const token = localStorage.getItem("authToken");

    const initializeAuth = async () => {
      if (token) {
        try {
          // Set the auth header
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Verify token validity and get user data
          const response = await axios.get(`${API_URL}/auth/me`);
          setCurrentUser(response.data);
        } catch (error) {
          // If token is invalid or expired
          console.error("Token validation failed:", error);
          localStorage.removeItem("authToken");
          delete axios.defaults.headers.common["Authorization"];
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [API_URL]);

  // Login function - used by Login component
  const login = async (userData) => {
    setCurrentUser(userData);
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("authToken");
    delete axios.defaults.headers.common["Authorization"];
  };

  // Create an axios interceptor to handle token expiration
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 Unauthorized and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
              const response = await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken,
              });

              const { token } = response.data;
              localStorage.setItem("authToken", token);
              axios.defaults.headers.common[
                "Authorization"
              ] = `Bearer ${token}`;

              // Retry the original request
              return axios(originalRequest);
            } else {
              // No refresh token, logout the user
              logout();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            // Refresh failed, logout the user
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Clean up interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [API_URL]);

  const value = {
    currentUser,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
