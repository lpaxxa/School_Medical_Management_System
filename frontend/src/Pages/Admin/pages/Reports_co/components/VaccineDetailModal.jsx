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
    <div className="vaccine-modal-backdrop" onClick={handleBackdropClick}>
      <div className="vaccine-modal-container">
        <div className="vaccine-modal-header">
          <div className="modal-title-section">
            <h2>
              <i className="fas fa-syringe"></i>
              Chi tiết vaccine
            </h2>
            <span className="vaccine-id">ID: {vaccine.id}</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="vaccine-modal-content">
          {/* Basic Information */}
          <div className="info-section">
            <h3>
              <i className="fas fa-info-circle"></i>
              Thông tin cơ bản
            </h3>
            <div className="info-grid">
              <div className="info-item full-width">
                <label>Tên vaccine:</label>
                <div className="vaccine-name-display">
                  <strong>{vaccine.name}</strong>
                  <span className={`status-indicator ${statusInfo.class}`}>
                    <i className={statusInfo.icon}></i>
                    {statusInfo.text}
                  </span>
                </div>
              </div>

              <div className="info-item full-width">
                <label>Mô tả:</label>
                <div className="description-box">{vaccine.description}</div>
              </div>
            </div>
          </div>

          {/* Age Group Information */}
          <div className="info-section">
            <h3>
              <i className="fas fa-users"></i>
              Thông tin độ tuổi
            </h3>
            <div className="age-info-card">
              <div className="age-category">
                <span className="category-badge">{ageInfo.category}</span>
                <span className="age-range">{ageInfo.range}</span>
              </div>
              <p className="age-description">{ageInfo.description}</p>
              <div className="age-details">
                <div className="age-detail-item">
                  <span className="label">Độ tuổi tối thiểu:</span>
                  <span className="value">
                    {vaccineService.monthsToAgeText(vaccine.minAgeMonths)}
                  </span>
                </div>
                <div className="age-detail-item">
                  <span className="label">Độ tuổi tối đa:</span>
                  <span className="value">
                    {vaccineService.monthsToAgeText(vaccine.maxAgeMonths)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dosage Information */}
          <div className="info-section">
            <h3>
              <i className="fas fa-calendar-alt"></i>
              Thông tin liều tiêm
            </h3>
            <div className="dosage-info-card">
              <div className="dosage-header">
                <span className="dosage-type">{dosageInfo.type}</span>
                <span className="total-doses">{vaccine.totalDoses} liều</span>
              </div>
              <p className="dosage-description">{dosageInfo.schedule}</p>
              <div className="dosage-details">
                <div className="dosage-detail-item">
                  <i className="fas fa-syringe"></i>
                  <div>
                    <span className="label">Tổng số liều:</span>
                    <span className="value">{vaccine.totalDoses} liều</span>
                  </div>
                </div>
                <div className="dosage-detail-item">
                  <i className="fas fa-clock"></i>
                  <div>
                    <span className="label">Khoảng cách:</span>
                    <span className="value">
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
          <div className="info-section">
            <h3>
              <i className="fas fa-toggle-on"></i>
              Trạng thái sử dụng
            </h3>
            <div className={`status-info-card ${statusInfo.class}`}>
              <div className="status-header">
                <i className={statusInfo.icon}></i>
                <span className="status-text">{statusInfo.text}</span>
              </div>
              <p className="status-description">{statusInfo.description}</p>
            </div>
          </div>

          {/* Additional Information */}
          <div className="info-section">
            <h3>
              <i className="fas fa-notes-medical"></i>
              Thông tin bổ sung
            </h3>
            <div className="additional-info">
              <div className="info-row">
                <span className="label">Mã vaccine:</span>
                <span className="value">
                  VCN-{String(vaccine.id).padStart(4, "0")}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Loại vaccine:</span>
                <span className="value">
                  {vaccine.totalDoses === 1
                    ? "Vaccine một liều"
                    : "Vaccine đa liều"}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Phân loại theo tuổi:</span>
                <span className="value">{ageInfo.category}</span>
              </div>
              <div className="info-row">
                <span className="label">Tình trạng:</span>
                <span className={`value status-${statusInfo.class}`}>
                  {statusInfo.text}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="vaccine-modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            <i className="fas fa-times"></i>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default VaccineDetailModal;
