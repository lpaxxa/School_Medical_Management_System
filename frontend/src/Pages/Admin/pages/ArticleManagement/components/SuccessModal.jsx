import React from "react";
import { FaCheckCircle, FaTimes } from "react-icons/fa";
import "./SuccessModal.css";

const SuccessModal = ({ isOpen, onClose, message, title = "Thành công!" }) => {
  if (!isOpen) return null;

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="success-modal-header">
          <div className="success-modal-icon">
            <FaCheckCircle />
          </div>
          <button className="success-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="success-modal-body">
          <h3 className="success-modal-title">{title}</h3>
          <p className="success-modal-message">{message}</p>
        </div>
        
        <div className="success-modal-footer">
          <button className="success-modal-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
