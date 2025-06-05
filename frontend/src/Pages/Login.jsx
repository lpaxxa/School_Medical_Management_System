import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";
import loginImage from "../assets/A1.jpg";
import googleIcon from "../assets/google.png";
import axios from "axios"; // Sử dụng axios

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, mockUsers } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const API_URL = "https://68419fdad48516d1d35c4cf6.mockapi.io/api/login/v1/users";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Sử dụng hàm login từ AuthContext đã được cập nhật để gọi đến MockAPI
      const user = await login(username, password);

      console.log("Login successful, user:", user);
      console.log("Redirecting to:", from);

      // Chuyển hướng dựa trên vai trò người dùng
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
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);

      // Gọi API để lấy danh sách người dùng
      const response = await axios.get(`${API_URL}/users`);
      const users = response.data;

      // Tìm một người dùng có role là "parent" để giả lập đăng nhập Google
      const parentUser = users.find((user) => user.role === "parent");

      if (parentUser) {
        // Không sử dụng mật khẩu
        const { password, ...userWithoutPassword } = parentUser;

        // Tạo token giả lập cho đăng nhập Google
        const googleToken = `google-mock-token-${Date.now()}`;

        // Lưu token và thông tin người dùng
        localStorage.setItem("authToken", googleToken);
        localStorage.setItem("userData", JSON.stringify(userWithoutPassword));

        // Chuyển hướng đến trang phụ huynh
        navigate("/parent", { replace: true });
      } else {
        throw new Error("Không tìm thấy tài khoản phụ huynh để đăng nhập");
      }
    } catch (error) {
      console.error("Google login error:", error);
      setError("Đăng nhập Google thất bại. Vui lòng thử lại sau.");
    } finally {
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

          {/* Hiển thị danh sách tài khoản từ MockAPI */}
          {mockUsers && mockUsers.length > 0 && (
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
                  <strong>{user.role}:</strong> {user.username}
                  {index < mockUsers.length - 1 ? " | " : ""}
                </span>
              ))}
              <p>
                <small>
                  Mật khẩu mặc định: <strong>123456</strong>
                </small>
              </p>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Form không thay đổi */}
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
