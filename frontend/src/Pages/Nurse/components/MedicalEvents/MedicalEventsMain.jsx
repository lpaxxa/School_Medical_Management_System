import React, { useState } from 'react';
import MedicalIncidentsManagement from './components/MedicalIncidents/MedicalIncidentsManagement';
import MedicationReceivingManagement from './components/MedicationReceiving/MedicationReceivingManagement';
import MedicationAdministrationManagement from './components/MedicationAdministration/MedicationAdministrationManagement';
import './MedicalEventsMain.css';

const MedicalEventsMain = () => {
  const [activeTab, setActiveTab] = useState('incidents');

  const renderContent = () => {
    switch (activeTab) {
      case 'incidents':
        return <MedicalIncidentsManagement />;
      case 'receiving':
        return <MedicationReceivingManagement />;
      case 'administration':
        return <MedicationAdministrationManagement />;
      default:
        return <MedicalIncidentsManagement />;
    }
  };

  return (
    <div className="medical-events-container">
      <div className="medical-events-tabs">
        <button 
          className={`tab-button ${activeTab === 'incidents' ? 'active' : ''}`}
          onClick={() => setActiveTab('incidents')}
        >
          <i className="fas fa-exclamation-triangle"></i>
          Sự cố y tế
        </button>
        <button 
          className={`tab-button ${activeTab === 'receiving' ? 'active' : ''}`}
          onClick={() => setActiveTab('receiving')}
        >
          <i className="fas fa-capsules"></i>
          Nhận thuốc từ phụ huynh
        </button>
        <button 
          className={`tab-button ${activeTab === 'administration' ? 'active' : ''}`}
          onClick={() => setActiveTab('administration')}
        >
          <i className="fas fa-history"></i>
          Lịch sử dùng thuốc
        </button>
      </div>

      <div className="medical-events-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default MedicalEventsMain;
