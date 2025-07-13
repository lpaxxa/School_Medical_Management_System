import React from "react";
import "./DetailView.css";
import {
  FaUser,
  FaCalendarAlt,
  FaEnvelope,
  FaCheck,
  FaClock,
  FaTimes as FaReject,
  FaUsers,
  FaClipboardList,
  FaEye,
} from "react-icons/fa";
import BackButton from "./BackButton"; // Import BackButton

const DetailView = ({ data, reportType, isLoading, onViewDetail, onBack }) => {
  // Thêm prop onBack
  if (isLoading) {
    return (
      <div className="detail-view">
        <div className="detail-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải chi tiết dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="detail-view">
        <div className="no-data">
          <i className="fas fa-inbox"></i>
          <p>Không có dữ liệu chi tiết</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Tính tổng thống kê
  const totalStats = data.reduce(
    (acc, notification) => {
      acc.totalRecipients += notification.recipients.length;
      notification.recipients.forEach((recipient) => {
        switch (recipient.response) {
          case "ACCEPTED":
            acc.accepted++;
            break;
          case "PENDING":
            acc.pending++;
            break;
          case "REJECTED":
            acc.rejected++;
            break;
          default:
            break;
        }
      });
      return acc;
    },
    { totalRecipients: 0, accepted: 0, pending: 0, rejected: 0 }
  );

  return (
    <div className="reports-detail-view-container">
      <BackButton onClick={onBack} />

      {/* Stats Header */}
      <div className="reports-detail-stats-header">
        <div className="reports-detail-stats-card">
          <div className="reports-detail-stats-icon reports-detail-document-icon">
            <FaClipboardList />
          </div>
          <div className="reports-detail-stats-content">
            <div className="reports-detail-stats-number">{data.length}</div>
            <div className="reports-detail-stats-label">Thông báo</div>
          </div>
        </div>

        <div className="reports-detail-stats-card">
          <div className="reports-detail-stats-icon reports-detail-user-icon">
            <FaUsers />
          </div>
          <div className="reports-detail-stats-content">
            <div className="reports-detail-stats-number">
              {totalStats.totalRecipients}
            </div>
            <div className="reports-detail-stats-label">Người nhận</div>
          </div>
        </div>

        <div className="reports-detail-stats-card">
          <div className="reports-detail-stats-icon reports-detail-accept-icon">
            <FaCheck />
          </div>
          <div className="reports-detail-stats-content">
            <div className="reports-detail-stats-number">
              {totalStats.accepted}
            </div>
            <div className="reports-detail-stats-label">Đã chấp nhận</div>
          </div>
        </div>

        <div className="reports-detail-stats-card">
          <div className="reports-detail-stats-icon reports-detail-pending-icon">
            <FaClock />
          </div>
          <div className="reports-detail-stats-content">
            <div className="reports-detail-stats-number">
              {totalStats.pending}
            </div>
            <div className="reports-detail-stats-label">Chờ phản hồi</div>
          </div>
        </div>

        <div className="reports-detail-stats-card">
          <div className="reports-detail-stats-icon reports-detail-reject-icon">
            <FaReject />
          </div>
          <div className="reports-detail-stats-content">
            <div className="reports-detail-stats-number">
              {totalStats.rejected}
            </div>
            <div className="reports-detail-stats-label">Từ chối</div>
          </div>
        </div>
      </div>

      {/* Notification Table */}
      <div className="reports-detail-notification-container">
        <h3 className="reports-detail-table-title">
          <FaClipboardList /> Danh sách thông báo
        </h3>
        <div className="reports-detail-table-container">
          <table className="reports-detail-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tiêu đề</th>
                <th>Người gửi</th>
                <th>Ngày tạo</th>
                <th>Loại</th>
                <th>Số người nhận</th>
                <th>Đã chấp nhận</th>
                <th>Chờ phản hồi</th>
                <th>Từ chối</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {data.map((notification, index) => {
                const acceptedCount = notification.recipients.filter(
                  (r) => r.response === "ACCEPTED"
                ).length;
                const pendingCount = notification.recipients.filter(
                  (r) => r.response === "PENDING"
                ).length;
                const rejectedCount = notification.recipients.filter(
                  (r) => r.response === "REJECTED"
                ).length;

                return (
                  <tr
                    key={notification.id}
                    className="reports-detail-table-row"
                  >
                    <td className="reports-detail-table-stt">{index + 1}</td>
                    <td className="reports-detail-table-title">
                      <div className="reports-detail-notification-title">
                        {notification.title}
                      </div>
                    </td>
                    <td className="reports-detail-table-sender">
                      <div className="reports-detail-sender-info">
                        <FaUser className="reports-detail-table-icon" />
                        <span>{notification.senderName}</span>
                      </div>
                    </td>
                    <td className="reports-detail-table-date">
                      <div className="reports-detail-date-info">
                        <FaCalendarAlt className="reports-detail-table-icon" />
                        <span>{formatDate(notification.createdAt)}</span>
                      </div>
                    </td>
                    <td className="reports-detail-table-type">
                      <span className="reports-detail-type-badge">
                        {notification.type}
                      </span>
                    </td>
                    <td className="reports-detail-table-recipients">
                      <span className="reports-detail-recipients-count">
                        {notification.recipients.length}
                      </span>
                    </td>
                    <td className="reports-detail-table-accepted">
                      <span className="reports-detail-response-badge reports-detail-accepted">
                        <FaCheck /> {acceptedCount}
                      </span>
                    </td>
                    <td className="reports-detail-table-pending">
                      <span className="reports-detail-response-badge reports-detail-pending">
                        <FaClock /> {pendingCount}
                      </span>
                    </td>
                    <td className="reports-detail-table-rejected">
                      <span className="reports-detail-response-badge reports-detail-rejected">
                        <FaReject /> {rejectedCount}
                      </span>
                    </td>
                    <td className="reports-detail-table-actions">
                      <button
                        className="reports-detail-action-button"
                        onClick={() => onViewDetail(notification)}
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DetailView;
