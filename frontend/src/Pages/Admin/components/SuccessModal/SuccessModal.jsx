import React from "react";
import { FaCheck } from "react-icons/fa";
import "./SuccessModal.css";

const SuccessModal = ({
  isOpen,
  onClose,
  title = "Thành công!",
  message = "",
  details = "",
  autoClose = true,
  autoCloseDelay = 3000,
}) => {
  // Auto close effect
  React.useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay success-modal-overlay" onClick={onClose}>
      <div
        className="modal-content success-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-body success-modal-body">
          <div className="success-icon">
            <FaCheck />
          </div>
          <div className="success-title">{title}</div>
          {message && <div className="success-message">{message}</div>}
          {details && <div className="success-details">{details}</div>}
        </div>
        <div className="modal-footer success-modal-footer">
          <button className="btn-primary success-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
