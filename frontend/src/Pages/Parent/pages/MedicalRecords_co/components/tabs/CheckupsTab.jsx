import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  FaCalendarCheck,
  FaExclamationCircle,
  FaInfoCircle,
  FaCalendarAlt,
  FaChevronRight,
  FaSync,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import medicalService from "../../../../../../services/medicalService";
import { formatDate } from "../../utils/formatters";
import { cacheData, getCachedData } from "../../utils/helpers";
import CheckupModal from "../modals/CheckupModal";

const CheckupsTab = ({ studentId }) => {
  const [checkups, setCheckups] = useState([]);
  const [isLoadingCheckups, setIsLoadingCheckups] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [checkupsError, setCheckupsError] = useState(null);
  const [selectedCheckup, setSelectedCheckup] = useState(null);
  const [isCheckupModalOpen, setIsCheckupModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"

  // Refs for managing intervals and component state
  const refreshIntervalRef = useRef(null);
  const componentMountedRef = useRef(true);

  // Fetch checkups function with auto-refresh support
  const fetchCheckups = useCallback(
    async (isRefresh = false) => {
      if (!studentId || !componentMountedRef.current) {
        if (!isRefresh) setIsLoadingCheckups(false);
        return;
      }

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoadingCheckups(true);
      }
      setCheckupsError(null);

      try {
        console.log(
          "Fetching checkups for student:",
          studentId,
          isRefresh ? "(refresh)" : "(initial)"
        );
        const response = await medicalService.getMedicalCheckups(studentId);
        console.log("Checkups response:", response);

        // API trả về array trực tiếp
        const checkupsData = Array.isArray(response)
          ? response
          : response.data || [];

        if (componentMountedRef.current) {
          setCheckups(checkupsData);
          setLastUpdated(new Date());
        }
        console.log("Checkups data:", checkupsData);
      } catch (err) {
        console.error("Error fetching checkups:", err);
        if (componentMountedRef.current) {
          setCheckupsError(
            "Không thể tải dữ liệu kiểm tra sức khỏe. Vui lòng thử lại sau."
          );
        }
      } finally {
        if (componentMountedRef.current) {
          if (isRefresh) {
            setIsRefreshing(false);
          } else {
            setIsLoadingCheckups(false);
          }
        }
      }
    },
    [studentId]
  );

  // Manual refresh function
  const handleManualRefresh = useCallback(() => {
    fetchCheckups(true);
  }, [fetchCheckups]);

  useEffect(() => {
    componentMountedRef.current = true;

    if (studentId) {
      // Fetch initial data
      fetchCheckups(false);

      // Setup auto-refresh every 45 seconds for checkups
      refreshIntervalRef.current = setInterval(() => {
        fetchCheckups(true);
      }, 45000);
    }

    // Cleanup function
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [studentId, fetchCheckups]);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      componentMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const openCheckupModal = (checkup) => {
    console.log("Opening modal for checkup:", checkup);
    setSelectedCheckup(checkup);
    setIsCheckupModalOpen(true);
  };

  const closeCheckupModal = () => {
    setIsCheckupModalOpen(false);
    setSelectedCheckup(null);
  };

  // Sort checkups by date using useMemo for proper re-rendering
  const sortedCheckups = useMemo(() => {
    return [...checkups].sort((a, b) => {
      const dateA = new Date(a.checkupDate || a.createdAt || a.date);
      const dateB = new Date(b.checkupDate || b.createdAt || b.date);

      if (sortOrder === "newest") {
        return dateB - dateA; // Newest first
      } else {
        return dateA - dateB; // Oldest first
      }
    });
  }, [checkups, sortOrder]);

  // Toggle sort order
  const toggleSortOrder = () => {
    const newOrder = sortOrder === "newest" ? "oldest" : "newest";
    console.log(
      "🔄 Toggling checkups sort order from",
      sortOrder,
      "to",
      newOrder
    );
    console.log("📋 Current checkups data:", checkups);
    setSortOrder(newOrder);
  };

  return (
    <div className="checkups-panel">
      <div className="checkups-header">
        <div className="checkups-title-section">
          <h3>Lịch sử kiểm tra sức khỏe định kỳ</h3>
          {/* {lastUpdated && (
            <div className="last-updated">
              Cập nhật: {lastUpdated.toLocaleTimeString("vi-VN")}
            </div>
          )} */}
        </div>
        <div className="checkups-controls">
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
            title="Làm mới dữ liệu kiểm tra sức khỏe"
          >
            <FaSync className={isRefreshing ? "spin" : ""} />
            <span>{isRefreshing ? "Đang tải..." : "Làm mới"}</span>
          </button>
        </div>
      </div>

      {checkupsError ? (
        <div className="error-message">
          <FaExclamationCircle /> {checkupsError}
        </div>
      ) : isLoadingCheckups ? (
        <div className="data-loading">
          <div className="loading-spinner small"></div>
          <p>Đang tải dữ liệu kiểm tra sức khỏe...</p>
        </div>
      ) : checkups.length === 0 ? (
        <div className="no-data-message">
          <FaInfoCircle />
          <h4>Chưa có thông tin kiểm tra sức khỏe định kỳ</h4>
          <p>
            Học sinh chưa có thông tin kiểm tra sức khỏe định kỳ trong hệ thống.
          </p>
          <p>
            Các dữ liệu sẽ được cập nhật sau mỗi đợt khám sức khỏe tại trường.
          </p>
        </div>
      ) : (
        <div className="checkups-list-simple">
          {sortedCheckups.map((checkup) => (
            <div
              className="checkup-row"
              key={checkup.id}
              onClick={() => openCheckupModal(checkup)}
            >
              <div className="checkup-row-content">
                <div className="checkup-date">
                  <FaCalendarAlt className="date-icon" />
                  <span>{formatDate(checkup.checkupDate)}</span>
                </div>
                <div className="checkup-type">
                  <span>{checkup.checkupType || "Kiểm tra định kỳ"}</span>
                </div>
              </div>
              <FaChevronRight className="arrow-icon" />
            </div>
          ))}
        </div>
      )}

      {/* Modal for checkup details */}
      {isCheckupModalOpen && selectedCheckup && (
        <CheckupModal
          isOpen={isCheckupModalOpen}
          onClose={closeCheckupModal}
          checkup={selectedCheckup}
        />
      )}
    </div>
  );
};

export default CheckupsTab;
