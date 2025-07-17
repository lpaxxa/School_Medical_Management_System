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
  FaPaperPlane,
  FaUsers,
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
  onBulkSendEmail, // ✅ NEW: Callback cho bulk email
  getRoleDisplayName,
  isSendingEmail = false,
  sendingUserId = null,
  updatedUserIds = [], // ✅ NEW: Array chứa IDs của users đã được cập nhật
  isSendingBulkEmail = false, // ✅ NEW: Trạng thái đang gửi bulk email
}) => {
  // ✅ PERSISTENT: Load trạng thái email đã gửi từ localStorage
  const [sentEmailUsers, setSentEmailUsers] = useState(() => {
    try {
      const saved = localStorage.getItem("admin_sentEmailUsers");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading sent email users from localStorage:", error);
      return [];
    }
  });

  // ✅ NEW: State cho bulk email selection
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // ✅ PERSISTENT: Lưu trạng thái email đã gửi vào localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem(
        "admin_sentEmailUsers",
        JSON.stringify(sentEmailUsers)
      );
    } catch (error) {
      console.error("Error saving sent email users to localStorage:", error);
    }
  }, [sentEmailUsers]);

  // ✅ NEW: Effect để reset trạng thái email khi user được cập nhật
  React.useEffect(() => {
    if (updatedUserIds.length > 0) {
      setSentEmailUsers((prev) => {
        const filtered = prev.filter(
          (userId) => !updatedUserIds.includes(userId)
        );
        console.log("🔄 Reset email sent status for users:", updatedUserIds);
        console.log("📧 Email sent users before reset:", prev);
        console.log("📧 Email sent users after reset:", filtered);
        return filtered;
      });
    }
  }, [updatedUserIds]);

  // ✅ NEW: Functions cho bulk email selection
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
      setSelectAll(false);
    } else {
      const allUserIds = users.map((user) => user.id);
      setSelectedUsers(allUserIds);
      setSelectAll(true);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        const newSelection = prev.filter((id) => id !== userId);
        setSelectAll(false);
        return newSelection;
      } else {
        const newSelection = [...prev, userId];
        setSelectAll(newSelection.length === users.length);
        return newSelection;
      }
    });
  };

  const handleBulkSendEmail = (type) => {
    if (type === "all") {
      // Gửi email cho tất cả users
      const allUsers = users.filter(
        (user) => !sentEmailUsers.includes(user.id)
      );
      if (allUsers.length > 0 && onBulkSendEmail) {
        onBulkSendEmail(allUsers, "all");
        // Thêm tất cả users vào danh sách đã gửi
        setSentEmailUsers((prev) => [...prev, ...allUsers.map((u) => u.id)]);
      }
    } else if (type === "selected") {
      // Gửi email cho users được chọn
      const selectedUsersData = users.filter(
        (user) =>
          selectedUsers.includes(user.id) && !sentEmailUsers.includes(user.id)
      );
      if (selectedUsersData.length > 0 && onBulkSendEmail) {
        onBulkSendEmail(selectedUsersData, "selected");
        // Thêm selected users vào danh sách đã gửi
        setSentEmailUsers((prev) => [
          ...prev,
          ...selectedUsersData.map((u) => u.id),
        ]);
        // Clear selection
        setSelectedUsers([]);
        setSelectAll(false);
      }
    }
  };

  // ✅ NEW: Reset selection khi users thay đổi
  React.useEffect(() => {
    setSelectedUsers([]);
    setSelectAll(false);
  }, [users]);

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

      {/* ✅ NEW: Bulk Email Actions */}
      <div className="admin-bulk-actions">
        <div className="admin-bulk-selection">
          <span className="admin-selection-info">
            {selectedUsers.length > 0
              ? `Đã chọn ${selectedUsers.length} người dùng`
              : "Chưa chọn người dùng nào"}
          </span>
        </div>

        <div className="admin-bulk-buttons">
          <button
            className="admin-bulk-btn admin-bulk-btn-all"
            onClick={() => handleBulkSendEmail("all")}
            disabled={
              isSendingBulkEmail ||
              users.filter((u) => !sentEmailUsers.includes(u.id)).length === 0
            }
            title="Gửi email cho tất cả người dùng chưa được gửi"
          >
            {isSendingBulkEmail ? (
              <FaSpinner className="admin-spin-icon" />
            ) : (
              <FaUsers />
            )}
            <span>Gửi tất cả</span>
          </button>

          <button
            className="admin-bulk-btn admin-bulk-btn-selected"
            onClick={() => handleBulkSendEmail("selected")}
            disabled={
              isSendingBulkEmail ||
              selectedUsers.length === 0 ||
              selectedUsers.every((id) => sentEmailUsers.includes(id))
            }
            title={
              selectedUsers.length === 0
                ? "Vui lòng chọn ít nhất một người dùng"
                : `Gửi email cho ${selectedUsers.length} người dùng đã chọn`
            }
          >
            {isSendingBulkEmail ? (
              <FaSpinner className="admin-spin-icon" />
            ) : (
              <FaPaperPlane />
            )}
            <span>Gửi đã chọn ({selectedUsers.length})</span>
          </button>
        </div>
      </div>

      <div className="admin-table-scroll">
        <table className="admin-modern-table">
          <thead>
            <tr>
              <th className="admin-col-checkbox">
                <input
                  type="checkbox"
                  className="admin-checkbox-input"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  title={selectAll ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                />
              </th>
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
                } ${selectedUsers.includes(user.id) ? "selected" : ""}`}
              >
                <td className="admin-col-checkbox">
                  <input
                    type="checkbox"
                    className="admin-checkbox-input"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    title={selectedUsers.includes(user.id) ? "Bỏ chọn" : "Chọn"}
                  />
                </td>

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
                        console.log(
                          "📧 Sending email to user:",
                          user.id,
                          user.email
                        );
                        onSendEmail(user);
                        setSentEmailUsers((prev) => {
                          const newList = [...prev, user.id];
                          console.log("📧 Updated sent email users:", newList);
                          return newList;
                        });
                      }
                    }}
                    disabled={
                      (isSendingEmail && sendingUserId === user.id) ||
                      sentEmailUsers.includes(user.id)
                    }
                    title={
                      sentEmailUsers.includes(user.id)
                        ? "Email đã được gửi. Cập nhật thông tin user để có thể gửi lại"
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

// ✅ UTILITY: Functions để quản lý localStorage cho email sent status
export const emailSentStatusUtils = {
  // Clear tất cả trạng thái email đã gửi
  clearAllSentStatus: () => {
    try {
      localStorage.removeItem("admin_sentEmailUsers");
      console.log("🧹 Cleared all sent email status from localStorage");
    } catch (error) {
      console.error("Error clearing sent email status:", error);
    }
  },

  // Clear trạng thái email cho user cụ thể
  clearUserSentStatus: (userId) => {
    try {
      const saved = localStorage.getItem("admin_sentEmailUsers");
      if (saved) {
        const sentUsers = JSON.parse(saved);
        const filtered = sentUsers.filter((id) => id !== userId);
        localStorage.setItem("admin_sentEmailUsers", JSON.stringify(filtered));
        console.log(`🧹 Cleared sent email status for user ${userId}`);
      }
    } catch (error) {
      console.error("Error clearing user sent email status:", error);
    }
  },

  // Lấy danh sách users đã gửi email
  getSentEmailUsers: () => {
    try {
      const saved = localStorage.getItem("admin_sentEmailUsers");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error getting sent email users:", error);
      return [];
    }
  },

  // Kiểm tra user đã được gửi email chưa
  isEmailSent: (userId) => {
    const sentUsers = emailSentStatusUtils.getSentEmailUsers();
    return sentUsers.includes(userId);
  },
};

// ✅ DEVELOPMENT: Expose utils to window for debugging
if (process.env.NODE_ENV === "development") {
  window.emailSentStatusUtils = emailSentStatusUtils;
}

export default UserTable;
