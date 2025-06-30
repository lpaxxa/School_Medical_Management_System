import React from "react";
import "./ConfirmModal.css";

const ConfirmModal = ({ action, onConfirm, onCancel }) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const getConfirmContent = () => {
    if (action.type === "single") {
      return {
        title: "Xác nhận gửi email",
        message: (
          <div className="confirm-details">
            <p className="confirm-question">
              Gửi thông tin đăng nhập cho <strong>{action.userName}</strong>?
            </p>
            {action.userEmail && (
              <div className="user-details">
                <div className="detail-item">
                  <span className="detail-label">Gửi đến:</span>
                  <span className="detail-value">{action.userEmail}</span>
                </div>
              </div>
            )}
          </div>
        ),
        confirmText: "Gửi email",
        icon: "fas fa-paper-plane",
      };
    } else if (action.type === "multiple") {
      return {
        title: "Xác nhận gửi email",
        message: (
          <div className="confirm-details">
            <p className="confirm-question">
              Gửi thông tin đăng nhập cho <strong>{action.count}</strong> người
              dùng đã chọn?
            </p>
            <p className="confirm-note">
              Mỗi người sẽ nhận được email riêng với tài khoản và mật khẩu cá
              nhân.
            </p>
          </div>
        ),
        confirmText: `Gửi ${action.count} email`,
        icon: "fas fa-paper-plane",
      };
    } else if (action.type === "all") {
      return {
        title: "Xác nhận gửi tất cả email",
        message: (
          <div className="confirm-details">
            <p className="confirm-question">
              Gửi thông tin đăng nhập cho <strong>tất cả {action.count}</strong>{" "}
              người dùng?
            </p>
            <p className="confirm-note">
              Toàn bộ danh sách sẽ nhận email với tài khoản và mật khẩu riêng.
            </p>
          </div>
        ),
        confirmText: `Gửi tất cả ${action.count} email`,
        icon: "fas fa-paper-plane",
      };
    }
  };

  const content = getConfirmContent();

  return (
    <div className="confirm-modal-overlay" onClick={handleOverlayClick}>
      <div className="confirm-modal">
        <div className="confirm-header">
          <div className="confirm-icon">
            <i className={content.icon}></i>
          </div>
          <h3>{content.title}</h3>
        </div>

        <div className="confirm-body">{content.message}</div>

        <div className="confirm-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            <i className="fas fa-times"></i>
            Hủy
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            <i className={content.icon}></i>
            {content.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
