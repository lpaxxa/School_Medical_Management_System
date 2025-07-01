import React from "react";
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
  FaShieldAlt,
  FaChartLine,
  FaCalendarCheck,
  FaUserShield,
  FaCamera,
  FaAward,
  FaHandHoldingMedical,
  FaBookMedical,
} from "react-icons/fa";
import { formatDateTime } from "../../utils/formatters";

const IncidentModal = ({ isOpen, onClose, incident }) => {
  if (!isOpen || !incident) return null;

  const getSeverityConfig = (severityLevel) => {
    const level = severityLevel?.toLowerCase();
    switch (level) {
      case "high":
      case "cao":
        return {
          icon: FaExclamationTriangle,
          color: "#ef4444",
          bgColor: "linear-gradient(135deg, #fee2e2, #fecaca)",
          borderColor: "#ef4444",
          label: "Nghiêm trọng",
          emoji: "🚨",
          priority: "KHẨN CẤP",
        };
      case "medium":
      case "trung bình":
        return {
          icon: FaExclamationCircle,
          color: "#f59e0b",
          bgColor: "linear-gradient(135deg, #fef3c7, #fde68a)",
          borderColor: "#f59e0b",
          label: "Trung bình",
          emoji: "⚠️",
          priority: "QUAN TRỌNG",
        };
      case "low":
      case "thấp":
        return {
          icon: FaInfoCircle,
          color: "#10b981",
          bgColor: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
          borderColor: "#10b981",
          label: "Nhẹ",
          emoji: "ℹ️",
          priority: "THÔNG THƯỜNG",
        };
      default:
        return {
          icon: FaInfoCircle,
          color: "#6b7280",
          bgColor: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
          borderColor: "#6b7280",
          label: severityLevel || "Không xác định",
          emoji: "❓",
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
  const SeverityIcon = severityConfig.icon;
  const IncidentTypeIcon = getIncidentTypeIcon(incident.incidentType);

  return (
    <div className="modern-modal-overlay" onClick={onClose}>
      <div
        className="modern-modal-content incident-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Enhanced Header */}
        <div className="modern-modal-header">
          <div className="modal-header-main">
            <div className="header-icon-container incident-header">
              <FaBandAid className="header-main-icon" />
              <div className="icon-pulse incident-pulse"></div>
            </div>
            <div className="header-content">
              <h2>Chi tiết sự cố y tế</h2>
              <p className="header-subtitle">
                <FaFirstAid /> Thông tin chi tiết về sự cố và cách xử lý
              </p>
            </div>
          </div>
          <button className="modern-close-btn" onClick={onClose}>
            <FaTimes />
            <span className="close-btn-tooltip">Đóng</span>
          </button>
        </div>

        {/* Enhanced Body */}
        <div className="modern-modal-body">
          {/* Basic Information */}
          <div className="modern-section">
            <div className="section-header-modern">
              <div className="section-icon-wrapper">
                <FaInfoCircle />
              </div>
              <h3>Thông tin cơ bản</h3>
            </div>

            <div className="incident-basic-modern">
              {/* Severity Badge */}
              <div className="severity-badge-container">
                <div
                  className="severity-badge-modern-large"
                  style={{
                    background: severityConfig.bgColor,
                    borderColor: severityConfig.borderColor,
                  }}
                >
                  <div className="severity-icon-container">
                    <SeverityIcon style={{ color: severityConfig.color }} />
                    <span className="severity-emoji">
                      {severityConfig.emoji}
                    </span>
                  </div>
                  <div className="severity-content">
                    <span
                      className="severity-level-modern"
                      style={{ color: severityConfig.color }}
                    >
                      {severityConfig.label}
                    </span>
                    <span
                      className="severity-priority"
                      style={{ color: severityConfig.color }}
                    >
                      {severityConfig.priority}
                    </span>
                  </div>
                  <div className="severity-decoration"></div>
                </div>
              </div>

              {/* Incident Type & Time Cards */}
              <div className="incident-info-cards-modern">
                <div className="modern-incident-info-card type">
                  <div
                    className="incident-card-icon"
                    style={{ color: severityConfig.color }}
                  >
                    <IncidentTypeIcon />
                  </div>
                  <div className="incident-card-content">
                    <span className="incident-card-label">Loại sự cố</span>
                    <span className="incident-card-value">
                      {incident.incidentType}
                    </span>
                  </div>
                  <div
                    className="incident-card-accent"
                    style={{ backgroundColor: severityConfig.color }}
                  ></div>
                </div>

                <div className="modern-incident-info-card time">
                  <div className="incident-card-icon">
                    <FaClock />
                  </div>
                  <div className="incident-card-content">
                    <span className="incident-card-label">
                      Thời gian xảy ra
                    </span>
                    <span className="incident-card-value">
                      {formatDateTime(incident.dateTime)}
                    </span>
                  </div>
                  <div className="incident-card-accent"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="modern-section">
            <div className="section-header-modern">
              <div className="section-icon-wrapper">
                <FaBookMedical />
              </div>
              <h3>Mô tả sự cố</h3>
            </div>

            <div className="modern-content-card description-modern">
              <div className="content-card-header-modern">
                <FaClipboardList />
                <h4>Chi tiết diễn biến</h4>
              </div>
              <div className="content-card-body-modern">
                <p>{incident.description}</p>
              </div>
            </div>
          </div>

          {/* Symptoms */}
          {incident.symptoms && (
            <div className="modern-section">
              <div className="section-header-modern">
                <div className="section-icon-wrapper">
                  <FaHeartbeat />
                </div>
                <h3>Triệu chứng quan sát</h3>
              </div>

              <div className="modern-content-card symptoms-modern">
                <div className="content-card-header-modern symptoms-header">
                  <FaHeart />
                  <h4>Biểu hiện lâm sàng</h4>
                </div>
                <div className="content-card-body-modern">
                  <p>{incident.symptoms}</p>
                </div>
                <div className="symptoms-decoration"></div>
              </div>
            </div>
          )}

          {/* Treatment */}
          {incident.treatment && (
            <div className="modern-section">
              <div className="section-header-modern">
                <div className="section-icon-wrapper">
                  <FaHandHoldingMedical />
                </div>
                <h3>Biện pháp xử lý</h3>
              </div>

              <div className="modern-content-card treatment-modern">
                <div className="content-card-header-modern treatment-header">
                  <FaStethoscope />
                  <h4>Phương pháp điều trị</h4>
                </div>
                <div className="content-card-body-modern">
                  <p>{incident.treatment}</p>
                </div>
                <div className="treatment-success-indicator">
                  <FaCheckCircle />
                  <span>Đã thực hiện</span>
                </div>
              </div>
            </div>
          )}

          {/* Medications */}
          {incident.medicationsUsed && (
            <div className="modern-section">
              <div className="section-header-modern">
                <div className="section-icon-wrapper">
                  <FaPills />
                </div>
                <h3>Thuốc đã sử dụng</h3>
              </div>

              <div className="medication-modern-card">
                <div className="medication-card-header">
                  <div className="medication-icon-wrapper">
                    <FaPills />
                    <div className="medication-pulse"></div>
                  </div>
                  <div className="medication-content">
                    <h4>Danh sách thuốc</h4>
                    <p>{incident.medicationsUsed}</p>
                  </div>
                </div>
                <div className="medication-status">
                  <FaCheckCircle />
                  <span>Đã sử dụng an toàn</span>
                </div>
              </div>
            </div>
          )}

          {/* Follow-up */}
          {incident.requiresFollowUp && incident.followUpNotes && (
            <div className="modern-section">
              <div className="section-header-modern">
                <div className="section-icon-wrapper">
                  <FaChartLine />
                </div>
                <h3>Theo dõi sau xử lý</h3>
              </div>

              <div className="followup-modern-card">
                <div className="followup-header-modern">
                  <div className="followup-status-badge">
                    <FaFlag />
                    <span>Cần theo dõi</span>
                  </div>
                </div>
                <div className="followup-content-modern">
                  <FaCalendarCheck className="followup-icon" />
                  <p>{incident.followUpNotes}</p>
                </div>
                <div className="followup-timeline">
                  <div className="timeline-dot"></div>
                  <span>Đang theo dõi</span>
                </div>
              </div>
            </div>
          )}

          {/* Medical Staff */}
          <div className="modern-section">
            <div className="section-header-modern">
              <div className="section-icon-wrapper">
                <FaUserShield />
              </div>
              <h3>Nhân viên xử lý</h3>
            </div>

            <div className="staff-modern-card">
              <div className="staff-card-header">
                <div className="staff-avatar">
                  <FaUserMd />
                </div>
                <div className="staff-info-modern">
                  <span className="staff-role">Nhân viên y tế phụ trách</span>
                  <span className="staff-name-modern">
                    {incident.staffName || "Không xác định"}
                  </span>
                </div>
              </div>
              <div className="staff-verification">
                <FaShieldAlt />
                <span>Đã xác minh</span>
              </div>
            </div>
          </div>

          {/* Image */}
          {incident.imgUrl && (
            <div className="modern-section">
              <div className="section-header-modern">
                <div className="section-icon-wrapper">
                  <FaCamera />
                </div>
                <h3>Hình ảnh minh họa</h3>
              </div>

              <div className="image-modern-card">
                <div className="image-container-modern">
                  <img
                    src={incident.imgUrl}
                    alt="Hình ảnh sự cố y tế"
                    className="incident-image-modern"
                  />
                  <div className="image-overlay-modern">
                    <FaImage />
                    <span>Hình ảnh minh họa</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Summary */}
          <div className="modern-section">
            <div className="section-header-modern">
              <div className="section-icon-wrapper">
                <FaAward />
              </div>
              <h3>Tóm tắt trạng thái</h3>
            </div>

            <div className="status-summary-modern-grid">
              <div className="modern-status-summary-card resolved">
                <div className="status-summary-icon">
                  <FaCheckCircle />
                </div>
                <div className="status-summary-content">
                  <span className="status-summary-label">Tình trạng</span>
                  <span className="status-summary-value">
                    Đã xử lý hoàn tất
                  </span>
                </div>
                <div className="status-summary-indicator resolved"></div>
              </div>

              <div
                className="modern-status-summary-card severity"
                style={{ borderColor: severityConfig.color }}
              >
                <div
                  className="status-summary-icon"
                  style={{ color: severityConfig.color }}
                >
                  <SeverityIcon />
                </div>
                <div className="status-summary-content">
                  <span className="status-summary-label">Mức độ</span>
                  <span
                    className="status-summary-value"
                    style={{ color: severityConfig.color }}
                  >
                    {severityConfig.label}
                  </span>
                </div>
                <div
                  className="status-summary-indicator"
                  style={{ backgroundColor: severityConfig.color }}
                ></div>
              </div>

              {incident.requiresFollowUp && (
                <div className="modern-status-summary-card followup">
                  <div className="status-summary-icon">
                    <FaFlag />
                  </div>
                  <div className="status-summary-content">
                    <span className="status-summary-label">Theo dõi</span>
                    <span className="status-summary-value">
                      Cần theo dõi thêm
                    </span>
                  </div>
                  <div className="status-summary-indicator followup"></div>
                </div>
              )}

              <div className="modern-status-summary-card treatment">
                <div className="status-summary-icon">
                  <FaHandHoldingMedical />
                </div>
                <div className="status-summary-content">
                  <span className="status-summary-label">Điều trị</span>
                  <span className="status-summary-value">
                    {incident.treatment ? "Đã thực hiện" : "Không cần thiết"}
                  </span>
                </div>
                <div className="status-summary-indicator treatment"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentModal;
