import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import { useStudentData } from "../../../../context/StudentDataContext";
import { useNotification } from "../../../../context/NotificationContext";
import logoImage from "../../../../assets/A1.jpg";
import "./Header.css";

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { parentInfo } = useStudentData();
  const { unreadCount } = useNotification() || { unreadCount: 0 };
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Xử lý scroll để thêm class .scrolled và điều chỉnh navigation
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector(".header");
      const navigation = document.querySelector(".main-navigation");

      if (window.scrollY > 50) {
        header?.classList.add("scrolled");
        // Điều chỉnh navigation để stick sát với header khi scroll
        if (navigation) {
          navigation.style.top = "60px"; // Header height khi scroll
        }
      } else {
        header?.classList.remove("scrolled");
        // Khôi phục position ban đầu của navigation
        if (navigation) {
          navigation.style.top = "70px"; // Header height ban đầu
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update thời gian thực
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    setDropdownOpen(false);
  };

  // Kiểm tra path hiện tại để áp dụng class active
  const isActive = (path) => {
    if (path === "/parent") {
      return location.pathname === "/parent" ? "active" : "";
    }
    return location.pathname === path ? "active" : "";
  };

  // Xác định tên hiển thị ưu tiên sử dụng từ parentInfo
  const displayName = parentInfo?.fullName || currentUser?.email || "Phụ huynh";

  return (
    <header className="header">
      {/* Top Header Row - Logo and Actions */}
      <div className="header-top">
        <div className="container">
          <nav className="header-nav">
            {/* Logo area - Sử dụng logo được import */}
            <Link to="/parent" className="header-logo">
              <img src={logoImage} alt="School Medical System Logo" />
              <div className="logo-text">
                School <span>Medical</span>
              </div>
            </Link>

            {/* Mobile toggle */}
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              <i
                className={`fas ${mobileMenuOpen ? "fa-times" : "fa-bars"}`}
              ></i>
            </button>

            {/* Nav list - giữ nguyên các mục ban đầu của header */}
            <ul className={`nav-list ${mobileMenuOpen ? "active" : ""}`}>
              <li>
                <Link
                  to="/parent"
                  className={`nav-link ${isActive("/parent")}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  to="/parent/introduction"
                  className={`nav-link ${
                    location.pathname.includes("/introduction") ? "active" : ""
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
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
                  onClick={() => setMobileMenuOpen(false)}
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
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cộng đồng
                </Link>
              </li>
            </ul>

            {/* Actions area - Cập nhật phần thông báo với badge */}
            <div className="header-actions">
              <Link to="/parent/notifications" className="notification-btn">
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </Link>

              {currentUser ? (
                <div className="user-menu">
                  <span className="user-greeting">
                    <i className="fas fa-user-circle"></i>
                    Xin chào, {displayName}
                  </span>
                  <button className="logout-btn" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>{" "}
                    <span>Đăng xuất</span>
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
      </div>

      {/* Bottom Header Row - Main Navigation */}
      <div className="header-navigation">
        <div className="nav-wrapper">
          <ul className="main-nav-list">
            <li className="main-nav-item">
              <Link
                to="/parent/medical-records"
                className={`main-nav-link ${
                  location.pathname.includes("/medical-records") ? "active" : ""
                }`}
              >
                Hồ sơ bệnh án học sinh
              </Link>
            </li>
            <li className="main-nav-item">
              <Link
                to="/parent/student-profile"
                className={`main-nav-link ${
                  location.pathname.includes("/student-profile") ? "active" : ""
                }`}
              >
                Hồ sơ học sinh
              </Link>
            </li>
            <li className="main-nav-item">
              <Link
                to="/parent/send-medicine"
                className={`main-nav-link ${
                  location.pathname.includes("/send-medicine") ? "active" : ""
                }`}
              >
                Gửi thuốc
              </Link>
            </li>
            <li className="main-nav-item">
              <Link
                to="/parent/health-declaration"
                className={`main-nav-link ${
                  location.pathname.includes("/health-declaration")
                    ? "active"
                    : ""
                }`}
              >
                Khai báo sức khỏe học sinh
              </Link>
            </li>
          </ul>

          {/* Quick Info Panel */}
          <div className="nav-quick-info">
            <div className="quick-info-item">
              <i className="fas fa-calendar-day"></i>
              <span>
                {currentTime.toLocaleDateString("vi-VN", {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                })}
              </span>
            </div>
            <div className="quick-info-item">
              <i className="fas fa-clock"></i>
              <span>
                {currentTime.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="quick-info-item health-status">
              <i className="fas fa-heart"></i>
              <span>Khỏe mạnh</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
