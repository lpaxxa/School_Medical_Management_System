import React, { useState, useEffect } from "react";
import "./EditUserModal.css";

const EditUserModal = ({ user, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        password: user.password || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Tối thiểu 6 ký tự";
    }

    // Phone validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Số điện thoại là bắt buộc";
    } else if (!/^0[0-9]{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "10 chữ số, bắt đầu bằng 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!user) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="edit-user-modal">
        <div className="modal-header">
          <h2>
            <i className="fas fa-user-edit"></i>
            Chỉnh sửa thông tin người dùng
          </h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="user-summary">
            <div className="user-avatar">
              <i className="fas fa-user-circle"></i>
            </div>
            <div className="user-details">
              <h3>{user.username}</h3>
              <p>ID: {user.id}</p>
              <span className={`role-badge ${user.role.toLowerCase()}`}>
                {user.role === "ADMIN"
                  ? "Quản trị viên"
                  : user.role === "NURSE"
                  ? "Y tá"
                  : user.role === "PARENT"
                  ? "Phụ huynh"
                  : user.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i>
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? "error" : ""}
                placeholder="Nhập địa chỉ email"
              />
              <div className="error-container">
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i>
                Mật khẩu *
              </label>
              <input
                type="text"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? "error" : ""}
                placeholder="Nhập mật khẩu mới"
              />
              <div className="error-container">
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">
                <i className="fas fa-phone"></i>
                Số điện thoại *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className={errors.phoneNumber ? "error" : ""}
                placeholder="Nhập số điện thoại"
              />
              <div className="error-container">
                {errors.phoneNumber && (
                  <span className="error-message">{errors.phoneNumber}</span>
                )}
              </div>
            </div>

            <div className="form-note">
              <i className="fas fa-info-circle"></i>
              <p>
                Chỉ có thể chỉnh sửa email, mật khẩu và số điện thoại. Các thông
                tin khác sẽ được giữ nguyên.
              </p>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Đang lưu...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
