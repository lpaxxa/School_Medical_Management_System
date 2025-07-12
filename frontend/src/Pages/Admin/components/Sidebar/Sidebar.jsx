import React from "react";
import "./Sidebar.css";

const Sidebar = ({ activeSection, onSectionChange, userRole }) => {
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
