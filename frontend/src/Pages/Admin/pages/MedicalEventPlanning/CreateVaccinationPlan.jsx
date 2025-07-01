import React, { useState } from "react";
import {
  FaSyringe,
  FaCalendarAlt,
  FaFileAlt,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaPlusCircle,
  FaHospital,
} from "react-icons/fa";
import vaccinationPlanService from "../../../../services/APIAdmin/vaccinationPlanService";
import "./CreateVaccinationPlan.css";

const CreateVaccinationPlan = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form data với giá trị mặc định
  const [formData, setFormData] = useState({
    vaccineName: "",
    vaccinationDate: "",
    status: "PENDING",
    statusVietnamese: "Chờ thực hiện",
    description: "",
  });

  // Validate form
  const validateForm = () => {
    if (!formData.vaccineName.trim()) {
      setErrorMessage("Vui lòng nhập tên vaccine");
      return false;
    }
    if (!formData.vaccinationDate) {
      setErrorMessage("Vui lòng chọn ngày tiêm");
      return false;
    }
    if (!formData.description.trim()) {
      setErrorMessage("Vui lòng nhập mô tả");
      return false;
    }
    return true;
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    setIsLoading(true);
    setShowSuccess(false);
    setShowError(false);

    try {
      // Tạo data để gửi API
      const planData = {
        ...formData,
        id: Date.now(), // Tạo ID tạm thời
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };

      console.log("🚀 Tạo kế hoạch tiêm chủng:", planData);

      const result = await vaccinationPlanService.createVaccinationPlan(
        planData
      );

      if (result.success) {
        setShowSuccess(true);
        // Reset form sau khi thành công
        setFormData({
          vaccineName: "",
          vaccinationDate: "",
          status: "PENDING",
          statusVietnamese: "Chờ thực hiện",
          description: "",
        });
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        throw new Error(result.message || "Có lỗi xảy ra khi tạo kế hoạch");
      }
    } catch (err) {
      console.error("❌ Lỗi tạo kế hoạch:", err);
      setErrorMessage(err.message || "Có lỗi không mong muốn xảy ra");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý thay đổi input
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto update statusVietnamese when status changes
    if (field === "status") {
      const statusMap = {
        PENDING: "Chờ thực hiện",
        ONGOING: "Đang diễn ra",
        COMPLETED: "Đã hoàn thành",
        CANCELLED: "Đã hủy",
      };
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        statusVietnamese: statusMap[value] || value,
      }));
    }
  };

  return (
    <div className="create-vaccination-plan">
      {/* Header */}
      <div className="form-header">
        <div className="header-icon">
          <FaHospital />
        </div>
        <div className="header-content">
          <h2>Tạo Kế Hoạch Tiêm Chủng Mới</h2>
          <p>Lập kế hoạch tiêm chủng cho học sinh trong trường</p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="notification success">
          <FaCheck className="notification-icon" />
          <div className="notification-content">
            <h4>Thành công!</h4>
            <p>Kế hoạch tiêm chủng đã được tạo thành công</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <div className="notification error">
          <FaTimes className="notification-icon" />
          <div className="notification-content">
            <h4>Có lỗi xảy ra!</h4>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="vaccination-form">
        <div className="form-section">
          <h3>
            <FaSyringe className="section-icon" />
            Thông Tin Vaccine
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="vaccineName">
                <FaSyringe className="label-icon" />
                Tên Vaccine *
              </label>
              <input
                id="vaccineName"
                type="text"
                placeholder="Ví dụ: Covid-19, Hepatitis B, MMR..."
                value={formData.vaccineName}
                onChange={(e) =>
                  handleInputChange("vaccineName", e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="vaccinationDate">
                <FaCalendarAlt className="label-icon" />
                Ngày Thực Hiện *
              </label>
              <input
                id="vaccinationDate"
                type="date"
                value={formData.vaccinationDate}
                onChange={(e) =>
                  handleInputChange("vaccinationDate", e.target.value)
                }
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">
                <FaCheck className="label-icon" />
                Trạng Thái
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
              >
                <option value="PENDING">Chờ thực hiện</option>
                <option value="ONGOING">Đang diễn ra</option>
                <option value="COMPLETED">Đã hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>
            <FaFileAlt className="section-icon" />
            Mô Tả Chi Tiết
          </h3>

          <div className="form-group full-width">
            <label htmlFor="description">
              <FaFileAlt className="label-icon" />
              Mô Tả Kế Hoạch *
            </label>
            <textarea
              id="description"
              rows="6"
              placeholder="Mô tả chi tiết về kế hoạch tiêm chủng, đối tượng, quy trình, lưu ý..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              required
            />
            <small className="helper-text">
              Mô tả chi tiết giúp phụ huynh và học sinh hiểu rõ hơn về kế hoạch
            </small>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <FaSpinner className="spinning" />
                Đang tạo kế hoạch...
              </>
            ) : (
              <>
                <FaPlusCircle />
                Tạo Kế Hoạch
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info Cards */}
      <div className="info-cards">
        <div className="info-card">
          <div className="card-icon">📋</div>
          <div className="card-content">
            <h4>Lưu ý quan trọng</h4>
            <p>
              Kế hoạch tiêm chủng cần được thông báo trước cho phụ huynh ít nhất
              7 ngày
            </p>
          </div>
        </div>

        <div className="info-card">
          <div className="card-icon">⏰</div>
          <div className="card-content">
            <h4>Thời gian thực hiện</h4>
            <p>
              Nên lên kế hoạch vào thời gian không ảnh hưởng đến việc học của
              học sinh
            </p>
          </div>
        </div>

        <div className="info-card">
          <div className="card-icon">👥</div>
          <div className="card-content">
            <h4>Đối tượng tham gia</h4>
            <p>
              Y tá trường, giáo viên chủ nhiệm và đại diện phụ huynh cần phối
              hợp
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVaccinationPlan;
