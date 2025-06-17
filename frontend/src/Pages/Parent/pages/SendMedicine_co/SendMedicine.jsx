import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SendMedicine.css";
import { useStudentData } from "../../../../context/StudentDataContext";
import { useAuth } from "../../../../context/AuthContext";
import axios from "axios";
import api from "../../../../services/api";

//http://localhost:8080/api/parent-medication-requests/my-requests
//lịch sử gửi thuốc của phụ huynh

const SendMedicine = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { API_ENDPOINTS } = useAuth();

  // State cho tabs và lịch sử
  const [activeTab, setActiveTab] = useState("form"); // "form" hoặc "history"
  const [medicationHistory, setMedicationHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [selectedStudentFilter, setSelectedStudentFilter] = useState("");

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

  // Fetch lịch sử gửi thuốc khi chuyển tab
  useEffect(() => {
    if (activeTab === "history") {
      fetchMedicationHistory();
    }
  }, [activeTab]);

  // Fetch lịch sử gửi thuốc
  const fetchMedicationHistory = async () => {
    setIsHistoryLoading(true);
    setHistoryError(null);

    try {
      const response = await api.get(
        "/api/parent-medication-requests/my-requests"
      );
      console.log("Medication history:", response.data);
      setMedicationHistory(response.data || []);
    } catch (error) {
      console.error("Error fetching medication history:", error);
      setHistoryError(
        error.response?.data?.message ||
          "Không thể tải lịch sử yêu cầu thuốc. Vui lòng thử lại sau."
      );
      setMedicationHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

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
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", response.data);
      setFormSubmitted(true);

      // Refresh lịch sử yêu cầu thuốc nếu cần
      if (activeTab === "history") {
        fetchMedicationHistory();
      }

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
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Có lỗi xảy ra, vui lòng thử lại sau.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Format date cho việc hiển thị
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Parse timeOfDay từ chuỗi JSON hoặc string
  const parseTimeOfDay = (timeOfDay) => {
    if (!timeOfDay) return [];

    let result = [];
    try {
      if (typeof timeOfDay === "string") {
        // Xử lý chuỗi có thể là "[after_lunch, after_breakfast]"
        if (timeOfDay.startsWith("[") && timeOfDay.endsWith("]")) {
          const cleanedString = timeOfDay
            .replace("[", "")
            .replace("]", "")
            .split(", ");
          result = cleanedString;
        } else {
          try {
            // Thử parse như JSON
            result = JSON.parse(timeOfDay);
          } catch {
            // Nếu không phải JSON, có thể là chuỗi đơn
            result = [timeOfDay];
          }
        }
      } else if (Array.isArray(timeOfDay)) {
        result = timeOfDay;
      }
    } catch (error) {
      console.error("Error parsing timeOfDay:", error);
      result = [];
    }

    return result;
  };

  // Chuyển đổi code thành label cho timeOfDay
  const getTimeOfDayLabel = (code) => {
    const option = timeOptions.find((opt) => opt.value === code);
    return option ? option.label : code;
  };

  // Lấy label trạng thái
  const getStatusLabel = (status) => {
    const statusMap = {
      PENDING_APPROVAL: "Đang chờ duyệt",
      APPROVED: "Đã duyệt",
      REJECTED: "Từ chối",
      COMPLETED: "Đã hoàn thành",
      CANCELLED: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  // Lấy class cho trạng thái
  const getStatusClass = (status) => {
    const statusClasses = {
      PENDING_APPROVAL: "status-pending",
      APPROVED: "status-approved",
      REJECTED: "status-rejected",
      COMPLETED: "status-completed",
      CANCELLED: "status-cancelled",
    };
    return statusClasses[status] || "";
  };

  // Lọc danh sách lịch sử theo học sinh
  const getFilteredHistory = () => {
    if (!selectedStudentFilter) return medicationHistory;

    // Nếu có lọc theo học sinh
    return medicationHistory.filter((item) => {
      const student = students.find(
        (s) => s.id === parseInt(selectedStudentFilter)
      );
      return student && item.studentName === student.name;
    });
  };

  return (
    <div className="send-medicine-container">
      <div className="send-medicine-header">
        <h1>Yêu cầu dùng thuốc cho học sinh</h1>
        <p>
          Phụ huynh có thể gửi yêu cầu cho con uống thuốc tại trường và theo dõi
          trạng thái các yêu cầu đã gửi
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "form" ? "active" : ""}`}
          onClick={() => setActiveTab("form")}
        >
          <i className="fas fa-prescription-bottle-alt"></i> Gửi yêu cầu thuốc
        </button>
        <button
          className={`tab-button ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <i className="fas fa-history"></i> Lịch sử yêu cầu
        </button>
      </div>

      {activeTab === "form" ? (
        // Form gửi thuốc
        formSubmitted ? (
          <div className="success-message">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2>Gửi yêu cầu thành công!</h2>
            <p>
              Yêu cầu của bạn đã được ghi nhận. Nhà trường sẽ liên hệ nếu cần
              thêm thông tin.
            </p>
            <div className="success-actions">
              <button
                className="btn-primary"
                onClick={() => {
                  setFormSubmitted(false);
                }}
              >
                Gửi yêu cầu mới
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setActiveTab("history");
                  fetchMedicationHistory();
                }}
              >
                Xem lịch sử yêu cầu
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
        )
      ) : (
        // Tab lịch sử
        <div className="medication-history-container">
          <div className="history-header">
            <h2>Lịch sử yêu cầu dùng thuốc</h2>

            {students && students.length > 0 && (
              <div className="history-filter">
                <label htmlFor="studentFilter">Lọc theo học sinh:</label>
                <select
                  id="studentFilter"
                  value={selectedStudentFilter}
                  onChange={(e) => setSelectedStudentFilter(e.target.value)}
                >
                  <option value="">Tất cả học sinh</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {historyError && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i> {historyError}
            </div>
          )}

          {isHistoryLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Đang tải lịch sử yêu cầu...</p>
            </div>
          ) : medicationHistory.length === 0 ? (
            <div className="empty-history">
              <i className="fas fa-prescription-bottle-alt"></i>
              <p>Bạn chưa có yêu cầu dùng thuốc nào</p>
              <button
                className="btn-primary"
                onClick={() => setActiveTab("form")}
              >
                Tạo yêu cầu mới
              </button>
            </div>
          ) : (
            <div className="medication-request-list">
              {getFilteredHistory().map((request) => (
                <div className="medication-request-card" key={request.id}>
                  <div className="request-header">
                    <div className="request-title">
                      <h3>{request.medicationName}</h3>
                      <p className="request-student">{request.studentName}</p>
                      <p className="request-date">
                        Ngày yêu cầu: {formatDate(request.submittedAt)}
                      </p>
                    </div>
                    <div
                      className={`request-status ${getStatusClass(
                        request.status
                      )}`}
                    >
                      {getStatusLabel(request.status)}
                    </div>
                  </div>

                  <div className="request-details">
                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="detail-label">Liều lượng:</span>
                        <span className="detail-value">
                          {request.dosageInstructions}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Tần suất:</span>
                        <span className="detail-value">
                          {request.frequencyPerDay} lần/ngày
                        </span>
                      </div>
                    </div>

                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="detail-label">Thời gian sử dụng:</span>
                        <span className="detail-value">
                          {formatDate(request.startDate)} -{" "}
                          {formatDate(request.endDate)}
                        </span>
                      </div>
                    </div>

                    <div className="detail-item full-width">
                      <span className="detail-label">Thời điểm uống:</span>
                      <div className="time-tags">
                        {parseTimeOfDay(request.timeOfDay).map(
                          (time, index) => (
                            <span className="time-tag" key={index}>
                              {getTimeOfDayLabel(time)}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {request.specialInstructions && (
                      <div className="detail-item full-width">
                        <span className="detail-label">
                          Hướng dẫn đặc biệt:
                        </span>
                        <span className="detail-value">
                          {request.specialInstructions}
                        </span>
                      </div>
                    )}

                    {request.status === "REJECTED" &&
                      request.rejectionReason && (
                        <div className="rejection-reason">
                          <span className="detail-label">Lý do từ chối:</span>
                          <span className="detail-value">
                            {request.rejectionReason}
                          </span>
                        </div>
                      )}
                  </div>

                  {request.approvedBy && (
                    <div className="request-footer">
                      <div className="approval-info">
                        <span>
                          <i className="fas fa-user-nurse"></i> Duyệt bởi:{" "}
                          {request.approvedBy}
                        </span>
                        {request.responseDate && (
                          <span>
                            <i className="far fa-clock"></i> Ngày phản hồi:{" "}
                            {formatTimestamp(request.responseDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SendMedicine;