import React from "react";
import { Link, useLocation } from "react-router-dom"; // Thêm useLocation để xác định vị trí hiện tại
import "./Navigation.css";

export default function Navigation() {
  const location = useLocation(); // Hook để lấy đường dẫn hiện tại
  const currentPath = location.pathname;

  // Cập nhật danh sách navItems để thêm đường dẫn đến trang hồ sơ học sinh
  const navItems = [
    { title: "Hồ sơ bệnh án học sinh", path: "/parent/medical-records" },
    { title: "Hồ sơ học sinh", path: "/parent/student-profile" },
    { title: "Gửi thuốc", path: "/parent/send-medicine" },
    { title: "Khai báo sức khỏe học sinh", path: "/parent/health-declaration" }, // Cập nhật path để phù hợp với cấu trúc thư mục
    // { title: "Hồ sơ phụ huynh", path: "/parent-profile" },
  ];

  return (
    <nav className="main-navigation">
      <div className="container">
        <div className="nav-wrapper">
          <ul className="main-nav-list">
            {navItems.map((item, index) => (
              <li key={index} className="main-nav-item">
                <Link
                  to={item.path}
                  className={`main-nav-link ${
                    currentPath === item.path ? "active" : ""
                  }`}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}