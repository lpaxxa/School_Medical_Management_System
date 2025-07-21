import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaSyringe,
  FaExclamationCircle,
  FaCalendarAlt,
  FaClipboardList,
  FaClipboardCheck,
  FaCheck,
  FaHistory,
  FaChevronRight,
  FaCheckCircle,
  FaTag,
} from "react-icons/fa";
import medicalService from "../../../../../../services/medicalService";
import { formatDate } from "../../utils/formatters";
import VaccinationModal from "../modals/VaccinationModal";

const VaccinationsTab = ({ studentId, parentInfo, studentCode }) => {
  // Debug logging
  console.log("VaccinationsTab props:", { studentId, parentInfo, studentCode });
  console.log("Parent ID from parentInfo:", parentInfo?.id);

  // Sub-tab navigation state
  const [activeSubTab, setActiveSubTab] = useState("confirmation");

  // Confirmation data states - chỉ cần cho vaccination plans
  const [vaccinationPlans, setVaccinationPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState(null);

  // Vaccination history states
  const [vaccinationHistory, setVaccinationHistory] = useState([]);
  const [healthProfile, setHealthProfile] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  // State for multi-vaccine confirmation
  const [confirmations, setConfirmations] = useState({});
  const [isSubmittingConfirmation, setIsSubmittingConfirmation] =
    useState(false);

  // State for vaccination modal
  const [selectedVaccination, setSelectedVaccination] = useState(null);
  const [isVaccinationModalOpen, setIsVaccinationModalOpen] = useState(false);

  // State for notification modal
  const [notificationModal, setNotificationModal] = useState({
    show: false,
    type: "success", // 'success' or 'error'
    title: "",
    message: "",
  });

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Số items mỗi trang cho kế hoạch tiêm chủng
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [historyItemsPerPage] = useState(8); // Số items mỗi trang cho lịch sử tiêm chủng

  // Refs for managing intervals and component state
  const refreshIntervalRef = useRef(null);
  const componentMountedRef = useRef(true);

  // Fetch vaccination plans for confirmation
  const fetchVaccinationPlans = useCallback(async () => {
    // VaccinationsTab chỉ sử dụng studentId số, không dùng studentCode
    if (!studentId || !componentMountedRef.current) {
      console.log("Missing studentId (number required):", studentId);
      setIsLoadingPlans(false);
      return;
    }

    setIsLoadingPlans(true);
    setPlansError(null);

    try {
      console.log(
        "Fetching vaccination plans for studentId (number):",
        studentId
      );

      const data = await medicalService.getVaccinationPlans(studentId);
      console.log("Vaccination plans received:", data);
      console.log("📋 Plans with status breakdown:");
      data.forEach((plan) => {
        console.log(`  - Plan ${plan.id} (${plan.name}): ${plan.status}`);
      });

      if (componentMountedRef.current) {
        setVaccinationPlans(data);
      }
    } catch (error) {
      console.error("Error fetching vaccination plans:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (componentMountedRef.current) {
        const errorMessage =
          error.response?.data?.message ||
          "Không thể tải danh sách kế hoạch tiêm chủng";
        setPlansError(errorMessage);
      }
    } finally {
      if (componentMountedRef.current) {
        setIsLoadingPlans(false);
      }
    }
  }, [studentId]);

  // Fetch vaccination history
  const fetchVaccinationHistory = useCallback(async () => {
    if (!studentId || !componentMountedRef.current) {
      console.log("Missing studentId for history:", studentId);
      setIsLoadingHistory(false);
      return;
    }

    // Lấy parentId từ parentInfo prop
    const parentId = parentInfo?.id;
    if (!parentId) {
      console.log("Missing parentId from parentInfo:", parentInfo);
      setHistoryError("Không thể xác định thông tin phụ huynh");
      setIsLoadingHistory(false);
      return;
    }

    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      console.log(
        "Fetching vaccination history for studentId:",
        studentId,
        "parentId:",
        parentId
      );

      const data = await medicalService.getStudentVaccinations(
        parentId,
        studentId
      );
      console.log("Vaccination history received:", data);

      if (componentMountedRef.current) {
        setVaccinationHistory(data.vaccinations || []);
        // Set basic student info từ response
        setHealthProfile({
          studentName: data.studentName,
          className: data.className,
          // Không có health profile trong API mới, có thể bỏ hoặc lấy từ API khác
        });
      }
    } catch (error) {
      console.error("Error fetching vaccination history:", error);
      console.error("Error details:", {
        message: error.message,
        studentId: studentId,
      });

      if (componentMountedRef.current) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Không thể tải lịch sử tiêm chủng";
        setHistoryError(errorMessage);
      }
    } finally {
      if (componentMountedRef.current) {
        setIsLoadingHistory(false);
      }
    }
  }, [studentId, parentInfo]);

  // Open vaccination modal
  const openVaccinationModal = (vaccination) => {
    console.log("Opening vaccination modal for:", vaccination);
    setSelectedVaccination(vaccination);
    setIsVaccinationModalOpen(true);
  };

  // Close vaccination modal
  const closeVaccinationModal = () => {
    setIsVaccinationModalOpen(false);
    setSelectedVaccination(null);
  };

  // Show notification modal
  const showNotification = (type, title, message) => {
    setNotificationModal({
      show: true,
      type,
      title,
      message,
    });

    // Auto hide after 3 seconds
    setTimeout(() => {
      setNotificationModal((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // Close notification modal
  const closeNotification = () => {
    setNotificationModal((prev) => ({ ...prev, show: false }));
  };

  // Handle radio button change for batch confirmation
  const handleConfirmationChange = (vaccineId, response) => {
    setConfirmations((prev) => ({
      ...prev,
      [vaccineId]: { response, parentNotes: "" }, // Reset notes when response changes
    }));
  };

  // Handle notes change for batch confirmation
  const handleNotesChange = (vaccineId, notes) => {
    setConfirmations((prev) => ({
      ...prev,
      [vaccineId]: {
        ...prev[vaccineId],
        parentNotes: notes,
      },
    }));
  };

  // Handle batch vaccination confirmation submission
  const handleBatchConfirmationSubmit = async (plan) => {
    if (isSubmittingConfirmation) {
      console.log(
        "Already submitting confirmation, ignoring duplicate request"
      );
      return;
    }

    console.log("Starting batch confirmation for plan:", plan);
    setIsSubmittingConfirmation(true);

    const recipientId = plan.notificationRecipientId;
    console.log("Recipient ID:", recipientId);

    // Filter vaccines that belong to this plan, don't have response yet, and have confirmations
    const planVaccineIds = plan.vaccines
      .filter((v) => !v.response)
      .map((v) => v.id);
    const confirmationsToSend = Object.entries(confirmations)
      .filter(([vaccineId]) => planVaccineIds.includes(parseInt(vaccineId, 10)))
      .map(([vaccineId, data]) => ({
        vaccineId: parseInt(vaccineId, 10),
        response: data.response, // "ACCEPTED" hoặc "REJECTED"
        parentNotes: data.parentNotes || "",
      }))
      .filter((c) => c.response); // Only send confirmations with a response

    console.log("Vaccines needing confirmation (no response):", planVaccineIds);
    console.log("Confirmations to send:", confirmationsToSend);
    console.log("Current confirmations state:", confirmations);

    if (confirmationsToSend.length === 0) {
      alert(
        "Vui lòng chọn xác nhận cho ít nhất một loại vaccine trong kế hoạch này."
      );
      setIsSubmittingConfirmation(false);
      return;
    }

    // Check if all vaccines that need confirmation have been confirmed
    const vaccinesNeedingConfirmation = plan.vaccines.filter(
      (v) => !v.response
    );
    const allVaccinesConfirmed = vaccinesNeedingConfirmation.every(
      (vaccine) => confirmations[vaccine.id]?.response
    );

    if (!allVaccinesConfirmed) {
      const unconfirmedVaccines = vaccinesNeedingConfirmation
        .filter((vaccine) => !confirmations[vaccine.id]?.response)
        .map((vaccine) => vaccine.name);

      const confirmMessage = `Bạn chưa xác nhận các vaccine sau:\n${unconfirmedVaccines.join(
        "\n"
      )}\n\nBạn có muốn tiếp tục với những vaccine đã xác nhận không?`;
      if (!window.confirm(confirmMessage)) {
        setIsSubmittingConfirmation(false);
        return;
      }
    }

    if (!recipientId) {
      alert("Lỗi: Không tìm thấy thông tin người nhận. Vui lòng thử lại.");
      console.error("Missing notificationRecipientId in plan:", plan);
      setIsSubmittingConfirmation(false);
      return;
    }

    try {
      console.log("Sending confirmation request...");
      const requestData = {
        notificationRecipientId: recipientId,
        confirmations: confirmationsToSend,
      };
      console.log("Request data:", requestData);

      const result = await medicalService.confirmVaccination(requestData);
      console.log("Confirmation result:", result);

      // Show success notification modal
      showNotification(
        "success",
        "Xác nhận tiêm chủng đã được gửi thành công!",
        `Đã xác nhận ${confirmationsToSend.length} vaccine.`
      );

      // Clear confirmations for this plan's vaccines
      const updatedConfirmations = { ...confirmations };
      planVaccineIds.forEach((vaccineId) => {
        delete updatedConfirmations[vaccineId];
      });
      setConfirmations(updatedConfirmations);

      // Refresh plans to get updated status
      console.log(
        "🔄 Refreshing vaccination plans after successful confirmation..."
      );

      // Add a small delay to ensure server has processed the update
      setTimeout(async () => {
        await fetchVaccinationPlans();
        console.log("✅ Plans refreshed after confirmation");
      }, 500);

      // Additional logging to check if status changed
      setTimeout(() => {
        console.log("📊 Updated vaccination plans:", vaccinationPlans);
        const updatedPlan = vaccinationPlans.find((p) => p.id === plan.id);
        if (updatedPlan) {
          console.log(`📌 Plan ${plan.id} new status:`, updatedPlan.status);
        }
      }, 1500);
    } catch (error) {
      console.error("Error submitting batch confirmation:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra khi gửi xác nhận";

      // Show error notification modal
      showNotification(
        "error",
        "Gửi xác nhận thất bại!",
        `Lỗi: ${errorMessage}. Vui lòng thử lại.`
      );
    } finally {
      setIsSubmittingConfirmation(false);
    }
  };

  // Helper function to get confirmation summary for a plan
  const getConfirmationSummary = useCallback(
    (plan) => {
      // Only count vaccines that don't have response yet (need confirmation)
      const vaccinesNeedingConfirmation = plan.vaccines.filter(
        (v) => !v.response
      );
      const planVaccineIds = vaccinesNeedingConfirmation.map((v) => v.id);

      const confirmedVaccines = planVaccineIds.filter(
        (id) => confirmations[id]?.response
      );
      const acceptedCount = planVaccineIds.filter(
        (id) => confirmations[id]?.response === "ACCEPTED"
      ).length;
      const rejectedCount = planVaccineIds.filter(
        (id) => confirmations[id]?.response === "REJECTED"
      ).length;

      return {
        total: planVaccineIds.length,
        confirmed: confirmedVaccines.length,
        accepted: acceptedCount,
        rejected: rejectedCount,
        isComplete: confirmedVaccines.length === planVaccineIds.length,
      };
    },
    [confirmations]
  );

  // Pagination helper functions
  const getPaginatedPlans = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return vaccinationPlans.slice(startIndex, endIndex);
  };

  const getPaginatedHistory = () => {
    const startIndex = (historyCurrentPage - 1) * historyItemsPerPage;
    const endIndex = startIndex + historyItemsPerPage;
    return vaccinationHistory.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(vaccinationPlans.length / itemsPerPage);
  };

  const getHistoryTotalPages = () => {
    return Math.ceil(vaccinationHistory.length / historyItemsPerPage);
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of the list when changing page
    const plansContainer = document.querySelector(".vaccination-plans-list");
    if (plansContainer) {
      plansContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const goToHistoryPage = (pageNumber) => {
    setHistoryCurrentPage(pageNumber);
    // Scroll to top of the history list when changing page
    const historyContainer = document.querySelector(
      ".vaccination-history-list"
    );
    if (historyContainer) {
      historyContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    componentMountedRef.current = true;

    if (studentId && parentInfo?.id) {
      // Fetch vaccination plans for confirmation
      fetchVaccinationPlans();
      // Fetch vaccination history using new API
      fetchVaccinationHistory();
    }

    // Cleanup function
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [studentId, parentInfo, fetchVaccinationPlans, fetchVaccinationHistory]);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      componentMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="vaccinations-panel">
      {/* Section Header */}
      <div className="section-header">
        <h3>Tiêm chủng</h3>
        <p>Quản lý thông tin tiêm chủng và lịch sử vaccine của học sinh</p>
      </div>

      {/* Sub-tab Navigation */}
      <div className="vaccination-sub-tabs">
        <button
          className={`sub-tab-btn ${
            activeSubTab === "confirmation" ? "active" : ""
          }`}
          onClick={() => {
            setActiveSubTab("confirmation");
            setCurrentPage(1); // Reset trang về 1 khi chuyển tab
          }}
        >
          <FaClipboardList />
          <span>Xác nhận tiêm chủng</span>
        </button>
        <button
          className={`sub-tab-btn ${
            activeSubTab === "history" ? "active" : ""
          }`}
          onClick={() => {
            setActiveSubTab("history");
            setHistoryCurrentPage(1); // Reset trang về 1 khi chuyển tab
          }}
        >
          <FaHistory />
          <span>Lịch sử tiêm chủng</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeSubTab === "confirmation" ? (
        // Existing confirmation content
        <div className="confirmation-section">
          <div className="section-header">
            <h3>Xác nhận tiêm chủng</h3>
            <p>Xác nhận hoặc từ chối các kế hoạch tiêm chủng cho con em mình</p>
          </div>

          {plansError ? (
            <div className="error-message">
              <FaExclamationCircle /> {plansError}
            </div>
          ) : isLoadingPlans ? (
            <div className="data-loading">
              <div className="loading-spinner small"></div>
              <p>Đang tải danh sách kế hoạch tiêm chủng...</p>
            </div>
          ) : vaccinationPlans.length === 0 ? (
            <div className="no-data-message">
              <FaClipboardCheck />
              <h4>Không có kế hoạch tiêm chủng nào</h4>
              <p>
                Hiện tại không có kế hoạch tiêm chủng nào cần xác nhận cho học
                sinh này.
              </p>
            </div>
          ) : (
            <div className="vaccination-plans-list">
              {getPaginatedPlans().map((plan) => (
                <div className="vaccination-plan-card" key={plan.id}>
                  <div className="plan-header">
                    <div className="plan-title">
                      <FaSyringe className="plan-icon" />
                      <div>
                        <h4>{plan.name}</h4>
                        <p className="plan-description">{plan.description}</p>
                      </div>
                    </div>
                    <div className="plan-date">
                      <FaCalendarAlt />
                      <span>Ngày tiêm: {formatDate(plan.vaccinationDate)}</span>
                    </div>
                  </div>

                  <div className="plan-status">
                    <span
                      className={`status-badge ${plan.status.toLowerCase()}`}
                    >
                      {plan.status === "COMPLETED"
                        ? "Đã hoàn thành"
                        : plan.status === "PENDING"
                        ? "Chờ xử lý"
                        : plan.status === "WAITING_PARENT"
                        ? "Chờ phụ huynh xác nhận"
                        : plan.status === "ACCEPTED"
                        ? "Đã được phụ huynh đồng ý"
                        : plan.status === "REJECTED"
                        ? "Đã bị phụ huynh từ chối"
                        : plan.status}
                    </span>
                  </div>

                  {plan.status === "WAITING_PARENT" ? (
                    <div className="vaccine-confirmation-form">
                      <h5>
                        <FaClipboardList /> Vui lòng xác nhận các mũi tiêm sau:
                      </h5>
                      <div className="confirmation-instruction">
                        <small>
                          * Bạn cần xác nhận các vaccine chưa có phản hồi trong
                          kế hoạch này. Chọn "Đồng ý" nếu cho phép tiêm chủng,
                          "Từ chối" nếu không đồng ý.
                        </small>
                      </div>

                      {/* Progress indicator */}
                      {(() => {
                        const needConfirmationVaccines = plan.vaccines.filter(
                          (v) => !v.response
                        );
                        const summary = getConfirmationSummary(plan);

                        return (
                          summary.confirmed > 0 && (
                            <div className="confirmation-progress">
                              <div className="progress-text">
                                Đã xác nhận: {summary.confirmed}/
                                {needConfirmationVaccines.length} vaccine
                                {summary.accepted > 0 &&
                                  ` (${summary.accepted} đồng ý`}
                                {summary.rejected > 0 &&
                                  `, ${summary.rejected} từ chối`}
                                {(summary.accepted > 0 ||
                                  summary.rejected > 0) &&
                                  ")"}
                              </div>
                              <div className="progress-bar">
                                <div
                                  className="progress-fill"
                                  style={{
                                    width: `${
                                      needConfirmationVaccines.length > 0
                                        ? (summary.confirmed /
                                            needConfirmationVaccines.length) *
                                          100
                                        : 100
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>
                          )
                        );
                      })()}

                      {/* Hiển thị vaccines đã có response */}
                      {plan.vaccines
                        .filter((v) => v.response)
                        .map((vaccine) => (
                          <div
                            className="vaccine-confirm-item completed"
                            key={`completed-${vaccine.id}`}
                          >
                            <div className="vaccine-confirm-info">
                              <strong>{vaccine.name}</strong>
                              <p>{vaccine.description}</p>
                              <div className="vaccine-response">
                                <span
                                  className={`response-badge ${vaccine.response.toLowerCase()}`}
                                >
                                  {vaccine.response === "ACCEPTED"
                                    ? "✅ Đã đồng ý"
                                    : "❌ Đã từ chối"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* Hiển thị vaccines cần xác nhận */}
                      {plan.vaccines
                        .filter((v) => !v.response)
                        .map((vaccine) => (
                          <div
                            className="vaccine-confirm-item"
                            key={vaccine.id}
                          >
                            <div className="vaccine-confirm-info">
                              <strong>{vaccine.name}</strong>
                              <p>{vaccine.description}</p>
                            </div>
                            <div className="vaccine-confirm-actions">
                              <label
                                className={
                                  confirmations[vaccine.id]?.response ===
                                  "ACCEPTED"
                                    ? "selected"
                                    : ""
                                }
                              >
                                <input
                                  type="radio"
                                  name={`vaccine-${vaccine.id}`}
                                  value="ACCEPTED"
                                  checked={
                                    confirmations[vaccine.id]?.response ===
                                    "ACCEPTED"
                                  }
                                  onChange={() =>
                                    handleConfirmationChange(
                                      vaccine.id,
                                      "ACCEPTED"
                                    )
                                  }
                                />
                                <span className="radio-label">Đồng ý</span>
                              </label>
                              <label
                                className={
                                  confirmations[vaccine.id]?.response ===
                                  "REJECTED"
                                    ? "selected"
                                    : ""
                                }
                              >
                                <input
                                  type="radio"
                                  name={`vaccine-${vaccine.id}`}
                                  value="REJECTED"
                                  checked={
                                    confirmations[vaccine.id]?.response ===
                                    "REJECTED"
                                  }
                                  onChange={() =>
                                    handleConfirmationChange(
                                      vaccine.id,
                                      "REJECTED"
                                    )
                                  }
                                />
                                <span className="radio-label">Từ chối</span>
                              </label>
                            </div>
                            {confirmations[vaccine.id]?.response ===
                              "REJECTED" && (
                              <div className="vaccine-notes">
                                <input
                                  type="text"
                                  placeholder="Lý do từ chối (không bắt buộc)"
                                  value={
                                    confirmations[vaccine.id]?.parentNotes || ""
                                  }
                                  onChange={(e) =>
                                    handleNotesChange(
                                      vaccine.id,
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            )}
                          </div>
                        ))}

                      {/* Chỉ hiển thị nút gửi xác nhận nếu còn vaccines cần xác nhận */}
                      {(() => {
                        const vaccinesNeedingConfirmation =
                          plan.vaccines.filter((v) => !v.response);
                        const summary = getConfirmationSummary(plan);

                        // Nếu không còn vaccines nào cần xác nhận, ẩn nút
                        if (vaccinesNeedingConfirmation.length === 0) {
                          return (
                            <div className="all-confirmed-message">
                              <FaCheck className="success-icon" />
                              <p>✅ Tất cả vaccines đã được xác nhận</p>
                            </div>
                          );
                        }

                        // Nếu còn vaccines cần xác nhận, hiển thị nút
                        return (
                          <button
                            className={`submit-confirmation-btn ${
                              isSubmittingConfirmation ? "loading" : ""
                            }`}
                            onClick={() => handleBatchConfirmationSubmit(plan)}
                            disabled={isSubmittingConfirmation}
                          >
                            {isSubmittingConfirmation ? (
                              <>
                                <div className="loading-spinner small"></div>
                                Đang gửi xác nhận...
                              </>
                            ) : (
                              <>
                                <FaCheck />
                                {summary.confirmed > 0
                                  ? `Gửi xác nhận (${summary.confirmed}/${summary.total})`
                                  : "Gửi xác nhận"}
                              </>
                            )}
                          </button>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="vaccines-list">
                      <h5>Các loại vaccine:</h5>
                      {plan.vaccines.map((vaccine) => (
                        <div className="vaccine-item" key={vaccine.id}>
                          <div className="vaccine-info">
                            <strong>{vaccine.name}</strong>
                            <p>{vaccine.description}</p>

                            {/* Hiển thị response của phụ huynh nếu có */}
                            {vaccine.response && (
                              <div className="vaccine-response">
                                <span
                                  className={`response-badge ${vaccine.response.toLowerCase()}`}
                                >
                                  {vaccine.response === "ACCEPTED"
                                    ? "✅ Đã đồng ý"
                                    : vaccine.response === "REJECTED"
                                    ? "❌ Đã từ chối"
                                    : vaccine.response}
                                </span>
                              </div>
                            )}

                            {/* Hiển thị trạng thái chưa xác nhận */}
                            {!vaccine.response &&
                              plan.status === "COMPLETED" && (
                                <div className="vaccine-response">
                                  <span className="response-badge pending">
                                    ⏳ Chưa có phản hồi
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination for vaccination plans */}
              {vaccinationPlans.length > itemsPerPage && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    <span>
                      Hiển thị{" "}
                      {Math.min(
                        (currentPage - 1) * itemsPerPage + 1,
                        vaccinationPlans.length
                      )}{" "}
                      -{" "}
                      {Math.min(
                        currentPage * itemsPerPage,
                        vaccinationPlans.length
                      )}{" "}
                      trong tổng số {vaccinationPlans.length} kế hoạch
                    </span>
                  </div>
                  <div className="pagination-controls">
                    <button
                      className="pagination-btn prev-btn"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      title="Trang trước"
                    >
                      ←
                    </button>

                    <div className="pagination-pages">
                      {Array.from({ length: getTotalPages() }, (_, index) => (
                        <button
                          key={index + 1}
                          className={`pagination-page ${
                            index + 1 === currentPage ? "active" : ""
                          }`}
                          onClick={() => goToPage(index + 1)}
                          title={`Trang ${index + 1}`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      className="pagination-btn next-btn"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === getTotalPages()}
                      title="Trang sau"
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // Vaccination History content
        <div className="history-section">
          {historyError ? (
            <div className="error-message">
              <FaExclamationCircle /> {historyError}
            </div>
          ) : isLoadingHistory ? (
            <div className="data-loading">
              <div className="loading-spinner small"></div>
              <p>Đang tải lịch sử tiêm chủng...</p>
            </div>
          ) : (
            <div className="vaccination-history-content">
              {/* Student Info Summary */}
              {healthProfile && (
                <div className="health-profile-summary">
                  <h4>Thông tin học sinh</h4>
                  <div className="profile-info-grid">
                    <div className="profile-info-item">
                      <label>Tên học sinh:</label>
                      <span>{healthProfile.studentName}</span>
                    </div>
                    <div className="profile-info-item">
                      <label>Lớp:</label>
                      <span>{healthProfile.className}</span>
                    </div>
                    <div className="profile-info-item">
                      <label>Tổng số mũi tiêm:</label>
                      <span>{vaccinationHistory.length}</span>
                    </div>
                    <div className="profile-info-item">
                      <label>Đã tiêm:</label>
                      <span className="immunization-status complete">
                        {
                          vaccinationHistory.filter((v) => v.vaccinationDate)
                            .length
                        }{" "}
                        mũi
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Vaccination History */}
              <div className="vaccination-history-list">
                <h4>Lịch sử tiêm chủng</h4>
                {vaccinationHistory.length === 0 ? (
                  <div className="no-data-message">
                    <FaSyringe />
                    <h5>Chưa có lịch sử tiêm chủng</h5>
                    <p>
                      Hiện tại chưa có thông tin về các mũi vaccine đã tiêm cho
                      học sinh này.
                    </p>
                  </div>
                ) : (
                  <div className="vaccination-history-rows">
                    {getPaginatedHistory().map((vaccination, index) => (
                      <div
                        className="vaccination-row"
                        key={index}
                        onClick={() => openVaccinationModal(vaccination)}
                      >
                        <div className="vaccination-row-content">
                          <div className="vaccination-row-main">
                            <div className="vaccination-dose">
                              <FaSyringe className="dose-icon" />
                              <span className="dose-text">
                                Mũi {vaccination.doseNumber || "N/A"}
                              </span>
                            </div>
                            <div className="vaccination-name">
                              <span className="vaccine-name">
                                {vaccination.vaccineName || "N/A"}
                              </span>
                            </div>
                            <div className="vaccination-date">
                              <FaCalendarAlt className="date-icon" />
                              <span className="date-text">
                                {vaccination.vaccinationDate
                                  ? formatDate(vaccination.vaccinationDate)
                                  : "Chưa tiêm"}
                              </span>
                            </div>
                            <div className="vaccination-type">
                              <span
                                className={`vaccination-type-badge-small ${vaccination.vaccinationType?.toLowerCase()}`}
                              >
                                {vaccination.vaccinationType === "SCHOOL_PLAN"
                                  ? "Kế hoạch trường"
                                  : vaccination.vaccinationType ===
                                    "PARENT_DECLARED"
                                  ? "Phụ huynh khai báo"
                                  : vaccination.vaccinationType || "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="vaccination-row-status">
                            {vaccination.vaccinationDate ? (
                              <FaCheckCircle className="status-icon completed" />
                            ) : (
                              <FaCalendarAlt className="status-icon pending" />
                            )}
                          </div>
                        </div>
                        <FaChevronRight className="arrow-icon" />
                      </div>
                    ))}

                    {/* Pagination for vaccination history */}
                    {vaccinationHistory.length > historyItemsPerPage && (
                      <div className="pagination-container">
                        <div className="pagination-info">
                          <span>
                            Hiển thị{" "}
                            <strong>
                              {Math.min(
                                (historyCurrentPage - 1) * historyItemsPerPage +
                                  1,
                                vaccinationHistory.length
                              )}{" "}
                              -{" "}
                              {Math.min(
                                historyCurrentPage * historyItemsPerPage,
                                vaccinationHistory.length
                              )}
                            </strong>{" "}
                            trong tổng số{" "}
                            <strong>{vaccinationHistory.length}</strong> mũi
                            tiêm
                          </span>
                        </div>
                        <div className="pagination-controls">
                          <button
                            className="pagination-btn prev-btn"
                            onClick={() =>
                              goToHistoryPage(historyCurrentPage - 1)
                            }
                            disabled={historyCurrentPage === 1}
                            title="Trang trước"
                          >
                            ←
                          </button>

                          <div className="pagination-pages">
                            {Array.from(
                              { length: getHistoryTotalPages() },
                              (_, index) => (
                                <button
                                  key={index + 1}
                                  className={`pagination-page ${
                                    index + 1 === historyCurrentPage
                                      ? "active"
                                      : ""
                                  }`}
                                  onClick={() => goToHistoryPage(index + 1)}
                                  title={`Trang ${index + 1}`}
                                >
                                  {index + 1}
                                </button>
                              )
                            )}
                          </div>

                          <button
                            className="pagination-btn next-btn"
                            onClick={() =>
                              goToHistoryPage(historyCurrentPage + 1)
                            }
                            disabled={
                              historyCurrentPage === getHistoryTotalPages()
                            }
                            title="Trang sau"
                          >
                            →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vaccination Modal */}
      {isVaccinationModalOpen && selectedVaccination && (
        <VaccinationModal
          isOpen={isVaccinationModalOpen}
          onClose={closeVaccinationModal}
          vaccination={selectedVaccination}
        />
      )}

      {/* Notification Modal */}
      {notificationModal.show && (
        <div className="vaccination-notification-modal-overlay">
          <div
            className={`vaccination-notification-modal vaccination-notification-${notificationModal.type}`}
          >
            <div className="vaccination-notification-icon">
              {notificationModal.type === "success" ? (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <div className="vaccination-notification-content">
              <h3>{notificationModal.title}</h3>
              <p>{notificationModal.message}</p>
            </div>
            <div className="vaccination-notification-progress"></div>
            <button
              className="vaccination-notification-close"
              onClick={closeNotification}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccinationsTab;
