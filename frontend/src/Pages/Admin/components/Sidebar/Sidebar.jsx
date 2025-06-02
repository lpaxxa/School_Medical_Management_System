import React from "react";
import "./Sidebar.css";

// Role-based menu configurations
const menuOptions = {
  admin: [
    { id: "dashboard", icon: "fas fa-tachometer-alt", label: "Dashboard" },
    { id: "users", icon: "fas fa-users", label: "Quản lý người dùng" },
    { id: "permissions", icon: "fas fa-user-shield", label: "Phân quyền" },
    { id: "reports", icon: "fas fa-chart-bar", label: "Báo cáo thống kê" },
    { id: "settings", icon: "fas fa-cog", label: "Cài đặt" },
  ],
  manager: [
    { id: "dashboard", icon: "fas fa-tachometer-alt", label: "Dashboard" },
    { id: "users", icon: "fas fa-users", label: "Quản lý người dùng" },
    { id: "reports", icon: "fas fa-chart-bar", label: "Báo cáo thống kê" },
    { id: "nurses", icon: "fas fa-user-md", label: "Quản lý Y tá" },
    { id: "records", icon: "fas fa-file-medical", label: "Hồ sơ Y tế" },
  ],
  staff: [
    { id: "dashboard", icon: "fas fa-tachometer-alt", label: "Dashboard" },
    { id: "reports", icon: "fas fa-chart-bar", label: "Báo cáo thống kê" },
    { id: "records", icon: "fas fa-file-medical", label: "Hồ sơ Y tế" },
  ],
};

const Sidebar = ({ activeSection, onSectionChange, userRole }) => {
  // Get menu options based on user role, default to staff options
  const menuItems = menuOptions[userRole] || menuOptions.staff;

  return (
    <aside className="admin-sidebar">
      <ul className="admin-menu">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={`admin-menu-item ${
              activeSection === item.id ? "active" : ""
            }`}
            onClick={() => onSectionChange(item.id)}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
