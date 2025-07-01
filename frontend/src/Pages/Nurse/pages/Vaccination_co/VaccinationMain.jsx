import React, { useState, useEffect } from 'react';
import VaccinationDashboard from './Dashboard/VaccinationDashboard';
import VaccinationRecordManagement from './VaccinationRecords/VaccinationRecordManagement';
import VaccinationStatistics from './StatisticsAndReports/VaccinationStatistics';
import VaccinationListCreation from './ListCreation/VaccinationListCreation';
import PostVaccinationMonitoring from './PostMonitoring/PostVaccinationMonitoring';
import './VaccinationMain.css';
// Component VaccinationManagement từ file VaccinationManagement.jsx
const VaccinationManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [needsRefresh, setNeedsRefresh] = useState(false);

  // Function to trigger a refresh of data across components
  const triggerRefresh = () => {
    setNeedsRefresh(true);
  };

  // Reset refresh flag after data has been refreshed
  useEffect(() => {
    if (needsRefresh) {
      setNeedsRefresh(false);
    }
  }, [needsRefresh]);
  return (
    <div className="vaccination-management-container">
      <h1 className="page-title">Quản lý Tiêm chủng</h1>
        <div className="vaccination-tabs">
        <div className="vaccination-nav">
          <div 
            className={`vaccination-tab ${activeTab === 0 ? 'active' : ''}`}
            onClick={() => setActiveTab(0)}
          >
            <i className="fas fa-chart-line"></i> 
            <span>Tổng quan</span>
          </div>
          
          <div 
            className={`vaccination-tab ${activeTab === 1 ? 'active' : ''}`}
            onClick={() => setActiveTab(1)}
          >
            <i className="fas fa-clipboard-list"></i>
            <span>Lập danh sách tiêm chủng</span>
          </div>
          
          <div 
            className={`vaccination-tab ${activeTab === 2 ? 'active' : ''}`}
            onClick={() => setActiveTab(2)}
          >
            <i className="fas fa-syringe"></i>
            <span>Hồ sơ Tiêm chủng</span>
          </div>
          
          <div 
            className={`vaccination-tab ${activeTab === 3 ? 'active' : ''}`}
            onClick={() => setActiveTab(3)}
          >
            <i className="fas fa-user-md"></i>
            <span>Theo dõi sau tiêm</span>
          </div>

          <div 
            className={`vaccination-tab ${activeTab === 4 ? 'active' : ''}`}
            onClick={() => setActiveTab(4)}
          >
            <i className="fas fa-chart-pie"></i>
            <span>Thống kê & Báo cáo</span>
          </div>
        </div>
          <div className="vaccination-content">
          {activeTab === 0 && (
            <VaccinationDashboard 
              refreshData={needsRefresh}
              onDataChange={triggerRefresh}
            />
          )}
          
          {activeTab === 1 && (
            <VaccinationListCreation
              refreshData={needsRefresh}
              onDataChange={triggerRefresh}
            />
          )}
          
          {activeTab === 2 && (
            <VaccinationRecordManagement 
              refreshData={needsRefresh}
              onDataChange={triggerRefresh}
            />
          )}
          
          {activeTab === 3 && (
            <PostVaccinationMonitoring
              refreshData={needsRefresh}
              onDataChange={triggerRefresh}
            />
          )}

          {activeTab === 4 && (
            <VaccinationStatistics 
              refreshData={needsRefresh}
              onDataChange={triggerRefresh}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Component VaccinationPage từ file index.jsx
const VaccinationPage = () => {
  return (
    <div className="vaccination-page">
      <VaccinationManagement />
    </div>
  );
};

export { VaccinationManagement };
export default VaccinationPage;
