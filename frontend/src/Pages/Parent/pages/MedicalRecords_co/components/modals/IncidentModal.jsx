import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { formatDateTime } from '../../utils/formatters';
import { modalClasses } from '../../utils/helpers';

const IncidentModal = ({ isOpen, onClose, incident }) => {
  if (!isOpen || !incident) return null;
  
  const { modalOverlayClass, modalContentClass, modalHeaderClass, modalBodyClass, closeModalBtnClass } = modalClasses;

  return (
    <div className={modalOverlayClass} onClick={onClose}>
      <div className={modalContentClass} onClick={(e) => e.stopPropagation()}>
        <div className={modalHeaderClass}>
          <h3>Chi tiết sự cố y tế</h3>
          <button className={closeModalBtnClass} onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className={modalBodyClass}>
          <div className="incident-details-modal">
            <div className="stats-row">
              <div className="stat-box">
                <span className="stat-label">Thời gian</span>
                <span className="stat-value">
                  {formatDateTime(incident.dateTime)}
                </span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Mức độ</span>
                <span
                  className={`severity-tag ${incident.severityLevel
                    .replace(" ", "_")
                    .toLowerCase()}`}
                >
                  {incident.severityLevel}
                </span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Loại sự cố</span>
                <span className="stat-value">
                  {incident.incidentType}
                </span>
              </div>
            </div>
            
            <div className="detail-section">
              <h4>Mô tả</h4>
              <p>{incident.description}</p>
            </div>
            
            {incident.symptoms && (
              <div className="detail-section">
                <h4>Triệu chứng</h4>
                <p>{incident.symptoms}</p>
              </div>
            )}
            
            {incident.treatment && (
              <div className="detail-section">
                <h4>Xử lý</h4>
                <p>{incident.treatment}</p>
              </div>
            )}
            
            {incident.medicationsUsed && (
              <div className="detail-section">
                <h4>Thuốc đã dùng</h4>
                <p>{incident.medicationsUsed}</p>
              </div>
            )}
            
            {incident.requiresFollowUp &&
              incident.followUpNotes && (
                <div className="detail-section">
                  <h4>Theo dõi</h4>
                  <p>{incident.followUpNotes}</p>
                </div>
              )}
              
            <div className="detail-section">
              <h4>Nhân viên y tế</h4>
              <p>{incident.staffName || "Không xác định"}</p>
            </div>
            
            {incident.imgUrl && (
              <div className="detail-section">
                <h4>Hình ảnh</h4>
                <img
                  src={incident.imgUrl}
                  alt="Hình ảnh sự cố"
                  className="incident-image"
                  style={{ maxWidth: "100%", borderRadius: 8 }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentModal;