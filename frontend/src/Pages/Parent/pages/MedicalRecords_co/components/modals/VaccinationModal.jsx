import React from "react";
import {
  FaTimes,
  FaUserGraduate,
  FaSyringe,
  FaExclamationCircle,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserMd,
  FaClipboardList,
  FaIdCard,
  FaSchool,
  FaShieldAlt,
  FaInfoCircle,
  FaSpinner,
  FaCheckCircle,
  FaVial,
  FaUser,
  FaBell,
  FaCalendarPlus,
  FaStickyNote,
} from "react-icons/fa";
import { formatDate, formatDateTime } from "../../utils/formatters";

const VaccinationModal = ({
  isOpen,
  onClose,
  isLoading,
  error,
  vaccinationDetail,
}) => {
  if (!isOpen) return null;

  const getDoseStatus = (doseNumber) => {
    if (!doseNumber) return { status: "Chưa xác định", type: "info" };
    const dose = parseInt(doseNumber);
    if (dose === 1) return { status: "Mũi cơ bản", type: "success" };
    if (dose <= 3) return { status: "Mũi nhắc lại", type: "info" };
    return { status: "Mũi bổ sung", type: "warning" };
  };

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
                <FaSyringe />
              </div>
              <div className="modal-header-text">
                <h2>Chi tiết tiêm chủng</h2>
                <p>Thông tin chi tiết về vắc xin đã tiêm</p>
              </div>
            </div>
            <button className="modal-close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Simple Modern Body */}
        <div className="modern-modal-body">
          {isLoading ? (
            <div className="modal-loading">
              <div className="modal-loading-spinner"></div>
              <h3>Đang tải thông tin...</h3>
              <p>Vui lòng chờ trong giây lát</p>
            </div>
          ) : error ? (
            <div className="modal-error">
              <FaExclamationCircle className="modal-error-icon" />
              <h3>Lỗi tải dữ liệu</h3>
              <p>{error}</p>
              <button
                className="modal-error-btn"
                onClick={() => window.location.reload()}
              >
                <FaSpinner />
                Thử lại
              </button>
            </div>
          ) : vaccinationDetail ? (
            <>
              {/* Student Information */}
              <div className="modal-section">
                <h3 className="section-title">
                  <FaUser />
                  Thông tin học sinh
                </h3>
                <div className="info-cards-grid">
                  <div className="info-card-simple">
                    <div className="info-card-header">
                      <FaUserGraduate className="info-card-icon" />
                      <span className="info-card-label">Họ tên</span>
                    </div>
                    <div className="info-card-value">
                      {vaccinationDetail.studentName || "Không có thông tin"}
                    </div>
                  </div>

                  <div className="info-card-simple">
                    <div className="info-card-header">
                      <FaIdCard className="info-card-icon" />
                      <span className="info-card-label">Mã học sinh</span>
                    </div>
                    <div className="info-card-value">
                      {vaccinationDetail.studentId || "Không có thông tin"}
                    </div>
                  </div>

                  <div className="info-card-simple">
                    <div className="info-card-header">
                      <FaSchool className="info-card-icon" />
                      <span className="info-card-label">Lớp</span>
                    </div>
                    <div className="info-card-value">
                      {vaccinationDetail.className || "Không có thông tin"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vaccine Information */}
              <div className="modal-section">
                <h3 className="section-title">
                  <FaVial />
                  Thông tin vắc xin
                </h3>

                {/* Main Vaccine Info */}
                <div className="content-card">
                  <div className="content-card-title">
                    <FaShieldAlt />
                    Tên vắc xin
                  </div>
                  <div className="info-card-value">
                    {vaccinationDetail.vaccineName || "Không có thông tin"}
                    {vaccinationDetail.doseNumber && (
                      <div style={{ marginTop: "8px" }}>
                        <span
                          className={`status-badge-simple ${
                            getDoseStatus(vaccinationDetail.doseNumber).type
                          }`}
                        >
                          Mũi thứ {vaccinationDetail.doseNumber} -{" "}
                          {getDoseStatus(vaccinationDetail.doseNumber).status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="info-cards-grid">
                  <div className="info-card-simple">
                    <div className="info-card-header">
                      <FaCalendarAlt className="info-card-icon" />
                      <span className="info-card-label">Ngày tiêm</span>
                    </div>
                    <div className="info-card-value">
                      {vaccinationDetail.vaccinationDate
                        ? formatDateTime(vaccinationDetail.vaccinationDate)
                        : "Không có thông tin"}
                    </div>
                  </div>

                  <div className="info-card-simple">
                    <div className="info-card-header">
                      <FaMapMarkerAlt className="info-card-icon" />
                      <span className="info-card-label">Địa điểm tiêm</span>
                    </div>
                    <div className="info-card-value">
                      {vaccinationDetail.administeredAt || "Không có thông tin"}
                    </div>
                  </div>

                  <div className="info-card-simple">
                    <div className="info-card-header">
                      <FaUserMd className="info-card-icon" />
                      <span className="info-card-label">Người thực hiện</span>
                    </div>
                    <div className="info-card-value">
                      {vaccinationDetail.administeredBy || "Không có thông tin"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Dose */}
              {vaccinationDetail.nextDoseDate && (
                <div className="modal-section">
                  <h3 className="section-title">
                    <FaCalendarPlus />
                    Lịch tiêm kế tiếp
                  </h3>
                  <div className="content-card">
                    <div className="content-card-title">
                      <FaBell />
                      Nhắc nhở
                    </div>
                    <p className="content-card-text">
                      <strong>Ngày hẹn tiêm kế tiếp: </strong>
                      {formatDate(vaccinationDetail.nextDoseDate)}
                    </p>
                    <p className="content-card-text">
                      Vui lòng đưa con đến đúng hẹn để đảm bảo hiệu quả vắc xin.
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {vaccinationDetail.notes && (
                <div className="modal-section">
                  <h3 className="section-title">
                    <FaStickyNote />
                    Ghi chú
                  </h3>
                  <div className="content-card">
                    <div className="content-card-title">
                      <FaClipboardList />
                      Thông tin bổ sung
                    </div>
                    <p className="content-card-text">
                      {vaccinationDetail.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Status Summary */}
              <div className="modal-section">
                <h3 className="section-title">
                  <FaCheckCircle />
                  Tình trạng tiêm chủng
                </h3>
                <div className="info-cards-grid">
                  <div className="info-card-simple">
                    <div className="info-card-header">
                      <FaCheckCircle className="info-card-icon" />
                      <span className="info-card-label">Trạng thái</span>
                    </div>
                    <div className="info-card-value">
                      <span className="status-badge-simple success">
                        Đã hoàn thành
                      </span>
                    </div>
                  </div>

                  <div className="info-card-simple">
                    <div className="info-card-header">
                      <FaShieldAlt className="info-card-icon" />
                      <span className="info-card-label">Hiệu lực</span>
                    </div>
                    <div className="info-card-value">
                      <span className="status-badge-simple success">
                        Đang hoạt động
                      </span>
                    </div>
                  </div>

                  {vaccinationDetail.nextDoseDate && (
                    <div className="info-card-simple">
                      <div className="info-card-header">
                        <FaCalendarPlus className="info-card-icon" />
                        <span className="info-card-label">Theo dõi</span>
                      </div>
                      <div className="info-card-value">
                        <span className="status-badge-simple info">
                          Có lịch hẹn
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="modal-error">
              <FaInfoCircle className="modal-error-icon" />
              <h3>Không có thông tin chi tiết</h3>
              <p>Thông tin chi tiết về mũi tiêm này hiện chưa có sẵn.</p>
              <button className="modal-error-btn" onClick={onClose}>
                <FaTimes />
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaccinationModal;
