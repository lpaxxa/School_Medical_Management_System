import React, { useState, useEffect, useCallback } from "react";
import "./EmailManagement.css";
import EmailTable from "./components/EmailTable";
import EditUserModal from "./components/EditUserModal";
import ConfirmModal from "./components/ConfirmModal";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api/v1";

// API service functions
const emailApiService = {
  // Get all users pending email
  getUsersPendingEmail: async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${BASE_URL}/account-members/getAllToSendEmail`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching users pending email:", error);
      throw error;
    }
  },

  // Get user details by ID
  getUserById: async (userId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${BASE_URL}/account-members/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },

  // Update user information
  updateUser: async (userId, userData) => {
    try {
      const token = localStorage.getItem("authToken");
      console.log("Updating user:", userId, "with data:", userData);

      // Thử với PATCH trước
      let response;
      try {
        response = await axios.patch(
          `${BASE_URL}/account-members/update/${userId}`,
          userData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (patchError) {
        console.log("PATCH failed, trying PUT:", patchError.response?.status);
        // Nếu PATCH không hoạt động, thử PUT
        response = await axios.put(
          `${BASE_URL}/account-members/update/${userId}`,
          userData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      console.log("Update response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error headers:", error.response?.headers);
      throw error;
    }
  },

  // Send email to single user
  sendEmailToUser: async (userId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${BASE_URL}/email/sendAccountEmail/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error sending email to user ${userId}:`, error);
      throw error;
    }
  },

  // Send email to multiple users
  sendEmailToMultipleUsers: async (userIds) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${BASE_URL}/email/sendAccountEmail`,
        userIds,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error sending emails to multiple users:", error);
      throw error;
    }
  },
};

const EmailManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendingUserId, setSendingUserId] = useState(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  // Fetch users pending email
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedUsers = await emailApiService.getUsersPendingEmail();
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(
        "Không thể tải dữ liệu người dùng chưa gửi email. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on search and role
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.phoneNumber?.toLowerCase().includes(searchLower)
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);

    // Reset selected users when filters change to avoid selecting users not visible
    setSelectedUsers((prevSelected) =>
      prevSelected.filter((userId) =>
        filtered.some((user) => user.id === userId)
      )
    );
  }, [searchTerm, roleFilter, users]);

  // Handle user selection
  const handleUserSelect = (userId, isSelected) => {
    if (isSelected) {
      setSelectedUsers((prev) => [...prev, userId]);
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    }
  };

  // Handle select all
  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  // Handle edit user
  const handleEditUser = async (user) => {
    try {
      setIsEditingUser(true);
      const detailedUser = await emailApiService.getUserById(user.id);
      setCurrentUser(detailedUser);
      setShowEditModal(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError("Không thể tải thông tin chi tiết người dùng.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsEditingUser(false);
    }
  };

  // Handle update user
  const handleUpdateUser = async (updatedData) => {
    try {
      setIsEditingUser(true);
      console.log(
        "Updating user with ID:",
        currentUser.id,
        "Data:",
        updatedData
      );

      // Tạo payload với tất cả thông tin cần thiết
      const updatePayload = {
        email: updatedData.email,
        password: updatedData.password,
        phoneNumber: updatedData.phoneNumber,
        // Thêm các trường khác nếu cần
        username: currentUser.username,
        role: currentUser.role,
        isActive: currentUser.isActive,
      };

      console.log("Full update payload:", updatePayload);

      await emailApiService.updateUser(currentUser.id, updatePayload);

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === currentUser.id ? { ...user, ...updatedData } : user
        )
      );

      setShowEditModal(false);
      setCurrentUser(null);
      setSuccessMessage("✓ Cập nhật thông tin thành công!");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Error updating user:", error);

      // Hiển thị lỗi chi tiết từ server
      let errorMessage = "Không thể cập nhật thông tin người dùng. ";

      if (error.response?.status === 400) {
        // Nếu server trả về message cụ thể, ưu tiên hiển thị message đó
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response?.data === "string") {
          errorMessage = error.response.data;
        } else {
          errorMessage += "Dữ liệu không hợp lệ.";
        }
      } else if (error.response?.status === 401) {
        errorMessage += "Không có quyền truy cập.";
      } else if (error.response?.status === 404) {
        errorMessage += "Không tìm thấy người dùng.";
      } else if (error.response?.status === 500) {
        errorMessage += "Lỗi máy chủ.";
      } else {
        errorMessage += "Vui lòng thử lại.";
      }

      setError(errorMessage);
      setTimeout(() => setError(null), 8000);
    } finally {
      setIsEditingUser(false);
    }
  };

  // Handle send email to single user
  const handleSendEmailToUser = (user) => {
    setSendingUserId(user.id);
    setConfirmAction({
      type: "single",
      userId: user.id,
      userName: user.username,
      userEmail: user.email,
    });
    setShowConfirmModal(true);
  };

  // Handle send email to selected users or all users
  const handleSendEmailToSelected = (mode = "selected") => {
    let targetUsers, targetCount;

    if (mode === "all") {
      // Gửi tất cả users
      targetUsers = users.map((user) => user.id);
      targetCount = users.length;
    } else {
      // Gửi chỉ selected users
      if (selectedUsers.length === 0) {
        setSuccessMessage("Vui lòng chọn ít nhất một người dùng để gửi email.");
        setTimeout(() => setSuccessMessage(null), 5000);
        return;
      }
      targetUsers = selectedUsers;
      targetCount = selectedUsers.length;
    }

    setConfirmAction({
      type: mode === "all" ? "all" : "multiple",
      userIds: targetUsers,
      count: targetCount,
    });
    setShowConfirmModal(true);
  };

  // Execute email sending
  const executeSendEmail = async () => {
    try {
      setIsSendingEmail(true);
      setShowConfirmModal(false);

      if (confirmAction.type === "single") {
        await emailApiService.sendEmailToUser(confirmAction.userId);

        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === confirmAction.userId
              ? { ...user, emailSent: true }
              : user
          )
        );

        setSuccessMessage(`✓ Gửi email thành công: ${confirmAction.userName}`);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else if (
        confirmAction.type === "multiple" ||
        confirmAction.type === "all"
      ) {
        await emailApiService.sendEmailToMultipleUsers(confirmAction.userIds);

        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            confirmAction.userIds.includes(user.id)
              ? { ...user, emailSent: true }
              : user
          )
        );

        if (confirmAction.type === "multiple") {
          setSelectedUsers([]);
        }

        const message =
          confirmAction.type === "all"
            ? `✓ Gửi thành công ${confirmAction.count} email (tất cả)`
            : `✓ Gửi thành công ${confirmAction.count} email (đã chọn)`;

        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 5000);
      }

      // Không cần refresh data vì đã cập nhật local state
    } catch (error) {
      console.error("Error sending email:", error);
      setError("Có lỗi xảy ra khi gửi email. Vui lòng thử lại.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSendingEmail(false);
      setSendingUserId(null);
      setConfirmAction(null);
    }
  };

  return (
    <div className="email-management">
      <div className="email-management-header">
        <div className="header-title">
          <h1>
            <i className="fas fa-envelope"></i> Quản lý gửi tài khoản
          </h1>
          <p>Gửi thông tin tài khoản qua email cho người dùng mới</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={fetchUsers}
            disabled={isLoading}
          >
            <i className="fas fa-sync-alt"></i> Làm mới
          </button>
        </div>
      </div>

      {/* Error message display */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="email-stats">
        <div className="stat-card">
          <div className="stat-icon pending">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <h3>{users.filter((user) => !user.emailSent).length}</h3>
            <p>Chờ gửi email</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon sent">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <h3>{users.filter((user) => user.emailSent).length}</h3>
            <p>Đã gửi email</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon selected">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="stat-info">
            <h3>{selectedUsers.length}</h3>
            <p>Đã chọn</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="email-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="ADMIN">Quản trị viên</option>
            <option value="NURSE">Y tá</option>
            <option value="PARENT">Phụ huynh</option>
          </select>
        </div>
      </div>

      {/* Success message display - moved above table */}
      {successMessage && (
        <div className="success-message-compact">
          <i className="fas fa-check-circle"></i>
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Users Table */}
      <EmailTable
        users={filteredUsers}
        selectedUsers={selectedUsers}
        isLoading={isLoading}
        isSendingEmail={isSendingEmail}
        sendingUserId={sendingUserId}
        onUserSelect={handleUserSelect}
        onSelectAll={handleSelectAll}
        onEditUser={handleEditUser}
        onSendEmail={handleSendEmailToUser}
        onSendBulkEmail={handleSendEmailToSelected}
      />

      {/* Edit User Modal */}
      {showEditModal && currentUser && (
        <EditUserModal
          user={currentUser}
          onClose={() => {
            setShowEditModal(false);
            setCurrentUser(null);
          }}
          onSave={handleUpdateUser}
          isLoading={isEditingUser}
        />
      )}

      {/* Confirm Modal */}
      {showConfirmModal && confirmAction && (
        <ConfirmModal
          action={confirmAction}
          onConfirm={executeSendEmail}
          onCancel={() => {
            setShowConfirmModal(false);
            setSendingUserId(null);
            setConfirmAction(null);
          }}
        />
      )}
    </div>
  );
};

export default EmailManagement;
