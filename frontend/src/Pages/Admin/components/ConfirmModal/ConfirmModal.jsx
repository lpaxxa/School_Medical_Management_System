import React from "react";
import { FaQuestionCircle } from "react-icons/fa";
import "./ConfirmModal.css";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện thao tác này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  type = "default", // "default" | "danger" | "warning"
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="admin-confirm-modal-overlay" onClick={onClose}>
      <div
        className="admin-confirm-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-confirm-modal-body">
          <div className={`admin-confirm-icon ${type}`}>
            <FaQuestionCircle />
          </div>
          <div className="admin-confirm-title">{title}</div>
          {message && <div className="admin-confirm-message">{message}</div>}
        </div>
        <div className="admin-confirm-modal-footer">
          <button className="admin-confirm-btn-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button
            className={`admin-confirm-btn-confirm ${type}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
