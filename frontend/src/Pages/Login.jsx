import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";
import loginImage from "../assets/A1.jpg";
import googleIcon from "../assets/google.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const { login, loginWithGoogle, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  // Kích hoạt animation sau khi component mount
  useEffect(() => {
    setShowAnimation(true);
    const remembered = localStorage.getItem("rememberMe") === "true";
    setRememberMe(remembered);

    // Nếu có thông tin ghi nhớ đăng nhập, tự động điền username
    if (remembered) {
      const savedUsername = localStorage.getItem("savedUsername");
      if (savedUsername) setUsername(savedUsername);
    }

    // Check for OAuth2 error in URL parameters
    const urlParams = new URLSearchParams(location.search);
    const oauthError = urlParams.get('error');
    if (oauthError) {
      setError(decodeURIComponent(oauthError));
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const user = await login(username, password);
      console.log("Login successful, user:", user);

      // Lưu trạng thái "ghi nhớ đăng nhập" và username
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("savedUsername", username);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("savedUsername");
      }

      // Điều hướng dựa trên vai trò người dùng
      let redirectPath = from;
      if (from === "/") {
        switch (user.role?.toLowerCase()) {
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
  };


  const handleGoogleLogin = () => {
    try {
      setError("");
      loginWithGoogle();
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.message || "Đăng nhập Google thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className={`login-container ${showAnimation ? "animate" : ""}`}>
      {/* Phần banner bên trái */}
      <div className="login-banner">
        <img
          src={loginImage}
          className="login-banner-image"
          alt="School Healthcare"
        />
        <div className="login-banner-content">
          <h2>Chào mừng đến với</h2>
          <h1>HỆ THỐNG CHĂM SÓC SỨC KHỎE HỌC ĐƯỜNG</h1>
          <p>Cùng chăm sóc sức khỏe con em chúng ta</p>
        </div>
      </div>

      {/* Phần form đăng nhập bên phải */}
      <div className="login-form-section">
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <h2>Đăng nhập</h2>
            <p>Vui lòng đăng nhập để tiếp tục</p>
          </div>


          {/* Test accounts information */}
          <div className="test-accounts">
            <strong>Tài khoản thử nghiệm:</strong>
            <br />
            <span>
              <strong>Admin:</strong> admin | <strong>Y tá:</strong> nurse | <strong>Phụ huynh:</strong> parent
            </span>
            <p>
              <small>
                Mật khẩu mặc định: <strong>123456</strong>
              </small>
            </p>
          </div>


          {/* Thông báo lỗi */}
          {(error || authError) && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error || authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="username">Email đăng nhập</label>
              <div className="input-control">
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập email đăng nhập"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="input-control">
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

            <div className="form-actions">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Ghi nhớ đăng nhập</label>
              </div>
              <Link to="/forgot-password" className="forgot-password">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>

            <div className="divider">
              <span>Hoặc đăng nhập bằng</span>
            </div>

            <button
              type="button"
              className="social-button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <img src={googleIcon} alt="Google" />
              Đăng nhập với Google
            </button>
          </form>

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
