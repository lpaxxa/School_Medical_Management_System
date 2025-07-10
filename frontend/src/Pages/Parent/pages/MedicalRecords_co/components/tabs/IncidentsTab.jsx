import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaBandAid,
  FaExclamationCircle,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSpinner,
  FaChevronRight,
  FaHeartbeat,
  FaThermometerHalf,
  FaPills,
  FaUserMd,
  FaClock,
  FaFlag,
  FaClipboardList,
  FaSync,
} from "react-icons/fa";
import medicalService from "../../../../../../services/medicalService";
import { formatDate } from "../../utils/formatters";
import { cacheData, getCachedData } from "../../utils/helpers";
import IncidentModal from "../modals/IncidentModal";

const IncidentsTab = ({ studentId }) => {
  const [medicalIncidents, setMedicalIncidents] = useState([]);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [incidentsError, setIncidentsError] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Refs for managing intervals and component state
  const refreshIntervalRef = useRef(null);
  const componentMountedRef = useRef(true);

  // Fetch incidents data function with auto-refresh support
  const fetchIncidentsData = useCallback(
    async (isRefresh = false) => {
      if (
        !studentId ||
        typeof studentId !== "number" ||
        !componentMountedRef.current
      ) {
        console.log("Invalid studentId:", studentId);
        if (!isRefresh) setIsLoadingIncidents(false);
        return;
      }

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoadingIncidents(true);
      }
      setIncidentsError(null);

      try {
        console.log("Fetching incidents data:", { studentId, isRefresh });

        // Sử dụng API hiện có: /medical-incidents/student/{studentId}
        const data = await medicalService.getMedicalIncidents(studentId);
        console.log("Incidents data received:", data);

        if (componentMountedRef.current) {
          // data là array trực tiếp theo cấu trúc JSON mới
          setMedicalIncidents(Array.isArray(data) ? data : []);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error("Error fetching incidents data:", error);
        if (componentMountedRef.current) {
          setIncidentsError("Không thể tải dữ liệu sự cố y tế");
        }
      } finally {
        if (componentMountedRef.current) {
          if (isRefresh) {
            setIsRefreshing(false);
          } else {
            setIsLoadingIncidents(false);
          }
        }
      }
    },
    [studentId]
  );

  // Manual refresh function
  const handleManualRefresh = useCallback(() => {
    fetchIncidentsData(true);
  }, [fetchIncidentsData]);

  useEffect(() => {
    componentMountedRef.current = true;

    if (studentId && typeof studentId === "number") {
      // Fetch initial data
      fetchIncidentsData(false);

      // Setup auto-refresh every 40 seconds for incident data
      refreshIntervalRef.current = setInterval(() => {
        fetchIncidentsData(true);
      }, 40000);
    }

    // Cleanup function
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [studentId, fetchIncidentsData]);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      componentMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const openIncidentModal = (incident) => {
    setSelectedIncident(incident);
    setIsIncidentModalOpen(true);
  };

  const closeIncidentModal = () => {
    setIsIncidentModalOpen(false);
    setSelectedIncident(null);
  };

  const getSeverityConfig = (severityLevel) => {
    const level = severityLevel?.toLowerCase();
    switch (level) {
      case "high":
      case "cao":
        return {
          icon: FaExclamationTriangle,
          color: "#ef4444",
          bgColor: "rgba(239, 68, 68, 0.1)",
          label: "Nghiêm trọng",
          priority: "Khẩn cấp",
        };
      case "medium":
      case "trung bình":
        return {
          icon: FaExclamationCircle,
          color: "#f59e0b",
          bgColor: "rgba(245, 158, 11, 0.1)",
          label: "Trung bình",
          priority: "Quan trọng",
        };
      case "low":
      case "thấp":
        return {
          icon: FaInfoCircle,
          color: "#10b981",
          bgColor: "rgba(16, 185, 129, 0.1)",
          label: "Nhẹ",
          priority: "Thông thường",
        };
      default:
        return {
          icon: FaInfoCircle,
          color: "#6b7280",
          bgColor: "rgba(107, 114, 128, 0.1)",
          label: severityLevel || "Không xác định",
          priority: "Không rõ",
        };
    }
  };

  const getIncidentTypeIcon = (incidentType) => {
    const type = incidentType?.toLowerCase();
    if (type?.includes("sốt") || type?.includes("nhiệt"))
      return FaThermometerHalf;
    if (type?.includes("tim") || type?.includes("mạch")) return FaHeartbeat;
    if (type?.includes("thuốc") || type?.includes("dị ứng")) return FaPills;
    return FaBandAid;
  };

  const getTimeAgo = (dateTime) => {
    const now = new Date();
    const incidentDate = new Date(dateTime);
    const diffDays = Math.floor((now - incidentDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return `${Math.floor(diffDays / 30)} tháng trước`;
  };

  return (
    <div className="incidents-panel">
      <div className="incidents-header">
        <div className="incidents-title-section">
          <h3>Lịch sử sự cố y tế</h3>
          {lastUpdated && (
            <div className="last-updated">
              Cập nhật: {lastUpdated.toLocaleTimeString("vi-VN")}
            </div>
          )}
        </div>
        <div className="incidents-controls">
          <button
            className={`refresh-btn ${isRefreshing ? "refreshing" : ""}`}
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Làm mới dữ liệu sự cố y tế"
          >
            <FaSync className={isRefreshing ? "spin" : ""} />
            <span>{isRefreshing ? "Đang tải..." : "Làm mới"}</span>
          </button>
        </div>
      </div>

      {incidentsError ? (
        <div className="error-message">
          <FaExclamationCircle /> {incidentsError}
        </div>
      ) : isLoadingIncidents ? (
        <div className="data-loading">
          <div className="loading-spinner small"></div>
          <p>Đang tải dữ liệu sự cố y tế...</p>
        </div>
      ) : medicalIncidents.length === 0 ? (
        <div className="no-incidents">
          <FaBandAid />
          <h4>Không có sự cố y tế</h4>
          <p>Học sinh chưa có ghi nhận sự cố y tế nào trong hệ thống.</p>
        </div>
      ) : (
        <div className="incidents-list">
          {medicalIncidents.map((incident) => (
            <div
              className={`incident-card ${incident.severityLevel.toLowerCase()}`}
              key={incident.incidentId}
              onClick={() => openIncidentModal(incident)}
            >
              <div className="incident-header">
                <div className="incident-type">
                  <span
                    className={`severity-tag ${incident.severityLevel.toLowerCase()}`}
                  >
                    {incident.severityLevel}
                  </span>
                  <h4>{incident.incidentType}</h4>
                </div>
                <div className="incident-date">
                  <FaCalendarAlt />
                  {formatDate(incident.dateTime)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for incident details */}
      {isIncidentModalOpen && selectedIncident && (
        <IncidentModal
          isOpen={isIncidentModalOpen}
          onClose={closeIncidentModal}
          incident={selectedIncident}
        />
      )}
    </div>
  );
};

export default IncidentsTab;
