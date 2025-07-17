import React from 'react';

/**
 * Notification Modal Component
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether to show the modal
 * @param {string} props.type - Type of notification (success, error, warning, info)
 * @param {string} props.title - Modal title
 * @param {string} props.message - Modal message
 * @param {Function} props.onClose - Close handler
 */
const NotificationModal = ({ show, type, title, message, onClose }) => {
  if (!show) return null;

  const getIconByType = (type) => {
    switch (type) {
      case 'success':
        return (
          <svg className="notification-icon success" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'error':
        return (
          <svg className="notification-icon error" viewBox="0 0 24 24" fill="none">
            <path
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg className="notification-icon warning" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="notification-icon info" viewBox="0 0 24 24" fill="none">
            <path
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
    }
  };

  return (
    <div className="notification-modal-overlay" onClick={onClose}>
      <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`notification-header ${type}`}>
          {getIconByType(type)}
          <h3>{title}</h3>
          <button className="notification-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M6 18L18 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="notification-body">
          <p>{message}</p>
        </div>
        <div className="notification-footer">
          <button className={`notification-btn ${type}`} onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
