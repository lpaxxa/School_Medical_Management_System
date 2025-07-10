import React from "react";
import {
  FaTimes,
  FaSyringe,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaNotesMedical,
  FaUserEdit,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTag,
  FaClipboardList,
} from "react-icons/fa";
import { formatDate } from "../../utils/formatters";

const VaccinationModal = ({ isOpen, onClose, vaccination }) => {
  if (!isOpen || !vaccination) return null;

  const formatValue = (value) => {
    return value || "Chưa có thông tin";
  };

  const getVaccinationStatusInfo = (vaccination) => {
    if (vaccination.vaccinationDate) {
      return {
        status: "Đã tiêm",
        type: "success",
        icon: FaCheckCircle,
      };
    } else {
      return {
        status: "Chưa tiêm",
        type: "warning",
        icon: FaExclamationTriangle,
      };
    }
  };

  const getVaccinationTypeDisplay = (type) => {
    switch (type) {
      case "SCHOOL_PLAN":
        return "Kế hoạch trường";
      case "INDIVIDUAL":
        return "Cá nhân";
      case "CAMPAIGN":
        return "Chiến dịch";
      default:
        return type || "Không xác định";
    }
  };

  const statusInfo = getVaccinationStatusInfo(vaccination);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="modern-modal-overlay" onClick={onClose}>
      <div
        className="modern-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modern-modal-header">
          <div className="modal-header-content">
            <div className="modal-header-left">
              <div className="modal-header-icon">
                <FaSyringe />
              </div>
              <div className="modal-header-text">
                <h2>Chi tiết tiêm chủng</h2>
                <p>Thông tin chi tiết về mũi tiêm vaccine</p>
              </div>
            </div>
            <button className="modal-close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modern-modal-body">
          {/* Basic Information */}
          <div className="modal-section">
            <h3 className="section-title">
              <FaClipboardList />
              Thông tin cơ bản
            </h3>
            <div className="info-cards-grid">
              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaSyringe className="info-card-icon" />
                  <span className="info-card-label">Tên vaccine</span>
                </div>
                <div className="info-card-value">
                  {vaccination.vaccineName || "Chưa xác định"}
                </div>
              </div>

              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaSyringe className="info-card-icon" />
                  <span className="info-card-label">Mũi tiêm số</span>
                </div>
                <div className="info-card-value">
                  {vaccination.doseNumber || "Chưa xác định"}
                </div>
              </div>

              <div className="info-card-simple">
                <div className="info-card-header">
                  <StatusIcon className="info-card-icon" />
                  <span className="info-card-label">Trạng thái</span>
                </div>
                <div className="info-card-value">
                  <span className={`status-badge-simple ${statusInfo.type}`}>
                    {statusInfo.status}
                  </span>
                </div>
              </div>

              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaTag className="info-card-icon" />
                  <span className="info-card-label">Loại tiêm chủng</span>
                </div>
                <div className="info-card-value">
                  <span
                    className={`vaccination-type-badge ${vaccination.vaccinationType?.toLowerCase()}`}
                  >
                    {getVaccinationTypeDisplay(vaccination.vaccinationType)}
                  </span>
                </div>
              </div>

              {vaccination.planName && (
                <div className="info-card-simple">
                  <div className="info-card-header">
                    <FaClipboardList className="info-card-icon" />
                    <span className="info-card-label">Tên kế hoạch</span>
                  </div>
                  <div className="info-card-value">{vaccination.planName}</div>
                </div>
              )}

              {vaccination.nurseName && (
                <div className="info-card-simple">
                  <div className="info-card-header">
                    <FaUserEdit className="info-card-icon" />
                    <span className="info-card-label">Nhân viên y tế</span>
                  </div>
                  <div className="info-card-value">{vaccination.nurseName}</div>
                </div>
              )}
            </div>
          </div>

          {/* Vaccination Details */}
          <div className="modal-section">
            <h3 className="section-title">
              <FaCalendarAlt />
              Thông tin tiêm chủng
            </h3>
            <div className="info-cards-grid">
              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaCalendarAlt className="info-card-icon" />
                  <span className="info-card-label">Ngày tiêm</span>
                </div>
                <div className="info-card-value">
                  {vaccination.vaccinationDate ? (
                    formatDate(vaccination.vaccinationDate)
                  ) : (
                    <span className="pending-text">Chưa tiêm</span>
                  )}
                </div>
              </div>

              {vaccination.administeredAt && (
                <div className="info-card-simple">
                  <div className="info-card-header">
                    <FaMapMarkerAlt className="info-card-icon" />
                    <span className="info-card-label">Nơi tiêm</span>
                  </div>
                  <div className="info-card-value">
                    {vaccination.administeredAt}
                  </div>
                </div>
              )}

              {vaccination.nextDoseDate && (
                <div className="info-card-simple">
                  <div className="info-card-header">
                    <FaClock className="info-card-icon" />
                    <span className="info-card-label">Mũi tiêm tiếp theo</span>
                  </div>
                  <div className="info-card-value">
                    <span className="next-dose-date">
                      {formatDate(vaccination.nextDoseDate)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          {(vaccination.notes || vaccination.parentNotes) && (
            <div className="modal-section">
              <h3 className="section-title">
                <FaNotesMedical />
                Ghi chú
              </h3>
              <div className="notes-section">
                {vaccination.notes && (
                  <div className="note-item">
                    <div className="note-header">
                      <FaNotesMedical className="note-icon" />
                      <span className="note-label">Ghi chú y tế</span>
                    </div>
                    <div className="note-content medical-note">
                      {vaccination.notes}
                    </div>
                  </div>
                )}

                {vaccination.parentNotes && (
                  <div className="note-item">
                    <div className="note-header">
                      <FaUserEdit className="note-icon" />
                      <span className="note-label">Ghi chú của phụ huynh</span>
                    </div>
                    <div className="note-content parent-note">
                      {vaccination.parentNotes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaccinationModal;
