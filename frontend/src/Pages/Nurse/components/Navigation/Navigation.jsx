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
      <nav>
        <ul>
          <li>
            <Link to="/nurse/dashboard" className={isActive('/nurse/dashboard')}>
              <i className="fas fa-home" style={{marginRight: '10px'}}></i> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/nurse/student-records" className={isActive('/nurse/student-records')}>
              <i className="fas fa-file-medical" style={{marginRight: '10px'}}></i> Student Records
            </Link>
          </li>
          <li>
            <Link to="/nurse/consultations" className={isActive('/nurse/consultations')}>
              <i className="fas fa-comments" style={{marginRight: '10px'}}></i> Consultations
            </Link>
          </li>
          <li>
            <Link to="/nurse/health-checkups" className={isActive('/nurse/health-checkups')}>
              <i className="fas fa-stethoscope" style={{marginRight: '10px'}}></i> Health Checkups
            </Link>
          </li>
          <li>
            <Link to="/nurse/inventory" className={isActive('/nurse/inventory')}>
              <i className="fas fa-warehouse" style={{marginRight: '10px'}}></i> Inventory
            </Link>
          </li>
          <li>
            <Link to="/nurse/medical-events" className={isActive('/nurse/medical-events')}>
              <i className="fas fa-calendar-plus" style={{marginRight: '10px'}}></i> Medical Events
            </Link>
          </li>
          <li>
            <Link to="/nurse/vaccination" className={isActive('/nurse/vaccination')}>
              <i className="fas fa-syringe" style={{marginRight: '10px'}}></i> Vaccination
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Navigation;
