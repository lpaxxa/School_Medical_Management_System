import React, { useState } from "react";
import {
  FaHeartbeat,
  FaCalendarAlt,
  FaFileAlt,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaPlusCircle,
  FaStethoscope,
} from "react-icons/fa";
import healthCampaignService from "../../../../services/APIAdmin/healthCampaignService";
import "./CreateHealthCampaign.css";

const CreateHealthCampaign = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form data với giá trị mặc định
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    status: "PREPARING",
    notes: "",
  });

  // Validate form
  const validateForm = () => {
    if (!formData.title.trim()) {
      setErrorMessage("Vui lòng nhập tiêu đề chiến dịch");
      return false;
    }
    if (!formData.startDate) {
      setErrorMessage("Vui lòng chọn ngày bắt đầu");
      return false;
    }
    if (!formData.notes.trim()) {
      setErrorMessage("Vui lòng nhập ghi chú");
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
      console.log("🚀 Tạo chiến dịch kiểm tra sức khỏe:", formData);

      const result = await healthCampaignService.createHealthCampaign(formData);

      if (result.success) {
        setShowSuccess(true);
        // Reset form sau khi thành công
        setFormData({
          title: "",
          startDate: "",
          status: "PREPARING",
          notes: "",
        });
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        throw new Error(result.message || "Có lỗi xảy ra khi tạo chiến dịch");
      }
    } catch (err) {
      console.error("❌ Lỗi tạo chiến dịch:", err);
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
  };

  return (
    <div className="create-health-campaign">
      {/* Header */}
      <div className="form-header">
        <div className="header-icon">
          <FaStethoscope />
        </div>
        <div className="header-content">
          <h2>Tạo Chiến Dịch Kiểm Tra Sức Khỏe Mới</h2>
          <p>Lập kế hoạch kiểm tra sức khỏe định kỳ cho học sinh</p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="notification success">
          <FaCheck className="notification-icon" />
          <div className="notification-content">
            <h4>Thành công!</h4>
            <p>Chiến dịch kiểm tra sức khỏe đã được tạo thành công</p>
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
      <form onSubmit={handleSubmit} className="campaign-form">
        <div className="form-section">
          <h3>
            <FaHeartbeat className="section-icon" />
            Thông Tin Chiến Dịch
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title">
                <FaHeartbeat className="label-icon" />
                Tiêu Đề Chiến Dịch *
              </label>
              <input
                id="title"
                type="text"
                placeholder="Ví dụ: Khám sức khỏe định kỳ, Phòng chống sốt xuất huyết..."
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="startDate">
                <FaCalendarAlt className="label-icon" />
                Ngày Bắt Đầu *
              </label>
              <input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
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
                <option value="PREPARING">Đang chuẩn bị</option>
                <option value="ONGOING">Đang thực hiện</option>
                <option value="COMPLETED">Đã hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>
            <FaFileAlt className="section-icon" />
            Ghi Chú Chi Tiết
          </h3>

          <div className="form-group full-width">
            <label htmlFor="notes">
              <FaFileAlt className="label-icon" />
              Ghi Chú Chiến Dịch *
            </label>
            <textarea
              id="notes"
              rows="6"
              placeholder="Mô tả chi tiết về chiến dịch, đối tượng tham gia, quy trình thực hiện, lưu ý đặc biệt..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              required
            />
            <small className="helper-text">
              Ghi chú chi tiết giúp các bên liên quan hiểu rõ hơn về chiến dịch
            </small>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <FaSpinner className="spinning" />
                Đang tạo chiến dịch...
              </>
            ) : (
              <>
                <FaPlusCircle />
                Tạo Chiến Dịch
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info Cards */}
      <div className="info-cards">
        <div className="info-card">
          <div className="card-icon">🩺</div>
          <div className="card-content">
            <h4>Quy trình chuẩn</h4>
            <p>
              Tất cả chiến dịch cần tuân thủ quy trình kiểm tra sức khỏe theo
              quy định của Bộ Y tế
            </p>
          </div>
        </div>

        <div className="info-card">
          <div className="card-icon">📅</div>
          <div className="card-content">
            <h4>Lập kế hoạch</h4>
            <p>
              Nên lập kế hoạch trước ít nhất 2 tuần để chuẩn bị đầy đủ nhân lực
              và trang thiết bị
            </p>
          </div>
        </div>

        <div className="info-card">
          <div className="card-icon">👨‍⚕️</div>
          <div className="card-content">
            <h4>Đội ngũ thực hiện</h4>
            <p>
              Bác sĩ, y tá và các chuyên gia y tế cần có đủ chuyên môn và kinh
              nghiệm
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateHealthCampaign;
