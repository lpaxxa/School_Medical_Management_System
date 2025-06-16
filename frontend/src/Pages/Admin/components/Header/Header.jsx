import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useStudentData } from "../../../../context/StudentDataContext";
import "./Header.css";

const Header = ({ user }) => {
  const { logout, currentUser } = useAuth();
  const { parentInfo } = useStudentData(); // Lấy thông tin phụ huynh từ context
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    setDropdownOpen(false);
  };

  // Xác định tên hiển thị ưu tiên sử dụng từ parentInfo
  const displayName =
    parentInfo?.fullName ||
    currentUser?.fullName ||
    user?.fullName ||
    currentUser?.email ||
    user?.email ||
    "Phụ huynh";

  // Mock notifications (giữ nguyên như cũ)
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
        
      </div>      <div className="admin-header-right">
        {/* Notifications */}
        <div className="header-notifications">          <button
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

        {/* User Profile - Phần này được cập nhật */}
        <div className="admin-header-user">
          {/* <div className="user-info">
            <span className="user-greeting">Xin chào,</span>

            <span className="user-name">
              {currentUser?.name || user?.name || "Admin"}
            </span>
          </div> */}


          <div className="admin-header-dropdown">
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
                    <h4>{displayName}</h4>
                    <p>
                      {parentInfo?.email ||
                        currentUser?.email ||
                        user?.email ||
                        ""}
                    </p>
                    <span className="user-role">
                      {parentInfo?.relationshipType || "Phụ huynh"}
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
                <button className="dropdown-item logout" onClick={handleLogout}>
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
