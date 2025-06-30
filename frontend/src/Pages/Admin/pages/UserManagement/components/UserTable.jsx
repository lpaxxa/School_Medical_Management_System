import React, { useState } from "react";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaSpinner,
  FaInbox,
  FaPaperPlane,
  FaCheck,
  FaClock,
} from "react-icons/fa";
import "./UserTable.css";

const UserTable = ({
  users,
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
        <span className="table-count">{users.length} người dùng</span>
      </div>

      <div className="table-scroll">
        <table className="modern-table">
          <thead>
            <tr>
              <th className="col-id">ID</th>
              <th className="col-username">Tên đăng nhập</th>
              <th className="col-email">Email</th>
              <th className="col-phone">Số điện thoại</th>
              <th className="col-role">Vai trò</th>
              <th className="col-status">Trạng thái</th>
              <th className="col-email-sent">Email gửi</th>
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

                <td className="col-username">
                  <div className="user-info">
                    <span className="user-name">{user.username}</span>
                  </div>
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
                    onClick={() => onToggleStatus(user.id)}
                    title="Click để thay đổi trạng thái"
                  >
                    {user.isActive ? (
                      <>
                        <FaToggleOn className="toggle-icon" />
                        <span>Hoạt động</span>
                      </>
                    ) : (
                      <>
                        <FaToggleOff className="toggle-icon" />
                        <span>Tạm ngưng</span>
                      </>
                    )}
                  </button>
                </td>

                <td className="col-email-sent">
                  {user.emailSent === null ? (
                    <span className="email-status hidden">-</span>
                  ) : user.emailSent === true ? (
                    <span className="email-status sent">
                      <FaCheck className="status-icon" />
                      Đã gửi
                    </span>
                  ) : (
                    <button
                      className={`email-send-btn ${
                        isSendingEmail && sendingUserId === user.id
                          ? "sending"
                          : ""
                      }`}
                      onClick={() => onSendEmail && onSendEmail(user)}
                      disabled={isSendingEmail && sendingUserId === user.id}
                      title="Gửi email tài khoản"
                    >
                      {isSendingEmail && sendingUserId === user.id ? (
                        <>
                          <FaSpinner className="spin-icon" />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="send-icon" />
                          Gửi email
                        </>
                      )}
                    </button>
                  )}
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

                    <button
                      className="action-btn delete"
                      onClick={() => {
                        if (user.role === "ADMIN") {
                          alert(
                            "⚠️ Không thể xóa tài khoản Admin!\n\nTài khoản Admin được bảo vệ để đảm bảo an toàn hệ thống."
                          );
                          return;
                        }
                        onDelete(user.id);
                      }}
                      title={
                        user.role === "ADMIN"
                          ? "Không thể xóa tài khoản Admin"
                          : `Xóa người dùng ${user.username}`
                      }
                      disabled={user.role === "ADMIN"}
                    >
                      <FaTrash />
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
