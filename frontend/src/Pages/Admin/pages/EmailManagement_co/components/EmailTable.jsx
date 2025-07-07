import React from "react";
import "./EmailTable.css";

const EmailTable = ({
  users,
  selectedUsers,
  isLoading,
  isSendingEmail,
  sendingUserId,
  onUserSelect,
  onSelectAll,
  onEditUser,
  onSendEmail,
  onSendBulkEmail,
}) => {
  const handleSelectAll = (isSelected) => {
    onSelectAll(isSelected);
  };

  const handleUserSelect = (userId, isSelected) => {
    onUserSelect(userId, isSelected);
  };

  const allSelected = selectedUsers.length === users.length && users.length > 0;

  const getRoleLabel = (role) => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên";
      case "NURSE":
        return "Y tá";
      case "PARENT":
        return "Phụ huynh";
      default:
        return role;
    }
  };

  const getRoleClass = (role) => {
    switch (role) {
      case "ADMIN":
        return "role-admin";
      case "NURSE":
        return "role-nurse";
      case "PARENT":
        return "role-parent";
      default:
        return "role-default";
    }
  };

  if (isLoading) {
    return (
      <div className="email-table-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="email-table-container">
        <div className="no-data-container">
          <i className="fas fa-inbox"></i>
          <h3>Không có dữ liệu</h3>
          <p>Hiện tại không có người dùng nào cần gửi email tài khoản.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="email-table-container">
      <div className="email-table-header">
        <h3>Danh sách người dùng ({users.length})</h3>
        <div className="bulk-actions">
          <button
            className="btn btn-primary bulk-send-btn"
            onClick={() => onSendBulkEmail("all")}
            disabled={isLoading || isSendingEmail}
          >
            <i className="fas fa-paper-plane"></i>
            {isSendingEmail ? "Đang gửi..." : "Gửi tất cả"}
          </button>
          {selectedUsers.length > 0 && (
            <button
              className="btn btn-secondary bulk-send-selected-btn"
              onClick={() => onSendBulkEmail("selected")}
              disabled={isLoading || isSendingEmail}
            >
              <i className="fas fa-check"></i>
              {isSendingEmail
                ? "Đang gửi..."
                : `Gửi đã chọn (${selectedUsers.length})`}
            </button>
          )}
        </div>
      </div>

      <div className="email-table-wrapper">
        <table className="email-table">
          <thead>
            <tr>
              <th width="50">
                <button
                  className="select-all-btn"
                  onClick={() => handleSelectAll(!allSelected)}
                  title={allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                >
                  {allSelected ? "Bỏ chọn" : "Chọn tất cả"}
                </button>
              </th>
              <th>ID</th>
              <th>Tên đăng nhập</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Email đã gửi</th>
              <th width="200">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className={selectedUsers.includes(user.id) ? "selected" : ""}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) =>
                      handleUserSelect(user.id, e.target.checked)
                    }
                  />
                </td>
                <td>
                  <span className="user-id">{user.id}</span>
                </td>
                <td>
                  <div className="user-info">
                    <span className="username">{user.username}</span>
                  </div>
                </td>
                <td>
                  <span className="email">{user.email}</span>
                </td>
                <td>
                  <span className="phone">{user.phoneNumber}</span>
                </td>
                <td>
                  <span className={`role-badge ${getRoleClass(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td>
                  <span
                    className={`status-badge ${
                      user.isActive ? "active" : "inactive"
                    }`}
                  >
                    {user.isActive ? "Hoạt động" : "Tạm ngưng"}
                  </span>
                </td>
                <td>
                  <span
                    className={`email-status ${
                      user.emailSent ? "sent" : "pending"
                    }`}
                  >
                    {user.emailSent ? (
                      <>
                        <i className="fas fa-check-circle"></i>
                        Đã gửi
                      </>
                    ) : (
                      <>
                        <i className="fas fa-clock"></i>
                        Chưa gửi
                      </>
                    )}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-action btn-edit"
                      onClick={() => onEditUser(user)}
                      title="Chỉnh sửa"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="btn-action btn-send"
                      onClick={() => onSendEmail(user)}
                      disabled={
                        user.emailSent ||
                        (isSendingEmail && sendingUserId === user.id)
                      }
                      title={user.emailSent ? "Đã gửi email" : "Gửi email"}
                    >
                      {isSendingEmail && sendingUserId === user.id ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-paper-plane"></i>
                      )}
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

export default EmailTable;
