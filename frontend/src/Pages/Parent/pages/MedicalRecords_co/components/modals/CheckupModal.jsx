import React from "react";
import {
  FaTimes,
  FaUserMd,
  FaHeartbeat,
  FaEye,
  FaRulerVertical,
  FaWeight,
  FaThermometerHalf,
  FaStethoscope,
  FaCalendarAlt,
  FaClipboardList,
  FaExclamationTriangle,
  FaCheckCircle,
  FaBell,
  FaUser,
  FaNotesMedical,
  FaHeart,
  FaAward,
} from "react-icons/fa";
import { formatDate } from "../../utils/formatters";

const CheckupModal = ({ isOpen, onClose, checkup }) => {
  if (!isOpen || !checkup) return null;

  const formatValue = (value, unit = "") => {
    return value ? `${value}${unit}` : "Chưa có thông tin";
  };

  const getBMIStatus = (bmi) => {
    if (!bmi) return { status: "Chưa có thông tin", type: "info" };
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return { status: "Thiếu cân", type: "warning" };
    if (bmiValue <= 24.9) return { status: "Bình thường", type: "success" };
    if (bmiValue <= 29.9) return { status: "Thừa cân", type: "warning" };
    return { status: "Béo phì", type: "error" };
  };

  const getVisionStatus = (vision) => {
    if (!vision) return { status: "Chưa đánh giá", type: "info" };
    if (vision.includes("10/10") || vision.includes("bình thường")) {
      return { status: "Tốt", type: "success" };
    }
    return { status: "Cần theo dõi", type: "warning" };
  };

  const bmiStatus = getBMIStatus(checkup.bmi);
  const leftVisionStatus = getVisionStatus(checkup.visionLeft);
  const rightVisionStatus = getVisionStatus(checkup.visionRight);

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
                <FaStethoscope />
              </div>
              <div className="modal-header-text">
                <h2>Chi tiết kiểm tra sức khỏe</h2>
                <p>Thông tin chi tiết về kết quả khám sức khỏe định kỳ</p>
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
              <FaClipboardList />
              Thông tin cơ bản
            </h3>
            <div className="info-cards-grid">
              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaCalendarAlt className="info-card-icon" />
                  <span className="info-card-label">Ngày khám</span>
                </div>
                <div className="info-card-value">
                  {formatDate(checkup.checkupDate)}
                </div>
              </div>

              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaNotesMedical className="info-card-icon" />
                  <span className="info-card-label">Loại khám</span>
                </div>
                <div className="info-card-value">
                  {checkup.checkupType || "Kiểm tra định kỳ"}
                </div>
              </div>

              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaUserMd className="info-card-icon" />
                  <span className="info-card-label">Nhân viên y tế</span>
                </div>
                <div className="info-card-value">
                  {checkup.medicalStaffName || "Chưa có thông tin"}
                </div>
              </div>
            </div>
          </div>

          {/* Body Measurements */}
          <div className="modal-section">
            <h3 className="section-title">
              <FaRulerVertical />
              Chỉ số cơ thể
            </h3>
            <div className="info-cards-grid">
              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaRulerVertical className="info-card-icon" />
                  <span className="info-card-label">Chiều cao</span>
                </div>
                <div className="info-card-value">
                  {formatValue(checkup.height, " cm")}
                </div>
              </div>

              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaWeight className="info-card-icon" />
                  <span className="info-card-label">Cân nặng</span>
                </div>
                <div className="info-card-value">
                  {formatValue(checkup.weight, " kg")}
                </div>
              </div>

              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaAward className="info-card-icon" />
                  <span className="info-card-label">Chỉ số BMI</span>
                </div>
                <div className="info-card-value">
                  {formatValue(checkup.bmi)}
                  {checkup.bmi && (
                    <div style={{ marginTop: "8px" }}>
                      <span className={`status-badge-simple ${bmiStatus.type}`}>
                        {bmiStatus.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          <div className="modal-section">
            <h3 className="section-title">
              <FaHeartbeat />
              Dấu hiệu sinh tồn
            </h3>
            <div className="info-cards-grid">
              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaHeartbeat className="info-card-icon" />
                  <span className="info-card-label">Huyết áp</span>
                </div>
                <div className="info-card-value">
                  {checkup.bloodPressure || "Chưa có thông tin"}
                </div>
              </div>

              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaHeart className="info-card-icon" />
                  <span className="info-card-label">Nhịp tim</span>
                </div>
                <div className="info-card-value">
                  {formatValue(checkup.heartRate, " lần/phút")}
                </div>
              </div>

              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaThermometerHalf className="info-card-icon" />
                  <span className="info-card-label">Thân nhiệt</span>
                </div>
                <div className="info-card-value">
                  {formatValue(checkup.bodyTemperature, "°C")}
                </div>
              </div>
            </div>
          </div>

          {/* Vision & Hearing */}
          <div className="modal-section">
            <h3 className="section-title">
              <FaEye />
              Khám chuyên khoa
            </h3>
            <div className="info-cards-grid">
              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaEye className="info-card-icon" />
                  <span className="info-card-label">Thị lực mắt trái</span>
                </div>
                <div className="info-card-value">
                  {checkup.visionLeft || "Chưa có thông tin"}
                  {checkup.visionLeft && (
                    <div style={{ marginTop: "8px" }}>
                      <span
                        className={`status-badge-simple ${leftVisionStatus.type}`}
                      >
                        {leftVisionStatus.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaEye className="info-card-icon" />
                  <span className="info-card-label">Thị lực mắt phải</span>
                </div>
                <div className="info-card-value">
                  {checkup.visionRight || "Chưa có thông tin"}
                  {checkup.visionRight && (
                    <div style={{ marginTop: "8px" }}>
                      <span
                        className={`status-badge-simple ${rightVisionStatus.type}`}
                      >
                        {rightVisionStatus.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaStethoscope className="info-card-icon" />
                  <span className="info-card-label">Thính lực</span>
                </div>
                <div className="info-card-value">
                  {checkup.hearingStatus || "Chưa có thông tin"}
                </div>
              </div>
            </div>
          </div>

          {/* Diagnosis & Recommendations */}
          {(checkup.diagnosis || checkup.recommendations) && (
            <div className="modal-section">
              <h3 className="section-title">
                <FaNotesMedical />
                Chẩn đoán & Khuyến nghị
              </h3>

              {checkup.diagnosis && (
                <div className="content-card">
                  <div className="content-card-title">
                    <FaStethoscope />
                    Chẩn đoán
                  </div>
                  <p className="content-card-text">{checkup.diagnosis}</p>
                </div>
              )}

              {checkup.recommendations && (
                <div className="content-card">
                  <div className="content-card-title">
                    <FaClipboardList />
                    Khuyến nghị
                  </div>
                  <p className="content-card-text">{checkup.recommendations}</p>
                </div>
              )}
            </div>
          )}

          {/* Status Summary */}
          <div className="modal-section">
            <h3 className="section-title">
              <FaCheckCircle />
              Tình trạng theo dõi
            </h3>
            <div className="info-cards-grid">
              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaExclamationTriangle className="info-card-icon" />
                  <span className="info-card-label">Theo dõi</span>
                </div>
                <div className="info-card-value">
                  <span
                    className={`status-badge-simple ${
                      checkup.followUpNeeded ? "warning" : "success"
                    }`}
                  >
                    {checkup.followUpNeeded ? "Cần theo dõi" : "Hoàn thành"}
                  </span>
                </div>
              </div>

              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaBell className="info-card-icon" />
                  <span className="info-card-label">Thông báo phụ huynh</span>
                </div>
                <div className="info-card-value">
                  <span
                    className={`status-badge-simple ${
                      checkup.parentNotified ? "success" : "warning"
                    }`}
                  >
                    {checkup.parentNotified ? "Đã thông báo" : "Chưa thông báo"}
                  </span>
                </div>
              </div>

              <div className="info-card-simple">
                <div className="info-card-header">
                  <FaUser className="info-card-icon" />
                  <span className="info-card-label">Trạng thái</span>
                </div>
                <div className="info-card-value">
                  <span className="status-badge-simple success">
                    Hoàn thành khám
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckupModal;
