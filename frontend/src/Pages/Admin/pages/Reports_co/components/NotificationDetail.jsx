import React, { useState } from "react";
import "./NotificationDetail.css";
import {
  FaUser,
  FaCalendarAlt,
  FaEnvelope,
  FaCheck,
  FaClock,
  FaTimes as FaReject,
  FaTimes,
  FaUsers,
  FaIdCard,
  FaCommentAlt,
  FaFilter,
} from "react-icons/fa";
import BackButton from "./BackButton"; // Import BackButton
import { formatDateTimeLocale } from "../../../utils/dateUtils"; // Import date utility

const NotificationDetail = ({ notification, onBack }) => {
  // Thêm state để quản lý filter
  const [activeFilter, setActiveFilter] = useState(null);

  if (!notification) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="reports-notification-status-badge reports-notification-accepted">
            <FaCheck /> Đã chấp nhận
          </span>
        );
      case "PENDING":
        return (
          <span className="reports-notification-status-badge reports-notification-pending">
            <FaClock /> Chờ phản hồi
          </span>
        );
      case "REJECTED":
        return (
          <span className="reports-notification-status-badge reports-notification-rejected">
            <FaReject /> Từ chối
          </span>
        );
      case "NOT_APPLICABLE":
        return (
          <span className="reports-notification-status-badge reports-notification-not-applicable">
            <FaTimes /> Không áp dụng
          </span>
        );
      default:
        return (
          <span className="reports-notification-status-badge reports-notification-unknown">
            <FaClock /> {status || "Chưa xác định"}
          </span>
        );
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

  const notApplicableCount = notification.recipients.filter(
    (r) => r.response === "NOT_APPLICABLE"
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
    <div className="reports-notification-detail">
      <div className="reports-notification-detail-header">
        {/* Sử dụng component BackButton chung */}
        <BackButton onClick={onBack} text="Quay lại danh sách" />
        <h2 className="reports-notification-detail-title">
          {notification.title}
        </h2>
        <div className="reports-notification-detail-meta">
          <div className="reports-notification-detail-meta-item">
            <FaUser className="reports-notification-icon" />
            <span>Người gửi: {notification.senderName}</span>
          </div>
          <div className="reports-notification-detail-meta-item">
            <FaCalendarAlt className="reports-notification-icon" />
            <span>
              Ngày tạo: {formatDateTimeLocale(notification.createdAt)}
            </span>
          </div>
          <div className="reports-notification-detail-meta-item">
            <FaEnvelope className="reports-notification-icon" />
            <span>Loại thông báo: {notification.type}</span>
          </div>
        </div>

        <div className="reports-notification-message">
          <h3>
            <FaCommentAlt style={{ marginRight: "8px" }} />
            Nội dung thông báo
          </h3>
          <p className="reports-notification-message-content">
            {notification.message}
          </p>
        </div>

        <div className="reports-notification-detail-header-actions">
          <div className="reports-notification-filter-label">
            <FaFilter /> Lọc theo trạng thái:
          </div>
          <div className="reports-notification-summary">
            <div className="reports-notification-summary-item">
              <span
                className={`reports-notification-summary-stat reports-notification-accepted ${
                  activeFilter === "ACCEPTED" ? "active" : ""
                }`}
                onClick={() => handleFilterClick("ACCEPTED")}
              >
                <FaCheck /> Đã chấp nhận: {acceptedCount}
              </span>
            </div>
            <div className="reports-notification-summary-item">
              <span
                className={`reports-notification-summary-stat reports-notification-pending ${
                  activeFilter === "PENDING" ? "active" : ""
                }`}
                onClick={() => handleFilterClick("PENDING")}
              >
                <FaClock /> Chờ phản hồi: {pendingCount}
              </span>
            </div>
            <div className="reports-notification-summary-item">
              <span
                className={`reports-notification-summary-stat reports-notification-rejected ${
                  activeFilter === "REJECTED" ? "active" : ""
                }`}
                onClick={() => handleFilterClick("REJECTED")}
              >
                <FaReject /> Từ chối: {rejectedCount}
              </span>
            </div>
            <div className="reports-notification-summary-item">
              <span
                className={`reports-notification-summary-stat reports-notification-not-applicable ${
                  activeFilter === "NOT_APPLICABLE" ? "active" : ""
                }`}
                onClick={() => handleFilterClick("NOT_APPLICABLE")}
              >
                <FaTimes /> Không áp dụng: {notApplicableCount}
              </span>
            </div>
            {activeFilter && (
              <div className="reports-notification-summary-item">
                <span
                  className="reports-notification-summary-stat reports-notification-clear-filter"
                  onClick={() => setActiveFilter(null)}
                >
                  Xem tất cả
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="reports-notification-detail-content">
        <div className="reports-notification-recipient-list">
          <h3 className="reports-notification-recipient-list-title">
            <FaUsers className="reports-notification-icon" />
            {activeFilter ? (
              <span>
                Danh sách người nhận ({filteredRecipients.length}/
                {notification.recipients.length})
                {activeFilter === "ACCEPTED" && " - Đã chấp nhận"}
                {activeFilter === "PENDING" && " - Chờ phản hồi"}
                {activeFilter === "REJECTED" && " - Từ chối"}
                {activeFilter === "NOT_APPLICABLE" && " - Không áp dụng"}
              </span>
            ) : (
              <span>
                Danh sách người nhận ({notification.recipients.length})
              </span>
            )}
          </h3>

          {/* Chuyển từ grid sang table */}
          <div className="reports-notification-table-container">
            <table className="reports-notification-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên người nhận</th>
                  <th>Tên học sinh</th>
                  <th>Mã học sinh</th>
                  <th>Trạng thái</th>
                  <th>Ngày phản hồi</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecipients.map((recipient, index) => (
                  <tr
                    key={recipient.id}
                    className="reports-notification-table-row"
                  >
                    <td className="reports-notification-table-stt">
                      {index + 1}
                    </td>
                    <td className="reports-notification-table-receiver">
                      <div className="reports-notification-receiver-info">
                        <FaUser className="reports-notification-table-icon" />
                        <span className="reports-notification-receiver-name">
                          {recipient.receiverName}
                        </span>
                      </div>
                    </td>
                    <td className="reports-notification-table-student">
                      {recipient.studentName}
                    </td>
                    <td className="reports-notification-table-student-id">
                      <span className="reports-notification-student-id-badge">
                        {recipient.studentId}
                      </span>
                    </td>
                    <td className="reports-notification-table-status">
                      {getStatusBadge(recipient.response)}
                    </td>
                    <td className="reports-notification-table-date">
                      {recipient.responseDate ? (
                        <span className="reports-notification-response-date">
                          {formatDateTimeLocale(recipient.responseDate)}
                        </span>
                      ) : (
                        <span className="reports-notification-no-response">
                          Chưa phản hồi
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRecipients.length === 0 && (
            <div className="reports-notification-no-recipients">
              <p>Không có người nhận nào phù hợp với bộ lọc đã chọn</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDetail;
