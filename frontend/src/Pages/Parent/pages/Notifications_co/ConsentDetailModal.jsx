import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import healthCheckupConsentService from "../../../../services/healthCheckupConsentService";

const ConsentDetailModal = ({
  isOpen,
  onClose,
  consentId,
  onConsentUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [parentNotes, setParentNotes] = useState("");

  // Load chi tiết consent khi modal mở
  useEffect(() => {
    if (isOpen && consentId) {
      loadConsentDetails();
    }
  }, [isOpen, consentId]);

  const loadConsentDetails = async () => {
    setLoading(true);
    try {
      console.log(`🚀 Loading consent details for ID: ${consentId}`);
      const result = await healthCheckupConsentService.getConsentDetails(
        consentId
      );

      setData(result);

      // Đồng bộ selectedItems và parentNotes từ dữ liệu consent đã có
      if (result.consent) {
        // Nếu consent đã có specialCheckupItems, đồng bộ vào selectedItems
        if (
          result.consent.specialCheckupItems &&
          Array.isArray(result.consent.specialCheckupItems)
        ) {
          setSelectedItems(result.consent.specialCheckupItems);
        } else {
          setSelectedItems([]);
        }

        // Đồng bộ parentNotes
        if (result.consent.parentNotes) {
          setParentNotes(result.consent.parentNotes);
        } else {
          setParentNotes("");
        }
      } else {
        // Nếu chưa có consent, reset về trạng thái ban đầu
        setSelectedItems([]);
        setParentNotes("");
      }

      console.log("✅ Modal: API call successful for consent", consentId);
      console.log("📊 Consent data:", result);
      console.log(
        "📝 Synced selectedItems:",
        result.consent?.specialCheckupItems || []
      );
      console.log("💬 Synced parentNotes:", result.consent?.parentNotes || "");
    } catch (error) {
      console.error("❌ Modal: Error loading consent details:", error);
      toast.error("Lỗi khi tải chi tiết thông báo: " + error.message, {
        position: "top-center",
        autoClose: 5000,
      });
      onClose(); // Đóng modal nếu không load được data
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi checkbox
  const handleItemToggle = (item) => {
    setSelectedItems((prev) => {
      if (prev.includes(item)) {
        return prev.filter((i) => i !== item);
      } else {
        return [...prev, item];
      }
    });
  };

  // Gửi consent
  const handleSubmitConsent = async () => {
    if (!data) return;

    setSubmitting(true);
    try {
      const consentData = {
        consentStatus: "APPROVED",
        specialCheckupItems: selectedItems,
        parentNotes: parentNotes.trim() || null,
      };

      console.log(`🚀 Submitting consent for ID: ${consentId}`, consentData);
      await healthCheckupConsentService.submitConsent(consentId, consentData);

      toast.success("Đã gửi xác nhận thành công!", {
        position: "top-center",
        autoClose: 3000,
      });

      console.log("✅ Modal: Submit consent successful for", consentId);

      // Update local data
      setData((prev) => ({
        ...prev,
        consentStatus: "APPROVED",
        selectedSpecialCheckupItems: selectedItems,
        consent: {
          ...prev.consent,
          consentStatus: "APPROVED",
          specialCheckupItems: selectedItems,
          parentNotes: parentNotes.trim() || null,
        },
      }));

      // Callback để cập nhật danh sách
      if (onConsentUpdated) {
        onConsentUpdated();
      }

      onClose();
    } catch (error) {
      console.error("❌ Error submitting consent:", error);
      toast.error("Có lỗi xảy ra khi gửi xác nhận: " + error.message, {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Từ chối consent
  const handleRejectConsent = async () => {
    if (!data) return;

    const confirmReject = window.confirm(
      "Bạn có chắc chắn muốn từ chối tham gia kiểm tra sức khỏe này không?"
    );
    if (!confirmReject) return;

    setSubmitting(true);
    try {
      const consentData = {
        consentStatus: "REJECTED",
        specialCheckupItems: [],
        parentNotes: parentNotes.trim() || null,
      };

      console.log(`🚀 Rejecting consent for ID: ${consentId}`, consentData);
      await healthCheckupConsentService.submitConsent(consentId, consentData);

      toast.success("Đã từ chối tham gia thành công!", {
        position: "top-center",
        autoClose: 3000,
      });

      console.log("✅ Modal: Reject consent successful for", consentId);

      // Update local data
      setData((prev) => ({
        ...prev,
        consentStatus: "REJECTED",
        selectedSpecialCheckupItems: [],
        consent: {
          ...prev.consent,
          consentStatus: "REJECTED",
          specialCheckupItems: [],
          parentNotes: parentNotes.trim() || null,
        },
      }));

      // Callback để cập nhật danh sách
      if (onConsentUpdated) {
        onConsentUpdated();
      }

      onClose();
    } catch (error) {
      console.error("❌ Error rejecting consent:", error);
      toast.error("Có lỗi xảy ra khi từ chối: " + error.message, {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi tiết thông báo kiểm tra sức khỏe</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="modal-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Đang tải thông tin...</p>
            </div>
          ) : data ? (
            <>
              {/* Thông tin chiến dịch */}
              <div className="campaign-info-modal">
                <h3>{data.campaignTitle}</h3>
                <div className="student-info-modal">
                  <i className="fas fa-user-graduate"></i>
                  <span>
                    Học sinh: <strong>{data.studentName}</strong>
                  </span>
                </div>
                <p className="campaign-description-modal">
                  {data.campaignDescription}
                </p>

                {/* Trạng thái */}
                <div
                  className={`consent-status-modal ${
                    data.consentStatus === "APPROVED"
                      ? "confirmed"
                      : data.consentStatus === "REJECTED"
                      ? "rejected"
                      : "pending"
                  }`}
                >
                  <i
                    className={`fas ${
                      data.consentStatus === "APPROVED"
                        ? "fa-check-circle"
                        : data.consentStatus === "REJECTED"
                        ? "fa-times-circle"
                        : "fa-clock"
                    }`}
                  ></i>
                  <span>
                    {data.consentStatus === "APPROVED"
                      ? "Đã đồng ý"
                      : data.consentStatus === "REJECTED"
                      ? "Đã từ chối"
                      : "Chờ phản hồi"}
                  </span>
                </div>
              </div>

              {/* Form nếu chưa consent */}
              {data.consentStatus === "PENDING" && (
                <div className="consent-form-modal">
                  <h4>Các mục kiểm tra sức khỏe đặc biệt</h4>
                  <p className="form-description-modal">
                    Vui lòng chọn các mục kiểm tra sức khỏe đặc biệt:
                  </p>

                  <div className="checkup-items-modal">
                    {data.availableSpecialCheckupItems?.map((item, index) => (
                      <label key={index} className="checkup-item-modal">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item)}
                          onChange={() => handleItemToggle(item)}
                        />
                        <span className="checkmark-modal"></span>
                        <span className="item-text-modal">{item}</span>
                      </label>
                    ))}
                  </div>

                  <div className="parent-notes-modal">
                    <label htmlFor="modal-notes">
                      Ghi chú từ phụ huynh (tùy chọn):
                    </label>
                    <textarea
                      id="modal-notes"
                      value={parentNotes}
                      onChange={(e) => setParentNotes(e.target.value)}
                      placeholder="Ví dụ: Con tôi bị dị ứng nhẹ..."
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Thông tin đã xác nhận */}
              {data.consentStatus === "APPROVED" && (
                <div className="confirmed-info-modal">
                  <h4 style={{ color: "#28a745", marginBottom: "15px" }}>
                    <i className="fas fa-check-circle"></i>
                    <span style={{ marginLeft: "8px" }}>
                      Thông tin đã xác nhận
                    </span>
                  </h4>

                  {/* Hiển thị các mục kiểm tra đã chọn */}
                  {selectedItems && selectedItems.length > 0 ? (
                    <div style={{ marginBottom: "15px" }}>
                      <h5>Các mục kiểm tra đặc biệt đã chọn:</h5>
                      <ul className="selected-items-modal">
                        {selectedItems.map((item, index) => (
                          <li key={index}>
                            <i
                              className="fas fa-check"
                              style={{ color: "#28a745" }}
                            ></i>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "10px",
                        backgroundColor: "#e8f5e8",
                        borderRadius: "6px",
                        color: "#28a745",
                        marginBottom: "15px",
                      }}
                    >
                      <i className="fas fa-check-circle"></i>
                      <span style={{ marginLeft: "8px" }}>
                        Đã đồng ý tham gia kiểm tra sức khỏe cơ bản
                      </span>
                    </div>
                  )}

                  {/* Hiển thị ghi chú từ phụ huynh */}
                  {(data.consent?.parentNotes || parentNotes) && (
                    <div
                      style={{
                        padding: "15px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        border: "1px solid #e9ecef",
                      }}
                    >
                      <strong
                        style={{
                          color: "#495057",
                          display: "block",
                          marginBottom: "8px",
                        }}
                      >
                        <i className="fas fa-comment"></i>
                        <span style={{ marginLeft: "8px" }}>
                          Ghi chú từ phụ huynh:
                        </span>
                      </strong>
                      <p
                        style={{
                          margin: "0",
                          fontStyle: "italic",
                          color: "#6c757d",
                          lineHeight: "1.5",
                          padding: "8px",
                          backgroundColor: "#ffffff",
                          borderRadius: "4px",
                          border: "1px solid #dee2e6",
                        }}
                      >
                        "{data.consent?.parentNotes || parentNotes}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Thông tin đã từ chối */}
              {data.consentStatus === "REJECTED" && (
                <div
                  className="rejected-info-modal"
                  style={{
                    padding: "15px",
                    backgroundColor: "#ffebee",
                    borderRadius: "8px",
                    border: "1px solid #ffcdd2",
                  }}
                >
                  <h4 style={{ color: "#d32f2f", marginBottom: "10px" }}>
                    <i className="fas fa-times-circle"></i>
                    <span style={{ marginLeft: "8px" }}>
                      Đã từ chối tham gia
                    </span>
                  </h4>
                  <p style={{ margin: "0 0 15px 0", color: "#666" }}>
                    Bạn đã từ chối cho con tham gia kiểm tra sức khỏe này.
                  </p>
                  {(data.consent?.parentNotes || parentNotes) && (
                    <div
                      style={{
                        padding: "15px",
                        backgroundColor: "#fff3cd",
                        borderRadius: "8px",
                        border: "1px solid #ffeaa7",
                      }}
                    >
                      <strong
                        style={{
                          color: "#856404",
                          display: "block",
                          marginBottom: "8px",
                        }}
                      >
                        <i className="fas fa-comment"></i>
                        <span style={{ marginLeft: "8px" }}>
                          Ghi chú từ phụ huynh:
                        </span>
                      </strong>
                      <p
                        style={{
                          margin: "0",
                          fontStyle: "italic",
                          color: "#6c757d",
                          lineHeight: "1.5",
                          padding: "8px",
                          backgroundColor: "#ffffff",
                          borderRadius: "4px",
                          border: "1px solid #dee2e6",
                        }}
                      >
                        "{data.consent?.parentNotes || parentNotes}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="modal-error">
              <i className="fas fa-exclamation-circle"></i>
              <p>Không thể tải thông tin</p>
            </div>
          )}
        </div>

        {/* Footer với nút action */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Đóng
          </button>
          {data && data.consentStatus === "PENDING" && (
            <>
              <button
                className="btn-reject"
                onClick={handleRejectConsent}
                disabled={submitting}
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  marginRight: "10px",
                }}
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="fas fa-times"></i>
                    Từ chối
                  </>
                )}
              </button>
              <button
                className="btn-confirm"
                onClick={handleSubmitConsent}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i>
                    Đồng ý tham gia
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsentDetailModal;
