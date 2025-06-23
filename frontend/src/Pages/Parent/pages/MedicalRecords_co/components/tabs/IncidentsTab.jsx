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
    if (!studentId) return;
    
    const fetchIncidents = async () => {
      setIsLoadingIncidents(true);
      setIncidentsError(null);
      
      try {
        // Check cache first
        const cacheKey = `incidents_${studentId}`;
        const cachedData = getCachedData(cacheKey);
        
        if (cachedData) {
          setMedicalIncidents(cachedData);
          setIsLoadingIncidents(false);
          return;
        }
        
        const response = await medicalService.getMedicalIncidents(studentId);
        const incidents = response.data || [];
        setMedicalIncidents(incidents);
        
        // Cache data
        cacheData(cacheKey, incidents);
      } catch (err) {
        console.error('Error fetching incidents:', err);
        setIncidentsError('Không thể tải dữ liệu sự cố y tế. Vui lòng thử lại sau.');
      } finally {
        setIsLoadingIncidents(false);
      }
    };
    
    fetchIncidents();
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