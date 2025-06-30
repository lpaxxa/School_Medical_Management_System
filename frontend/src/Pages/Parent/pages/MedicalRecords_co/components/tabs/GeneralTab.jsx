import React from "react";
import {
  FaExclamationCircle,
  FaInfoCircle,
  FaSyncAlt,
  FaRulerVertical,
  FaWeight,
  FaChartLine,
  FaHeartbeat,
  FaEye,
  FaStethoscope,
  FaAllergies,
  FaNotesMedical,
  FaUtensils,
  FaShieldVirus,
  FaWheelchair,
  FaPhoneVolume,
} from "react-icons/fa";
import { formatDate, formatDateTime } from "../../utils/formatters";
import { getBMIStatus } from "../../utils/helpers";

// Function để lấy status và màu cho tình trạng tiêm chủng
const getImmunizationStatus = (status) => {
  if (!status)
    return { text: "Chưa có thông tin", className: "status-unknown" };

  const statusLower = status.toLowerCase();

  if (
    statusLower.includes("đầy đủ") ||
    statusLower.includes("hoàn thành") ||
    statusLower.includes("bình thường")
  ) {
    return { text: status, className: "status-complete" };
  } else if (
    statusLower.includes("đang cập nhật") ||
    statusLower.includes("cập nhật")
  ) {
    return { text: status, className: "status-updating" };
  } else if (
    statusLower.includes("chưa đầy đủ") ||
    statusLower.includes("thiếu") ||
    statusLower.includes("chưa hoàn thành")
  ) {
    return { text: status, className: "status-incomplete" };
  } else {
    return { text: status, className: "status-unknown" };
  }
};

const GeneralTab = ({
  healthProfileData,
  isLoading,
  error,
  studentId,
  onRefresh,
}) => {
  return (
    <div>
      {error ? (
        <div className="error-message">
          <FaExclamationCircle /> {error}
          <button className="refresh-btn" onClick={onRefresh}>
            <FaSyncAlt /> Thử lại
          </button>
        </div>
      ) : isLoading ? (
        <div className="data-loading">
          <div className="loading-spinner small"></div>
          <p>Đang tải dữ liệu sức khỏe...</p>
        </div>
      ) : !healthProfileData ? (
        <div className="no-data-message">
          <FaInfoCircle />
          <h4>Chưa có thông tin sức khỏe</h4>
          <p>Học sinh chưa có thông tin sức khỏe trong hệ thống.</p>
          <p>Vui lòng thực hiện khai báo sức khỏe để cập nhật thông tin.</p>
        </div>
      ) : (
        <>
          {/* Hiển thị thời gian cập nhật gần nhất */}
          {healthProfileData && healthProfileData.lastUpdated && (
            <div className="last-update-info">
              <p>
                Cập nhật lần cuối:{" "}
                <strong>{formatDateTime(healthProfileData.lastUpdated)}</strong>
              </p>
              {healthProfileData.lastPhysicalExamDate && (
                <p>
                  Ngày khám gần nhất:{" "}
                  <strong>
                    {formatDate(healthProfileData.lastPhysicalExamDate)}
                  </strong>
                </p>
              )}
            </div>
          )}

          {/* Phần hiển thị thông tin sức khỏe cơ bản */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon height">
                <FaRulerVertical />
              </div>
              <div className="stat-content">
                <h3>Chiều cao</h3>
                <div className="value">{healthProfileData?.height || 0}</div>
                <div className="unit">cm</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon weight">
                <FaWeight />
              </div>
              <div className="stat-content">
                <h3>Cân nặng</h3>
                <div className="value">{healthProfileData?.weight || 0}</div>
                <div className="unit">kg</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon bmi">
                <FaChartLine />
              </div>
              <div className="stat-content">
                <h3>Chỉ số BMI</h3>
                <div className="value">
                  {healthProfileData?.bmi
                    ? Number(healthProfileData.bmi).toFixed(1)
                    : "N/A"}
                </div>
                <div className="unit">
                  {getBMIStatus(healthProfileData?.bmi)}
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon blood">
                <FaHeartbeat />
              </div>
              <div className="stat-content">
                <h3>Nhóm máu</h3>
                <div className="value">
                  {healthProfileData?.bloodType || "Chưa có"}
                </div>
                <div className="unit">-</div>
              </div>
            </div>
          </div>

          {/* Phần hiển thị chi tiết thông tin sức khỏe */}
          <div className="info-grid">
            <div className="info-card">
              <div className="info-card-header">
                <FaEye className="info-card-icon" />
                <h4 className="info-card-title">Thị lực</h4>
              </div>
              <div className="info-card-content">
                <div className="vision-content">
                  <div className="vision-item">
                    <span className="vision-label">Mắt trái:</span>
                    <span className="vision-value">
                      {healthProfileData?.visionLeft || "20/20"}
                    </span>
                  </div>
                  <div className="vision-item">
                    <span className="vision-label">Mắt phải:</span>
                    <span className="vision-value">
                      {healthProfileData?.visionRight || "20/20"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-header">
                <FaStethoscope className="info-card-icon" />
                <h4 className="info-card-title">Thính lực</h4>
              </div>
              <div className="info-card-content">
                {healthProfileData?.hearingStatus || "Bình thường"}
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-header">
                <FaAllergies className="info-card-icon" />
                <h4 className="info-card-title">Dị ứng</h4>
              </div>
              <div className="info-card-content">
                {healthProfileData?.allergies || "Không có"}
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-header">
                <FaNotesMedical className="info-card-icon" />
                <h4 className="info-card-title">Bệnh mãn tính</h4>
              </div>
              <div className="info-card-content">
                {healthProfileData?.chronicDiseases || "Không có"}
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-header">
                <FaUtensils className="info-card-icon" />
                <h4 className="info-card-title">Chế độ ăn uống đặc biệt</h4>
              </div>
              <div className="info-card-content">
                {healthProfileData?.dietaryRestrictions ||
                  "Không có hạn chế đặc biệt"}
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-header">
                <FaShieldVirus className="info-card-icon" />
                <h4 className="info-card-title">Tình trạng tiêm chủng</h4>
              </div>
              <div className="info-card-content">
                <div className="immunization-status">
                  {(() => {
                    const statusInfo = getImmunizationStatus(
                      healthProfileData?.immunizationStatus
                    );
                    return (
                      <span className={`status-badge ${statusInfo.className}`}>
                        {statusInfo.text}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-header">
                <FaWheelchair className="info-card-icon" />
                <h4 className="info-card-title">Nhu cầu đặc biệt</h4>
              </div>
              <div className="info-card-content">
                {healthProfileData?.specialNeeds || "Không có"}
              </div>
            </div>

            <div className="info-card emergency-info">
              <div className="info-card-header">
                <FaPhoneVolume className="info-card-icon" />
                <h4 className="info-card-title">Thông tin liên hệ khẩn cấp</h4>
              </div>
              <div className="info-card-content">
                {healthProfileData?.emergencyContactInfo || "Chưa cập nhật"}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GeneralTab;
