import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";
import loginImage from "../assets/A1.jpg";
import googleIcon from "../assets/google.png";
import axios from "axios"; // Make sure axios is installed

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1/auth/login";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Call backend login endpoint
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      });

      // Extract JWT token from response
      const { token, user } = response.data;

      if (!token) {
        throw new Error("Token not received from server");
      }

      // Store token in localStorage for later use
      localStorage.setItem("authToken", token);

      // Set authorization header for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Call the login function from AuthContext with the user data
      await login(user);

      console.log("Login successful, redirecting to:", from);
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login error:", err);

      // Handle different types of errors
      if (err.response) {
        // Server responded with an error status
        const serverError = err.response.data?.message || "Invalid credentials";
        setError(serverError);
      } else if (err.request) {
        // Request was made but no response received
        setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      } else {
        // Error in request setup
        setError(
          err.message ||
            "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);

      // Redirect to Google OAuth endpoint
      window.location.href = `${API_URL}/auth/google`;

      // Note: The redirect will handle the rest of the flow
      // You'll need a separate route to handle the Google callback
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

          {/* Phần đăng nhập bằng Google */}
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
            Đăng nhập với Google
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
