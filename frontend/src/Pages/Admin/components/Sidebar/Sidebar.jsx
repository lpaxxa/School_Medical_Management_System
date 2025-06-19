import React from "react";
import "./Sidebar.css";

const Sidebar = ({ activeSection, onSectionChange, userRole }) => {  // Đảm bảo ID "users" cho quản lý người dùng
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "fas fa-tachometer-alt",
      roles: ["admin", "nurse", "manager"],
    },
    {
      id: "users", // ID này phải khớp với case trong AdminLayout
      label: "Quản lý người dùng",
      icon: "fas fa-users-cog",
      roles: ["admin"],
    },
    {
      id: "vaccination",
      label: "Quản lý tiêm chủng",
      icon: "fas fa-syringe",
      roles: ["admin"],
    },
    {
      id: "checkups",
      label: "Quản lý kiểm tra định kỳ",
      icon: "fas fa-calendar-check",
      roles: ["admin"],
    },
    {
      id: "permissions",
      label: "Phân quyền hệ thống",
      icon: "fas fa-shield-alt",
      roles: ["admin"],
    },
    {
      id: "reports",
      label: "Báo cáo & Thống kê",
      icon: "fas fa-chart-bar",
      roles: ["admin", "manager"],
    },
    {
      id: "settings",
      label: "Cài đặt hệ thống",
      icon: "fas fa-cogs",
      roles: ["admin"],
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = userRole
    ? menuItems.filter((item) => item.roles.includes(userRole))
    : menuItems;

  const handleClick = (id) => {
    console.log("Sidebar clicked:", id);
    onSectionChange(id);
  };

  return (
    <aside className="admin-sidebar">
      <nav className="sidebar-nav">
        <ul>
          {filteredMenuItems.map((item) => (
            <li
              key={item.id}
              className={activeSection === item.id ? "active" : ""}
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
