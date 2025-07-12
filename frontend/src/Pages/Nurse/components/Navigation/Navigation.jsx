import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  
  // Function to check if the link is active
  const isActive = (path) => {
    return location.pathname.startsWith(path) ? 'active' : '';
  };
    return (
    <aside className="nurse-sidebar">

      <nav>        <ul>
          <li>
            <Link to="/nurse/dashboard" className={isActive('/nurse/dashboard')}>
              <i className="fas fa-home"></i> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/nurse/inventory" className={isActive('/nurse/inventory')}>
              <i className="fas fa-warehouse"></i> Quản lý kho
            </Link>
          </li>
          <li>
            <Link to="/nurse/medical-events" className={isActive('/nurse/medical-events')}>
              <i className="fas fa-calendar-plus"></i> Sự kiện y tế
            </Link>
          </li>
          <li>
            <Link to="/nurse/vaccination" className={isActive('/nurse/vaccination')}>
              <i className="fas fa-syringe"></i> Quản lý tiêm chủng
            </Link>
          </li>          <li>
            <Link to="/nurse/health-checkups" className={isActive('/nurse/health-checkups')}>
              <i className="fas fa-stethoscope"></i> Khám sức khỏe định kỳ
            </Link>
          </li>
          <li>
            <Link to="/nurse/student-records" className={isActive('/nurse/student-records')}>
              <i className="fas fa-file-medical"></i> Hồ sơ y tế học sinh
            </Link>
          </li>
          <li>
            <Link to="/nurse/receive-medicine" className={isActive('/nurse/receive-medicine')}>
              <i className="fas fa-pills"></i> Nhận thuốc từ phụ huynh
            </Link>
          </li>
          
          <li>
            <Link to="/nurse/blog/posts" className={isActive('/nurse/blog')}>
              <i className="fas fa-blog"></i> Quản lý blog
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Navigation;
