import React from "react";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import "./UserTable.css";

const UserTable = ({
  users,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  // Xử lý khi không có users
  if (isLoading) {
    return (
      <div className="user-table-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu người dùng...</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="user-table-empty">
        <p>Không tìm thấy người dùng nào</p>
      </div>
    );
  }

  return (
    <div className="user-table-wrapper">
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Giới tính</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td className="user-name">{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.gender}</td>
              <td>
                <span className={`role-badge ${user.role}`}>
                  {user.role === "admin"
                    ? "Quản trị viên"
                    : user.role === "nurse"
                    ? "Y tá trường"
                    : "Phụ huynh"}
                </span>
              </td>
              <td>
                <span
                  className={`status-badge ${
                    user.status ? "active" : "inactive"
                  }`}
                  onClick={() => onToggleStatus(user.id)}
                >
                  {user.status ? (
                    <>
                      <FaToggleOn /> Hoạt động
                    </>
                  ) : (
                    <>
                      <FaToggleOff /> Tạm ngưng
                    </>
                  )}
                </span>
              </td>
              <td>{user.createdAt}</td>
              <td className="actions">
                <button
                  className="btn-action view"
                  onClick={() => onView(user)}
                  title="Xem chi tiết"
                >
                  <FaEye />
                </button>
                <button
                  className="btn-action edit"
                  onClick={() => onEdit(user)}
                  title="Chỉnh sửa"
                >
                  <FaEdit />
                </button>
                <button
                  className="btn-action delete"
                  onClick={() => onDelete(user.id)}
                  title="Xóa"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
