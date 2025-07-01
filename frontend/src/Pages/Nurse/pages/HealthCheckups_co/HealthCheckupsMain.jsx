import React, { useState } from 'react';
import { HealthCheckupProvider } from '../../../../context/NurseContext/HealthCheckupContext';
import Dashboard from './Dashboard/Dashboard';
import CheckupList from './CheckupList/CheckupList';
import Reports from './Reports/Reports';
import './HealthCheckupsMain.css';

// Thêm import cho các component mới
import CreateCheckupList from './CreateCheckupList/CreateCheckupList';  // Cần tạo component này
import ScheduleConsultation from './ScheduleConsultation/ScheduleConsultation';  // Cần tạo component này

// Export the HealthCheckupsPage component for routes
export const HealthCheckupsPage = () => {
  return (
    <HealthCheckupProvider>
      <HealthCheckups />
    </HealthCheckupProvider>
  );
};

const HealthCheckups = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
      
      {/* Tabs điều hướng các chức năng - Đã sắp xếp lại theo yêu cầu */}
      <div className="health-checkups-tabs">
        <button 
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <i className="fas fa-chart-line"></i> Dashboard
        </button>
        <button 
          className={`tab-button ${activeTab === 'create-checkup-list' ? 'active' : ''}`}
          onClick={() => setActiveTab('create-checkup-list')}
        >
          <i className="fas fa-clipboard-list"></i> Lập danh sách khám
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
          <i className="fas fa-calendar-alt"></i> Lập lịch tư vấn riêng
        </button>
        <button 
          className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <i className="fas fa-file-medical-alt"></i> Báo cáo
        </button>
        {activeTab === 'create-checkup' || activeTab === 'create-checkup-list' || activeTab === 'schedule-consultation' ? (
          <button className="tab-button back-button" onClick={handleBack}>
            <i className="fas fa-arrow-left"></i> Quay lại
          </button>
        ) : null}
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
        
        {/* Lập danh sách khám - Chức năng mới */}
        {activeTab === 'create-checkup-list' && (
          <CreateCheckupList 
            refreshData={refreshData}
          />
        )}
        
        {/* Campaign List */}
        {activeTab === 'campaign-list' && (
          <CheckupList />
        )}
        
        {/* Lập lịch tư vấn riêng - Chức năng mới */}
        {activeTab === 'schedule-consultation' && (
          <ScheduleConsultation 
            refreshData={refreshData}
          />
        )}
        
        {/* Reports */}
        {activeTab === 'reports' && (
          <Reports />
        )}
      </div>
    </div>
  );
};

// Export both components but make HealthCheckupsPage the default
export { HealthCheckups };
export default HealthCheckupsPage;
