import React, { useState, useEffect } from 'react';
import { HealthCheckupProvider } from '../../../../context/NurseContext/HealthCheckupContext';
import Dashboard from './Dashboard/Dashboard';
import CheckupList from './CheckupList/CheckupList';
import './HealthCheckupsMain.css';

// Import renamed component
import MedicalCheckupList from './ScheduleConsultation/ScheduleConsultation';

// Export the HealthCheckupsPage component for routes
export const HealthCheckupsPage = () => {
  return (
    <HealthCheckupProvider>
      <HealthCheckups />
    </HealthCheckupProvider>
  );
};

const HealthCheckups = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('healthCheckupsActiveTab') || 'dashboard';
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    sessionStorage.setItem('healthCheckupsActiveTab', activeTab);
  }, [activeTab]);

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleBack = () => {
    if (activeTab === 'create-checkup') {
      setActiveTab('dashboard');
    } else if (activeTab === 'create-checkup-list') {
      setActiveTab('dashboard');
    } else if (activeTab === 'schedule-consultation') {
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="health-checkups-container">
      {/* Tiêu đề trang */}
      <div className="health-checkups-header">
        <h1 className="health-checkups-title">Quản lý khám sức khỏe</h1>
      </div>
      
      {/* Tabs điều hướng các chức năng */}
      <div className="health-checkups-tabs">
        <button 
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <i className="fas fa-chart-line"></i> Dashboard
        </button>
        <button 
          className={`tab-button ${activeTab === 'campaign-list' ? 'active' : ''}`}
          onClick={() => setActiveTab('campaign-list')}
        >
          <i className="fas fa-list"></i> Danh sách đợt khám
        </button>
        <button 
          className={`tab-button ${activeTab === 'schedule-consultation' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule-consultation')}
        >
          <i className="fas fa-calendar-alt"></i> Danh sách khám sức khỏe
        </button>
        {/* <button className="tab-button back-button" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i> Quay lại
        </button> */}
      </div>
      
      {/* Hiển thị nội dung theo tab đang active */}
      <div className="health-checkups-content">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <Dashboard 
            stats={{}} 
            campaignsData={[]} 
            refreshData={refreshData}
          />
        )}
        
        {/* Campaign List */}
        {activeTab === 'campaign-list' && (
          <CheckupList />
        )}
        
        {/* Medical Checkup List */}
        {activeTab === 'schedule-consultation' && (
          <MedicalCheckupList 
            refreshData={refreshData}
          />
        )}
      </div>
    </div>
  );
};

// Export both components but make HealthCheckupsPage the default
export { HealthCheckups };
export default HealthCheckupsPage;
