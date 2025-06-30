import React, { useState, useEffect } from "react";
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
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { students, parentInfo } = useStudentData();

  // State management - đơn giản hóa
  const [activeTab, setActiveTab] = useState("general");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [healthProfileData, setHealthProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      (s) => s && String(s.id) === String(studentId)
    );

    if (!foundStudent && students.length > 0) {
      foundStudent = students[0];
    }

    setSelectedStudent(foundStudent || null);
    setSelectedStudentId(foundStudent ? foundStudent.id : null);
  }, [students, studentId]);

  // Fetch dữ liệu sức khỏe - đơn giản hóa
  const fetchHealthProfile = async () => {
    if (!selectedStudentId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching health profile for student:", selectedStudentId);
      const response = await medicalService.getHealthProfile(selectedStudentId);
      setHealthProfileData(response);
    } catch (err) {
      console.error("Error fetching health profile:", err);
      setError("Không thể tải dữ liệu hồ sơ sức khỏe. Vui lòng thử lại.");
      setHealthProfileData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect để fetch data khi selectedStudentId thay đổi
  useEffect(() => {
    if (selectedStudentId) {
      fetchHealthProfile();
    }
  }, [selectedStudentId]);

  // Effect để refetch khi chuyển về tab general
  useEffect(() => {
    if (activeTab === "general" && selectedStudentId) {
      fetchHealthProfile();
    }
  }, [activeTab]);

  // Handler cho việc thay đổi học sinh
  const handleStudentChange = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    const student = students.find(
      (s) => s && String(s.id) === String(selectedId)
    );
    if (!student) return;

    setSelectedStudent(student);
    setSelectedStudentId(student.id);
    navigate(`/health-profile/student/${student.id}`, { replace: true });
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
                  studentId={selectedStudentId}
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
