import React, { useState, useEffect } from "react";

const UserForm = ({ user, onSave, onCancel, isAdding }) => {
  const initialFormData = {
    id: null,
    name: "",
    email: "",
    role: "parent", // Default role
    status: "active", // Default status
    phone: "",
    password: "",
    confirmPassword: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If editing an existing user, populate the form
    if (user) {
      setFormData({
        ...initialFormData,
        ...user,
        password: "", // Don't populate password for security
        confirmPassword: "",
      });
    } else {
      // If adding a new user, reset form
      setFormData(initialFormData);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error on field change
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Họ tên không được để trống";
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Validate phone (optional)
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    // Validate password for new users
    if (isAdding) {
      if (!formData.password) {
        newErrors.password = "Mật khẩu không được để trống";
      } else if (formData.password.length < 6) {
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu không khớp";
      }
    } else {
      // If updating and password provided, validate it
      if (formData.password) {
        if (formData.password.length < 6) {
          newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }

        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Mật khẩu không khớp";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API delay
    setTimeout(() => {
      // Prepare data for saving (remove confirmPassword)
      const userData = { ...formData };
      delete userData.confirmPassword;

      // If updating and no password provided, remove password field
      if (!isAdding && !userData.password) {
        delete userData.password;
      }

      onSave(userData);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="user-form">
      <h3>
        {isAdding ? "Thêm người dùng mới" : "Cập nhật thông tin người dùng"}
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">
              Họ và tên <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập địa chỉ email"
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">Số điện thoại</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
            />
            {errors.phone && (
              <div className="error-message">{errors.phone}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role">
              Vai trò <span className="required">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="admin">Quản trị viên</option>
              <option value="nurse">Y tá</option>
              <option value="parent">Phụ huynh</option>
              <option value="staff">Nhân viên</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Trạng thái</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>

          <div className="form-group">{/* Empty to balance the grid */}</div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="password">
              {isAdding ? "Mật khẩu" : "Mật khẩu mới"}
              {isAdding && <span className="required">*</span>}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={
                isAdding ? "Nhập mật khẩu" : "Nhập mật khẩu mới hoặc để trống"
              }
            />
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              {isAdding ? "Xác nhận mật khẩu" : "Xác nhận mật khẩu mới"}
              {isAdding && <span className="required">*</span>}
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              disabled={!formData.password && !isAdding}
            />
            {errors.confirmPassword && (
              <div className="error-message">{errors.confirmPassword}</div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Hủy
          </button>
          <button type="submit" className="save-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Đang xử lý...
              </>
            ) : (
              <>
                <i className={isAdding ? "fas fa-plus" : "fas fa-save"}></i>
                {isAdding ? " Thêm người dùng" : " Lưu thay đổi"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
