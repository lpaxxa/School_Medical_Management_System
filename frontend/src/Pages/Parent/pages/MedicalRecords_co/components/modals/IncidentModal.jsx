import React, { useState } from "react";
import {
  FaTimes,
  FaBandAid,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaClipboardList,
  FaStethoscope,
  FaPills,
  FaUserMd,
  FaImage,
  FaInfoCircle,
  FaHeart,
  FaClock,
  FaExclamationCircle,
  FaCheckCircle,
  FaFlag,
  FaFirstAid,
  FaHeartbeat,
  FaThermometerHalf,
  FaAmbulance,
  FaNotesMedical,
  FaChartLine,
  FaUserShield,
  FaCamera,
  FaHandHoldingMedical,
  FaSearch,
  FaExpand,
} from "react-icons/fa";
import { formatDateTime } from "../../utils/formatters";
// Remove import of SendMedicine.css

// Removed inline styles - now using CSS classes from components.css

const IncidentModal = ({ isOpen, onClose, incident }) => {
  // State for image zoom functionality
  const [zoomedImage, setZoomedImage] = useState(null);

  // Function to handle image click for zooming
  const handleImageClick = (imageUrl) => {
    setZoomedImage(imageUrl);
  };

  // Function to close the zoomed image
  const handleCloseZoom = () => {
    setZoomedImage(null);
  };

  if (!isOpen || !incident) return null;

  const getSeverityConfig = (severityLevel) => {
    const level = severityLevel?.toLowerCase();
    switch (level) {
      case "high":
      case "cao":
        return {
          label: "Nghiêm trọng",
          type: "error",
          priority: "KHẨN CẤP",
        };
      case "medium":
      case "trung bình":
        return {
          label: "Trung bình",
          type: "warning",
          priority: "QUAN TRỌNG",
        };
      case "low":
      case "thấp":
        return {
          label: "Nhẹ",
          type: "info",
          priority: "THÔNG THƯỜNG",
        };
      default:
        return {
          label: severityLevel || "Không xác định",
          type: "info",
          priority: "KHÔNG RÕ",
        };
    }
  };

  const getIncidentTypeIcon = (incidentType) => {
    const type = incidentType?.toLowerCase();
    if (type?.includes("sốt") || type?.includes("nhiệt"))
      return FaThermometerHalf;
    if (type?.includes("tim") || type?.includes("mạch")) return FaHeartbeat;
    if (type?.includes("thuốc") || type?.includes("dị ứng")) return FaPills;
    if (type?.includes("chấn thương") || type?.includes("thương tích"))
      return FaAmbulance;
    return FaBandAid;
  };

  const severityConfig = getSeverityConfig(incident.severityLevel);
  const IncidentTypeIcon = getIncidentTypeIcon(incident.incidentType);

  return (
    <div className="modern-modal-overlay" onClick={onClose}>
      <div
        className="modern-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Simple Modern Header */}
        <div className="modern-modal-header">
          <div className="modal-header-content">
            <div className="modal-header-left">
              <div className="modal-header-icon">
                <FaBandAid />
              </div>
              <div className="modal-header-text">
                <h2>Chi tiết sự cố y tế</h2>
                <p>Thông tin chi tiết về sự cố và cách xử lý</p>
              </div>
            </div>
            <button className="modal-close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Simple Modern Body */}
        <div className="modern-modal-body">
          {/* Basic Information */}
          <div className="modal-section">
            <h3 className="section-title">
              <FaInfoCircle />
              Thông tin cơ bản
            </h3>

            {/* Severity Badge */}
            <div className="content-card">
              <div className="content-card-title">
                <FaExclamationTriangle />
                Mức độ nghiêm trọng
              </div>
              <div className="info-card-value">
                <span className={`status-badge-simple ${severityConfig.type}`}>
                  {severityConfig.label} - {severityConfig.priority}
                </span>
              </div>
            </div>

            <div className="info-cards-grid">
              <div className="info-card-simple">
                <div className="info-card-header">
                  <IncidentTypeIcon className="info-card-icon" />
                  <span className="info-card-label">Loại sự cố</span>
                </div>
                <div className="info-card-value">{incident.incidentType}</div>
              </div>

              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaClock className="info-card-icon" />
                  <span className="info-card-label">Thời gian xảy ra</span>
                </div>
                <div className="info-card-value">
                  {formatDateTime(incident.dateTime)}
                </div>
              </div>

              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaUserShield className="info-card-icon" />
                  <span className="info-card-label">Nhân viên xử lý</span>
                </div>
                <div className="info-card-value">
                  {incident.staffName || "Không xác định"}
                </div>
              </div>

              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaUserMd className="info-card-icon" />
                  <span className="info-card-label">Học sinh</span>
                </div>
                <div className="info-card-value">
                  {incident.studentName} ({incident.studentId})
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="modal-section">
            <h3 className="section-title">
              <FaNotesMedical />
              Mô tả sự cố
            </h3>
            <div className="content-card">
              <div className="content-card-title">
                <FaClipboardList />
                Chi tiết diễn biến
              </div>
              <p className="content-card-text">{incident.description}</p>
            </div>
          </div>

          {/* Symptoms */}
          {incident.symptoms && (
            <div className="modal-section">
              <h3 className="section-title">
                <FaHeartbeat />
                Triệu chứng quan sát
              </h3>
              <div className="content-card">
                <div className="content-card-title">
                  <FaHeart />
                  Biểu hiện lâm sàng
                </div>
                <p className="content-card-text">{incident.symptoms}</p>
              </div>
            </div>
          )}

          {/* Treatment */}
          {incident.treatment && (
            <div className="modal-section">
              <h3 className="section-title">
                <FaHandHoldingMedical />
                Biện pháp xử lý
              </h3>
              <div className="content-card">
                <div className="content-card-title">
                  <FaStethoscope />
                  Phương pháp điều trị
                </div>
                <p className="content-card-text">{incident.treatment}</p>
                <div style={{ marginTop: "12px" }}>
                  <span className="status-badge-simple success">
                    <FaCheckCircle style={{ marginRight: "4px" }} />
                    Đã thực hiện
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Medications */}
          {incident.medicationsUsed && (
            <div className="modal-section">
              <h3 className="section-title">
                <FaPills />
                Thuốc đã sử dụng
              </h3>
              <div className="content-card">
                <div className="content-card-title">
                  <FaPills />
                  Danh sách thuốc
                </div>
                <p className="content-card-text">{incident.medicationsUsed}</p>
                <div style={{ marginTop: "12px" }}>
                  <span className="status-badge-simple success">
                    <FaCheckCircle style={{ marginRight: "4px" }} />
                    Đã sử dụng an toàn
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Follow-up */}
          {incident.requiresFollowUp && incident.followUpNotes && (
            <div className="modal-section">
              <h3 className="section-title">
                <FaChartLine />
                Theo dõi sau xử lý
              </h3>
              <div className="content-card">
                <div className="content-card-title">
                  <FaFlag />
                  Ghi chú theo dõi
                </div>
                <p className="content-card-text">{incident.followUpNotes}</p>
                <div style={{ marginTop: "12px" }}>
                  <span className="status-badge-simple warning">
                    <FaFlag style={{ marginRight: "4px" }} />
                    Cần theo dõi
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Medical Images - Updated with zoom functionality */}
          {incident.imageMedicalUrl && (
            <div className="modal-section">
              <h3 className="section-title">
                <FaCamera />
                Hình ảnh sự cố
              </h3>
              <div className="modal-image-container">
                <img
                  src={incident.imageMedicalUrl}
                  alt="Hình ảnh sự cố y tế"
                  className="modal-image"
                  onClick={() => handleImageClick(incident.imageMedicalUrl)}
                />
                <div className="incident-image-zoom-hint">
                  <FaExpand /> Nhấp vào ảnh để phóng to
                </div>
              </div>
            </div>
          )}

          {/* Status Summary */}
          <div className="modal-section">
            <h3 className="section-title">
              <FaCheckCircle />
              Tóm tắt trạng thái
            </h3>
            <div className="info-cards-grid">
              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaCheckCircle className="info-card-icon" />
                  <span className="info-card-label">Tình trạng</span>
                </div>
                <div className="info-card-value">
                  <span className="status-badge-simple success">
                    Đã xử lý hoàn tất
                  </span>
                </div>
              </div>

              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaExclamationTriangle className="info-card-icon" />
                  <span className="info-card-label">Mức độ</span>
                </div>
                <div className="info-card-value">
                  <span
                    className={`status-badge-simple ${severityConfig.type}`}
                  >
                    {severityConfig.label}
                  </span>
                </div>
              </div>

              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaUserMd className="info-card-icon" />
                  <span className="info-card-label">Thông báo phụ huynh</span>
                </div>
                <div className="info-card-value">
                  <span
                    className={`status-badge-simple ${
                      incident.parentNotified ? "success" : "warning"
                    }`}
                  >
                    {incident.parentNotified
                      ? "Đã thông báo"
                      : "Chưa thông báo"}
                  </span>
                </div>
              </div>

              {incident.requiresFollowUp && (
                <div className="info-card-simple">
                  <div className="info-card-header">
                    <FaFlag className="info-card-icon" />
                    <span className="info-card-label">Theo dõi</span>
                  </div>
                  <div className="info-card-value">
                    <span className="status-badge-simple warning">
                      Cần theo dõi thêm
                    </span>
                  </div>
                </div>
              )}

              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaHandHoldingMedical className="info-card-icon" />
                  <span className="info-card-label">Điều trị</span>
                </div>
                <div className="info-card-value">
                  <span
                    className={`status-badge-simple ${
                      incident.treatment ? "success" : "info"
                    }`}
                  >
                    {incident.treatment ? "Đã thực hiện" : "Không cần thiết"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Zoom Overlay - Fixed to prevent modal closing */}
      {zoomedImage && (
        <div 
          className="incident-zoom-overlay" 
          onClick={(e) => {
            e.stopPropagation(); // Prevent event bubbling to modal
            handleCloseZoom();
          }}
        >
          <img
            src={zoomedImage}
            alt="Zoomed image"
            className="incident-zoomed-image"
            onClick={(e) => e.stopPropagation()}
          />
          <button 
            className="incident-zoom-close-btn" 
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling to modal
              handleCloseZoom();
            }}
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
};

export default IncidentModal;
