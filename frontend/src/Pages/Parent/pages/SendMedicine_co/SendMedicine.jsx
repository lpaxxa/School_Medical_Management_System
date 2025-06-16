import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SendMedicine.css";
import { useStudentData } from "../../../../context/StudentDataContext";
import { useAuth } from "../../../../context/AuthContext";
import axios from "axios";

const SendMedicine = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { API_ENDPOINTS } = useAuth();

  const [formData, setFormData] = useState({
    studentId: "",
    medicineName: "",
    dosage: "",
    frequency: "",
    startDate: "",
    endDate: "",
    timeToTake: [],
    notes: "",
    prescriptionImage: null,
  });

  const [errors, setErrors] = useState({});

  const { students, isLoading: studentsLoading } = useStudentData();

  const timeOptions = [
    { value: "before_breakfast", label: "Trước bữa sáng" },
    { value: "after_breakfast", label: "Sau bữa sáng" },
    { value: "before_lunch", label: "Trước bữa trưa" },
    { value: "after_lunch", label: "Sau bữa trưa" },
    { value: "before_dinner", label: "Trước bữa tối" },
    { value: "after_dinner", label: "Sau bữa tối" },
    { value: "bedtime", label: "Trước khi đi ngủ" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Xóa lỗi khi người dùng nhập
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleTimeChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        timeToTake: [...formData.timeToTake, value],
      });
    } else {
      setFormData({
        ...formData,
        timeToTake: formData.timeToTake.filter((time) => time !== value),
      });
    }

    // Xóa lỗi khi người dùng chọn
    if (errors.timeToTake) {
      setErrors({
        ...errors,
        timeToTake: null,
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          prescriptionImage: "File không được vượt quá 5MB",
        });
        return;
      }

      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setErrors({
          ...errors,
          prescriptionImage: "Chỉ chấp nhận file ảnh (JPEG, PNG, JPG)",
        });
        return;
      }

      setFormData({
        ...formData,
        prescriptionImage: file,
      });

      // Xóa lỗi khi người dùng chọn file hợp lệ
      if (errors.prescriptionImage) {
        setErrors({
          ...errors,
          prescriptionImage: null,
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentId) newErrors.studentId = "Vui lòng chọn học sinh";
    if (!formData.medicineName)
      newErrors.medicineName = "Vui lòng nhập tên thuốc";
    if (!formData.dosage) newErrors.dosage = "Vui lòng nhập liều lượng";
    if (!formData.frequency)
      newErrors.frequency = "Vui lòng nhập tần suất dùng thuốc";
    if (!formData.startDate) newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    if (!formData.endDate) newErrors.endDate = "Vui lòng chọn ngày kết thúc";

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    if (formData.timeToTake.length === 0) {
      newErrors.timeToTake = "Vui lòng chọn thời gian uống thuốc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Get authentication token
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Vui lòng đăng nhập lại");
        return;
      }

      // Prepare data for API
      const requestData = {
        studentId: parseInt(formData.studentId),
        medicineName: formData.medicineName,
        dosage: formData.dosage,
        frequency: formData.frequency,
        startDate: formData.startDate,
        endDate: formData.endDate,
        timeToTake: formData.timeToTake, // Keep as array - DTO expects List<String>
        notes: formData.notes || "",
        // Note: prescriptionImage handling would need multipart form data
      };

      console.log("Dữ liệu gửi đi:", requestData);

      // Call real API
      const response = await axios.post(
        API_ENDPOINTS.parent.submitMedicationRequest,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("API Response:", response.data);
      setFormSubmitted(true);

      // Reset form sau khi gửi thành công
      setFormData({
        studentId: "",
        medicineName: "",
        dosage: "",
        frequency: "",
        startDate: "",
        endDate: "",
        timeToTake: [],
        notes: "",
        prescriptionImage: null,
      });
    } catch (error) {
      console.error("Lỗi khi gửi:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Có lỗi xảy ra, vui lòng thử lại sau.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="send-medicine-container">
      <div className="send-medicine-header">
        <h1>Gửi yêu cầu dùng thuốc</h1>
        <p>
          Phụ huynh vui lòng điền đầy đủ thông tin để nhà trường quản lý việc
          cho con uống thuốc đúng liều lượng và thời gian
        </p>
      </div>

      {formSubmitted ? (
        <div className="success-message">
          <div className="success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h2>Gửi yêu cầu thành công!</h2>
          <p>
            Yêu cầu của bạn đã được ghi nhận. Nhà trường sẽ liên hệ nếu cần thêm
            thông tin.
          </p>
          <div className="success-actions">
            <button
              className="btn-primary"
              onClick={() => setFormSubmitted(false)}
            >
              Gửi yêu cầu mới
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate("/parent")}
            >
              Quay về trang chủ
            </button>
          </div>
        </div>
      ) : (
        <form className="send-medicine-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Thông tin học sinh</h3>
            <div className="form-group">
              <label htmlFor="studentId">Chọn học sinh:</label>
              <select
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                className={errors.studentId ? "error" : ""}
              >
                <option value="">-- Chọn học sinh --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} - Lớp {student.class}
                  </option>
                ))}
              </select>
              {errors.studentId && (
                <span className="error-text">{errors.studentId}</span>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Thông tin thuốc</h3>
            <div className="form-group">
              <label htmlFor="medicineName">Tên thuốc:</label>
              <input
                type="text"
                id="medicineName"
                name="medicineName"
                value={formData.medicineName}
                onChange={handleChange}
                placeholder="Nhập tên thuốc"
                className={errors.medicineName ? "error" : ""}
              />
              {errors.medicineName && (
                <span className="error-text">{errors.medicineName}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dosage">Liều lượng:</label>
                <input
                  type="text"
                  id="dosage"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleChange}
                  placeholder="VD: 1 viên, 5ml, ..."
                  className={errors.dosage ? "error" : ""}
                />
                {errors.dosage && (
                  <span className="error-text">{errors.dosage}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="frequency">Tần suất:</label>
                <input
                  type="text"
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  placeholder="VD: 2 lần/ngày, 8 tiếng/lần, ..."
                  className={errors.frequency ? "error" : ""}
                />
                {errors.frequency && (
                  <span className="error-text">{errors.frequency}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Ngày bắt đầu:</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={errors.startDate ? "error" : ""}
                />
                {errors.startDate && (
                  <span className="error-text">{errors.startDate}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="endDate">Ngày kết thúc:</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={errors.endDate ? "error" : ""}
                />
                {errors.endDate && (
                  <span className="error-text">{errors.endDate}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Thời điểm uống thuốc:</label>
              <div className="checkbox-group">
                {timeOptions.map((option) => (
                  <div className="checkbox-item" key={option.value}>
                    <input
                      type="checkbox"
                      id={option.value}
                      name="timeToTake"
                      value={option.value}
                      checked={formData.timeToTake.includes(option.value)}
                      onChange={handleTimeChange}
                    />
                    <label htmlFor={option.value}>{option.label}</label>
                  </div>
                ))}
              </div>
              {errors.timeToTake && (
                <span className="error-text">{errors.timeToTake}</span>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Thông tin bổ sung</h3>
            <div className="form-group">
              <label htmlFor="prescriptionImage">
                Đính kèm đơn thuốc (nếu có):
              </label>
              <div className="file-input-container">
                <input
                  type="file"
                  id="prescriptionImage"
                  name="prescriptionImage"
                  onChange={handleImageChange}
                  accept="image/jpeg,image/png,image/jpg"
                  className={errors.prescriptionImage ? "error" : ""}
                />
                <label htmlFor="prescriptionImage" className="file-label">
                  <i className="fas fa-upload"></i>
                  {formData.prescriptionImage
                    ? formData.prescriptionImage.name
                    : "Chọn file ảnh"}
                </label>
              </div>
              {errors.prescriptionImage && (
                <span className="error-text">{errors.prescriptionImage}</span>
              )}
              <span className="help-text">
                Chỉ chấp nhận file ảnh (JPEG, PNG, JPG), tối đa 5MB
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Ghi chú:</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Các lưu ý đặc biệt về việc dùng thuốc (nếu có)"
                rows="4"
              ></textarea>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/parent")}
            >
              Hủy bỏ
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Đang gửi...
                </>
              ) : (
                "Gửi yêu cầu"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SendMedicine;
