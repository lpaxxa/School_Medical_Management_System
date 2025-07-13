import React from "react";
import vaccineService from "../../../../../services/APIAdmin/vaccineService";
import "./VaccineDetailModal.css";

const VaccineDetailModal = ({ vaccine, onClose }) => {
  if (!vaccine) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStatusInfo = (isActive) => {
    return isActive
      ? {
          class: "active",
          icon: "fas fa-check-circle",
          text: "Đang sử dụng",
          description:
            "Vaccine này hiện đang được sử dụng trong chương trình tiêm chủng",
        }
      : {
          class: "inactive",
          icon: "fas fa-pause-circle",
          text: "Tạm dừng",
          description: "Vaccine này hiện tạm dừng sử dụng",
        };
  };

  const getDosageInfo = () => {
    if (vaccine.totalDoses === 1) {
      return {
        type: "Tiêm một lần",
        schedule: "Chỉ cần tiêm 1 liều duy nhất",
        interval: "Không có khoảng cách",
      };
    } else {
      return {
        type: `Tiêm ${vaccine.totalDoses} liều`,
        schedule: `Cần tiêm ${vaccine.totalDoses} liều để đạt hiệu quả tối ưu`,
        interval: `Khoảng cách giữa các liều: ${vaccine.intervalDays} ngày`,
      };
    }
  };

  const getAgeGroupInfo = () => {
    const minAge = vaccineService.monthsToAgeText(vaccine.minAgeMonths);
    const maxAge = vaccineService.monthsToAgeText(vaccine.maxAgeMonths);

    let category = "";
    let description = "";

    if (vaccine.maxAgeMonths <= 12) {
      category = "Trẻ sơ sinh";
      description = "Vaccine dành cho trẻ sơ sinh và trẻ nhỏ";
    } else if (vaccine.minAgeMonths <= 60 && vaccine.maxAgeMonths > 12) {
      category = "Trẻ em";
      description = "Vaccine dành cho trẻ em trong độ tuổi mầm non và tiểu học";
    } else if (vaccine.minAgeMonths > 60) {
      category = "Thiếu niên";
      description = "Vaccine dành cho thiếu niên và người trưởng thành";
    } else {
      category = "Đa độ tuổi";
      description = "Vaccine có thể sử dụng cho nhiều nhóm tuổi khác nhau";
    }

    return {
      category,
      range: `${minAge} - ${maxAge}`,
      description,
    };
  };

  const statusInfo = getStatusInfo(vaccine.isActive);
  const dosageInfo = getDosageInfo();
  const ageInfo = getAgeGroupInfo();

  return (
    <div
      className="reports-vaccine-modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div className="reports-vaccine-modal-container">
        <div className="reports-vaccine-modal-header">
          <div className="reports-vaccine-modal-title">
            <i className="fas fa-syringe"></i>
            <h2>Chi tiết vaccine</h2>
          </div>
          <button className="reports-vaccine-modal-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="reports-vaccine-modal-body">
          {/* Basic Information */}
          <div className="reports-vaccine-info-section">
            <h3>
              <i className="fas fa-info-circle"></i>
              Thông tin cơ bản
            </h3>
            <div className="reports-vaccine-info-grid">
              <div className="reports-vaccine-info-item reports-vaccine-full-width">
                <label>Tên vaccine:</label>
                <div className="reports-vaccine-name-display">
                  <strong>{vaccine.name}</strong>
                  <span
                    className={`reports-vaccine-status-indicator ${statusInfo.class}`}
                  >
                    <i className={statusInfo.icon}></i>
                    {statusInfo.text}
                  </span>
                </div>
              </div>

              <div className="reports-vaccine-info-item reports-vaccine-full-width">
                <label>Mô tả:</label>
                <div className="reports-vaccine-description-box">
                  {vaccine.description}
                </div>
              </div>
            </div>
          </div>

          {/* Age Group Information */}
          <div className="reports-vaccine-info-section">
            <h3>
              <i className="fas fa-users"></i>
              Thông tin độ tuổi
            </h3>
            <div className="reports-vaccine-age-info-card">
              <div className="reports-vaccine-age-category">
                <span className="reports-vaccine-category-badge">
                  {ageInfo.category}
                </span>
                <span className="reports-vaccine-age-range">
                  {ageInfo.range}
                </span>
              </div>
              <p className="reports-vaccine-age-description">
                {ageInfo.description}
              </p>
              <div className="reports-vaccine-age-details">
                <div className="reports-vaccine-age-detail-item">
                  <span className="reports-vaccine-label">
                    Độ tuổi tối thiểu:
                  </span>
                  <span className="reports-vaccine-value">
                    {vaccineService.monthsToAgeText(vaccine.minAgeMonths)}
                  </span>
                </div>
                <div className="reports-vaccine-age-detail-item">
                  <span className="reports-vaccine-label">Độ tuổi tối đa:</span>
                  <span className="reports-vaccine-value">
                    {vaccineService.monthsToAgeText(vaccine.maxAgeMonths)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dosage Information */}
          <div className="reports-vaccine-info-section">
            <h3>
              <i className="fas fa-calendar-alt"></i>
              Thông tin liều tiêm
            </h3>
            <div className="reports-vaccine-dosage-info-card">
              <div className="reports-vaccine-dosage-header">
                <span className="reports-vaccine-dosage-type">
                  {dosageInfo.type}
                </span>
                <span className="reports-vaccine-total-doses">
                  {vaccine.totalDoses} liều
                </span>
              </div>
              <p className="reports-vaccine-dosage-description">
                {dosageInfo.schedule}
              </p>
              <div className="reports-vaccine-dosage-details">
                <div className="reports-vaccine-dosage-detail-item">
                  <i className="fas fa-syringe"></i>
                  <div>
                    <span className="reports-vaccine-label">Tổng số liều:</span>
                    <span className="reports-vaccine-value">
                      {vaccine.totalDoses} liều
                    </span>
                  </div>
                </div>
                <div className="reports-vaccine-dosage-detail-item">
                  <i className="fas fa-clock"></i>
                  <div>
                    <span className="reports-vaccine-label">Khoảng cách:</span>
                    <span className="reports-vaccine-value">
                      {vaccine.intervalDays > 0
                        ? `${vaccine.intervalDays} ngày`
                        : "Không có khoảng cách"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="reports-vaccine-info-section">
            <h3>
              <i className="fas fa-toggle-on"></i>
              Trạng thái sử dụng
            </h3>
            <div
              className={`reports-vaccine-status-info-card ${statusInfo.class}`}
            >
              <div className="reports-vaccine-status-header">
                <i className={statusInfo.icon}></i>
                <span className="reports-vaccine-status-text">
                  {statusInfo.text}
                </span>
              </div>
              <p className="reports-vaccine-status-description">
                {statusInfo.description}
              </p>
            </div>
          </div>

          {/* Additional Information */}
          <div className="reports-vaccine-info-section">
            <h3>
              <i className="fas fa-notes-medical"></i>
              Thông tin bổ sung
            </h3>
            <div className="reports-vaccine-additional-info">
              <div className="reports-vaccine-info-row">
                <span className="reports-vaccine-label">Mã vaccine:</span>
                <span className="reports-vaccine-value">
                  VCN-{String(vaccine.id).padStart(4, "0")}
                </span>
              </div>
              <div className="reports-vaccine-info-row">
                <span className="reports-vaccine-label">Loại vaccine:</span>
                <span className="reports-vaccine-value">
                  {vaccine.totalDoses === 1
                    ? "Vaccine một liều"
                    : "Vaccine đa liều"}
                </span>
              </div>
              <div className="reports-vaccine-info-row">
                <span className="reports-vaccine-label">
                  Phân loại theo tuổi:
                </span>
                <span className="reports-vaccine-value">
                  {ageInfo.category}
                </span>
              </div>
              <div className="reports-vaccine-info-row">
                <span className="reports-vaccine-label">Tình trạng:</span>
                <span
                  className={`reports-vaccine-value reports-vaccine-status-${statusInfo.class}`}
                >
                  {statusInfo.text}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="reports-vaccine-modal-footer">
          <button className="reports-vaccine-btn-secondary" onClick={onClose}>
            <i className="fas fa-times"></i>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default VaccineDetailModal;
