import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import logoImage from "../../../../assets/A1.jpg";
import "./Header.css";

const Header = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(
    new Date().toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  );

  // Handle scroll for header animation with throttle
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Add throttling to improve performance
    let timeoutId = null;
    const throttledHandleScroll = () => {
      if (timeoutId === null) {
        timeoutId = setTimeout(() => {
          handleScroll();
          timeoutId = null;
        }, 100);
      }
    };

    window.addEventListener("scroll", throttledHandleScroll);

    // Update current date every minute
    const dateInterval = setInterval(() => {
      setCurrentDate(
        new Date().toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      );
    }, 60000);

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      clearInterval(dateInterval);
    };
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest(".parent-header")) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMobileMenuOpen]);

  // Thêm ripple effect cho parent-main-nav-link
  useEffect(() => {
    const handleRipple = (e) => {
      const link = e.currentTarget;
      const ripple = document.createElement("span");
      ripple.className = "parent-main-nav-link-ripple";
      const rect = link.getBoundingClientRect();
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      link.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    };
    const navLinks = document.querySelectorAll(".parent-main-nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", handleRipple);
    });
    return () => {
      navLinks.forEach((link) => {
        link.removeEventListener("click", handleRipple);
      });
    };
  }, []);

  // Get user display name from context
  const getDisplayName = () => {
    if (!currentUser) return "Phụ huynh";

    // Try different name fields from AuthContext
    return (
      currentUser.fullName ||
      currentUser.name ||
      currentUser.username ||
      "Phụ huynh"
    );
  };

  // Check if current path matches the link
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  // Check if current path matches the main nav link
  const isActiveMainNav = (path) => {
    return location.pathname === path;
  };

  return (
    <header className={`parent-header ${isScrolled ? "scrolled" : ""}`}>
      <div className="parent-header-top">
        <div className="parent-container">
          <div className="parent-header-nav">
            <Link to="/parent" className="parent-header-logo">
              <img src={logoImage} alt="School Medical" />
              <div className="parent-logo-text">
                School <span>Medical</span>
              </div>
            </Link>

            <nav>
              <ul
                className={`parent-nav-list ${
                  isMobileMenuOpen ? "active" : ""
                }`}
              >
                <li>
                  <Link
                    to="/parent"
                    className={`parent-nav-link ${
                      isActiveLink("/parent") ? "active" : ""
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/parent/introduction"
                    className={`parent-nav-link ${
                      isActiveLink("/parent/introduction") ? "active" : ""
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Giới thiệu
                  </Link>
                </li>
                <li>
                  <Link
                    to="/parent/health-guide"
                    className={`parent-nav-link ${
                      isActiveLink("/parent/health-guide") ? "active" : ""
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Cẩm nang
                  </Link>
                </li>
                <li>
                  <Link
                    to="/parent/community"
                    className={`parent-nav-link ${
                      isActiveLink("/parent/community") ? "active" : ""
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Cộng đồng
                  </Link>
                </li>
                <li>
                  <Link
                    to="/parent/contact"
                    className={`parent-nav-link ${
                      isActiveLink("/parent/contact") ? "active" : ""
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Liên hệ
                  </Link>
                </li>
              </ul>

              <button
                className="parent-mobile-menu-toggle"
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              >
                <i
                  className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"}`}
                ></i>
              </button>
            </nav>

            <div className="parent-header-actions">
              <Link
                to="/parent/notifications"
                className="parent-notification-btn"
              >
                <i className="fas fa-bell"></i>
              </Link>

              {currentUser ? (
                <>
                  <div className="parent-user-greeting">
                    <i className="fas fa-user-circle"></i>
                    <span>{getDisplayName()}</span>
                  </div>
                  <button className="parent-logout-btn" onClick={logout}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Đăng xuất</span>
                  </button>
                </>
              ) : (
                <Link to="/login" className="parent-login-btn">
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Đăng nhập</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isScrolled && (
        <div className="parent-header-navigation">
          <div className="parent-nav-wrapper">
            <ul className="parent-main-nav-list">
              <li className="parent-main-nav-item">
                <Link
                  to="/parent/health-declaration"
                  className={`parent-main-nav-link ${
                    isActiveMainNav("/parent/health-declaration")
                      ? "active"
                      : ""
                  }`}
                >
                  Khai báo sức khỏe
                </Link>
              </li>
              <li className="parent-main-nav-item">
                <Link
                  to="/parent/student-profile"
                  className={`parent-main-nav-link ${
                    isActiveMainNav("/parent/student-profile") ? "active" : ""
                  }`}
                >
                  Hồ sơ học sinh
                </Link>
              </li>
              <li className="parent-main-nav-item">
                <Link
                  to="/parent/medical-records"
                  className={`parent-main-nav-link ${
                    isActiveMainNav("/parent/medical-records") ? "active" : ""
                  }`}
                >
                  Hồ sơ bệnh án
                </Link>
              </li>
              <li className="parent-main-nav-item">
                <Link
                  to="/parent/send-medicine"
                  className={`parent-main-nav-link ${
                    isActiveMainNav("/parent/send-medicine") ? "active" : ""
                  }`}
                >
                  Gửi thuốc
                </Link>
              </li>
            </ul>

            <div className="parent-nav-quick-info">
              <div className="parent-quick-info-item health-status">
                <i className="fas fa-heartbeat"></i>
                <span>Tình trạng: Bình thường</span>
              </div>
              <div className="parent-quick-info-item">
                <i className="fas fa-calendar"></i>
                <span>{currentDate}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
