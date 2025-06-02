import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
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
      <div className="admin-header-left">
        <h1>Quản trị hệ thống Y tế học đường</h1>
      </div>
      <div className="admin-header-right">
        <div className="admin-user-info">
          <span>Xin chào, {user?.name}</span>
          <button className="logout-button" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
