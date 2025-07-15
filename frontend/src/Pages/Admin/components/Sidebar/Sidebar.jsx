import React, { useState } from "react";
import "./Sidebar.css";

const Sidebar = ({ activeSection, onSectionChange, userRole, user }) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  // Cập nhật ID cho khớp với case trong AdminLayout.jsx
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "fas fa-tachometer-alt",
      roles: ["admin", "nurse", "manager"],
    },
    {
      id: "users", // Đã khớp với AdminLayout
      label: "Quản lý người dùng",
      icon: "fas fa-users-cog",
      roles: ["admin"],
    },
    {
      id: "medical-planning", // Cập nhật ID này để khớp với AdminLayout
      label: "Kế hoạch y tế",
      icon: "fas fa-calendar-alt",
      roles: ["admin", "nurse"],
    },
    // {
    //   id: "notifications", // Thêm mục gửi thông báo
    //   label: "Gửi thông báo",
    //   icon: "fas fa-bell",
    //   roles: ["admin", "nurse"],
    // },
    {
      id: "reports", // Đã khớp với AdminLayout
      label: "Quản lý hồ sơ & Thống kê",
      icon: "fas fa-chart-bar",
      roles: ["admin", "manager"],
    },
    {
      id: "ui-showcase",
      label: "Modern UI Showcase",
      icon: "fas fa-palette",
      roles: ["admin"],
    },
    // {
    //   id: "settings",
    //   label: "Cài đặt hệ thống",
    //   icon: "fas fa-cogs",
    //   roles: ["admin"],
    // },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = userRole
    ? menuItems.filter((item) => item.roles.includes(userRole))
    : menuItems;

  const handleClick = (id) => {
    console.log("Sidebar clicked:", id);
    onSectionChange(id);
  };

  const handleLogout = () => {
    // Add logout logic here
    console.log("Logout clicked");
  };

  return (
    <aside className="admin_ui_sidebar">
      {/* Header Section */}
      <div className="admin_ui_sidebar_header">
        <div className="admin_ui_logo">
          <div className="admin_ui_logo_icon">
            <i className="fas fa-heartbeat"></i>
          </div>
          <div className="admin_ui_logo_text">
            <h1>Medical Admin</h1>
            <span>Hệ thống quản lý</span>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="admin_ui_header_actions">
          {/* Notifications */}
          <div className="admin_ui_notification_wrapper">
            <button
              className={`admin_ui_notification_btn ${
                showNotifications ? "active" : ""
              }`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <i className="fas fa-bell"></i>
              <span className="admin_ui_notification_badge">3</span>
            </button>
          </div>

          {/* User Profile */}
          <div className="admin_ui_user_wrapper">
            <button
              className={`admin_ui_user_btn ${
                showUserDropdown ? "active" : ""
              }`}
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <div className="admin_ui_user_avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="admin_ui_user_info">
                <span className="admin_ui_user_name">
                  {user?.fullName || "Admin User"}
                </span>
                <span className="admin_ui_user_role">
                  {user?.role || "Administrator"}
                </span>
              </div>
              <i className="fas fa-chevron-down admin_ui_dropdown_arrow"></i>
            </button>

            {showUserDropdown && (
              <div className="admin_ui_user_dropdown">
                <div className="admin_ui_dropdown_item">
                  <i className="fas fa-user-circle"></i>
                  <span>Hồ sơ cá nhân</span>
                </div>
                <div className="admin_ui_dropdown_item">
                  <i className="fas fa-cog"></i>
                  <span>Cài đặt</span>
                </div>
                <div className="admin_ui_dropdown_divider"></div>
                <div
                  className="admin_ui_dropdown_item admin_ui_logout"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Đăng xuất</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="admin_ui_sidebar_nav">
        <ul>
          {filteredMenuItems.map((item) => (
            <li
              key={item.id}
              className={`admin_ui_nav_item ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => handleClick(item.id)}
              data-tooltip={item.label}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
