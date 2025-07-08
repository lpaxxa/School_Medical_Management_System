import React, { useState } from "react";
import {
  FaBell,
  FaUsers,
  FaEnvelope,
  FaPaperPlane,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaExclamationTriangle,
  FaBullhorn,
} from "react-icons/fa";
import "./Notifications.css";

const Notifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form data
  const [notificationData, setNotificationData] = useState({
    title: "",
    message: "",
    type: "INFO", // INFO, WARNING, URGENT
    recipients: "ALL", // ALL, PARENTS, NURSES, ADMINS
    sendEmail: true,
    sendSms: false,
    scheduled: false,
    scheduledDate: "",
    scheduledTime: "",
  });

  // Validate form
  const validateForm = () => {
    if (!notificationData.title.trim()) {
      setErrorMessage("Vui lòng nhập tiêu đề thông báo");
      return false;
    }
    if (!notificationData.message.trim()) {
      setErrorMessage("Vui lòng nhập nội dung thông báo");
      return false;
    }
    if (notificationData.scheduled && !notificationData.scheduledDate) {
      setErrorMessage("Vui lòng chọn ngày gửi thông báo");
      return false;
    }
    if (notificationData.scheduled && !notificationData.scheduledTime) {
      setErrorMessage("Vui lòng chọn giờ gửi thông báo");
      return false;
    }
    return true;
  };

  // Handle submit
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
      console.log("🚀 Gửi thông báo:", notificationData);

      // Giả lập API call (thay thế bằng API thực tế)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("✅ Gửi thông báo thành công");
      setShowSuccess(true);

      // Reset form
      setNotificationData({
        title: "",
        message: "",
        type: "INFO",
        recipients: "ALL",
        sendEmail: true,
        sendSms: false,
        scheduled: false,
        scheduledDate: "",
        scheduledTime: "",
      });

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      console.error("❌ Lỗi gửi thông báo:", err);
      setErrorMessage(err.message || "Có lỗi không mong muốn xảy ra");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setNotificationData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Get notification type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case "INFO":
        return <FaInfoCircle className="type-icon info" />;
      case "WARNING":
        return <FaExclamationTriangle className="type-icon warning" />;
      case "URGENT":
        return <FaBullhorn className="type-icon urgent" />;
      default:
        return <FaInfoCircle className="type-icon info" />;
    }
  };

  // Get recipients count (mock data)
  const getRecipientsCount = (recipients) => {
    const counts = {
      ALL: 250,
      PARENTS: 180,
      NURSES: 15,
      ADMINS: 5,
    };
    return counts[recipients] || 0;
  };

  return (
    <div className="notifications-manager">
      {/* Header */}
      <div className="notifications-header">
        <div className="header-icon">
          <FaBell />
        </div>
        <div className="header-content">
          <h2>Gửi Thông Báo</h2>
          <p>Gửi thông báo đến phụ huynh, y tá và quản trị viên</p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="notification-alert success">
          <FaCheck className="alert-icon" />
          <div className="alert-content">
            <h4>Thành công!</h4>
            <p>
              Thông báo đã được gửi thành công đến{" "}
              {getRecipientsCount(notificationData.recipients)} người
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <div className="notification-alert error">
          <FaTimes className="alert-icon" />
          <div className="alert-content">
            <h4>Có lỗi xảy ra!</h4>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="notification-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>
            <FaEnvelope className="section-icon" />
            Thông Tin Thông Báo
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title">
                <FaBell className="label-icon" />
                Tiêu Đề Thông Báo *
              </label>
              <input
                id="title"
                type="text"
                placeholder="Ví dụ: Thông báo lịch kiểm tra sức khỏe định kỳ"
                value={notificationData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">
                {getTypeIcon(notificationData.type)}
                Loại Thông Báo
              </label>
              <select
                id="type"
                value={notificationData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
              >
                <option value="INFO">Thông tin thường</option>
                <option value="WARNING">Cảnh báo</option>
                <option value="URGENT">Khẩn cấp</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="message">
              <FaEnvelope className="label-icon" />
              Nội Dung Thông Báo *
            </label>
            <textarea
              id="message"
              rows="6"
              placeholder="Nhập nội dung chi tiết của thông báo..."
              value={notificationData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              required
            />
            <small className="char-count">
              {notificationData.message.length}/500 ký tự
            </small>
          </div>
        </div>

        {/* Recipients */}
        <div className="form-section">
          <h3>
            <FaUsers className="section-icon" />
            Đối Tượng Nhận Thông Báo
          </h3>

          <div className="recipients-grid">
            <div className="form-group">
              <label htmlFor="recipients">
                <FaUsers className="label-icon" />
                Chọn Đối Tượng
              </label>
              <select
                id="recipients"
                value={notificationData.recipients}
                onChange={(e) =>
                  handleInputChange("recipients", e.target.value)
                }
              >
                <option value="ALL">
                  Tất cả ({getRecipientsCount("ALL")} người)
                </option>
                <option value="PARENTS">
                  Phụ huynh ({getRecipientsCount("PARENTS")} người)
                </option>
                <option value="NURSES">
                  Y tá ({getRecipientsCount("NURSES")} người)
                </option>
                <option value="ADMINS">
                  Quản trị viên ({getRecipientsCount("ADMINS")} người)
                </option>
              </select>
            </div>

            <div className="delivery-methods">
              <h4>Phương thức gửi:</h4>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notificationData.sendEmail}
                    onChange={(e) =>
                      handleInputChange("sendEmail", e.target.checked)
                    }
                  />
                  <span className="checkmark"></span>
                  <FaEnvelope className="method-icon" />
                  Gửi Email
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notificationData.sendSms}
                    onChange={(e) =>
                      handleInputChange("sendSms", e.target.checked)
                    }
                  />
                  <span className="checkmark"></span>
                  <FaPaperPlane className="method-icon" />
                  Gửi SMS
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduling */}
        <div className="form-section">
          <h3>
            <FaPaperPlane className="section-icon" />
            Thời Gian Gửi
          </h3>

          <div className="scheduling-options">
            <label className="radio-label">
              <input
                type="radio"
                name="timing"
                checked={!notificationData.scheduled}
                onChange={() => handleInputChange("scheduled", false)}
              />
              <span className="radio-mark"></span>
              Gửi ngay
            </label>

            <label className="radio-label">
              <input
                type="radio"
                name="timing"
                checked={notificationData.scheduled}
                onChange={() => handleInputChange("scheduled", true)}
              />
              <span className="radio-mark"></span>
              Lên lịch gửi
            </label>
          </div>

          {notificationData.scheduled && (
            <div className="schedule-inputs">
              <div className="form-group">
                <label htmlFor="scheduledDate">Ngày gửi</label>
                <input
                  id="scheduledDate"
                  type="date"
                  value={notificationData.scheduledDate}
                  onChange={(e) =>
                    handleInputChange("scheduledDate", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="scheduledTime">Giờ gửi</label>
                <input
                  id="scheduledTime"
                  type="time"
                  value={notificationData.scheduledTime}
                  onChange={(e) =>
                    handleInputChange("scheduledTime", e.target.value)
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <FaSpinner className="spin" />
                Đang gửi thông báo...
              </>
            ) : (
              <>
                <FaPaperPlane />
                {notificationData.scheduled ? "Lên Lịch Gửi" : "Gửi Ngay"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Notifications;
