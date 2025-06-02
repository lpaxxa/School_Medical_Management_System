import React from "react";
import "./Sidebar.css";

const Sidebar = ({ activeSection, onSectionChange, userRole }) => {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "fas fa-tachometer-alt",
      roles: ["admin", "nurse"],
    },
    {
      id: "users",
      label: "Quản lý người dùng",
      icon: "fas fa-users",
      roles: ["admin"],
    },
    {
      id: "permissions",
      label: "Phân quyền",
      icon: "fas fa-lock",
      roles: ["admin"],
    },
    {
      id: "reports",
      label: "Báo cáo",
      icon: "fas fa-chart-bar",
      roles: ["admin", "nurse"],
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <aside className="admin-sidebar">
      <nav className="sidebar-nav">
        <ul>
          {filteredMenuItems.map((item) => (
            <li
              key={item.id}
              className={activeSection === item.id ? "active" : ""}
              onClick={() => onSectionChange(item.id)}
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
