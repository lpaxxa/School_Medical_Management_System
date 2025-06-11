import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import logoImage from "../../../../assets/A1.jpg"; // Import logo từ thư mục assets
import "./Header.css";

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Xử lý scroll để thêm class .scrolled
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector(".header");
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Kiểm tra path hiện tại để áp dụng class active
  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="header-nav">
          {/* Logo area - Sử dụng logo được import */}
          <Link to="/" className="header-logo">
            <img src={logoImage} alt="School Medical System Logo" />
            <div className="logo-text">
              School <span>Medical</span>
            </div>
          </Link>

          {/* Mobile toggle */}
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <i className={`fas ${mobileMenuOpen ? "fa-times" : "fa-bars"}`}></i>
          </button>

          {/* Nav list - áp dụng class active cho mục đang active */}
          <ul className={`nav-list ${mobileMenuOpen ? "active" : ""}`}>
            <li>
              <Link to="/" className={`nav-link ${isActive("/")}`}>
                Trang chủ
              </Link>
            </li>
            <li>
              <Link
                to="/parent/introduction"
                className={`nav-link ${
                  location.pathname.includes("/introduction") ? "active" : ""
                }`}
              >
                Giới thiệu
              </Link>
            </li>
            <li>
              <Link
                to="/parent/health-guide"
                className={`nav-link ${
                  location.pathname.includes("/health-guide") ? "active" : ""
                }`}
              >
                Cẩm nang
              </Link>
            </li>
            <li>
              <Link
                to="/parent/community"
                className={`nav-link ${
                  location.pathname.includes("/community") ? "active" : ""
                }`}
              >
                Cộng đồng
              </Link>
            </li>
          </ul>

          {/* Actions area */}
          <div className="header-actions">
            <Link to="/parent/notifications" className="notification-btn">
              <i className="fas fa-bell"></i>
              <span className="notification-badge">3</span>
            </Link>

            {currentUser ? (
              <div className="user-menu">
                <span className="user-greeting">
                  <i className="fas fa-user-circle"></i>
                  Xin chào, {currentUser.name}
                </span>
                <button className="logout-btn" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="login-btn">
                <i className="fas fa-sign-in-alt"></i> <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
