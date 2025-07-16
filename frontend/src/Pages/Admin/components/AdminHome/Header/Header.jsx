import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = ({ user }) => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Logout clicked - starting logout process");

    try {
      // Close dropdown first
      setDropdownOpen(false);

      // Call logout function
      console.log("Calling logout function...");
      logout();

      // Add small delay to ensure logout completes
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log("Navigating to login page...");
      navigate("/login");

      // Force page reload as backup
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if there's an error
      window.location.href = "/login";
    }
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Toggle dropdown clicked, current state:", dropdownOpen);
    setDropdownOpen(!dropdownOpen);
    setNotificationsOpen(false);
  };

  const toggleNotifications = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setNotificationsOpen(!notificationsOpen);
    setDropdownOpen(false);
  };

  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: "Báo cáo mới",
      message: "3 báo cáo y tế cần phê duyệt",
      time: "5 phút trước",
      type: "urgent",
      icon: "fas fa-exclamation-circle",
    },
    {
      id: 2,
      title: "Cập nhật hệ thống",
      message: "Hệ thống sẽ bảo trì lúc 23:00",
      time: "1 giờ trước",
      type: "info",
      icon: "fas fa-info-circle",
    },
    {
      id: 3,
      title: "Đăng ký thuốc",
      message: "Phụ huynh đã gửi đơn thuốc mới",
      time: "2 giờ trước",
      type: "normal",
      icon: "fas fa-pills",
    },
  ];

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <div className="admin-header-logo">
          <div className="logo-icon">
            <i className="fas fa-heartbeat"></i>
          </div>
          <div className="logo-text">
            <h1>MediCare</h1>
            <span>School Management</span>
          </div>
        </div>{" "}
      </div>{" "}
      <div className="admin-header-right">
        {/* Notifications */}
        <div className="header-notifications" ref={notificationRef}>
          <button
            className={`notification-btn ${notificationsOpen ? "active" : ""}`}
            onClick={toggleNotifications}
            title="Thông báo"
          >
            <i className="fas fa-bell"></i>
            <span className="notification-badge">3</span>
          </button>
          {notificationsOpen && (
            <div className="notifications-dropdown">
              <div className="dropdown-header">
                <h4>Thông báo</h4>
                <span className="notification-count">3 mới</span>
              </div>
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.type}`}
                  >
                    <div className="notification-icon">
                      <i className={notification.icon}></i>
                    </div>
                    <div className="notification-content">
                      <h5>{notification.title}</h5>
                      <p>{notification.message}</p>
                      <span className="notification-time">
                        {notification.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="dropdown-footer">
                <button>Xem tất cả</button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="admin-header-user">
          {/* <div className="user-info">
            <span className="user-greeting">Xin chào,</span>
            <span className="user-name">
              {currentUser?.name || user?.name || "Admin"}
            </span>
          </div> */}

          <div className="admin-header-dropdown" ref={dropdownRef}>
            <button
              className={`admin-header-profile ${dropdownOpen ? "active" : ""}`}
              onClick={toggleDropdown}
            >
              <div className="profile-avatar">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt="Avatar" />
                ) : (
                  <i className="fas fa-user-circle"></i>
                )}
              </div>
              <i className="fas fa-chevron-down dropdown-arrow"></i>
            </button>

            {dropdownOpen && (
              <div className="admin-header-dropdown-content">
                <div className="dropdown-user-info">
                  <div className="dropdown-avatar">
                    {currentUser?.avatar ? (
                      <img src={currentUser.avatar} alt="Avatar" />
                    ) : (
                      <i className="fas fa-user-circle"></i>
                    )}
                  </div>
                  <div className="dropdown-user-details">
                    <h4>{currentUser?.name || "Admin"}</h4>
                    <p>{currentUser?.email || "admin@school.edu.vn"}</p>
                    <span className="user-role">
                      {currentUser?.role || "Administrator"}
                    </span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={() => {}}>
                  <i className="fas fa-user"></i>
                  <span>Hồ sơ cá nhân</span>
                </button>
                <button className="dropdown-item" onClick={() => {}}>
                  <i className="fas fa-cog"></i>
                  <span>Cài đặt</span>
                </button>
                <button className="dropdown-item" onClick={() => {}}>
                  <i className="fas fa-moon"></i>
                  <span>Chế độ tối</span>
                </button>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item logout"
                  onClick={handleLogout}
                  style={{
                    cursor: "pointer",
                    pointerEvents: "auto",
                    zIndex: 10001,
                    position: "relative",
                  }}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
