import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import notificationService from "../../../../services/notificationService";

const VaccinationDetailModal = ({
  isOpen,
  onClose,
  notificationId,
  parentId,
  onResponseUpdated,
}) => {
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

      // Nếu API thất bại, hiển thị dữ liệu mẫu
      const sampleDetail = {
        id: notificationId,
        title: "Thông báo tiêm vaccine MMR",
        message:
          "Kính gửi quý phụ huynh, trường sẽ tổ chức tiêm vaccine MMR cho học sinh vào ngày 15/03/2024. Vui lòng xác nhận tham gia.",
        senderName: "Nguyễn Thị Hoa",
        createdAt: "2025-07-05T22:40:22.25",
        isRequest: true,
        response: null,
        responseAt: null,
        vaccinationType: "MMR (Sởi, Quai bị, Rubella)",
        scheduledDate: "2024-03-15T08:00:00",
        location: "Phòng y tế trường học - Tầng 1, Tòa A",
        studentName: "Nguyễn Văn A",
        studentClass: "3A1",
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
        <div className="pn-response-status">
          <div
            className={`pn-response-badge pn-response-badge--${vaccinationDetail.response}`}
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
            <p className="pn-response-time">
              Phản hồi lúc:{" "}
              {new Date(vaccinationDetail.responseAt).toLocaleString("vi-VN")}
            </p>
          )}
        </div>
      );
    }

    // Nếu chưa có phản hồi, hiển thị buttons
    return (
      <div className="pn-response-buttons">
        <button
          className="pn-btn pn-btn--accept"
          onClick={() => handleVaccinationResponse("accept")}
          disabled={submitting}
        >
          <i className="fas fa-check"></i>
          {submitting ? "Đang gửi..." : "Đồng ý"}
        </button>
        <button
          className="pn-btn pn-btn--reject"
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
    <div className="pn-modal-overlay" onClick={onClose}>
      <div className="pn-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="pn-modal-header">
          <h2 className="pn-modal-title">
            {vaccinationDetail?.title || "Chi tiết thông báo tiêm chủng"}
          </h2>
          <button className="pn-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="pn-modal-body">
          {loading ? (
            <div className="pn-loading">
              <div className="pn-spinner"></div>
              <p>Đang tải thông tin...</p>
            </div>
          ) : vaccinationDetail ? (
            <>
              {/* Thông tin chi tiết */}
              <div className="pn-vaccination-detail-info">
                <div className="pn-info-row">
                  <div className="pn-info-label">
                    <i className="fas fa-user-md"></i>
                    Người gửi:
                  </div>
                  <div className="pn-info-value">
                    {vaccinationDetail.senderName}
                  </div>
                </div>

                <div className="pn-info-row">
                  <div className="pn-info-label">
                    <i className="fas fa-calendar"></i>
                    Ngày nhận:
                  </div>
                  <div className="pn-info-value">
                    {vaccinationDetail.createdAt
                      ? new Date(vaccinationDetail.createdAt).toLocaleString(
                          "vi-VN"
                        )
                      : "Không có thông tin"}
                  </div>
                </div>

                {vaccinationDetail.vaccinationType && (
                  <div className="pn-info-row">
                    <div className="pn-info-label">
                      <i className="fas fa-syringe"></i>
                      Loại vaccine:
                    </div>
                    <div className="pn-info-value">
                      {vaccinationDetail.vaccinationType}
                    </div>
                  </div>
                )}

                {vaccinationDetail.scheduledDate && (
                  <div className="pn-info-row">
                    <div className="pn-info-label">
                      <i className="fas fa-clock"></i>
                      Thời gian tiêm:
                    </div>
                    <div className="pn-info-value">
                      {new Date(vaccinationDetail.scheduledDate).toLocaleString(
                        "vi-VN"
                      )}
                    </div>
                  </div>
                )}

                {vaccinationDetail.location && (
                  <div className="pn-info-row">
                    <div className="pn-info-label">
                      <i className="fas fa-map-marker-alt"></i>
                      Địa điểm:
                    </div>
                    <div className="pn-info-value">
                      {vaccinationDetail.location}
                    </div>
                  </div>
                )}

                {vaccinationDetail.studentName && (
                  <div className="pn-info-row">
                    <div className="pn-info-label">
                      <i className="fas fa-user"></i>
                      Học sinh:
                    </div>
                    <div className="pn-info-value">
                      {vaccinationDetail.studentName}
                      {vaccinationDetail.studentClass &&
                        ` - Lớp ${vaccinationDetail.studentClass}`}
                    </div>
                  </div>
                )}
              </div>

              {/* Nội dung thông báo */}
              <div className="pn-vaccination-message">
                <h4>Nội dung thông báo:</h4>
                <div className="pn-message-content">
                  {vaccinationDetail.message || "Không có nội dung"}
                </div>
              </div>

              {/* Response buttons */}
              {renderResponseButtons()}
            </>
          ) : (
            <div className="pn-no-data">
              <i className="fas fa-exclamation-circle pn-no-data-icon"></i>
              <p className="pn-no-data-text">
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
