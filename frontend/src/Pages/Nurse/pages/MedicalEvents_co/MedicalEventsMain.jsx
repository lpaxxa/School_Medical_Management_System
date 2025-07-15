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
  // Custom styles for header
  const medicalEventsStyles = `
    .lukhang-medical-events-main-wrapper {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
      min-height: 100vh !important;
      padding: 2rem !important;
    }
    
    .lukhang-medical-events-header-card {
      background: linear-gradient(135deg, #015C92 0%, #2D82B5 30%, #428CD4 60%, #88CDF6 100%) !important;
      border: none !important;
      border-radius: 1rem !important;
      box-shadow: 0 10px 30px rgba(13, 110, 253, 0.2) !important;
      margin-bottom: 2rem !important;
    }
    
    .lukhang-medical-events-title-custom {
      color: white !important;
      font-weight: 700 !important;
      font-size: 2rem !important;
      margin: 0 !important;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
    }
    
    @media (max-width: 992px) {
      .lukhang-medical-events-main-wrapper {
        padding: 1rem !important;
      }
      
      .lukhang-medical-events-title-custom {
        font-size: 1.5rem !important;
      }
    }
  `;

  return (
    <>
      <style>{medicalEventsStyles}</style>
      <div className="container-fluid lukhang-medical-events-main-wrapper">
        <div className="card lukhang-medical-events-header-card">
          <div className="card-body text-center py-4">
            <h1 className="lukhang-medical-events-title-custom">
              <i className="fas fa-notes-medical me-3"></i>
              Quản lý sự kiện y tế
            </h1>
          </div>
        </div>
        <div className="medical-events-content">
          <MedicalIncidentsList />
        </div>
      </div>
    </>
  );
};

export default MedicalEventsMain;