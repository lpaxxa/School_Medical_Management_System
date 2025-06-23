import React from 'react';
import { FaTimes, FaUserGraduate, FaSyringe, FaExclamationCircle } from 'react-icons/fa';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { modalClasses } from '../../utils/helpers';

const VaccinationModal = ({ 
  isOpen, 
  onClose, 
  isLoading, 
  error, 
  vaccinationDetail 
}) => {
  if (!isOpen) return null;

  const { 
    modalOverlayClass, 
    modalContentClass, 
    modalHeaderClass, 
    modalBodyClass, 
    closeModalBtnClass 
  } = modalClasses;

  return (
    <div className={modalOverlayClass} onClick={onClose}>
      <div className={modalContentClass} onClick={(e) => e.stopPropagation()}>
        <div className={modalHeaderClass}>
          <h3>Chi tiết tiêm chủng</h3>
          <button className={closeModalBtnClass} onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className={modalBodyClass}>
          {isLoading ? (
            <div className="data-loading">
              <div className="loading-spinner small"></div>
              <p>Đang tải thông tin chi tiết...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <FaExclamationCircle /> {error}
            </div>
          ) : vaccinationDetail ? (
            <div className="vaccination-detail-content">
              <div className="student-info-section">
                <div className="info-header">
                  <FaUserGraduate />
                  <h4>Thông tin học sinh</h4>
                </div>
                <div className="info-content">
                  <div className="info-row">
                    <span className="info-label">Họ tên:</span>
                    <span className="info-value">{vaccinationDetail.studentName}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Mã học sinh:</span>
                    <span className="info-value">{vaccinationDetail.studentId}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Lớp:</span>
                    <span className="info-value">{vaccinationDetail.className}</span>
                  </div>
                </div>
              </div>
              
              <div className="vaccination-info-section">
                <div className="info-header">
                  <FaSyringe />
                  <h4>Thông tin vắc xin</h4>
                </div>
                <div className="info-content">
                  <div className="info-row">
                    <span className="info-label">Tên vắc xin:</span>
                    <span className="info-value">{vaccinationDetail.vaccineName}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Ngày tiêm:</span>
                    <span className="info-value">{formatDateTime(vaccinationDetail.vaccinationDate)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Địa điểm:</span>
                    <span className="info-value">{vaccinationDetail.administeredAt}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Người thực hiện:</span>
                    <span className="info-value">{vaccinationDetail.administeredBy}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Mũi thứ:</span>
                    <span className="info-value">{vaccinationDetail.doseNumber}</span>
                  </div>
                  {vaccinationDetail.nextDoseDate && (
                    <div className="info-row">
                      <span className="info-label">Lịch tiêm kế tiếp:</span>
                      <span className="info-value highlight-next-dose">
                        {formatDate(vaccinationDetail.nextDoseDate)}
                      </span>
                    </div>
                  )}
                  {vaccinationDetail.notes && (
                    <div className="info-row notes-row">
                      <span className="info-label">Ghi chú:</span>
                      <span className="info-value">{vaccinationDetail.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-detail-message">
              <p>Không có thông tin chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaccinationModal;