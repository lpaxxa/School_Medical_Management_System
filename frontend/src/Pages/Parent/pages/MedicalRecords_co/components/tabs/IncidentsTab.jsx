import React, { useState, useEffect } from "react";
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
} from "react-icons/fa";
import medicalService from "../../../../../../services/medicalService";
import { formatDate } from "../../utils/formatters";
import { cacheData, getCachedData } from "../../utils/helpers";
import IncidentModal from "../modals/IncidentModal";

const IncidentsTab = ({ studentId }) => {
  const [medicalIncidents, setMedicalIncidents] = useState([]);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(true);
  const [incidentsError, setIncidentsError] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  useEffect(() => {
    const fetchIncidentsData = async () => {
      if (!studentId || typeof studentId !== "number") {
        console.log("Invalid studentId:", studentId);
        return;
      }

      try {
        setIsLoadingIncidents(true);
        const data = await medicalService.getMedicalIncidents(studentId);
        setMedicalIncidents(data);
      } catch (error) {
        console.error("Error fetching incidents data:", error);
        setIncidentsError("Không thể tải dữ liệu sự cố y tế");
      } finally {
        setIsLoadingIncidents(false);
      }
    };

    fetchIncidentsData();
  }, [studentId]);

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
      <h3>Lịch sử sự cố y tế</h3>

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
