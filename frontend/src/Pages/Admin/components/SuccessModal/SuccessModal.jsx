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
    <div className="admin-success-modal-overlay" onClick={onClose}>
      <div
        className="admin-success-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-success-modal-body">
          <div className="admin-success-icon">
            <FaCheck />
          </div>
          <div className="admin-success-title">{title}</div>
          {message && <div className="admin-success-message">{message}</div>}
          {details && <div className="admin-success-details">{details}</div>}
        </div>
        <div className="admin-success-modal-footer">
          <button className="admin-success-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
