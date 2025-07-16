import React from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ activeSection, onSectionChange, userRole }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
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
      id: "articles", // Thêm mục quản lý bài viết
      label: "Quản lý bài viết",
      icon: "fas fa-newspaper",
      roles: ["admin", "nurse"],
    },
    // {
    //   id: "ui-showcase",
    //   label: "Modern UI Showcase",
    //   icon: "fas fa-palette",
    //   roles: ["admin"],
    // },
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

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Logout clicked - starting logout process");

    try {
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

      {/* Logout Section */}
      <div className="admin_ui_sidebar_footer">
        <div
          className="admin_ui_logout_btn"
          onClick={handleLogout}
          data-tooltip="Đăng xuất"
        >
          <i className="fas fa-sign-out-alt"></i>
          <span>Đăng xuất</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
