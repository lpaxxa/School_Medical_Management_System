import React from 'react';
import MedicalIncidentsList from './MedicalIncidents/MedicalIncidentsList';
import './MedicalEventsMain.css';

// Export the page component for routes
export const MedicalEventsPage = () => {
  return (
    <div className="medical-events-page">
      <MedicalEventsMain />
    </div>
  );
};

const MedicalEventsMain = () => {
  return (
    <div className="medical-events-container">
      <h2 className="page-title">Quản lý sự kiện y tế</h2>
      <div className="medical-events-content">
        <MedicalIncidentsList />
      </div>
    </div>
  );
};

export default MedicalEventsMain;