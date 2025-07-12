import React, { useState, useEffect, useCallback } from "react";
import {
  FaExclamationCircle,
  FaInfoCircle,
  FaSyncAlt,
  FaRulerVertical,
  FaWeight,
  FaChartLine,
  FaHeartbeat,
  FaEye,
  FaStethoscope,
  FaAllergies,
  FaNotesMedical,
  FaUtensils,
  FaShieldVirus,
  FaWheelchair,
  FaPhoneVolume,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { formatDate, formatDateTime } from "../../utils/formatters";
import { getBMIStatus } from "../../utils/helpers";
import medicalService from "../../../../../../services/medicalService";

// Function để lấy status và màu cho tình trạng tiêm chủng
const getImmunizationStatus = (status) => {
  if (!status)
    return { text: "Chưa có thông tin", className: "status-unknown" };

  const statusLower = status.toLowerCase();

  if (
    statusLower.includes("đầy đủ") ||
    statusLower.includes("hoàn thành") ||
    statusLower.includes("bình thường")
  ) {
    return { text: status, className: "status-complete" };
  } else if (
    statusLower.includes("đang cập nhật") ||
    statusLower.includes("cập nhật")
  ) {
    return { text: status, className: "status-updating" };
  } else if (
    statusLower.includes("chưa đầy đủ") ||
    statusLower.includes("thiếu") ||
    statusLower.includes("chưa hoàn thành")
  ) {
    return { text: status, className: "status-incomplete" };
  } else {
    return { text: status, className: "status-unknown" };
  }
};

const GeneralTab = ({
  healthProfileData,
  isLoading,
  error,
  studentId,
  onRefresh,
}) => {
  const [mergedHealthData, setMergedHealthData] = useState(null);
  const [checkupsData, setCheckupsData] = useState([]);

  // Pagination states for vaccination history
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Function to merge health profile with latest checkup data
  const mergeHealthDataWithCheckups = useCallback((profileData, checkups) => {
    if (!profileData || !checkups || checkups.length === 0) {
      return profileData;
    }

    // Find the latest checkup with comprehensive data
    const latestCheckup = checkups
      .filter(
        (checkup) => checkup.checkupDate && (checkup.height || checkup.weight)
      )
      .sort((a, b) => new Date(b.checkupDate) - new Date(a.checkupDate))[0];

    if (!latestCheckup) return profileData;

    // Get the dates for comparison
    const profileDate =
      profileData.lastPhysicalExamDate || profileData.lastUpdated;
    const checkupDate = latestCheckup.checkupDate;

    // If checkup is newer than profile data, merge the data
    if (new Date(checkupDate) > new Date(profileDate)) {
      console.log("Merging newer checkup data into health profile:", {
        profileDate,
        checkupDate,
        latestCheckup,
      });

      return {
        ...profileData,
        // Update physical measurements from checkup if available
        height: latestCheckup.height || profileData.height,
        weight: latestCheckup.weight || profileData.weight,
        bmi: latestCheckup.bmi || profileData.bmi,
        bloodPressure: latestCheckup.bloodPressure || profileData.bloodPressure,
        heartRate: latestCheckup.heartRate || profileData.heartRate,
        temperature: latestCheckup.temperature || profileData.temperature,
        visionLeft: latestCheckup.visionLeft || profileData.visionLeft,
        visionRight: latestCheckup.visionRight || profileData.visionRight,
        // Update dates
        lastPhysicalExamDate: checkupDate,
        lastUpdated: checkupDate,
        // Add source info
        _mergedFromCheckup: true,
        _checkupId: latestCheckup.id,
      };
    }

    return profileData;
  }, []);

  // Fetch checkups data to compare with health profile
  useEffect(() => {
    if (!studentId) return;

    const fetchCheckupsForMerging = async () => {
      try {
        console.log(
          "Fetching checkups for merging with health profile:",
          studentId
        );
        const response = await medicalService.getMedicalCheckupsForGeneral(
          studentId
        );
        const checkupsArray = Array.isArray(response)
          ? response
          : response.data || [];
        setCheckupsData(checkupsArray);
      } catch (err) {
        console.error("Error fetching checkups for merging:", err);
        // Don't show error to user as this is background data merging
      }
    };

    fetchCheckupsForMerging();
  }, [studentId]);

  // Merge health profile data with latest checkup data when either changes
  useEffect(() => {
    const healthProfile = healthProfileData?.healthProfile;
    const merged = mergeHealthDataWithCheckups(healthProfile, checkupsData);
    setMergedHealthData(merged);
  }, [
    healthProfileData?.healthProfile,
    checkupsData,
    mergeHealthDataWithCheckups,
  ]);

  // Use merged data for display
  const displayHealthData =
    mergedHealthData || healthProfileData?.healthProfile;
  const vaccinationsData = healthProfileData?.vaccinations || [];

  // Pagination logic for vaccinations
  const totalPages = Math.ceil(vaccinationsData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVaccinations = vaccinationsData.slice(startIndex, endIndex);

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [vaccinationsData.length]);

  return (
    <div>
      {error ? (
        <div className="error-message">
          <FaExclamationCircle /> {error}
          <button className="refresh-btn" onClick={onRefresh}>
            <FaSyncAlt /> Thử lại
          </button>
        </div>
      ) : isLoading ? (
        <div className="data-loading">
          <div className="loading-spinner small"></div>
          <p>Đang tải dữ liệu sức khỏe...</p>
        </div>
      ) : !displayHealthData ? (
        <div className="no-data-message">
          <FaInfoCircle />
          <h4>Chưa có thông tin sức khỏe</h4>
          <p>Học sinh chưa có thông tin sức khỏe trong hệ thống.</p>
          <p>Vui lòng thực hiện khai báo sức khỏe để cập nhật thông tin.</p>
        </div>
      ) : (
        <>
          {/* Hiển thị thời gian cập nhật gần nhất */}
          {displayHealthData && displayHealthData.lastUpdated && (
            <div className="last-update-info">
              <p>
                Cập nhật lần cuối:{" "}
                <strong>{formatDateTime(displayHealthData.lastUpdated)}</strong>
                {displayHealthData._mergedFromCheckup && (
                  <span
                    className="merge-indicator"
                    title="Dữ liệu được cập nhật từ kết quả kiểm tra sức khỏe định kỳ mới nhất"
                  >
                    {" "}
                    (từ kiểm tra định kỳ)
                  </span>
                )}
              </p>
              {displayHealthData.lastPhysicalExamDate && (
                <p>
                  Ngày khám gần nhất:{" "}
                  <strong>
                    {formatDate(displayHealthData.lastPhysicalExamDate)}
                  </strong>
                </p>
              )}
            </div>
          )}

          {/* Phần hiển thị thông tin sức khỏe cơ bản */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon height">
                <FaRulerVertical />
              </div>
              <div className="stat-content">
                <h3>Chiều cao</h3>
                <div className="value">{displayHealthData?.height || 0}</div>
                <div className="unit">cm</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon weight">
                <FaWeight />
              </div>
              <div className="stat-content">
                <h3>Cân nặng</h3>
                <div className="value">{displayHealthData?.weight || 0}</div>
                <div className="unit">kg</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon bmi">
                <FaChartLine />
              </div>
              <div className="stat-content">
                <h3>Chỉ số BMI</h3>
                <div className="value">
                  {displayHealthData?.bmi
                    ? Number(displayHealthData.bmi).toFixed(1)
                    : "N/A"}
                </div>
                <div className="unit">
                  {getBMIStatus(displayHealthData?.bmi)}
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon blood">
                <FaHeartbeat />
              </div>
              <div className="stat-content">
                <h3>Nhóm máu</h3>
                <div className="value">
                  {displayHealthData?.bloodType || "Chưa có"}
                </div>
                <div className="unit">-</div>
              </div>
            </div>
          </div>

          {/* Phần hiển thị chi tiết thông tin sức khỏe */}
          <div className="info-grid">
            <div className="info-card">
              <div className="info-card-header">
                <FaEye className="info-card-icon" />
                <h4 className="info-card-title">Thị lực</h4>
              </div>
              <div className="info-card-content">
                <div className="vision-content">
                  <div className="vision-item">
                    <span className="vision-label">Mắt trái:</span>
                    <span className="vision-value">
                      {displayHealthData?.visionLeft || "20/20"}
                    </span>
                  </div>
                  <div className="vision-item">
                    <span className="vision-label">Mắt phải:</span>
                    <span className="vision-value">
                      {displayHealthData?.visionRight || "20/20"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-header">
                <FaStethoscope className="info-card-icon" />
                <h4 className="info-card-title">Thính lực</h4>
              </div>
              <div className="info-card-content">
                {displayHealthData?.hearingStatus || "Bình thường"}
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-header">
                <FaAllergies className="info-card-icon" />
                <h4 className="info-card-title">Dị ứng</h4>
              </div>
              <div className="info-card-content">
                {displayHealthData?.allergies || "Không có"}
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-header">
                <FaNotesMedical className="info-card-icon" />
                <h4 className="info-card-title">Bệnh mãn tính</h4>
              </div>
              <div className="info-card-content">
                {displayHealthData?.chronicDiseases || "Không có"}
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-header">
                <FaUtensils className="info-card-icon" />
                <h4 className="info-card-title">Chế độ ăn uống đặc biệt</h4>
              </div>
              <div className="info-card-content">
                {displayHealthData?.dietaryRestrictions ||
                  "Không có hạn chế đặc biệt"}
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-header">
                <FaShieldVirus className="info-card-icon" />
                <h4 className="info-card-title">Tình trạng tiêm chủng</h4>
              </div>
              <div className="info-card-content">
                <div className="immunization-status">
                  {(() => {
                    const statusInfo = getImmunizationStatus(
                      displayHealthData?.immunizationStatus
                    );
                    return (
                      <span className={`status-badge ${statusInfo.className}`}>
                        {statusInfo.text}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-header">
                <FaWheelchair className="info-card-icon" />
                <h4 className="info-card-title">Nhu cầu đặc biệt</h4>
              </div>
              <div className="info-card-content">
                {displayHealthData?.specialNeeds || "Không có"}
              </div>
            </div>

            <div className="info-card emergency-info">
              <div className="info-card-header">
                <FaPhoneVolume className="info-card-icon" />
                <h4 className="info-card-title">Thông tin liên hệ khẩn cấp</h4>
              </div>
              <div className="info-card-content">
                {displayHealthData?.emergencyContactInfo || "Chưa cập nhật"}
              </div>
            </div>
          </div>

          {/* Phần hiển thị thông tin tiêm chủng từ API mới */}
          {vaccinationsData && vaccinationsData.length > 0 && (
            <div className="vaccination-section">
              <h3>Lịch sử tiêm chủng</h3>
              <div className="vaccination-list">
                {currentVaccinations.map((vaccination) => (
                  <div key={vaccination.id} className="vaccination-item">
                    <div className="vaccination-header">
                      <span className="vaccine-name-primary">
                        {vaccination.vaccineName || "Chưa xác định"}
                      </span>
                      <span className="dose-info">
                        Mũi {vaccination.doseNumber || "N/A"}
                      </span>
                    </div>
                    <div className="vaccination-details">
                      {vaccination.vaccinationDate ? (
                        <>
                          <div className="vaccination-status">
                            <span className="status-completed">✅ Đã tiêm</span>
                            <span className="vaccination-date">
                              {formatDate(vaccination.vaccinationDate)}
                            </span>
                          </div>
                          <div className="vaccination-location">
                            <strong>Nơi tiêm:</strong>{" "}
                            {vaccination.administeredAt}
                          </div>
                          {/* {vaccination.notes && (
                            <div className="vaccination-notes">
                              <strong>Ghi chú:</strong> {vaccination.notes}
                            </div>
                          )} */}
                          {vaccination.nextDoseDate && (
                            <div className="next-dose">
                              <strong>Mũi tiếp theo:</strong>{" "}
                              {formatDate(vaccination.nextDoseDate)}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="vaccination-status">
                          <span className="status-pending">⏳ Chưa tiêm</span>
                          {vaccination.nextDoseDate && (
                            <span className="next-dose-date">
                              Dự kiến: {formatDate(vaccination.nextDoseDate)}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="vaccination-type-badge">
                        <span
                          className={`type-${vaccination.vaccinationType?.toLowerCase()}`}
                        >
                          {vaccination.vaccinationType === "SCHOOL_PLAN"
                            ? "Kế hoạch trường"
                            : vaccination.vaccinationType === "PARENT_DECLARED"
                            ? "Phụ huynh khai báo"
                            : vaccination.vaccinationType || "Không rõ"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button onClick={goToPrevPage} disabled={currentPage === 1}>
                    <FaChevronLeft /> Trước
                  </button>
                  <span>
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Tiếp <FaChevronRight />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GeneralTab;
