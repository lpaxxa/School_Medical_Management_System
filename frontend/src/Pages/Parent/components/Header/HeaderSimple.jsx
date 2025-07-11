import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import "./HeaderSimple.css";

const HeaderSimple = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Simple scroll detection - no complex throttling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest(".simple-header")) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMobileMenuOpen]);

  // Get user display name
  const getDisplayName = () => {
    if (!currentUser) return "Phụ huynh";
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

  return (
    <header className={`simple-header ${isScrolled ? "scrolled" : ""}`}>
      <div className="simple-header-container">
        <div className="simple-header-content">
          {/* Logo */}
          <Link to="/parent" className="simple-header-logo">
            <img src="/logo.svg" alt="School Medical" />
            <div className="simple-logo-text">
              School <span>Medical</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="simple-nav">
            <ul
              className={`simple-nav-list ${isMobileMenuOpen ? "active" : ""}`}
            >
              <li>
                <Link
                  to="/parent"
                  className={`simple-nav-link ${
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
                  className={`simple-nav-link ${
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
                  className={`simple-nav-link ${
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
                  className={`simple-nav-link ${
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
                  className={`simple-nav-link ${
                    isActiveLink("/parent/contact") ? "active" : ""
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Liên hệ
                </Link>
              </li>
            </ul>

            <button
              className="simple-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <i
                className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"}`}
              ></i>
            </button>
          </nav>

          {/* Actions */}
          <div className="simple-header-actions">
            <Link
              to="/parent/notifications"
              className="simple-notification-btn"
            >
              <i className="fas fa-bell"></i>
            </Link>

            {currentUser ? (
              <>
                <div className="simple-user-greeting">
                  <i className="fas fa-user-circle"></i>
                  <span>{getDisplayName()}</span>
                </div>
                <button
                  className="simple-logout-btn"
                  onClick={() => {
                    logout();
                    window.location.href = "/login";
                  }}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Đăng xuất</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="simple-login-btn">
                <i className="fas fa-sign-in-alt"></i>
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderSimple;
