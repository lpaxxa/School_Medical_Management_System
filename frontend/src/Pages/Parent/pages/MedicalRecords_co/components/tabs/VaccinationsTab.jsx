import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaSyringe,
  FaExclamationCircle,
  FaCalendarAlt,
  FaChevronRight,
  FaShieldAlt,
  FaSpinner,
  FaInfoCircle,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaUserMd,
  FaClipboardList,
  FaSync,
} from "react-icons/fa";
import medicalService from "../../../../../../services/medicalService";
import { formatDate } from "../../utils/formatters";
import { cacheData, getCachedData } from "../../utils/helpers";
import VaccinationModal from "../modals/VaccinationModal";

const VaccinationsTab = ({ studentId, parentInfo, studentCode }) => {
  const [vaccinationNotifications, setVaccinationNotifications] = useState([]);
  const [isLoadingVaccinations, setIsLoadingVaccinations] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [vaccinationsError, setVaccinationsError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vaccinationDetail, setVaccinationDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);

  // Refs for managing intervals and component state
  const refreshIntervalRef = useRef(null);
  const componentMountedRef = useRef(true);

  // Fetch vaccination data function with auto-refresh support
  const fetchVaccinationData = useCallback(
    async (isRefresh = false) => {
      if (!parentInfo?.id || !studentCode || !componentMountedRef.current) {
        console.log("Missing parentId or studentCode:", {
          parentId: parentInfo?.id,
          studentCode,
        });
        if (!isRefresh) setIsLoadingVaccinations(false);
        return;
      }

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoadingVaccinations(true);
      }
      setVaccinationsError(null);

      try {
        console.log("Fetching vaccination data:", { isRefresh });
        const data = await medicalService.getVaccinationNotifications(
          parentInfo.id,
          studentCode
        );

        if (componentMountedRef.current) {
          setVaccinationNotifications(data);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error("Error fetching vaccination data:", error);
        if (componentMountedRef.current) {
          setVaccinationsError("Không thể tải dữ liệu tiêm chủng");
        }
      } finally {
        if (componentMountedRef.current) {
          if (isRefresh) {
            setIsRefreshing(false);
          } else {
            setIsLoadingVaccinations(false);
          }
        }
      }
    },
    [parentInfo?.id, studentCode]
  );

  // Manual refresh function
  const handleManualRefresh = useCallback(() => {
    fetchVaccinationData(true);
  }, [fetchVaccinationData]);

  useEffect(() => {
    componentMountedRef.current = true;

    if (parentInfo?.id && studentCode) {
      // Fetch initial data
      fetchVaccinationData(false);

      // Setup auto-refresh every 50 seconds for vaccination data
      refreshIntervalRef.current = setInterval(() => {
        fetchVaccinationData(true);
      }, 50000);
    }

    // Cleanup function
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [parentInfo?.id, studentCode, fetchVaccinationData]);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      componentMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const handleViewDetails = async (notification) => {
    const notificationId = notification.id;

    console.log("🎯 handleViewDetails called with notification:", notification);
    console.log("🆔 Using notificationId:", notificationId);

    setSelectedNotificationId(notificationId);
    setIsModalOpen(true);
    setIsLoadingDetail(true);
    setDetailError(null);
    setVaccinationDetail(null);

    try {
      console.log("📡 Calling medicalService.getVaccinationDetail...");
      const detail = await medicalService.getVaccinationDetail(notificationId);
      console.log("✅ Received vaccination detail:", detail);
      setVaccinationDetail(detail);
    } catch (error) {
      console.error("❌ Error in handleViewDetails:", error);
      setDetailError("Không thể tải thông tin chi tiết tiêm chủng");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setVaccinationDetail(null);
    setSelectedNotificationId(null);
    setDetailError(null);
  };

  const getVaccineTypeColor = (title) => {
    if (title?.toLowerCase().includes("covid")) return "#ef4444";
    if (title?.toLowerCase().includes("cúm")) return "#3b82f6";
    if (title?.toLowerCase().includes("viêm gan")) return "#f59e0b";
    if (title?.toLowerCase().includes("bạch hầu")) return "#8b5cf6";
    return "#10b981";
  };

  const getVaccineIcon = (title) => {
    if (title?.toLowerCase().includes("covid")) return FaShieldAlt;
    if (title?.toLowerCase().includes("cúm")) return FaSyringe;
    return FaShieldAlt;
  };

  const getNotificationStatus = (notification) => {
    // Có thể dựa vào ngày hoặc status trong data
    const now = new Date();
    const receivedDate = new Date(notification.receivedAt);
    const daysDiff = Math.floor((now - receivedDate) / (1000 * 60 * 60 * 24));

    if (daysDiff < 7) return { status: "Mới", color: "#10b981" };
    if (daysDiff < 30) return { status: "Gần đây", color: "#3b82f6" };
    return { status: "Cũ", color: "#6b7280" };
  };

  return (
    <div className="vaccinations-panel">
      <div className="vaccinations-header">
        <div className="vaccinations-title-section">
          <h3>Lịch sử tiêm chủng</h3>
          {lastUpdated && (
            <div className="last-updated">
              Cập nhật: {lastUpdated.toLocaleTimeString("vi-VN")}
            </div>
          )}
        </div>
        <div className="vaccinations-controls">
          <button
            className={`refresh-btn ${isRefreshing ? "refreshing" : ""}`}
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Làm mới dữ liệu tiêm chủng"
          >
            <FaSync className={isRefreshing ? "spin" : ""} />
            <span>{isRefreshing ? "Đang tải..." : "Làm mới"}</span>
          </button>
        </div>
      </div>

      {vaccinationsError ? (
        <div className="error-message">
          <FaExclamationCircle /> {vaccinationsError}
        </div>
      ) : isLoadingVaccinations ? (
        <div className="data-loading">
          <div className="loading-spinner small"></div>
          <p>Đang tải dữ liệu tiêm chủng...</p>
        </div>
      ) : vaccinationNotifications.length === 0 ? (
        <div className="no-data-message">
          <FaSyringe />
          <h4>Chưa có thông tin tiêm chủng</h4>
          <p>Học sinh chưa có thông tin tiêm chủng nào được ghi nhận.</p>
        </div>
      ) : (
        <div className="vaccinations-list">
          {vaccinationNotifications.map((notification) => (
            <div
              className="vaccination-card"
              key={notification.id}
              onClick={() => handleViewDetails(notification)}
            >
              <div className="vaccination-header">
                <div className="vaccination-title">
                  <FaSyringe />
                  <h4>{notification.title}</h4>
                </div>
                <div className="vaccination-date">
                  <FaCalendarAlt />
                  {formatDate(notification.receivedAt)}
                </div>
              </div>
              <div className="vaccination-content">
                <p>{notification.message}</p>
                <div className="student-info">
                  <strong>Học sinh:</strong> {notification.studentName}
                </div>
              </div>
              <div className="vaccination-footer">
                <span className="view-details">
                  Xem chi tiết <FaChevronRight />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chỉ dùng 1 modal */}
      <VaccinationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isLoading={isLoadingDetail}
        error={detailError}
        vaccinationDetail={vaccinationDetail}
      />
    </div>
  );
};

export default VaccinationsTab;
