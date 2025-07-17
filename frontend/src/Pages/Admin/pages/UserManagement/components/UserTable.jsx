import React, { useState } from "react";
import {
  FaEye,
  FaEdit,
  FaToggleOn,
  FaToggleOff,
  FaSpinner,
  FaInbox,
  FaCheck,
  FaEnvelope,
} from "react-icons/fa";
import "./UserTable.css";

const UserTable = ({
  users,
  totalUsers,
  currentPage,
  itemsPerPage,
  startIndex,
  endIndex,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onSendEmail,
  getRoleDisplayName,
  isSendingEmail = false,
  sendingUserId = null,
}) => {
  const [sentEmailUsers, setSentEmailUsers] = useState([]);
  // Modern Loading State
  if (isLoading) {
    return (
      <div className="admin-table-loading-state">
        <div className="admin-loading-content">
          <FaSpinner className="admin-loading-icon" />
          <h3>Đang tải dữ liệu</h3>
          <p>Vui lòng đợi trong giây lát...</p>
        </div>
      </div>
    );
  }

  // Modern Empty State
  if (!users || users.length === 0) {
    return (
      <div className="admin-table-empty-state">
        <div className="admin-empty-content">
          <FaInbox className="admin-empty-icon" />
          <h3>Không có dữ liệu</h3>
          <p>
            Hiện tại chưa có người dùng nào trong hệ thống hoặc không có kết quả
            phù hợp với tìm kiếm của bạn.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-modern-table-container">
      <div className="admin-table-header">
        <h3>Danh sách người dùng</h3>
        <span className="admin-table-count">
          {totalUsers > 0
            ? `Trang ${currentPage} - ${users.length} người dùng (${totalUsers} tổng)`
            : `${users.length} người dùng`}
        </span>
      </div>

      <div className="admin-table-scroll">
        <table className="admin-modern-table">
          <thead>
            <tr>
              <th className="admin-col-id">ID</th>
              <th className="admin-col-email">Email</th>
              <th className="admin-col-phone">Số điện thoại</th>
              <th className="admin-col-role">Vai trò</th>
              <th className="admin-col-status">Trạng thái</th>
              <th className="admin-col-email-action">Gửi email</th>
              <th className="admin-col-actions">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user.id}
                className={`admin-table-row ${
                  index % 2 === 0 ? "even" : "odd"
                }`}
              >
                <td className="admin-col-id">
                  <span className="admin-user-id">{user.id}</span>
                </td>

                <td className="admin-col-email">
                  <span className="admin-user-email">{user.email}</span>
                </td>

                <td className="admin-col-phone">
                  <span className="admin-user-phone">{user.phoneNumber}</span>
                </td>

                <td className="admin-col-role">
                  <span
                    className={`admin-role-badge ${user.role?.toLowerCase()}`}
                  >
                    {getRoleDisplayName(user.role)}
                  </span>
                </td>

                <td className="admin-col-status">
                  <button
                    className={`admin-status-toggle ${
                      user.isActive ? "active" : "inactive"
                    }`}
                    onClick={() => {
                      console.log(
                        `Toggle status button clicked for user ID: ${user.id}`
                      );
                      onToggleStatus(user.id);
                    }}
                    title={
                      user.isActive
                        ? "Nhấn để vô hiệu hóa tài khoản"
                        : "Nhấn để kích hoạt tài khoản"
                    }
                  >
                    {user.isActive ? (
                      <>
                        <FaToggleOn className="admin-toggle-icon" />
                        <span>HOẠT ĐỘNG</span>
                      </>
                    ) : (
                      <>
                        <FaToggleOff className="admin-toggle-icon" />
                        <span>TẠM NGƯNG</span>
                      </>
                    )}
                  </button>
                </td>

                <td className="admin-col-email-action">
                  <button
                    className={`admin-email-btn ${
                      sentEmailUsers.includes(user.id) ? "sent" : ""
                    }`}
                    onClick={() => {
                      if (onSendEmail) {
                        onSendEmail(user);
                        setSentEmailUsers((prev) => [...prev, user.id]);
                      }
                    }}
                    disabled={
                      (isSendingEmail && sendingUserId === user.id) ||
                      sentEmailUsers.includes(user.id)
                    }
                    title={
                      sentEmailUsers.includes(user.id)
                        ? "Đã gửi email thành công"
                        : "Gửi thông tin tài khoản qua email"
                    }
                  >
                    {isSendingEmail && sendingUserId === user.id ? (
                      <FaSpinner className="admin-spin-icon" />
                    ) : sentEmailUsers.includes(user.id) ? (
                      <FaCheck className="admin-check-icon" />
                    ) : (
                      <FaEnvelope className="admin-envelope-icon" />
                    )}
                  </button>
                </td>

                <td className="admin-col-actions">
                  <div className="admin-action-buttons">
                    <button
                      className="admin-action-btn view"
                      onClick={() => onView(user)}
                      title="Xem chi tiết"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="admin-action-btn edit"
                      onClick={() => onEdit(user)}
                      title="Chỉnh sửa"
                    >
                      <FaEdit />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
