import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";
import loginImage from "../assets/A1.jpg";
import googleIcon from "../assets/google.png";
// import axios from "axios"; // Comment out axios for mock implementation

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, mockUsers } = useAuth(); // Get mockUsers for development
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  // Mock API URL - commented out for now
  // const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Use mock login function instead of real API call
      const user = await login(username, password);

      console.log("Login successful, user:", user);
      console.log("Redirecting to:", from);

      // Navigate based on user role
      let redirectPath = from;
      if (from === "/") {
        switch (user.role) {
          case "admin":
            redirectPath = "/admin";
            break;
          case "nurse":
            redirectPath = "/nurse";
            break;
          case "parent":
            redirectPath = "/parent";
            break;
          default:
            redirectPath = "/";
        }
      }

      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }

    /* 
    // Real API implementation - uncomment when backend is ready
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      });

      const { token, user } = response.data;

      if (!token) {
        throw new Error("Token not received from server");
      }

      localStorage.setItem("authToken", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await login(user);
      
      console.log("Login successful, redirecting to:", from);
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login error:", err);

      if (err.response) {
        const serverError = err.response.data?.message || "Invalid credentials";
        setError(serverError);
      } else if (err.request) {
        setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      } else {
        setError(
          err.message ||
            "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập."
        );
      }
    } finally {
      setIsLoading(false);
    }
    */
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);

      // Mock Google login - simulate successful login with a parent account
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockGoogleUser = {
        id: 99,
        username: "google_user",
        name: "Người dùng Google",
        email: "user@gmail.com",
        role: "parent",
        avatar: "https://randomuser.me/api/portraits/women/5.jpg",
        permissions: ["view_child_health", "submit_health_declaration"],
        studentIds: [104],
      };

      // Store mock token and user data
      const mockToken = `mock_google_token_${Date.now()}`;
      localStorage.setItem("mockAuthToken", mockToken);
      localStorage.setItem("mockUser", JSON.stringify(mockGoogleUser));

      // Redirect to parent dashboard
      navigate("/parent", { replace: true });

      /*
      // Real Google OAuth implementation - uncomment when backend is ready
      window.location.href = `${API_URL}/auth/google`;
      */
    } catch (error) {
      console.error("Google login error:", error);
      setError("Không thể kết nối với Google. Vui lòng thử lại sau.");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-image-container">
        <img src={loginImage} alt="School Healthcare" className="login-image" />
        <div className="login-image-overlay">
          <h2>Chào mừng đến với</h2>
          <h1>HỆ THỐNG CHĂM SÓC SỨC KHỎE HỌC ĐƯỜNG</h1>
          <p>Cùng chăm sóc sức khỏe con em chúng ta</p>
        </div>
      </div>

      <div className="login-form-container">
        <div className="login-form-wrapper">
          <div className="login-header">
            <h2>Đăng nhập</h2>
            <p>Vui lòng đăng nhập để tiếp tục</p>
          </div>

          {/* Development helper - show available accounts */}
          {mockUsers && (
            <div
              className="mock-accounts"
              style={{
                background: "#f0f8ff",
                padding: "10px",
                borderRadius: "5px",
                marginBottom: "15px",
                fontSize: "12px",
              }}
            >
              <strong>Tài khoản thử nghiệm:</strong>
              <br />
              {mockUsers.map((user, index) => (
                <span key={index}>
                  <strong>{user.role}:</strong> {user.username}/
                  {user.username === "admin"
                    ? "admin123"
                    : user.username.includes("nurse")
                    ? "nurse123"
                    : "parent123"}
                  {index < mockUsers.length - 1 ? " | " : ""}
                </span>
              ))}
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <div className="input-with-icon">
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="input-with-icon">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="remember-forgot">
              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Ghi nhớ đăng nhập</label>
              </div>
              <a href="#forgot-password" className="forgot-password">
                Quên mật khẩu?
              </a>
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          <div className="login-divider">
            <span>Hoặc đăng nhập bằng</span>
          </div>

          <button
            type="button"
            className="google-login-button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <img src={googleIcon} alt="Google" />
            Đăng nhập với Google (Mock)
          </button>

          <div className="login-footer">
            <p>
              Hỗ trợ:{" "}
              <a href="mailto:support@schoolhealth.edu.vn">
                support@schoolhealth.edu.vn
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
