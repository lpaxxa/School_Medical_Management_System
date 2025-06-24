import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import "./UserModal.css";

const UserModal = ({ mode, user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "parent",
    status: true,
    gender: "Nam",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && (mode === "edit" || mode === "view")) {
      setFormData({
        id: user.id || "",
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "parent",
        status: user.status !== undefined ? user.status : true,
        gender: user.gender || "Nam",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user, mode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Xóa lỗi khi người dùng sửa
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập họ tên";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email không hợp lệ";

    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (!/^[0-9]{10,11}$/.test(formData.phone))
      newErrors.phone = "Số điện thoại không hợp lệ";

    if (mode === "add") {
      if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";
      else if (formData.password.length < 6)
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";

      if (!formData.confirmPassword)
        newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
      else if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Xóa trường confirmPassword khỏi dữ liệu gửi đi
      const { confirmPassword, ...dataToSave } = formData;
      onSave(dataToSave);
    }
  };

  // Tạo tiêu đề modal theo mode
  const modalTitle =
    mode === "add"
      ? "Thêm người dùng mới"
      : mode === "edit"
      ? "Chỉnh sửa người dùng"
      : "Thông tin chi tiết";

  return (
    <div className="modal-overlay">
      <div className="user-modal">
        <div className="modal-header">
          <h2>{modalTitle}</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Họ tên</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={mode === "view"}
              className={errors.name ? "error" : ""}
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={mode === "view"}
              className={errors.email ? "error" : ""}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Số điện thoại</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={mode === "view"}
                className={errors.phone ? "error" : ""}
              />
              {errors.phone && (
                <span className="error-message">{errors.phone}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="gender">Giới tính</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={mode === "view"}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="role">Vai trò</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={mode === "view"}
              >
                <option value="admin">Quản trị viên</option>
                <option value="nurse">Y tá trường</option>
                <option value="parent">Phụ huynh</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Trạng thái</label>
              <div className="status-toggle">
                <input
                  type="checkbox"
                  id="status"
                  name="status"
                  checked={formData.status}
                  onChange={handleChange}
                  disabled={mode === "view"}
                />
                <label htmlFor="status" className="toggle-label">
                  {formData.status ? "Hoạt động" : "Tạm ngưng"}
                </label>
              </div>
            </div>
          </div>

          {/* Hiển thị fields password chỉ khi thêm mới */}
          {mode === "add" && (
            <>
              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "error" : ""}
                />
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "error" : ""}
                />
                {errors.confirmPassword && (
                  <span className="error-message">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
            </>
          )}

          {/* Hiển thị thông tin bổ sung khi xem chi tiết */}
          {mode === "view" && user && (
            <div className="additional-info">
              <div className="info-row">
                <span className="info-label">Ngày tạo:</span>
                <span className="info-value">{user.createdAt}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Lần đăng nhập cuối:</span>
                <span className="info-value">{user.lastLogin}</span>
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              {mode === "view" ? "Đóng" : "Hủy"}
            </button>

            {mode !== "view" && (
              <button type="submit" className="btn-save">
                {mode === "add" ? "Thêm người dùng" : "Lưu thay đổi"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
