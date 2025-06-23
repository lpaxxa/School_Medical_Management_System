import React, { useState, useEffect } from 'react';
import { 
  FaBandAid, 
  FaExclamationCircle, 
  FaCalendarAlt 
} from 'react-icons/fa';
import medicalService from '../../../../../../services/medicalService';
import { formatDate } from '../../utils/formatters';
import { cacheData, getCachedData } from '../../utils/helpers';
import IncidentModal from '../modals/IncidentModal';

const IncidentsTab = ({ studentId }) => {
  const [medicalIncidents, setMedicalIncidents] = useState([]);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(true);
  const [incidentsError, setIncidentsError] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  useEffect(() => {
    const fetchIncidentsData = async () => {
      if (!studentId || typeof studentId !== 'number') {
        console.log('Invalid studentId:', studentId);
        return;
      }

      try {
        setIsLoadingIncidents(true);
        // Sử dụng studentId (number, ví dụ: 1)
        const data = await medicalService.getMedicalIncidents(studentId);
        setMedicalIncidents(data);
      } catch (error) {
        console.error('Error fetching incidents data:', error);
        setIncidentsError('Không thể tải dữ liệu sự cố y tế');
      } finally {
        setIsLoadingIncidents(false);
      }
    };

    fetchIncidentsData();
  }, [studentId]);

  const openIncidentModal = (incident) => {
    setSelectedIncident(incident);
    setIsIncidentModalOpen(true);
  };

  const closeIncidentModal = () => {
    setIsIncidentModalOpen(false);
    setSelectedIncident(null);
  };

  return (
    <div className="incidents-panel">
      <h3>Lịch sử sự cố y tế</h3>
      
      {incidentsError ? (
        <div className="error-message">
          <FaExclamationCircle /> {incidentsError}
        </div>
      ) : isLoadingIncidents ? (
        <div className="data-loading">
          <div className="loading-spinner small"></div>
          <p>Đang tải dữ liệu sự cố y tế...</p>
        </div>
      ) : medicalIncidents.length === 0 ? (
        <div className="no-incidents">
          <FaBandAid />
          <h4>Không có sự cố y tế</h4>
          <p>Học sinh chưa có ghi nhận sự cố y tế nào trong hệ thống.</p>
        </div>
      ) : (
        <div className="incidents-list">
          {medicalIncidents.map((incident) => (
            <div
              className={`incident-card ${incident.severityLevel.toLowerCase()}`}
              key={incident.incidentId}
              onClick={() => openIncidentModal(incident)}
            >
              <div className="incident-header">
                <div className="incident-type">
                  <span
                    className={`severity-tag ${incident.severityLevel.toLowerCase()}`}
                  >
                    {incident.severityLevel}
                  </span>
                  <h4>{incident.incidentType}</h4>
                </div>
                <div className="incident-date">
                  <FaCalendarAlt />
                  {formatDate(incident.dateTime)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal for incident details */}
      {isIncidentModalOpen && selectedIncident && (
        <IncidentModal 
          isOpen={isIncidentModalOpen}
          onClose={closeIncidentModal}
          incident={selectedIncident}
        />
      )}
    </div>
  );
};

export default IncidentsTab;