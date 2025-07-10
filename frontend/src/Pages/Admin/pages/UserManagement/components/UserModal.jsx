import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaPlus,
  FaTrash,
  FaUser,
  FaUsers,
  FaUserTie,
} from "react-icons/fa";
import "./UserModal.css";

const UserModal = ({ mode, user, onClose, onSave, getRoleDisplayName }) => {
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    email: "",
    phoneNumber: "",
    role: "PARENT",
    isActive: true,
    password: "",
    confirmPassword: "",
    // Fields cho Phụ huynh
    fullName: "",
    address: "",
    emergencyPhoneNumber: "",
    relationshipType: "Mother",
    occupation: "",
    // Fields cho Y tá
    qualification: "",
    students: [
      {
        fullName: "",
        dateOfBirth: "",
        gender: "Male",
        studentId: "",
        className: "",
        gradeLevel: "",
        schoolYear: "2024-2025",
      },
    ],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && (mode === "edit" || mode === "view")) {
      // Debug logging for admin users
      if (user.role === "ADMIN") {
        console.log("=== ADMIN USER MODAL DEBUG ===");
        console.log("User object received:", user);
        console.log("User fullName:", user.fullName);
        console.log("User username:", user.username);
        console.log("Mode:", mode);
        console.log("=== END ADMIN MODAL DEBUG ===");
      }
      
      setFormData({
        id: user.id || "",
        username: user.username || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        role: user.role || "PARENT",
        isActive: user.isActive !== undefined ? user.isActive : true,
        password: "",
        confirmPassword: "",
        fullName: user.fullName || "",
        address: user.address || "",
        emergencyPhoneNumber: user.emergencyPhoneNumber || "",
        relationshipType: user.relationshipType || "Mother",
        occupation: user.occupation || "",
        qualification: user.qualification || "",
        students: user.students || [],
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

    // Reset students khi chuyển role
    if (name === "role" && value !== "PARENT") {
      setFormData((prev) => ({
        ...prev,
        students: [],
      }));
    }
  };

  // Xử lý thay đổi thông tin sinh viên
  const handleStudentChange = (index, field, value) => {
    const updatedStudents = [...formData.students];
    updatedStudents[index] = {
      ...updatedStudents[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      students: updatedStudents,
    }));

    // Xóa lỗi student nếu có
    if (errors[`student_${index}_${field}`]) {
      setErrors((prev) => ({ ...prev, [`student_${index}_${field}`]: null }));
    }
  };

  // Thêm sinh viên mới
  const addStudent = () => {
    setFormData((prev) => ({
      ...prev,
      students: [
        ...prev.students,
        {
          fullName: "",
          dateOfBirth: "",
          gender: "Male",
          studentId: "",
          className: "",
          gradeLevel: "",
          schoolYear: "2024-2025",
        },
      ],
    }));
  };

  // Xóa sinh viên
  const removeStudent = (index) => {
    if (formData.students.length > 1) {
      setFormData((prev) => ({
        ...prev,
        students: prev.students.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation chung
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email không hợp lệ";

    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
    else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = "Số điện thoại không hợp lệ (10-11 số)";

    // Validation theo role
    if (formData.role === "PARENT") {
      if (!formData.fullName.trim())
        newErrors.fullName = "Vui lòng nhập họ tên đầy đủ";

      if (!formData.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ";

      if (!formData.emergencyPhoneNumber.trim())
        newErrors.emergencyPhoneNumber = "Vui lòng nhập số điện thoại khẩn cấp";
      else if (!/^[0-9]{10,11}$/.test(formData.emergencyPhoneNumber))
        newErrors.emergencyPhoneNumber = "Số điện thoại khẩn cấp không hợp lệ";

      if (!formData.occupation.trim())
        newErrors.occupation = "Vui lòng nhập nghề nghiệp";

      // Password validation cho parent
      if (mode === "add") {
        if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";
        else if (formData.password.length < 5)
          newErrors.password = "Mật khẩu phải có ít nhất 5 ký tự";

        if (!formData.confirmPassword)
          newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
        else if (formData.password !== formData.confirmPassword)
          newErrors.confirmPassword = "Mật khẩu không khớp";
      }

      // Validation sinh viên
      formData.students.forEach((student, index) => {
        if (!student.fullName.trim())
          newErrors[`student_${index}_fullName`] =
            "Vui lòng nhập tên sinh viên";

        if (!student.dateOfBirth)
          newErrors[`student_${index}_dateOfBirth`] = "Vui lòng chọn ngày sinh";

        if (!student.studentId.trim())
          newErrors[`student_${index}_studentId`] =
            "Vui lòng nhập mã sinh viên";

        if (!student.className.trim())
          newErrors[`student_${index}_className`] = "Vui lòng nhập lớp";

        if (!student.gradeLevel.trim())
          newErrors[`student_${index}_gradeLevel`] = "Vui lòng nhập khối";
      });
    } else if (formData.role === "NURSE") {
      if (!formData.fullName.trim())
        newErrors.fullName = "Vui lòng nhập họ tên đầy đủ";

      if (!formData.qualification.trim())
        newErrors.qualification = "Vui lòng nhập trình độ/kinh nghiệm";

      // Password validation cho nurse
      if (mode === "add") {
        if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";
        else if (formData.password.length < 5)
          newErrors.password = "Mật khẩu phải có ít nhất 5 ký tự";

        if (!formData.confirmPassword)
          newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
        else if (formData.password !== formData.confirmPassword)
          newErrors.confirmPassword = "Mật khẩu không khớp";
      }
    } else if (formData.role === "ADMIN") {
      // Admin validation - added specific fields for ADMIN
      if (!formData.fullName.trim())
        newErrors.fullName = "Vui lòng nhập họ tên đầy đủ";

      // Password validation for admin
      if (mode === "add") {
        if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";
        else if (formData.password.length < 5)
          newErrors.password = "Mật khẩu phải có ít nhất 5 ký tự";

        if (!formData.confirmPassword)
          newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
        else if (formData.password !== formData.confirmPassword)
          newErrors.confirmPassword = "Mật khẩu không khớp";
      }
    }

    // Password validation cho edit mode
    if (mode === "edit" && formData.password && formData.password.length < 5) {
      newErrors.password = "Mật khẩu phải có ít nhất 5 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      let dataToSave;

      if (mode === "edit") {
        // Edit mode - format cũ
        dataToSave = {
          id: formData.id,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          username: formData.username,
          role: formData.role,
          isActive: formData.isActive,
        };
      } else {
        // Add mode - format mới theo API
        const { confirmPassword, ...allData } = formData;
        dataToSave = allData;
      }

      console.log("Submitting form data:", dataToSave);
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
      <div className="user-modal user-modal-large">
        <div className="modal-header">
          <h2>{modalTitle}</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Hiển thị ID khi edit hoặc view */}
          {(mode === "edit" || mode === "view") && (
            <div className="form-group">
              <label htmlFor="id">ID</label>
              <input
                type="text"
                id="id"
                name="id"
                value={formData.id}
                disabled
                className="disabled-field"
              />
            </div>
          )}

          {/* Role Selection */}
          <div className="form-group">
            <label htmlFor="role">Vai trò</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={mode === "view" || mode === "edit"}
            >
              <option value="ADMIN">Quản trị viên</option>
              <option value="NURSE">Y tá trường</option>
              <option value="PARENT">Phụ huynh</option>
            </select>
            {mode === "add" && (
              <small className="field-note">
                Chọn vai trò sẽ hiển thị form phù hợp
              </small>
            )}
          </div>

          {/* Common Fields */}
          <div className="form-row">
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
                disabled={mode === "view"}
                className={errors.email ? "error" : ""}
                placeholder="Nhập địa chỉ email"
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">
                Số điện thoại <span className="required">*</span>
              </label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={mode === "view"}
                className={errors.phoneNumber ? "error" : ""}
                placeholder="Nhập số điện thoại"
              />
              {errors.phoneNumber && (
                <span className="error-message">{errors.phoneNumber}</span>
              )}
            </div>
          </div>

          {/* Fields cho Admin */}
          {formData.role === "ADMIN" && (
            <div className="form-section">
              <h3>
                <FaUserTie /> Thông tin Quản trị viên
              </h3>

              <div className="form-group">
                <label htmlFor="fullName">
                  Họ tên đầy đủ <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName || (mode === "view" ? formData.username : "")}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  className={errors.fullName ? "error" : ""}
                  placeholder={mode === "view" ? 
                    (formData.fullName || formData.username || "Chưa có thông tin") : 
                    "Nhập họ tên đầy đủ"
                  }
                />
                {mode === "view" && !formData.fullName && (
                  <small className="field-note">
                    Hiển thị username: {formData.username}
                  </small>
                )}
                {errors.fullName && (
                  <span className="error-message">{errors.fullName}</span>
                )}
              </div>

              {/* Password fields cho Admin */}
              {mode === "add" && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="password">
                      Mật khẩu <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? "error" : ""}
                      placeholder="Nhập mật khẩu"
                    />
                    {errors.password && (
                      <span className="error-message">{errors.password}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      Xác nhận mật khẩu <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={errors.confirmPassword ? "error" : ""}
                      placeholder="Nhập lại mật khẩu"
                    />
                    {errors.confirmPassword && (
                      <span className="error-message">
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fields cho Y tá */}
          {formData.role === "NURSE" && (
            <div className="form-section">
              <h3>
                <FaUser /> Thông tin Y tá
              </h3>

              <div className="form-group">
                <label htmlFor="fullName">
                  Họ tên đầy đủ <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  className={errors.fullName ? "error" : ""}
                  placeholder="Nhập họ tên đầy đủ"
                />
                {errors.fullName && (
                  <span className="error-message">{errors.fullName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="qualification">
                  Trình độ/Kinh nghiệm <span className="required">*</span>
                </label>
                <textarea
                  id="qualification"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  className={errors.qualification ? "error" : ""}
                  placeholder="VD: RN, BSN, 5 years experience"
                  rows="3"
                />
                {errors.qualification && (
                  <span className="error-message">{errors.qualification}</span>
                )}
              </div>

              {/* Password fields cho Nurse */}
              {mode === "add" && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="password">
                      Mật khẩu <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? "error" : ""}
                      placeholder="Nhập mật khẩu"
                    />
                    {errors.password && (
                      <span className="error-message">{errors.password}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      Xác nhận mật khẩu <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={errors.confirmPassword ? "error" : ""}
                      placeholder="Nhập lại mật khẩu"
                    />
                    {errors.confirmPassword && (
                      <span className="error-message">
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fields cho Phụ huynh */}
          {formData.role === "PARENT" && (
            <>
              <div className="form-section">
                <h3>
                  <FaUser /> Thông tin Phụ huynh
                </h3>

                <div className="form-group">
                  <label htmlFor="fullName">
                    Họ tên đầy đủ <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    className={errors.fullName ? "error" : ""}
                    placeholder="Nhập họ tên đầy đủ"
                  />
                  {errors.fullName && (
                    <span className="error-message">{errors.fullName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="address">
                    Địa chỉ <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    className={errors.address ? "error" : ""}
                    placeholder="Nhập địa chỉ đầy đủ"
                  />
                  {errors.address && (
                    <span className="error-message">{errors.address}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="emergencyPhoneNumber">
                      SĐT khẩn cấp <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="emergencyPhoneNumber"
                      name="emergencyPhoneNumber"
                      value={formData.emergencyPhoneNumber}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      className={errors.emergencyPhoneNumber ? "error" : ""}
                      placeholder="Số điện thoại khẩn cấp"
                    />
                    {errors.emergencyPhoneNumber && (
                      <span className="error-message">
                        {errors.emergencyPhoneNumber}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="relationshipType">Mối quan hệ</label>
                    <select
                      id="relationshipType"
                      name="relationshipType"
                      value={formData.relationshipType}
                      onChange={handleChange}
                      disabled={mode === "view"}
                    >
                      <option value="Mother">Mẹ</option>
                      <option value="Father">Bố</option>
                      <option value="Guardian">Người giám hộ</option>
                      <option value="Other">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="occupation">
                    Nghề nghiệp <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    className={errors.occupation ? "error" : ""}
                    placeholder="Nhập nghề nghiệp"
                  />
                  {errors.occupation && (
                    <span className="error-message">{errors.occupation}</span>
                  )}
                </div>

                {/* Password fields cho Parent */}
                {mode === "add" && (
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="password">
                        Mật khẩu <span className="required">*</span>
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={errors.password ? "error" : ""}
                        placeholder="Nhập mật khẩu"
                      />
                      {errors.password && (
                        <span className="error-message">{errors.password}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmPassword">
                        Xác nhận mật khẩu <span className="required">*</span>
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={errors.confirmPassword ? "error" : ""}
                        placeholder="Nhập lại mật khẩu"
                      />
                      {errors.confirmPassword && (
                        <span className="error-message">
                          {errors.confirmPassword}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Students Section */}
              <div className="form-section">
                <div className="section-header">
                  <h3>
                    <FaUsers /> Thông tin Sinh viên
                  </h3>
                  {mode !== "view" && (
                    <button
                      type="button"
                      className="btn-add-student"
                      onClick={addStudent}
                    >
                      <FaPlus /> Thêm sinh viên
                    </button>
                  )}
                </div>

                {formData.students.map((student, index) => (
                  <div key={index} className="student-form">
                    <div className="student-header">
                      <h4>Sinh viên #{index + 1}</h4>
                      {mode !== "view" && formData.students.length > 1 && (
                        <button
                          type="button"
                          className="btn-remove-student"
                          onClick={() => removeStudent(index)}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          Họ tên <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          value={student.fullName}
                          onChange={(e) =>
                            handleStudentChange(
                              index,
                              "fullName",
                              e.target.value
                            )
                          }
                          disabled={mode === "view"}
                          className={
                            errors[`student_${index}_fullName`] ? "error" : ""
                          }
                          placeholder="Tên sinh viên"
                        />
                        {errors[`student_${index}_fullName`] && (
                          <span className="error-message">
                            {errors[`student_${index}_fullName`]}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label>
                          Ngày sinh <span className="required">*</span>
                        </label>
                        <input
                          type="date"
                          value={student.dateOfBirth}
                          onChange={(e) =>
                            handleStudentChange(
                              index,
                              "dateOfBirth",
                              e.target.value
                            )
                          }
                          disabled={mode === "view"}
                          className={
                            errors[`student_${index}_dateOfBirth`]
                              ? "error"
                              : ""
                          }
                        />
                        {errors[`student_${index}_dateOfBirth`] && (
                          <span className="error-message">
                            {errors[`student_${index}_dateOfBirth`]}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Giới tính</label>
                        <select
                          value={student.gender}
                          onChange={(e) =>
                            handleStudentChange(index, "gender", e.target.value)
                          }
                          disabled={mode === "view"}
                        >
                          <option value="Male">Nam</option>
                          <option value="Female">Nữ</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          Mã sinh viên <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          value={student.studentId}
                          onChange={(e) =>
                            handleStudentChange(
                              index,
                              "studentId",
                              e.target.value
                            )
                          }
                          disabled={mode === "view"}
                          className={
                            errors[`student_${index}_studentId`] ? "error" : ""
                          }
                          placeholder="STU2024XXX"
                        />
                        {errors[`student_${index}_studentId`] && (
                          <span className="error-message">
                            {errors[`student_${index}_studentId`]}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label>
                          Lớp <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          value={student.className}
                          onChange={(e) =>
                            handleStudentChange(
                              index,
                              "className",
                              e.target.value
                            )
                          }
                          disabled={mode === "view"}
                          className={
                            errors[`student_${index}_className`] ? "error" : ""
                          }
                          placeholder="5A, 6B..."
                        />
                        {errors[`student_${index}_className`] && (
                          <span className="error-message">
                            {errors[`student_${index}_className`]}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label>
                          Khối <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          value={student.gradeLevel}
                          onChange={(e) =>
                            handleStudentChange(
                              index,
                              "gradeLevel",
                              e.target.value
                            )
                          }
                          disabled={mode === "view"}
                          className={
                            errors[`student_${index}_gradeLevel`] ? "error" : ""
                          }
                          placeholder="Grade 5, Grade 6..."
                        />
                        {errors[`student_${index}_gradeLevel`] && (
                          <span className="error-message">
                            {errors[`student_${index}_gradeLevel`]}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Năm học</label>
                      <input
                        type="text"
                        value={student.schoolYear}
                        onChange={(e) =>
                          handleStudentChange(
                            index,
                            "schoolYear",
                            e.target.value
                          )
                        }
                        disabled={mode === "view"}
                        placeholder="2024-2025"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Username field cho NURSE/ADMIN hoặc trong view mode */}
          {(mode === "view" ||
            (mode === "edit" && formData.role !== "PARENT")) && (
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={mode === "view" || mode === "edit"}
                className={mode === "edit" ? "disabled-field" : ""}
                placeholder="Tên đăng nhập"
              />
              {mode === "edit" && (
                <small className="field-note">
                  Tên đăng nhập không thể thay đổi khi chỉnh sửa
                </small>
              )}
            </div>
          )}

          {/* Status toggle */}
          {(mode === "edit" || mode === "view") && (
            <div className="form-group">
              <label htmlFor="isActive">Trạng thái</label>
              <div className="status-toggle">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  disabled={mode === "view"}
                />
                <label htmlFor="isActive" className="toggle-label">
                  {formData.isActive ? "Hoạt động" : "Tạm ngưng"}
                </label>
              </div>
            </div>
          )}

          {/* Edit mode password */}
          {mode === "edit" && (
            <div className="form-group">
              <label htmlFor="password">
                Mật khẩu mới <span className="optional">(tùy chọn)</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
                placeholder="Để trống nếu không muốn thay đổi mật khẩu"
              />
              <small className="field-note">
                Chỉ nhập mật khẩu mới nếu muốn thay đổi. Để trống sẽ giữ nguyên mật khẩu cũ.
              </small>
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>
          )}

          {/* Hiển thị thông tin bổ sung khi xem chi tiết */}
          {mode === "view" && user && (
            <div className="additional-info">
              <div className="info-section">
                <h4>Thông tin chi tiết</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">ID:</span>
                    <span className="info-value">{user.id}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Vai trò:</span>
                    <span className="info-value">
                      {getRoleDisplayName(user.role)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Trạng thái:</span>
                    <span
                      className={`info-value ${
                        user.isActive ? "active" : "inactive"
                      }`}
                    >
                      {user.isActive ? "Hoạt động" : "Tạm ngưng"}
                    </span>
                  </div>
                </div>
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
