

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
      <div className="table-loading-state">
        <div className="loading-content">
          <FaSpinner className="loading-icon" />
          <h3>Đang tải dữ liệu</h3>
          <p>Vui lòng đợi trong giây lát...</p>
        </div>
      </div>
    );
  }

  // Modern Empty State
  if (!users || users.length === 0) {
    return (
      <div className="table-empty-state">
        <div className="empty-content">
          <FaInbox className="empty-icon" />
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
    <div className="modern-table-container">
      <div className="table-header">
        <h3>Danh sách người dùng</h3>
        <span className="table-count">
          {totalUsers > 0 
            ? `Trang ${currentPage} - ${users.length} người dùng (${totalUsers} tổng)`
            : `${users.length} người dùng`
          }
        </span>
      </div>

      <div className="table-scroll">
        <table className="modern-table">
          <thead>
            <tr>
              <th className="col-id">ID</th>
              <th className="col-email">Email</th>
              <th className="col-phone">Số điện thoại</th>
              <th className="col-role">Vai trò</th>
              <th className="col-status">Trạng thái</th>
              <th className="col-email-action">Gửi email</th>
              <th className="col-actions">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user.id}
                className={`table-row ${index % 2 === 0 ? "even" : "odd"}`}
              >
                <td className="col-id">
                  <span className="user-id">{user.id}</span>
                </td>

              
                <td className="col-email">
                  <span className="user-email">{user.email}</span>
                </td>

                <td className="col-phone">
                  <span className="user-phone">{user.phoneNumber}</span>
                </td>

                <td className="col-role">
                  <span className={`role-badge ${user.role?.toLowerCase()}`}>
                    {getRoleDisplayName(user.role)}
                  </span>
                </td>

                <td className="col-status">
                  <button
                    className={`status-toggle ${
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
                        <FaToggleOn className="toggle-icon" />
                        <span>HOẠT ĐỘNG</span>
                      </>
                    ) : (
                      <>
                        <FaToggleOff className="toggle-icon" />
                        <span>TẠM NGƯNG</span>
                      </>
                    )}
                  </button>
                </td>

                <td className="col-email-action">
                  <button
                    className={`email-btn ${
                      sentEmailUsers.includes(user.id) ? "sent" : ""
                    }`}
                    onClick={() => {
                      if (onSendEmail) {
                        onSendEmail(user);
                        setSentEmailUsers(prev => [...prev, user.id]);
                      }
                    }}
                    disabled={
                      isSendingEmail && sendingUserId === user.id ||
                      sentEmailUsers.includes(user.id)
                    }
                    title={
                      sentEmailUsers.includes(user.id)
                        ? "Đã gửi email thành công"
                        : "Gửi thông tin tài khoản qua email"
                    }
                  >
                    {isSendingEmail && sendingUserId === user.id ? (
                      <FaSpinner className="spin-icon" />
                    ) : sentEmailUsers.includes(user.id) ? (
                      <FaCheck className="check-icon" />
                    ) : (
                      <FaEnvelope className="envelope-icon" />
                    )}
                  </button>
                </td>

                <td className="col-actions">
                  <div className="action-buttons">
                    <button
                      className="action-btn view"
                      onClick={() => onView(user)}
                      title="Xem chi tiết"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="action-btn edit"
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
