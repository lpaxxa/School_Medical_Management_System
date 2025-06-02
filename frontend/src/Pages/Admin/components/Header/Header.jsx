import React from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = ({ user }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="admin-header">
      <div className="admin-header-logo">
        <h1>Medical System</h1>
      </div>
      <div className="admin-header-user">
        <span className="admin-header-username">{user?.name || "Admin"}</span>
        <div className="admin-header-dropdown">
          <button className="admin-header-profile">
            <i className="fas fa-user-circle"></i>
          </button>
          <div className="admin-header-dropdown-content">
            <button onClick={() => {}}>Hồ sơ</button>
            <button onClick={() => {}}>Cài đặt</button>
            <button onClick={handleLogout}>Đăng xuất</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
