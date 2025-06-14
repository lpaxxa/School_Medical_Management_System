import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import './Header.css';

const Header = ({ user }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    setDropdownOpen(false);
  };

  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: "Lịch khám",
      message: "3 học sinh cần được khám sức khỏe hôm nay",
      time: "5 phút trước",
      type: "urgent",
      icon: "fas fa-exclamation-circle",
    },
    {
      id: 2,
      title: "Thuốc mới",
      message: "Phụ huynh đã gửi đơn thuốc mới",
      time: "1 giờ trước",
      type: "info",
      icon: "fas fa-pills",
    },
    {
      id: 3,
      title: "Cập nhật hệ thống",
      message: "Hệ thống sẽ bảo trì lúc 23:00",
      time: "2 giờ trước",
      type: "normal",
      icon: "fas fa-info-circle",
    },
  ];

  return (
    <header className="nurse-header">
      <div className="nurse-header-left">
        <div className="nurse-header-logo">
          <div className="logo-icon">
            <i className="fas fa-heartbeat"></i>
          </div>
          <div className="logo-text">
            <h1>MediCare</h1>
            <span>School Medical System</span>
          </div>
        </div>
      </div>
      <div className="nurse-header-right">
        {/* Notifications */}
        <div className="header-notifications">
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
        <div className="nurse-header-user">
          <div className="nurse-header-dropdown">
            <button
              className={`nurse-header-profile ${dropdownOpen ? "active" : ""}`}
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
              <div className="nurse-header-dropdown-content">
                <div className="dropdown-user-info">
                  <div className="dropdown-avatar">
                    {currentUser?.avatar ? (
                      <img src={currentUser.avatar} alt="Avatar" />
                    ) : (
                      <i className="fas fa-user-circle"></i>
                    )}
                  </div>
                  <div className="dropdown-user-details">
                    <h4>{currentUser?.name || "Y Tá"}</h4>
                    <p>{currentUser?.email || "nurse@school.edu.vn"}</p>
                    <span className="user-role">
                      {currentUser?.role || "Nurse"}
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
