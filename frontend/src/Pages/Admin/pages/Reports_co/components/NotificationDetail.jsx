import React, { useState } from "react";
import "./NotificationDetail.css";
import {
  FaUser,
  FaCalendarAlt,
  FaEnvelope,
  FaCheck,
  FaClock,
  FaTimes as FaReject,
  FaUsers,
  FaIdCard,
  FaCommentAlt,
  FaFilter,
} from "react-icons/fa";
import BackButton from "./BackButton"; // Import BackButton

const NotificationDetail = ({ notification, onBack }) => {
  // Thêm state để quản lý filter
  const [activeFilter, setActiveFilter] = useState(null);

  if (!notification) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="status-badge accepted">
            <FaCheck /> Đã chấp nhận
          </span>
        );
      case "PENDING":
        return (
          <span className="status-badge pending">
            <FaClock /> Chờ phản hồi
          </span>
        );
      case "REJECTED":
        return (
          <span className="status-badge rejected">
            <FaReject /> Từ chối
          </span>
        );
      default:
        return status;
    }
  };

  const acceptedCount = notification.recipients.filter(
    (r) => r.response === "ACCEPTED"
  ).length;

  const pendingCount = notification.recipients.filter(
    (r) => r.response === "PENDING"
  ).length;

  const rejectedCount = notification.recipients.filter(
    (r) => r.response === "REJECTED"
  ).length;

  // Lọc danh sách người nhận dựa trên filter đang kích hoạt
  const filteredRecipients = activeFilter
    ? notification.recipients.filter((r) => r.response === activeFilter)
    : notification.recipients;

  // Hàm xử lý khi nhấp vào filter
  const handleFilterClick = (filterType) => {
    // Nếu đang chọn filter này rồi, bỏ chọn
    if (activeFilter === filterType) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filterType);
    }
  };

  return (
    <div className="notification-detail">
      <div className="notification-detail-header">
        {/* Sử dụng component BackButton chung */}
        <BackButton onClick={onBack} text="Quay lại danh sách" />
        <h2 className="notification-detail-title">{notification.title}</h2>
        <div className="notification-detail-meta">
          <div className="notification-detail-meta-item">
            <FaUser className="icon" />
            <span>Người gửi: {notification.senderName}</span>
          </div>
          <div className="notification-detail-meta-item">
            <FaCalendarAlt className="icon" />
            <span>Ngày tạo: {formatDate(notification.createdAt)}</span>
          </div>
          <div className="notification-detail-meta-item">
            <FaEnvelope className="icon" />
            <span>Loại thông báo: {notification.type}</span>
          </div>
        </div>

        <div className="notification-message">
          <h3>
            <FaCommentAlt style={{ marginRight: "8px" }} />
            Nội dung thông báo
          </h3>
          <p className="notification-message-content">{notification.message}</p>
        </div>

        <div className="notification-detail-header-actions">
          <div className="filter-label">
            <FaFilter /> Lọc theo trạng thái:
          </div>
          <div className="notification-summary">
            <div className="notification-summary-item">
              <span
                className={`summary-stat accepted ${
                  activeFilter === "ACCEPTED" ? "active" : ""
                }`}
                onClick={() => handleFilterClick("ACCEPTED")}
              >
                <FaCheck /> Đã chấp nhận: {acceptedCount}
              </span>
            </div>
            <div className="notification-summary-item">
              <span
                className={`summary-stat pending ${
                  activeFilter === "PENDING" ? "active" : ""
                }`}
                onClick={() => handleFilterClick("PENDING")}
              >
                <FaClock /> Chờ phản hồi: {pendingCount}
              </span>
            </div>
            <div className="notification-summary-item">
              <span
                className={`summary-stat rejected ${
                  activeFilter === "REJECTED" ? "active" : ""
                }`}
                onClick={() => handleFilterClick("REJECTED")}
              >
                <FaReject /> Từ chối: {rejectedCount}
              </span>
            </div>
            {activeFilter && (
              <div className="notification-summary-item">
                <span
                  className="summary-stat clear-filter"
                  onClick={() => setActiveFilter(null)}
                >
                  Xem tất cả
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="notification-detail-content">
        <div className="recipient-list">
          <h3 className="recipient-list-title">
            <FaUsers className="icon" />
            {activeFilter ? (
              <span>
                Danh sách người nhận ({filteredRecipients.length}/
                {notification.recipients.length})
                {activeFilter === "ACCEPTED" && " - Đã chấp nhận"}
                {activeFilter === "PENDING" && " - Chờ phản hồi"}
                {activeFilter === "REJECTED" && " - Từ chối"}
              </span>
            ) : (
              <span>
                Danh sách người nhận ({notification.recipients.length})
              </span>
            )}
          </h3>

          <div className="recipients-grid">
            {filteredRecipients.map((recipient) => (
              <div key={recipient.id} className="recipient-card">
                <div className="recipient-info">
                  <div className="recipient-name">{recipient.receiverName}</div>
                  <div className="recipient-details">
                    <span>
                      <FaUser /> {recipient.studentName}
                    </span>
                    <span>
                      <FaIdCard /> {recipient.studentId}
                    </span>
                  </div>
                </div>
                <div className="recipient-status">
                  {getStatusBadge(recipient.response)}
                  {recipient.responseDate && (
                    <span className="status-date">
                      {formatDate(recipient.responseDate)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredRecipients.length === 0 && (
            <div className="no-recipients">
              <p>Không có người nhận nào phù hợp với lọc đã chọn</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDetail;
