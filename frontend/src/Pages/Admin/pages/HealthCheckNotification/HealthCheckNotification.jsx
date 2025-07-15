import React, { useState } from "react";
import "./HealthCheckNotification.css";

const HealthCheckNotification = () => {
  const [filterStatus, setFilterStatus] = useState("");

  // Sample data
  const notification = {
    creator: "Nguyễn Thị Hoa",
    date: "20/07/08/2025",
    type: "HEALTH_CHECKUP",
    content:
      "Thông báo kiểm tra sức khỏe định kỳ cho tất cả học sinh vào tuần tới.",
  };

  const statusCounts = [
    { label: "Đã chấp nhận", count: 1, color: "success", icon: "✓" },
    { label: "Chờ phản hồi", count: 0, color: "warning", icon: "⏳" },
    { label: "Từ chối", count: 0, color: "error", icon: "✕" },
  ];

  const recipients = [
    {
      id: 1,
      name: "Ngô Thị Nga",
      studentName: "Ngô Văn Ich",
      studentId: "HS009",
      status: "Đã chấp nhận",
      responseDate: "Chưa phản hồi",
    },
  ];

  const reports = [
    {
      id: 1,
      title: "Thông báo kiểm tra sức khỏe",
      creator: "Nguyễn Thị Hoa",
      date: "20/07 08/07/2025",
      type: "HEALTH_CHECKUP",
      recipients: 1,
      accepted: 1,
      pending: 0,
      rejected: 0,
      actions: ["💬"],
    },
  ];

  return (
    <div className="admin_ui_health_check_notification">
      {/* Header */}
      <div className="admin_ui_notification_header">
        <button className="admin_ui_back_btn">← Quay lại</button>
        <h1>Thông báo kiểm tra sức khỏe định kỳ</h1>

        {/* Notification Info */}
        <div className="admin_ui_notification_info">
          <div className="admin_ui_info_item">
            <span className="admin_ui_info_icon">👤</span>
            <span>Người gửi: {notification.creator}</span>
          </div>
          <div className="admin_ui_info_item">
            <span className="admin_ui_info_icon">📅</span>
            <span>Ngày tạo: Invalid Date</span>
          </div>
          <div className="admin_ui_info_item">
            <span className="admin_ui_info_icon">📋</span>
            <span>
              Loại thông báo:{" "}
              {notification.type === "HEALTH_CHECKUP"
                ? "Khám tổng quát"
                : notification.type}
            </span>
          </div>
        </div>

        {/* Notification Content */}
        <div className="admin_ui_notification_content">
          <div className="admin_ui_content_header">
            <span className="admin_ui_content_icon">📢</span>
            <h3>Nội dung thông báo</h3>
          </div>
          <p>{notification.content}</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="admin_ui_filter_section">
        <h3>🔍 Lọc theo trạng thái:</h3>
        <div className="admin_ui_status_filters">
          {statusCounts.map((status, index) => (
            <div
              key={index}
              className={`admin_ui_status_filter admin_ui_status_${status.color}`}
            >
              <div className="admin_ui_status_icon">{status.icon}</div>
              <div className="admin_ui_status_info">
                <div className="admin_ui_status_label">{status.label}</div>
                <div className="admin_ui_status_count">{status.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recipients List */}
      <div className="admin_ui_recipients_section">
        <div className="admin_ui_section_header">
          <span className="admin_ui_section_icon">👥</span>
          <h3>Danh sách người nhận (1)</h3>
        </div>

        <div className="admin_ui_recipients_table_container">
          <table className="admin_ui_recipients_table">
            <thead>
              <tr>
                <th>STT</th>
                <th>TÊN NGƯỜI NHẬN</th>
                <th>TÊN HỌC SINH</th>
                <th>MÃ HỌC SINH</th>
                <th>TRẠNG THÁI</th>
                <th>NGÀY PHẢN HỒI</th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((recipient, index) => (
                <tr key={recipient.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="admin_ui_recipient_info">
                      <span className="admin_ui_recipient_icon">👤</span>
                      {recipient.name}
                    </div>
                  </td>
                  <td>{recipient.studentName}</td>
                  <td>
                    <span className="admin_ui_student_id">
                      {recipient.studentId}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin_ui_status_badge admin_ui_status_${
                        recipient.status === "Đã chấp nhận"
                          ? "accepted"
                          : "pending"
                      }`}
                    >
                      {recipient.status === "Đã chấp nhận"
                        ? "✓ ĐÃ CHẤP NHẬN"
                        : recipient.status}
                    </span>
                  </td>
                  <td>{recipient.responseDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reports List */}
      <div className="admin_ui_reports_section">
        <div className="admin_ui_section_header">
          <span className="admin_ui_section_icon">📊</span>
          <h3>Danh sách thông báo</h3>
        </div>

        <div className="admin_ui_reports_stats">
          <div className="admin_ui_stat_item admin_ui_stat_blue">
            <div className="admin_ui_stat_icon">📋</div>
            <div className="admin_ui_stat_content">
              <div className="admin_ui_stat_number">1</div>
              <div className="admin_ui_stat_label">Thông báo</div>
            </div>
          </div>
          <div className="admin_ui_stat_item admin_ui_stat_gray">
            <div className="admin_ui_stat_icon">👥</div>
            <div className="admin_ui_stat_content">
              <div className="admin_ui_stat_number">1</div>
              <div className="admin_ui_stat_label">Người nhận</div>
            </div>
          </div>
          <div className="admin_ui_stat_item admin_ui_stat_green">
            <div className="admin_ui_stat_icon">✓</div>
            <div className="admin_ui_stat_content">
              <div className="admin_ui_stat_number">1</div>
              <div className="admin_ui_stat_label">Đã chấp nhận</div>
            </div>
          </div>
          <div className="admin_ui_stat_item admin_ui_stat_yellow">
            <div className="admin_ui_stat_icon">⚠️</div>
            <div className="admin_ui_stat_content">
              <div className="admin_ui_stat_number">0</div>
              <div className="admin_ui_stat_label">Chờ phản hồi</div>
            </div>
          </div>
          <div className="admin_ui_stat_item admin_ui_stat_red">
            <div className="admin_ui_stat_icon">✕</div>
            <div className="admin_ui_stat_content">
              <div className="admin_ui_stat_number">0</div>
              <div className="admin_ui_stat_label">Từ chối</div>
            </div>
          </div>
        </div>

        <div className="admin_ui_reports_table_container">
          <table className="admin_ui_reports_table">
            <thead>
              <tr>
                <th>STT</th>
                <th>TIÊU ĐỀ</th>
                <th>NGƯỜI GỬI</th>
                <th>NGÀY TẠO</th>
                <th>LOẠI</th>
                <th>SỐ NGƯỜI NHẬN</th>
                <th>ĐÃ CHẤP NHẬN</th>
                <th>CHỜ PHẢN HỒI</th>
                <th>TỪ CHỐI</th>
                <th>HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr key={report.id}>
                  <td>{index + 1}</td>
                  <td>{report.title}</td>
                  <td>
                    <div className="admin_ui_creator_info">
                      <span className="admin_ui_creator_icon">👤</span>
                      {report.creator}
                    </div>
                  </td>
                  <td>
                    <span className="admin_ui_date_badge">
                      📅 {report.date}
                    </span>
                  </td>
                  <td>
                    <span className="admin_ui_type_badge">
                      {report.type === "HEALTH_CHECKUP"
                        ? "Khám tổng quát"
                        : report.type}
                    </span>
                  </td>
                  <td>{report.recipients}</td>
                  <td>
                    <span className="admin_ui_count_badge admin_ui_count_success">
                      ✓ {report.accepted}
                    </span>
                  </td>
                  <td>
                    <span className="admin_ui_count_badge admin_ui_count_warning">
                      ⏳ {report.pending}
                    </span>
                  </td>
                  <td>
                    <span className="admin_ui_count_badge admin_ui_count_error">
                      ✕ {report.rejected}
                    </span>
                  </td>
                  <td>
                    <button className="admin_ui_action_btn">💬</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HealthCheckNotification;
