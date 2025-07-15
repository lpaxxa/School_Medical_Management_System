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
import ReportHeader from "./ReportHeader";
import { formatDateTimeLocale } from "../../../utils/dateUtils";

const DetailView = ({ data, reportType, isLoading, onViewDetail, onBack }) => {
  // Thêm prop onBack
  if (isLoading) {
    return (
      <div className="reports-detail-view-container">
        <div className="detail-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải chi tiết dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="reports-detail-view-container">
        <div className="no-data">
          <i className="fas fa-inbox"></i>
          <p>Không có dữ liệu chi tiết</p>
        </div>
      </div>
    );
  }

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

  // Determine header content based on report type
  const getHeaderConfig = () => {
    switch (reportType) {
      case "vaccination":
        return {
          title: "Báo cáo tiêm chủng",
          subtitle: "Thống kê chi tiết các chiến dịch tiêm chủng",
          icon: "fas fa-syringe",
          colorTheme: "orange",
        };
      case "checkup":
      default:
        return {
          title: "Báo cáo khám sức khỏe định kỳ",
          subtitle: "Thống kê chi tiết các thông báo khám sức khỏe định kỳ",
          icon: "fas fa-heartbeat",
          colorTheme: "purple",
        };
    }
  };

  const headerConfig = getHeaderConfig();

  return (
    <div className="reports-detail-view-container">
      {/* Header */}
      <ReportHeader
        title={headerConfig.title}
        subtitle={headerConfig.subtitle}
        icon={headerConfig.icon}
        onBack={onBack}
        colorTheme={headerConfig.colorTheme}
      />

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
                        <span>
                          {notification.senderName ||
                            notification.createdBy ||
                            "Y tá trường học"}
                        </span>
                      </div>
                    </td>
                    <td className="reports-detail-table-date">
                      <div className="reports-detail-date-info">
                        <FaCalendarAlt className="reports-detail-table-icon" />
                        <span>
                          {formatDateTimeLocale(notification.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="reports-detail-table-type">
                      <span className="reports-detail-type-badge">
                        {notification.type === "HEALTH_CHECKUP"
                          ? "Khám tổng quát"
                          : notification.type}
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
