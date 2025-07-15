import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path) ? 'active' : '';
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const toggleUserDropdown = () => {
    setUserDropdownOpen(prev => !prev);
    setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(prev => !prev);
    setUserDropdownOpen(false);
  };

  const notifications = [
    { id: 1, title: "Lịch khám", message: "3 học sinh cần khám hôm nay", time: "5 phút trước", type: "urgent", icon: "fas fa-exclamation-circle" },
    { id: 2, title: "Thuốc mới", message: "Phụ huynh đã gửi đơn thuốc mới", time: "1 giờ trước", type: "info", icon: "fas fa-pills" },
    { id: 3, title: "Cập nhật hệ thống", message: "Hệ thống sẽ bảo trì lúc 23:00", time: "2 giờ trước", type: "normal", icon: "fas fa-info-circle" },
  ];

  return (
    <aside className="nurse-sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <div className="logo-icon"><i className="fas fa-heartbeat"></i></div>
          <div className="logo-text">
            <h1>MediCare</h1>
            <span>School Medical System</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li><Link to="/nurse/blog-management" className={isActive('/nurse/blog-management')}><i className="fas fa-blog"></i> Quản lý blog</Link></li>
            <li><Link to="/nurse/inventory" className={isActive('/nurse/inventory')}><i className="fas fa-warehouse"></i> Quản lý kho</Link></li>
            <li><Link to="/nurse/medical-events" className={isActive('/nurse/medical-events')}><i className="fas fa-calendar-plus"></i> Sự kiện y tế</Link></li>
            <li><Link to="/nurse/receive-medicine" className={isActive('/nurse/receive-medicine')}><i className="fas fa-pills"></i> Nhận thuốc từ phụ huynh</Link></li>
            <li><Link to="/nurse/student-records" className={isActive('/nurse/student-records')}><i className="fas fa-file-medical"></i> Hồ sơ y tế học sinh</Link></li>
            <li><Link to="/nurse/health-checkups" className={isActive('/nurse/health-checkups')}><i className="fas fa-stethoscope"></i> Khám sức khỏe định kỳ</Link></li>
            <li><Link to="/nurse/vaccination" className={isActive('/nurse/vaccination')}><i className="fas fa-syringe"></i> Quản lý tiêm chủng</Link></li>
          </ul>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-item sidebar-notifications">
          <button className={`notification-btn ${notificationsOpen ? "active" : ""}`} onClick={toggleNotifications} title="Thông báo">
            <i className="fas fa-bell"></i>
            <span className="notification-badge">3</span>
          </button>
          {notificationsOpen && (
            <div className="notifications-dropdown-sidebar">
              <div className="dropdown-header"><h4>Thông báo</h4></div>
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`notification-item ${notification.type}`}>
                    <div className="notification-icon"><i className={notification.icon}></i></div>
                    <div className="notification-content">
                      <h5>{notification.title}</h5>
                      <p>{notification.message}</p>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="dropdown-footer"><button>Xem tất cả</button></div>
            </div>
          )}
        </div>

        <div className="sidebar-item sidebar-user">
           <button className={`sidebar-user-profile ${userDropdownOpen ? 'active' : ''}`} onClick={toggleUserDropdown}>
              <div className="profile-avatar">
                {currentUser?.avatar ? <img src={currentUser.avatar} alt="Avatar" /> : <i className="fas fa-user-circle"></i>}
              </div>
              <div className="profile-info">
                  <span className="profile-name">{currentUser?.name || 'Y Tá'}</span>
                  <span className="profile-role">{currentUser?.role || 'Nurse'}</span>
              </div>
              <i className="fas fa-chevron-up dropdown-arrow"></i>
            </button>
          {userDropdownOpen && (
            <div className="user-dropdown-sidebar">
              <button className="dropdown-item" onClick={() => {}}><i className="fas fa-user"></i><span>Hồ sơ</span></button>
              <button className="dropdown-item" onClick={() => {}}><i className="fas fa-cog"></i><span>Cài đặt</span></button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i><span>Đăng xuất</span></button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Navigation;
