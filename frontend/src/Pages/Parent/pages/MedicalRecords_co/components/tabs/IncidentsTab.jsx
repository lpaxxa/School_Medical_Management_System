import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
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
  FaSortAmountDown,
  FaSortAmountUp,
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
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"
  const [sortChangeNotification, setSortChangeNotification] = useState(null);

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
          setIncidentsError(null); // Clear any previous errors
        }
      } catch (error) {
        console.error("Error fetching incidents data:", error);
        if (componentMountedRef.current) {
          // Check if it's a 404 error (no data found) vs other errors
          if (error.response && error.response.status === 404) {
            // 404 means no incidents found - this is normal, not an error
            setMedicalIncidents([]);
            setIncidentsError(null);
            console.log("No incidents found for student - this is normal");
          } else {
            // Other errors are actual problems
            setIncidentsError("Không thể tải dữ liệu sự cố y tế");
          }
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

  // Sort incidents using useMemo for proper re-rendering
  const sortedIncidents = useMemo(() => {
    console.log("🔄 Sorting incidents with order:", sortOrder);
    console.log("📋 Raw incidents data:", medicalIncidents);

    return [...medicalIncidents].sort((a, b) => {
      // Primary sort: by incidentId (assuming higher ID = newer)
      const idA = a.incidentId || 0;
      const idB = b.incidentId || 0;

      console.log("📊 Comparing incidents:", {
        a: { id: idA, type: a.incidentType, dateTime: a.dateTime },
        b: { id: idB, type: b.incidentType, dateTime: b.dateTime },
      });

      if (sortOrder === "newest") {
        return idB - idA; // Higher ID first (newer)
      } else {
        return idA - idB; // Lower ID first (older)
      }
    });
  }, [medicalIncidents, sortOrder]);

  // Toggle sort order
  const toggleSortOrder = () => {
    const newOrder = sortOrder === "newest" ? "oldest" : "newest";
    console.log(
      "🔄 Toggling incidents sort order from",
      sortOrder,
      "to",
      newOrder
    );
    console.log("📋 Current incidents data:", medicalIncidents);
    console.log(
      "📅 Incidents with dates:",
      medicalIncidents.map((incident) => ({
        id: incident.incidentId,
        type: incident.incidentType,
        date: incident.incidentDate || incident.createdAt || incident.date,
        dateTime: incident.dateTime,
      }))
    );
    setSortOrder(newOrder);

    // Show sort change notification
    setSortChangeNotification(
      `Đã sắp xếp theo ${newOrder === "newest" ? "mới nhất" : "cũ nhất"}`
    );
    setTimeout(() => setSortChangeNotification(null), 2000);
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
          {/* {lastUpdated && (
            <div className="last-updated">
              Cập nhật: {lastUpdated.toLocaleTimeString("vi-VN")}
            </div>
          )} */}
        </div>
        <div className="incidents-controls">
          <button
            className="sort-btn"
            onClick={toggleSortOrder}
            title={`Sắp xếp theo ${
              sortOrder === "newest" ? "cũ nhất" : "mới nhất"
            }`}
          >
            {sortOrder === "newest" ? <FaSortAmountDown /> : <FaSortAmountUp />}
            <span>{sortOrder === "newest" ? "Mới nhất" : "Cũ nhất"}</span>
          </button>
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

      {/* Sort change notification */}
      {sortChangeNotification && (
        <div className="sort-notification">
          <FaSync className="notification-icon" />
          {sortChangeNotification}
        </div>
      )}

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
          <FaExclamationCircle />
          <h4>Không có dữ liệu</h4>
          <p>Medical Incidents not found for Student with id: {studentId}</p>
        </div>
      ) : (
        <div className="incidents-list">
          {sortedIncidents.map((incident) => (
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
                  <span className="date-text">
                    {formatDate(incident.dateTime)}
                  </span>
                  {/* <span className="sort-indicator">
                    #
                    {sortedIncidents.findIndex(
                      (i) => i.incidentId === incident.incidentId
                    ) + 1}
                  </span> */}
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
