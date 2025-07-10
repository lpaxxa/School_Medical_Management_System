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
  FaTrashAlt,
} from "react-icons/fa";
import "./CreateHealthCampaign.css";

const CreateHealthCampaign = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form data với giá trị mặc định
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    notes: "",
    status: "PREPARING",
    specialCheckupItems: [],
  });

  // State cho special checkup items
  const [newCheckupItem, setNewCheckupItem] = useState("");

  // Validate form
  const validateForm = () => {
    if (!formData.title.trim()) {
      setErrorMessage("Vui lòng nhập tiêu đề chiến dịch");
      return false;
    }
    if (!formData.description.trim()) {
      setErrorMessage("Vui lòng nhập mô tả chiến dịch");
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

      // Gọi API tạo mới: http://localhost:8080/api/v1/health-campaigns
      const response = await fetch(
        "http://localhost:8080/api/v1/health-campaigns",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Tạo thành công:", result);
      setShowSuccess(true);

      // Reset form sau khi thành công
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        notes: "",
        status: "PREPARING",
        specialCheckupItems: [],
      });

      setTimeout(() => setShowSuccess(false), 5000);
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

  // Thêm special checkup item
  const addCheckupItem = () => {
    if (
      newCheckupItem.trim() &&
      !formData.specialCheckupItems.includes(newCheckupItem.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        specialCheckupItems: [
          ...prev.specialCheckupItems,
          newCheckupItem.trim(),
        ],
      }));
      setNewCheckupItem("");
    }
  };

  // Xóa special checkup item
  const removeCheckupItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      specialCheckupItems: prev.specialCheckupItems.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // Các mục kiểm tra sẵn có để chọn nhanh
  const predefinedItems = [
    "Khám mắt chuyên sâu",
    "Khám răng miệng",
    "Xét nghiệm máu",
    "Siêu âm tim",
    "Đo loãng xương",
    "Đo chiều cao, cân nặng",
    "Kiểm tra huyết áp",
    "Khám tai mũi họng",
  ];

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
                placeholder="Ví dụ: Khám sức khỏe định kỳ học kỳ I năm 2024-2025"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                <FaFileAlt className="label-icon" />
                Mô Tả Chiến Dịch *
              </label>
              <textarea
                id="description"
                rows="3"
                placeholder="Mô tả ngắn gọn về chiến dịch kiểm tra sức khỏe"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="form-grid">
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
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">
                <FaCalendarAlt className="label-icon" />
                Ngày Kết Thúc
              </label>
              <input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
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
            <FaStethoscope className="section-icon" />
            Các Mục Kiểm Tra Đặc Biệt
          </h3>

          {/* Danh sách mục kiểm tra hiện tại */}
          {formData.specialCheckupItems.length > 0 && (
            <div className="current-items">
              <h4>Các mục kiểm tra đã chọn:</h4>
              <div className="items-list">
                {formData.specialCheckupItems.map((item, index) => (
                  <div key={index} className="item-tag">
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removeCheckupItem(index)}
                      className="remove-item"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thêm mục kiểm tra mới */}
          <div className="add-item-section">
            <div className="form-group">
              <label htmlFor="newCheckupItem">
                <FaPlusCircle className="label-icon" />
                Thêm Mục Kiểm Tra
              </label>
              <div className="input-with-button">
                <input
                  id="newCheckupItem"
                  type="text"
                  placeholder="Nhập tên mục kiểm tra..."
                  value={newCheckupItem}
                  onChange={(e) => setNewCheckupItem(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addCheckupItem())
                  }
                />
                <button
                  type="button"
                  onClick={addCheckupItem}
                  className="add-button"
                  disabled={!newCheckupItem.trim()}
                >
                  <FaPlusCircle />
                </button>
              </div>
            </div>

            {/* Mục kiểm tra gợi ý */}
            <div className="predefined-items">
              <h4>Mục kiểm tra phổ biến:</h4>
              <div className="predefined-list">
                {predefinedItems.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`predefined-item ${
                      formData.specialCheckupItems.includes(item)
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => {
                      if (!formData.specialCheckupItems.includes(item)) {
                        setFormData((prev) => ({
                          ...prev,
                          specialCheckupItems: [
                            ...prev.specialCheckupItems,
                            item,
                          ],
                        }));
                      }
                    }}
                    disabled={formData.specialCheckupItems.includes(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
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
              rows="4"
              placeholder="Ghi chú chi tiết về chiến dịch, đối tượng ưu tiên, quy trình thực hiện..."
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
        <div >
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <FaSpinner className="spin" />
                Đang tạo chiến dịch...
              </>
            ) : (
              <>
                <FaCheck />
                Tạo Chiến Dịch
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateHealthCampaign;
