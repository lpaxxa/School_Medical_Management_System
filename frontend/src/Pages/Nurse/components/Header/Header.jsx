import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <header className="nurse-header">
      <div className="logo">School Medical System</div>
      <div className="user-info">
        {currentUser && (
          <>
            <span>Xin chào, {currentUser.name || "Y tá"}</span>
            <img 
              src={currentUser.photoURL || "/avatar-placeholder.png"} 
              alt="Profile" 
              className="profile-image" 
            />
            <button className="logout-button" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Đăng xuất
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
