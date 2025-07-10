import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
// Import mới của CSS
import "./styles/index.css";
import { useStudentData } from "../../../../context/StudentDataContext";
import medicalService from "../../../../services/medicalService";
import eventBus from "../../../../services/eventBus";
import {
  FaPrint,
  FaArrowLeft,
  FaTimes,
  FaImage,
  FaUser,
  FaHeartbeat,
  FaChevronDown,
  FaSpinner,
  FaExclamationTriangle,
  FaSync,
} from "react-icons/fa";

// Import các component khác
import ErrorBoundary from "../../../../components/ErrorBoundary";
import TabNavigation from "./components/TabNavigation";
import GeneralTab from "./components/tabs/GeneralTab";
import CheckupsTab from "./components/tabs/CheckupsTab";
import VaccinationsTab from "./components/tabs/VaccinationsTab";
import IncidentsTab from "./components/tabs/IncidentsTab";
import GrowthTab from "./components/tabs/GrowthTab";

// Import utils
import { cacheData, getCachedData } from "./utils/helpers";

const MedicalRecord = () => {
  const { healthProfileId } = useParams();
  const navigate = useNavigate();
  const { students, parentInfo } = useStudentData();

  // State management - đơn giản hóa
  const [activeTab, setActiveTab] = useState("general");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [healthProfileData, setHealthProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Refs for managing intervals and component state
  const refreshIntervalRef = useRef(null);
  const componentMountedRef = useRef(true);

  // Modal handlers
  const openImageModal = (imageUrl) => {
    setModalImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  // Khởi tạo selectedStudent
  useEffect(() => {
    if (!students || students.length === 0) {
      setIsLoading(false);
      return;
    }

    let foundStudent = students.find(
      (s) => s && String(s.id) === String(healthProfileId)
    );

    if (!foundStudent && students.length > 0) {
      foundStudent = students[0];
    }

    setSelectedStudent(foundStudent || null);
    setSelectedStudentId(foundStudent ? foundStudent.id : null);
  }, [students, healthProfileId]);

  // Fetch dữ liệu sức khỏe - đơn giản hóa với auto-refresh
  const fetchHealthProfile = useCallback(
    async (isRefresh = false) => {
      // Kiểm tra xem có học sinh được chọn không và component còn mounted không
      if (!selectedStudent || !componentMountedRef.current) {
        if (!isRefresh) {
          setIsLoading(false);
          if (!selectedStudent) {
            setError(
              "Không tìm thấy thông tin học sinh. Vui lòng chọn học sinh khác."
            );
          }
        }
        return;
      }

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        console.log(
          "Fetching health profile for student:",
          selectedStudent.studentId,
          isRefresh ? "(refresh)" : "(initial)"
        );
        // Sử dụng studentId hoặc id tùy thuộc vào API yêu cầu gì
        const studentIdentifier =
          selectedStudent.studentId || selectedStudent.id;
        console.log(
          "Using student identifier for API call:",
          studentIdentifier
        );

        const response = await medicalService.getHealthProfile(
          studentIdentifier
        );

        if (componentMountedRef.current) {
          setHealthProfileData(response);
          setLastUpdated(new Date());
        }
      } catch (err) {
        console.error("Error fetching health profile:", err);
        if (componentMountedRef.current) {
          setError("Không thể tải dữ liệu hồ sơ sức khỏe. Vui lòng thử lại.");
          setHealthProfileData(null);
        }
      } finally {
        if (componentMountedRef.current) {
          if (isRefresh) {
            setIsRefreshing(false);
          } else {
            setIsLoading(false);
          }
        }
      }
    },
    [selectedStudent?.studentId]
  );

  // Manual refresh function
  const handleManualRefresh = useCallback(() => {
    fetchHealthProfile(true);
  }, [fetchHealthProfile]);

  // Effect để fetch data khi selectedStudent thay đổi với auto-refresh
  useEffect(() => {
    componentMountedRef.current = true;

    if (selectedStudent?.studentId) {
      // Fetch initial data
      fetchHealthProfile(false);

      // Setup auto-refresh every 60 seconds for general health profile
      refreshIntervalRef.current = setInterval(() => {
        fetchHealthProfile(true);
      }, 60000);
    }

    // Cleanup function
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [selectedStudent?.studentId, fetchHealthProfile]);

  // Effect để refetch khi chuyển về tab general
  useEffect(() => {
    if (activeTab === "general" && selectedStudent?.studentId) {
      fetchHealthProfile(false);
    }
  }, [activeTab, selectedStudent?.studentId, fetchHealthProfile]);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      componentMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Handler cho việc thay đổi học sinh
  const handleStudentChange = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    const student = students.find(
      (s) => s && String(s.id) === String(selectedId)
    );
    if (!student) return;

    // Cập nhật state
    setSelectedStudent(student);
    setSelectedStudentId(student.id);

    // Log thông tin để debug
    console.log("Selected student:", student);
    console.log("Navigating to:", `/parent/health-profile/${student.id}`);

    // Sử dụng đúng route pattern với prefix /parent/ và không dùng /student/
    // Vì route được config là /parent/health-profile/:healthProfileId
    navigate(`/parent/health-profile/${student.id}`, { replace: true });
  };

  // Loading state
  if (!students) {
    return (
      <div className="medical-loading">
        <div className="loading-content">
          <FaSpinner className="loading-spinner" />
          <p>Đang tải danh sách học sinh...</p>
        </div>
      </div>
    );
  }

  // No students state
  if (students.length === 0 || !selectedStudent) {
    return (
      <div className="medical-error">
        <div className="error-content">
          <FaExclamationTriangle className="error-icon" />
          <h2>Không tìm thấy thông tin học sinh</h2>
          <p>Vui lòng kiểm tra lại thông tin hoặc liên hệ nhà trường.</p>
          <Link to="/parent/student-profile" className="btn-primary">
            <FaArrowLeft />
            Quay lại hồ sơ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="medical-container">
        {/* Header */}
        <header className="medical-header">
          <div className="header-content">
            <div className="header-left">
              <div className="header-icon">
                <FaHeartbeat />
              </div>
              <div className="header-info">
                <h1>Hồ Sơ Y Tế</h1>
                <p>Theo dõi sức khỏe học sinh toàn diện</p>
              </div>
            </div>

            <div className="header-actions">
              {selectedStudent?.studentId && (
                <button
                  className={`refresh-btn ${isRefreshing ? "refreshing" : ""}`}
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  title="Làm mới dữ liệu hồ sơ y tế"
                >
                  <FaSync className={isRefreshing ? "spin" : ""} />
                  <span>{isRefreshing ? "Đang tải..." : "Làm mới"}</span>
                </button>
              )}

              <Link to="/parent/student-profile" className="back-btn">
                <FaArrowLeft />
                <span>Trở về</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="medical-main">
          {/* Student Selector */}
          <section className="student-section">
            <div className="student-selector">
              <div className="selector-header">
                <h2>Chọn học sinh</h2>
                <p>Xem hồ sơ y tế của học sinh</p>
              </div>

              <div className="selector-content">
                <div className="select-wrapper">
                  <select
                    className="student-select"
                    value={selectedStudentId || ""}
                    onChange={handleStudentChange}
                    disabled={isLoading}
                  >
                    <option value="">-- Chọn học sinh --</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.fullName} - {student.studentId} (
                        {student.className})
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className="select-arrow" />
                </div>
              </div>
            </div>

            {/* Selected Student Info */}
            {selectedStudent && (
              <div className="student-info">
                <div className="student-avatar">
                  <FaUser />
                </div>
                <div className="student-details">
                  <h3>{selectedStudent.fullName}</h3>
                  <div className="student-meta">
                    <span className="meta-item">
                      Mã HS: {selectedStudent.studentId}
                    </span>
                    <span className="meta-item">
                      Lớp: {selectedStudent.className}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Content */}
          <section className="content-section">
            <div className="content-header">
              <h2>
                {activeTab === "general" && "Thông tin sức khỏe tổng quát"}
                {activeTab === "checkups" && "Kiểm tra sức khỏe định kỳ"}
                {activeTab === "vaccinations" && "Tiêm chủng"}
                {activeTab === "incidents" && "Sự cố y tế"}
                {activeTab === "growth" && "Biểu đồ tăng trưởng"}
              </h2>

              {/* Tab Navigation trong content header */}
              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <div className="content-body">
              {activeTab === "general" && (
                <GeneralTab
                  healthProfileData={healthProfileData}
                  isLoading={isLoading}
                  error={error}
                  studentId={selectedStudent?.studentId}
                  onRefresh={fetchHealthProfile}
                />
              )}

              {activeTab === "checkups" && (
                <CheckupsTab studentId={selectedStudentId} />
              )}

              {activeTab === "vaccinations" && (
                <VaccinationsTab
                  studentId={selectedStudentId}
                  parentInfo={parentInfo}
                  studentCode={selectedStudent?.studentId}
                />
              )}

              {activeTab === "incidents" && (
                <IncidentsTab studentId={selectedStudentId} />
              )}

              {activeTab === "growth" && (
                <GrowthTab studentId={selectedStudentId} />
              )}
            </div>
          </section>

          {/* Print Button */}
          <div className="print-section">
            <button className="print-btn" onClick={() => window.print()}>
              <FaPrint />
              <span>In hồ sơ y tế</span>
            </button>
          </div>
        </main>

        {/* Image Modal */}
        {isModalOpen && (
          <div className="image-modal" onClick={closeImageModal}>
            <div className="modal-backdrop"></div>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeImageModal}>
                <FaTimes />
              </button>
              {modalImage ? (
                <img
                  src={modalImage}
                  alt="Hình ảnh y tế"
                  className="modal-image"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div className="image-error" style={{ display: "none" }}>
                <FaImage />
                <p>Không thể tải hình ảnh</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default MedicalRecord;
