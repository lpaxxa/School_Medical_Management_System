import React from 'react';
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
  FaPhoneVolume
} from 'react-icons/fa';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { getBMIStatus } from '../../utils/helpers';

const GeneralTab = ({ healthProfileData, isLoading, error, studentId, onRefresh }) => {
  return (
    <div className="general-info-panel">
      <h3>Thông tin sức khỏe tổng quát</h3>

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
              <div className="stat-icon">
                <FaRulerVertical />
              </div>
              <div className="stat-content">
                <h4>Chiều cao</h4>
                <p>{healthProfileData?.height || 0} cm</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaWeight />
              </div>
              <div className="stat-content">
                <h4>Cân nặng</h4>
                <p>{healthProfileData?.weight || 0} kg</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaChartLine />
              </div>
              <div className="stat-content">
                <h4>Chỉ số BMI</h4>
                <p>
                  {healthProfileData?.bmi
                    ? Number(healthProfileData.bmi).toFixed(1)
                    : "N/A"}
                </p>
                <small>{getBMIStatus(healthProfileData?.bmi)}</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaHeartbeat />
              </div>
              <div className="stat-content">
                <h4>Nhóm máu</h4>
                <p>{healthProfileData?.bloodType || "Chưa cập nhật"}</p>
              </div>
            </div>
          </div>

          {/* Phần hiển thị chi tiết thông tin sức khỏe */}
          <div className="medical-details-section">
            <div className="medical-detail">
              <h4>
                <FaEye /> Thị lực
              </h4>
              <div className="detail-content">
                <p>
                  Mắt trái:{" "}
                  {healthProfileData?.visionLeft || "Chưa kiểm tra"}
                </p>
                <p>
                  Mắt phải:{" "}
                  {healthProfileData?.visionRight || "Chưa kiểm tra"}
                </p>
              </div>
            </div>

            <div className="medical-detail">
              <h4>
                <FaStethoscope /> Thính lực
              </h4>
              <p>{healthProfileData?.hearingStatus || "Chưa kiểm tra"}</p>
            </div>

            <div className="medical-detail">
              <h4>
                <FaAllergies /> Dị ứng
              </h4>
              <p>{healthProfileData?.allergies || "Không có"}</p>
            </div>

            <div className="medical-detail">
              <h4>
                <FaNotesMedical /> Bệnh mãn tính
              </h4>
              <p>{healthProfileData?.chronicDiseases || "Không có"}</p>
            </div>

            <div className="medical-detail">
              <h4>
                <FaUtensils /> Chế độ ăn uống đặc biệt
              </h4>
              <p>
                {healthProfileData?.dietaryRestrictions ||
                  "Không có hạn chế đặc biệt"}
              </p>
            </div>

            <div className="medical-detail">
              <h4>
                <FaShieldVirus /> Tình trạng tiêm chủng
              </h4>
              <p>
                {healthProfileData?.immunizationStatus ||
                  "Chưa có thông tin"}
              </p>
            </div>

            <div className="medical-detail">
              <h4>
                <FaWheelchair /> Nhu cầu đặc biệt
              </h4>
              <p>{healthProfileData?.specialNeeds || "Không có"}</p>
            </div>

            <div className="medical-detail emergency-info">
              <h4>
                <FaPhoneVolume /> Thông tin liên hệ khẩn cấp
              </h4>
              <p>
                {healthProfileData?.emergencyContactInfo ||
                  "Chưa cập nhật"}
              </p>
            </div>
          </div>

          {/* Thêm nút làm mới dữ liệu */}
          <button
            className="refresh-button"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <FaSyncAlt /> Làm mới dữ liệu
          </button>
        </>
      )}
    </div>
  );
};

export default GeneralTab;