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
            <Link to="/nurse/student-list" className={isActive('/nurse/student-list')}>
              <i className="fas fa-users"></i> Danh sách học sinh
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
          </li>
          <li>
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
            <Link to="/nurse/consultations" className={isActive('/nurse/consultations')}>
              <i className="fas fa-comments"></i> Hỗ trợ tư vấn
            </Link>
          </li>
          <li>
            <Link to="/nurse/blog-management" className={isActive('/nurse/blog-management')}>
              <i className="fas fa-blog"></i> Quản lý blog
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Navigation;
