import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";

export default function Navigation() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [scrolled, setScrolled] = useState(false);

  // Theo dõi cuộn trang để thêm hiệu ứng khi cuộn
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Danh sách menu với icon
  const navItems = [
    {
      title: "Hồ sơ bệnh án",
      path: "/parent/medical-records",
      icon: "fas fa-file-medical",
    },
    {
      title: "Hồ sơ học sinh",
      path: "/parent/student-profile",
      icon: "fas fa-user-graduate",
    },
    {
      title: "Gửi thuốc",
      path: "/parent/send-medicine",
      icon: "fas fa-pills",
    },
    {
      title: "Khai báo sức khỏe",
      path: "/parent/health-declaration",
      icon: "fas fa-clipboard-check",
    },
  ];

  return (
    <nav className={`modern-navigation ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <ul className="nav-menu">
          {navItems.map((item, index) => (
            <li key={index} className="nav-item">
              <Link
                to={item.path}
                className={`modern-link ${
                  currentPath === item.path ? "active" : ""
                }`}
              >
                <i className={item.icon}></i>
                <span className="nav-title">{item.title}</span>
                {currentPath === item.path && (
                  <span className="active-indicator"></span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
