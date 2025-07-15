import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import notificationService from "../../../../services/notificationService";
import "./VaccinationDetailModal.css";

const VaccinationDetailModal = ({
  isOpen,
  onClose,
  notificationId,
  parentId,
  onResponseUpdated,
}) => {
  // Utility function to format Java LocalDateTime arrays
  const formatDateTime = (timestamp) => {
    console.log("formatDateTime input:", timestamp);

    if (!timestamp) return "Không có thông tin";

    try {
      let date;

      // Kiểm tra nếu timestamp là mảng Java LocalDateTime
      if (Array.isArray(timestamp)) {
        console.log("Processing array timestamp:", timestamp);

        if (timestamp.length >= 5) {
          const [year, month, day, hour = 0, minute = 0, second = 0] =
            timestamp;
          // Java month là 1-based, JavaScript month là 0-based
          date = new Date(year, month - 1, day, hour, minute, second);
          console.log("Created date from array:", date);
        } else {
          console.log("Array too short:", timestamp.length);
          return "Dữ liệu không hợp lệ";
        }
      } else {
        // Xử lý timestamp dạng string hoặc number
        date = new Date(timestamp);
      }

      if (isNaN(date.getTime())) {
        console.log("Invalid date created:", date);
        return "Thời gian không hợp lệ";
      }

      // Format thành dd/MM/yyyy HH:mm:ss
      const result = date.toLocaleString("vi-VN");

      console.log("formatDateTime result:", result);
      return result;
    } catch (error) {
      console.error("Error in formatDateTime:", error);
      return "Lỗi xử lý thời gian";
    }
  };

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [vaccinationDetail, setVaccinationDetail] = useState(null);

  // Load chi tiết thông báo tiêm chủng khi modal mở
  useEffect(() => {
    if (isOpen && notificationId && parentId) {
      loadVaccinationDetail();
    }
  }, [isOpen, notificationId, parentId]);

  const loadVaccinationDetail = async () => {
    setLoading(true);
    try {
      console.log("Loading vaccination detail:", { notificationId, parentId });

      let response;
      try {
        // Thử gọi API thông qua proxy trước
        response = await notificationService.getNotificationDetail(
          notificationId,
          parentId
        );
      } catch (proxyError) {
        console.error("❌ Lỗi khi gọi qua proxy:", proxyError);
        // Nếu lỗi, thử gọi trực tiếp
        response = await notificationService.direct.getNotificationDetail(
          notificationId,
          parentId
        );
      }

      // Kiểm tra response format
      const apiData = response?.data || response;

      if (apiData && apiData.id) {
        // Transform dữ liệu từ API sang format hiển thị
        const detail = {
          id: apiData.id,
          title: apiData.title || "Thông báo tiêm chủng",
          message: apiData.message || "",
          senderName: apiData.senderName || "Y tá trường học",
          createdAt: apiData.createdAt,
          isRequest:
            apiData.isRequest !== undefined ? apiData.isRequest : false,
          response: apiData.response || null,
          responseAt: apiData.responseAt || null,
          // Extract thông tin vaccine từ title hoặc message
          vaccinationType: extractVaccineType(apiData.title || apiData.message),
          scheduledDate: extractScheduledDate(apiData.message),
          location: extractLocation(apiData.message) || "Phòng y tế trường học",
          studentName: apiData.studentName,
          studentClass: apiData.studentClass,
        };

        setVaccinationDetail(detail);
      } else {
        throw new Error("Dữ liệu không hợp lệ từ API");
      }
    } catch (error) {
      console.error("Error loading vaccination detail:", error);

      // Nếu API thất bại, hiển thị dữ liệu mẫu phù hợp với hình
      const sampleDetail = {
        id: notificationId,
        title: "Thông báo kế hoạch tiêm chủng: okoko22222222222",
        message:
          "Có kế hoạch tiêm chủng mới cho học sinh các lớp 2A1, 2A2, 2B1, 2B2, 2C1, 3A1, 3A2, 3B1, 3B2, 3C1, 3C2, 3D1, 3D2, 3E1, 3E2",
        senderName: "Y tá trường học",
        createdAt: "2025-07-14T11:15:17",
        isRequest: false, // Đây là thông báo thông tin, không phải yêu cầu
        response: null,
        responseAt: null,
        vaccinationType: "Vaccine định kỳ",
        scheduledDate: null,
        location: "Phòng y tế trường học",
        studentName: null,
        studentClass: null,
      };

      setVaccinationDetail(sampleDetail);

      toast.warning("Đang hiển thị dữ liệu mẫu do không thể kết nối máy chủ", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract vaccine type from title
  const extractVaccineType = (title) => {
    if (!title) return "";

    const vaccineTypes = {
      MMR: "MMR (Sởi, Quai bị, Rubella)",
      COVID: "COVID-19",
      Cúm: "Cúm mùa",
      "Thủy đậu": "Thủy đậu",
      DPT: "DPT (Bạch hầu, Ho gà, Uốn ván)",
      "Viêm gan B": "Viêm gan B",
      "Bại liệt": "Bại liệt",
    };

    for (const [key, value] of Object.entries(vaccineTypes)) {
      if (title.includes(key)) {
        return value;
      }
    }

    return "Vaccine định kỳ";
  };

  // Helper function to extract scheduled date from message
  const extractScheduledDate = (message) => {
    if (!message) return null;

    // Tìm pattern ngày tháng trong message (dd/mm/yyyy hoặc dd-mm-yyyy)
    const datePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
    const match = message.match(datePattern);

    if (match) {
      const day = match[1].padStart(2, "0");
      const month = match[2].padStart(2, "0");
      const year = match[3];
      return `${year}-${month}-${day}T08:00:00`;
    }

    return null;
  };

  // Helper function to extract location from message
  const extractLocation = (message) => {
    if (!message) return null;

    // Tìm pattern địa điểm trong message
    const locationPatterns = [
      /Địa điểm:\s*([^\n]+)/i,
      /tại\s+([^\n,]+)/i,
      /Phòng\s+([^\n,]+)/i,
    ];

    for (const pattern of locationPatterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  };

  // Handle vaccination response
  const handleVaccinationResponse = async (response) => {
    if (!vaccinationDetail?.id) {
      toast.error("Không tìm thấy thông tin thông báo");
      return;
    }

    setSubmitting(true);
    try {
      await notificationService.respondToVaccinationNotification(
        vaccinationDetail.id,
        parentId,
        response
      );

      toast.success(
        `Đã ${
          response === "accept" ? "đồng ý" : "từ chối"
        } thông báo tiêm chủng`
      );

      // Cập nhật local state
      setVaccinationDetail((prev) => ({
        ...prev,
        response: response,
        responseAt: new Date().toISOString(),
      }));

      // Callback để update parent component
      if (onResponseUpdated) {
        onResponseUpdated();
      }
    } catch (error) {
      console.error("Error responding to vaccination:", error);
      toast.error("Có lỗi xảy ra khi gửi phản hồi");
    } finally {
      setSubmitting(false);
    }
  };

  // Render response buttons
  const renderResponseButtons = () => {
    if (!vaccinationDetail?.isRequest) {
      return null;
    }

    // Nếu đã có phản hồi, hiển thị trạng thái
    if (vaccinationDetail.response) {
      return (
        <div className="modaldetailofnotivaccine-response-status">
          <div
            className={`modaldetailofnotivaccine-response-badge modaldetailofnotivaccine-response-badge--${vaccinationDetail.response}`}
          >
            <i
              className={`fas ${
                vaccinationDetail.response === "accept"
                  ? "fa-check"
                  : "fa-times"
              }`}
            ></i>
            <span>
              Đã{" "}
              {vaccinationDetail.response === "accept" ? "đồng ý" : "từ chối"}
            </span>
          </div>
          {vaccinationDetail.responseAt && (
            <p className="modaldetailofnotivaccine-response-time">
              Phản hồi lúc: {formatDateTime(vaccinationDetail.responseAt)}
            </p>
          )}
        </div>
      );
    }

    // Nếu chưa có phản hồi, hiển thị buttons
    return (
      <div className="modaldetailofnotivaccine-response-buttons">
        <button
          className="modaldetailofnotivaccine-btn modaldetailofnotivaccine-btn--accept"
          onClick={() => handleVaccinationResponse("accept")}
          disabled={submitting}
        >
          <i className="fas fa-check"></i>
          {submitting ? "Đang gửi..." : "Đồng ý"}
        </button>
        <button
          className="modaldetailofnotivaccine-btn modaldetailofnotivaccine-btn--reject"
          onClick={() => handleVaccinationResponse("reject")}
          disabled={submitting}
        >
          <i className="fas fa-times"></i>
          {submitting ? "Đang gửi..." : "Từ chối"}
        </button>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modaldetailofnotivaccine-overlay" onClick={onClose}>
      <div
        className="modaldetailofnotivaccine-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modern Header */}
        <div className="modaldetailofnotivaccine-header">
          <div className="modaldetailofnotivaccine-header-content">
            <div className="modaldetailofnotivaccine-header-left">
              <div className="modaldetailofnotivaccine-header-icon">
                <i className="fas fa-syringe"></i>
              </div>
              <div className="modaldetailofnotivaccine-header-text">
                <h2>
                  {vaccinationDetail?.title || "Chi tiết thông báo tiêm chủng"}
                </h2>
                <p>Thông tin chi tiết về kế hoạch tiêm chủng</p>
              </div>
            </div>
            <button
              className="modaldetailofnotivaccine-close"
              onClick={onClose}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Modern Body */}
        <div className="modaldetailofnotivaccine-body">
          {loading ? (
            <div className="modaldetailofnotivaccine-loading">
              <div className="modaldetailofnotivaccine-spinner"></div>
              <p>Đang tải thông tin...</p>
            </div>
          ) : vaccinationDetail ? (
            <>
              {/* Basic Information */}
              <div className="modaldetailofnotivaccine-section">
                <h3 className="modaldetailofnotivaccine-section-title">
                  <i className="fas fa-info-circle"></i>
                  Thông tin cơ bản
                </h3>

                <div className="modaldetailofnotivaccine-detail-info">
                  <div className="modaldetailofnotivaccine-info-row">
                    <div className="modaldetailofnotivaccine-info-label">
                      <i className="fas fa-user-md"></i>
                      Người gửi:
                    </div>
                    <div className="modaldetailofnotivaccine-info-value">
                      {vaccinationDetail.senderName}
                    </div>
                  </div>

                  <div className="modaldetailofnotivaccine-info-row">
                    <div className="modaldetailofnotivaccine-info-label">
                      <i className="fas fa-calendar"></i>
                      Ngày nhận:
                    </div>
                    <div className="modaldetailofnotivaccine-info-value">
                      {formatDateTime(vaccinationDetail.createdAt)}
                    </div>
                  </div>

                  {vaccinationDetail.vaccinationType && (
                    <div className="modaldetailofnotivaccine-info-row">
                      <div className="modaldetailofnotivaccine-info-label">
                        <i className="fas fa-syringe"></i>
                        Loại vaccine:
                      </div>
                      <div className="modaldetailofnotivaccine-info-value">
                        {vaccinationDetail.vaccinationType}
                      </div>
                    </div>
                  )}

                  {vaccinationDetail.scheduledDate && (
                    <div className="modaldetailofnotivaccine-info-row">
                      <div className="modaldetailofnotivaccine-info-label">
                        <i className="fas fa-clock"></i>
                        Thời gian tiêm:
                      </div>
                      <div className="modaldetailofnotivaccine-info-value">
                        {formatDateTime(vaccinationDetail.scheduledDate)}
                      </div>
                    </div>
                  )}

                  {vaccinationDetail.location && (
                    <div className="modaldetailofnotivaccine-info-row">
                      <div className="modaldetailofnotivaccine-info-label">
                        <i className="fas fa-map-marker-alt"></i>
                        Địa điểm:
                      </div>
                      <div className="modaldetailofnotivaccine-info-value">
                        {vaccinationDetail.location}
                      </div>
                    </div>
                  )}

                  {vaccinationDetail.studentName && (
                    <div className="modaldetailofnotivaccine-info-row">
                      <div className="modaldetailofnotivaccine-info-label">
                        <i className="fas fa-user"></i>
                        Học sinh:
                      </div>
                      <div className="modaldetailofnotivaccine-info-value">
                        {vaccinationDetail.studentName}
                        {vaccinationDetail.studentClass &&
                          ` - Lớp ${vaccinationDetail.studentClass}`}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div className="modaldetailofnotivaccine-section">
                <h3 className="modaldetailofnotivaccine-section-title">
                  <i className="fas fa-envelope"></i>
                  Nội dung thông báo
                </h3>

                <div className="modaldetailofnotivaccine-message">
                  <div className="modaldetailofnotivaccine-content-card-title">
                    <i style={{ color: 'gray' }} className="fas fa-file-alt"></i>
                    Chi tiết thông báo
                  </div>
                  <div className="modaldetailofnotivaccine-message-content">
                    {vaccinationDetail.message || "Không có nội dung"}
                  </div>
                </div>
              </div>

              {/* Response Section - Chỉ hiển thị khi là yêu cầu cần phản hồi */}
              {vaccinationDetail.isRequest && (
                <div className="modaldetailofnotivaccine-section">
                  <h3 className="modaldetailofnotivaccine-section-title">
                    <i className="fas fa-reply"></i>
                    Phản hồi của phụ huynh
                  </h3>

                  {renderResponseButtons()}
                </div>
              )}
            </>
          ) : (
            <div className="modaldetailofnotivaccine-no-data">
              <i className="fas fa-exclamation-circle modaldetailofnotivaccine-no-data-icon"></i>
              <p className="modaldetailofnotivaccine-no-data-text">
                Không thể tải thông tin chi tiết
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaccinationDetailModal;
