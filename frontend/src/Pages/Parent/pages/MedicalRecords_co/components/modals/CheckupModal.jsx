import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { formatDateTime } from '../../utils/formatters';
import { modalClasses } from '../../utils/helpers';

const CheckupModal = ({ isOpen, onClose, checkup }) => {
  if (!isOpen || !checkup) return null;
  
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
          <h3>Chi tiết kiểm tra sức khỏe</h3>
          <button className={closeModalBtnClass} onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className={modalBodyClass}>
          <div className="checkup-details-modal">
            <div className="stats-row">
              <div className="stat-box">
                <span className="stat-label">Ngày khám</span>
                <span className="stat-value">
                  {formatDateTime(checkup.examDate)}
                </span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Loại khám</span>
                <span className="stat-value">
                  {checkup.examType || "Kiểm tra định kỳ"}
                </span>
              </div>
            </div>
            
            <div className="detail-section">
              <h4>Kết quả khám</h4>
              <p>{checkup.examResult || "Không có kết quả cụ thể"}</p>
            </div>
            
            {checkup.height && (
              <div className="detail-section">
                <h4>Chiều cao</h4>
                <p>{checkup.height} cm</p>
              </div>
            )}
            
            {checkup.weight && (
              <div className="detail-section">
                <h4>Cân nặng</h4>
                <p>{checkup.weight} kg</p>
              </div>
            )}
            
            {checkup.bmi && (
              <div className="detail-section">
                <h4>Chỉ số BMI</h4>
                <p>{checkup.bmi}</p>
              </div>
            )}
            
            {checkup.visionLeft && checkup.visionRight && (
              <div className="detail-section">
                <h4>Thị lực</h4>
                <p>Mắt trái: {checkup.visionLeft}, Mắt phải: {checkup.visionRight}</p>
              </div>
            )}
            
            {checkup.notes && (
              <div className="detail-section">
                <h4>Ghi chú</h4>
                <p>{checkup.notes}</p>
              </div>
            )}
            
            <div className="detail-section">
              <h4>Bác sĩ khám</h4>
              <p>{checkup.doctorName || "Không có thông tin"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckupModal;