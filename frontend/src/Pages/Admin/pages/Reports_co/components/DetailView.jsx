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
    <div className="detail-view-container">
      {/* Sử dụng component BackButton chung */}
      <BackButton onClick={onBack} />

      {/* Phần header thống kê */}
      <div className="stats-header">
        <div className="stats-card">
          <div className="stats-icon document-icon">
            <FaClipboardList />
          </div>
          <div className="stats-content">
            <div className="stats-number">{data.length}</div>
            <div className="stats-label">Thông báo</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon user-icon">
            <FaUsers />
          </div>
          <div className="stats-content">
            <div className="stats-number">{totalStats.totalRecipients}</div>
            <div className="stats-label">Người nhận</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon accept-icon">
            <FaCheck />
          </div>
          <div className="stats-content">
            <div className="stats-number">{totalStats.accepted}</div>
            <div className="stats-label">Đã chấp nhận</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon pending-icon">
            <FaClock />
          </div>
          <div className="stats-content">
            <div className="stats-number">{totalStats.pending}</div>
            <div className="stats-label">Chờ phản hồi</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon reject-icon">
            <FaReject />
          </div>
          <div className="stats-content">
            <div className="stats-number">{totalStats.rejected}</div>
            <div className="stats-label">Từ chối</div>
          </div>
        </div>
      </div>

      {/* Danh sách thông báo */}
      <div className="notification-container">
        {data.map((notification) => (
          <div key={notification.id} className="notification-item">
            {/* Tiêu đề thông báo */}
            <div className="notification-title">{notification.title}</div>

            {/* Thông tin người gửi và ngày */}
            <div className="notification-info">
              <div className="info-section">
                <span className="info-tag sender">
                  <FaUser /> {notification.senderName}
                </span>
                <span className="info-tag date">
                  <FaCalendarAlt /> {formatDate(notification.createdAt)}
                </span>
                <span className="info-tag type">
                  <FaEnvelope /> {notification.type}
                </span>
              </div>

              {/* Thống kê phản hồi */}
              <div className="response-stats">
                <span className="response-badge accepted">
                  <FaCheck />{" "}
                  {
                    notification.recipients.filter(
                      (r) => r.response === "ACCEPTED"
                    ).length
                  }
                </span>
                <span className="response-badge pending">
                  <FaClock />{" "}
                  {
                    notification.recipients.filter(
                      (r) => r.response === "PENDING"
                    ).length
                  }
                </span>
                <span className="response-badge rejected">
                  <FaReject />{" "}
                  {
                    notification.recipients.filter(
                      (r) => r.response === "REJECTED"
                    ).length
                  }
                </span>
              </div>
            </div>

            {/* Footer với số người nhận và nút xem chi tiết */}
            <div className="notification-footer">
              <span className="recipient-count">
                {notification.recipients.length} người nhận
              </span>
              <button
                className="detail-button"
                onClick={() => onViewDetail(notification)}
              >
                <FaEye /> Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetailView;
