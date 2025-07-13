import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import "./ErrorModal.css";

const ErrorModal = ({
  isOpen,
  onClose,
  title = "Có lỗi xảy ra!",
  message = "",
  details = "",
  autoClose = false,
  autoCloseDelay = 5000,
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
    <div className="admin-error-modal-overlay" onClick={onClose}>
      <div
        className="admin-error-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-error-modal-body">
          <div className="admin-error-icon">
            <FaExclamationTriangle />
          </div>
          <div className="admin-error-title">{title}</div>
          {message && <div className="admin-error-message">{message}</div>}
          {details && <div className="admin-error-details">{details}</div>}
        </div>
        <div className="admin-error-modal-footer">
          <button className="admin-error-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
