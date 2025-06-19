import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./MedicalRecords.css";
import { useStudentData } from "../../../../context/StudentDataContext";
import api from "../../../../services/api";
import eventBus from "../../../../services/eventBus";
import medicalService from "../../../../services/medicalService";
import {
  FaHeartbeat,
  FaSyringe,
  FaWeight,
  FaRulerVertical,
  FaFileMedicalAlt,
  FaCalendarCheck,
  FaEye,
  FaTooth,
  FaStethoscope,
  FaAllergies,
  FaUserMd,
  FaNotesMedical,
  FaPrint,
  FaArrowLeft,
  FaHome,
  FaBandAid, // Icon phù hợp cho sự cố y tế
  FaProcedures,
  FaChartLine,
  FaUserGraduate,
  FaExchangeAlt,
} from "react-icons/fa";

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <h2>Đã xảy ra lỗi khi tải hồ sơ y tế</h2>
          <p>Vui lòng thử lại hoặc liên hệ hỗ trợ kỹ thuật.</p>
          <Link to="/parent/student-profile" className="btn-primary">
            Quay lại trang hồ sơ học sinh
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}

const MedicalRecord = () => {
  // Sử dụng useParams để lấy healthProfileId từ URL
  const { healthProfileId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");

  // State cho dữ liệu tổng quát (General Health)
  const [isLoadingGeneral, setIsLoadingGeneral] = useState(true);
  const [healthProfileData, setHealthProfileData] = useState(null);
  const [healthProfileError, setHealthProfileError] = useState(null);

  // State cho lịch sử kiểm tra (Checkups)
  const [isLoadingCheckups, setIsLoadingCheckups] = useState(false);
  const [checkupsData, setCheckupsData] = useState([]);
  const [checkupsError, setCheckupsError] = useState(null);

  // Thêm state cho sự cố y tế
  const [medicalIncidents, setMedicalIncidents] = useState([]);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(false);
  const [incidentsError, setIncidentsError] = useState(null);

  // DI CHUYỂN 2 HOOK NÀY LÊN ĐÂY
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [hasInitialized, setHasInitialized] = useState(false);

  // Lấy thông tin học sinh từ context
  const { students, isLoading: studentsLoading } = useStudentData();

  // State lưu trữ học sinh được chọn và ID của học sinh
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Thêm các hàm xử lý modal ảnh
  const openImageModal = (imageUrl) => {
    setModalImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  // Khởi tạo selectedStudent dựa vào healthProfileId từ URL
  useEffect(() => {
    if (studentsLoading) return;

    if (!hasInitialized && students && students.length > 0) {
      console.log("Initializing selected student");

      let foundStudent = null;

      if (healthProfileId) {
        // Tìm học sinh theo healthProfileId từ URL
        foundStudent = students.find((student) => {
          if (!student) return false;

          // So sánh cả string và number
          const profileId = student.healthProfileId;
          return (
            profileId && profileId.toString() === healthProfileId.toString()
          );
        });

        console.log("Found student by healthProfileId:", foundStudent);
      }

      if (!foundStudent) {
        foundStudent = students[0];
        console.log("Using first student as fallback:", foundStudent);
      }

      if (foundStudent) {
        setSelectedStudent(foundStudent);
        setSelectedStudentId(foundStudent.id);
      }

      setHasInitialized(true);
    }
  }, [students, healthProfileId, studentsLoading, hasInitialized]);

  // Handler cho sự kiện thay đổi học sinh
  const handleStudentChange = (e) => {
    try {
      const selectedId = parseInt(e.target.value);
      console.log("Selected student ID from dropdown:", selectedId);

      const student = students.find((s) => s && s.id === selectedId);

      if (!student) {
        console.error("Could not find student with ID:", selectedId);
        return;
      }

      console.log("Setting selected student to:", student);
      setSelectedStudent(student);
      setSelectedStudentId(student.id);

      // Cập nhật URL nếu có healthProfileId
      if (student.healthProfileId) {
        navigate(`/parent/health-profile/${student.healthProfileId}`, {
          replace: true,
        });
      }
    } catch (err) {
      console.error("Error in handleStudentChange:", err);
    }
  };

  // Fetch dữ liệu sức khỏe tổng quát từ API khi selectedStudentId thay đổi
  useEffect(() => {
    if (!selectedStudentId) return;

    const fetchHealthProfileData = async () => {
      setIsLoadingGeneral(true);
      setHealthProfileError(null);

      try {
        console.log(
          `Fetching health profile data for student ID: ${selectedStudentId}`
        );

        // Sử dụng API endpoint mới cho health profile
        const response = await api.get(
          `/api/health-profiles/student/${selectedStudentId}`
        );
        console.log("Health profile response:", response);

        if (response.data) {
          setHealthProfileData(response.data);
        } else {
          console.log("No health profile data available");
          setHealthProfileData(null);
        }
      } catch (err) {
        console.error("Error fetching health profile data:", err);
        setHealthProfileError(
          "Không thể tải dữ liệu sức khỏe tổng quát. Vui lòng thử lại sau."
        );
        setHealthProfileData(null);
      } finally {
        setIsLoadingGeneral(false);
      }
    };

    fetchHealthProfileData();
  }, [selectedStudentId]);

  // Fetch dữ liệu kiểm tra định kỳ khi chuyển tab
  useEffect(() => {
    if (!selectedStudentId || activeTab !== "checkups") return;

    const fetchCheckupsData = async () => {
      setIsLoadingCheckups(true);
      setCheckupsError(null);

      try {
        console.log(
          `Fetching medical checkups for student ID: ${selectedStudentId}`
        );

        // Sử dụng API endpoint cho medical checkups
        const response = await api.get(
          `/api/medical-checkups/student/${selectedStudentId}`
        );
        console.log("Checkups data response:", response.data);

        if (response.data && response.data.length > 0) {
          // Sắp xếp theo ngày khám mới nhất đến cũ nhất
          const sortedCheckups = response.data.sort(
            (a, b) => new Date(b.checkupDate) - new Date(a.checkupDate)
          );

          setCheckupsData(sortedCheckups);
        } else {
          console.log("No checkups data available");
          setCheckupsData([]);
        }
      } catch (err) {
        console.error("Error fetching checkups data:", err);
        setCheckupsError(
          "Không thể tải dữ liệu kiểm tra định kỳ. Vui lòng thử lại sau."
        );
        setCheckupsData([]);
      } finally {
        setIsLoadingCheckups(false);
      }
    };

    fetchCheckupsData();
  }, [selectedStudentId, activeTab]);

  // Fetch dữ liệu sự cố y tế khi chuyển tab
  useEffect(() => {
    if (!selectedStudentId || activeTab !== "incidents") return;

    const fetchMedicalIncidents = async () => {
      setIsLoadingIncidents(true);
      setIncidentsError(null);

      try {
        console.log(
          `Fetching medical incidents for student ID: ${selectedStudentId}`
        );

        // Gọi API sự cố y tế
        const response = await medicalService.getMedicalIncidents(
          selectedStudentId
        );
        console.log("Medical incidents response:", response.data);

        if (response.data && response.data.length > 0) {
          // Sắp xếp theo thời gian mới nhất đến cũ nhất
          const sortedIncidents = response.data.sort(
            (a, b) => new Date(b.dateTime) - new Date(a.dateTime)
          );

          setMedicalIncidents(sortedIncidents);
        } else {
          console.log("No medical incidents available");
          setMedicalIncidents([]);
        }
      } catch (err) {
        console.error("Error fetching medical incidents:", err);
        setIncidentsError(
          "Không thể tải dữ liệu sự cố y tế. Vui lòng thử lại sau."
        );
        setMedicalIncidents([]);
      } finally {
        setIsLoadingIncidents(false);
      }
    };

    fetchMedicalIncidents();
  }, [selectedStudentId, activeTab]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Không có dữ liệu";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Không có dữ liệu";
    }
  };

  // Format datetime
  const formatDateTime = (dateString) => {
    if (!dateString) return "Không có dữ liệu";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (err) {
      console.error("Error formatting datetime:", err);
      return "Không có dữ liệu";
    }
  };

  // Format temperature - ensure it shows with one decimal place
  const formatTemperature = (temp) => {
    if (temp === null || temp === undefined) return "Không có dữ liệu";
    try {
      return temp.toFixed(1) + "°C";
    } catch (err) {
      console.error("Error formatting temperature:", err);
      return "Không có dữ liệu";
    }
  };

  // Thêm function fetchHealthProfile để lấy thông tin mới nhất
  const fetchHealthProfile = async () => {
    if (!selectedStudentId) return;

    setIsLoadingGeneral(true);
    setHealthProfileError(null);

    try {
      console.log(`Fetching health profile for student: ${selectedStudentId}`);

      // Thêm timestamp để tránh cache
      const timestamp = new Date().getTime();
      const response = await api.get(
        `health-profiles/student/${selectedStudentId}?_t=${timestamp}`
      );

      if (response.data) {
        console.log("Health profile data received:", response.data);
        setHealthProfileData(response.data);
      } else {
        setHealthProfileData(null);
        console.log("No health profile data available");
      }
    } catch (err) {
      console.error("Error fetching health profile:", err);
      setHealthProfileError(
        "Không thể tải thông tin sức khỏe tổng quát. Vui lòng thử lại sau."
      );
      setHealthProfileData(null);
    } finally {
      setIsLoadingGeneral(false);
    }
  };

  // Thêm useEffect để gọi API mỗi khi selectedStudentId thay đổi
  useEffect(() => {
    if (selectedStudentId) {
      fetchHealthProfile();
    }
  }, [selectedStudentId]);

  // Thêm useEffect để đăng ký lắng nghe sự kiện cập nhật hồ sơ sức khỏe
  useEffect(() => {
    const handleHealthProfileUpdate = (studentId) => {
      console.log(
        `Received healthProfileUpdated event for student ID: ${studentId}`
      );
      if (
        selectedStudentId &&
        parseInt(selectedStudentId) === parseInt(studentId)
      ) {
        console.log("Refreshing health profile due to update event");
        fetchHealthProfile();
      }
    };

    // Đăng ký lắng nghe sự kiện
    eventBus.subscribe("healthProfileUpdated", handleHealthProfileUpdate);

    // Hủy đăng ký khi component unmount
    return () => {
      eventBus.unsubscribe("healthProfileUpdated", handleHealthProfileUpdate);
    };
  }, [selectedStudentId]);

  // Hiển thị trạng thái loading
  if (studentsLoading || (isLoadingGeneral && !hasInitialized)) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải hồ sơ y tế...</p>
      </div>
    );
  }

  // Hiển thị thông báo nếu không có học sinh
  if (!selectedStudent && hasInitialized && !studentsLoading) {
    return (
      <div className="error-container">
        <h2>Không tìm thấy thông tin học sinh</h2>
        <p>
          Vui lòng quay lại sau khi hệ thống đã cập nhật thông tin học sinh.
        </p>
        <Link to="/parent/student-profile" className="btn-primary">
          Quay lại hồ sơ
        </Link>
      </div>
    );
  }

  // Render UI chính
  return (
    <div className="medical-record-container">
      <div className="medical-record-header">
        <div className="header-content">
          <h1>Hồ Sơ Y Tế</h1>

          {/* Chọn học sinh */}
          {students && students.length > 0 && (
            <div className="student-selector">
              <FaUserGraduate className="selector-icon" />
              <select
                value={selectedStudentId || ""}
                onChange={handleStudentChange}
                disabled={isLoadingGeneral || isLoadingCheckups}
              >
                {students.map(
                  (student) =>
                    student && (
                      <option key={student.id} value={student.id}>
                        {student.fullName || `Học sinh ${student.id}`}
                      </option>
                    )
                )}
              </select>
              <FaExchangeAlt className="selector-arrow" />
            </div>
          )}

          {selectedStudent && (
            <div className="student-basic-info">
              <h2>{selectedStudent.fullName || "Chưa có tên"}</h2>
              <p>
                {selectedStudent.studentId
                  ? `Mã học sinh: ${selectedStudent.studentId} | `
                  : ""}
                {selectedStudent.className
                  ? `Lớp: ${selectedStudent.className}`
                  : ""}
              </p>
            </div>
          )}
        </div>
        <Link to={`/parent/student-profile`} className="back-button">
          <FaArrowLeft /> Trở về hồ sơ
        </Link>
      </div>

      <div className="medical-nav-tabs">
        <button
          className={activeTab === "general" ? "active" : ""}
          onClick={() => setActiveTab("general")}
        >
          <FaHeartbeat /> Thông tin chung
        </button>
        <button
          className={activeTab === "checkups" ? "active" : ""}
          onClick={() => setActiveTab("checkups")}
        >
          <FaCalendarCheck /> Kiểm tra định kỳ
        </button>
        <button
          className={`coming-soon ${
            activeTab === "vaccinations" ? "active" : ""
          }`}
          onClick={() => alert("Tính năng đang được phát triển!")}
          title="Tính năng đang được phát triển"
        >
          <FaSyringe /> Tiêm chủng
        </button>
        <button
          className={activeTab === "incidents" ? "active" : ""} // Thay đổi history thành incidents
          onClick={() => setActiveTab("incidents")} // Thay đổi tên tab
        >
          <FaBandAid /> Sự cố y tế
        </button>
        <button
          className={`coming-soon ${activeTab === "growth" ? "active" : ""}`}
          onClick={() => alert("Tính năng đang được phát triển!")}
          title="Tính năng đang được phát triển"
        >
          <FaChartLine /> Tăng trưởng
        </button>
      </div>

      <div className="medical-content">
        {/* TAB THÔNG TIN CHUNG - Sử dụng Health Profile API */}
        {activeTab === "general" && (
          <div className="general-info-panel">
            <h3>Thông tin sức khỏe tổng quát</h3>

            {healthProfileError ? (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>{" "}
                {healthProfileError}
              </div>
            ) : isLoadingGeneral ? (
              <div className="data-loading">
                <div className="loading-spinner small"></div>
                <p>Đang tải dữ liệu sức khỏe...</p>
              </div>
            ) : !healthProfileData ? (
              <div className="no-data-message">
                <p>Chưa có thông tin sức khỏe tổng quát cho học sinh này.</p>
                <p>
                  Hệ thống sẽ cập nhật dữ liệu sau các đợt khám sức khỏe định
                  kỳ.
                </p>
              </div>
            ) : (
              <>
                {healthProfileData.lastUpdated && (
                  <div className="last-checkup-info">
                    <p>
                      Dữ liệu cập nhật lần cuối:{" "}
                      <strong>
                        {formatDateTime(healthProfileData.lastUpdated)}
                      </strong>
                    </p>
                  </div>
                )}

                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaRulerVertical />
                    </div>
                    <div className="stat-content">
                      <h4>Chiều cao</h4>
                      <p>{healthProfileData.height} cm</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaWeight />
                    </div>
                    <div className="stat-content">
                      <h4>Cân nặng</h4>
                      <p>{healthProfileData.weight} kg</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaWeight />
                    </div>
                    <div className="stat-content">
                      <h4>Chỉ số BMI</h4>
                      <p>{Number(healthProfileData.bmi).toFixed(1)}</p>
                      <small>{getBMIStatus(healthProfileData.bmi)}</small>
                    </div>
                  </div>

                  {healthProfileData.bloodType && (
                    <div className="stat-card">
                      <div className="stat-icon">
                        <FaHeartbeat />
                      </div>
                      <div className="stat-content">
                        <h4>Nhóm máu</h4>
                        <p>{healthProfileData.bloodType}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="medical-details-section">
                  <div className="medical-detail">
                    <h4>
                      <FaEye /> Thị lực
                    </h4>
                    <div className="detail-content">
                      <p>Mắt trái: {healthProfileData.visionLeft || "N/A"}</p>
                      <p>Mắt phải: {healthProfileData.visionRight || "N/A"}</p>
                    </div>
                  </div>

                  <div className="medical-detail">
                    <h4>
                      <FaStethoscope /> Thính lực
                    </h4>
                    <p>
                      {healthProfileData.hearingStatus || "Chưa có dữ liệu"}
                    </p>
                  </div>

                  {healthProfileData.dentalStatus && (
                    <div className="medical-detail">
                      <h4>
                        <FaTooth /> Tình trạng răng miệng
                      </h4>
                      <p>{healthProfileData.dentalStatus}</p>
                    </div>
                  )}

                  {healthProfileData.allergies && (
                    <div className="medical-detail">
                      <h4>
                        <FaAllergies /> Dị ứng
                      </h4>
                      <p>{healthProfileData.allergies}</p>
                    </div>
                  )}

                  {healthProfileData.chronicDiseases && (
                    <div className="medical-detail">
                      <h4>
                        <FaNotesMedical /> Bệnh mãn tính
                      </h4>
                      <p>{healthProfileData.chronicDiseases}</p>
                    </div>
                  )}

                  {healthProfileData.treatmentHistory && (
                    <div className="medical-detail">
                      <h4>
                        <FaFileMedicalAlt /> Lịch sử điều trị
                      </h4>
                      <p>{healthProfileData.treatmentHistory}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB KIỂM TRA ĐỊNH KỲ - Sử dụng Medical Checkups API */}
        {activeTab === "checkups" && (
          <div className="checkups-panel">
            <h3>Lịch sử kiểm tra sức khỏe định kỳ</h3>

            {checkupsError ? (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i> {checkupsError}
              </div>
            ) : isLoadingCheckups ? (
              <div className="data-loading">
                <div className="loading-spinner small"></div>
                <p>Đang tải dữ liệu kiểm tra định kỳ...</p>
              </div>
            ) : checkupsData.length === 0 ? (
              <div className="no-data-message">
                <p>
                  Chưa có thông tin kiểm tra sức khỏe định kỳ cho học sinh này.
                </p>
                <p>
                  Các dữ liệu sẽ được cập nhật sau mỗi đợt khám sức khỏe tại
                  trường.
                </p>
              </div>
            ) : (
              <div className="checkups-list">
                {checkupsData.map((checkup) => (
                  <div className="checkup-card" key={checkup.id}>
                    <div className="checkup-header">
                      <div className="checkup-date">
                        <i className="fas fa-calendar-check"></i>
                        {formatDateTime(checkup.checkupDate)}
                      </div>
                      {checkup.checkupType && (
                        <div className="checkup-type">
                          {checkup.checkupType}
                        </div>
                      )}
                    </div>

                    <div className="checkup-stats-grid">
                      <div className="checkup-stat height-stat">
                        <span className="stat-label">Chiều cao</span>
                        <span className="stat-value">{checkup.height} cm</span>
                      </div>
                      <div className="checkup-stat weight-stat">
                        <span className="stat-label">Cân nặng</span>
                        <span className="stat-value">{checkup.weight} kg</span>
                      </div>
                      <div className="checkup-stat bmi-stat">
                        <span className="stat-label">BMI</span>
                        <span className="stat-value">
                          {Number(checkup.bmi).toFixed(1)}
                        </span>
                      </div>
                      <div className="checkup-stat blood-pressure-stat">
                        <span className="stat-label">Huyết áp</span>
                        <span className="stat-value">
                          {checkup.bloodPressure || "N/A"}
                        </span>
                      </div>
                      <div className="checkup-stat temperature-stat">
                        <span className="stat-label">Nhiệt độ</span>
                        <span className="stat-value">
                          {formatTemperature(checkup.bodyTemperature)}
                        </span>
                      </div>
                      <div className="checkup-stat heart-rate-stat">
                        <span className="stat-label">Nhịp tim</span>
                        <span className="stat-value">
                          {checkup.heartRate || "N/A"} BPM
                        </span>
                      </div>
                    </div>

                    <div className="checkup-details">
                      <div className="vision-hearing">
                        <div className="vision-info">
                          <h5>Thị lực</h5>
                          <p>Mắt trái: {checkup.visionLeft || "N/A"}</p>
                          <p>Mắt phải: {checkup.visionRight || "N/A"}</p>
                        </div>
                        <div className="hearing-info">
                          <h5>Thính lực</h5>
                          <p>{checkup.hearingStatus || "Chưa có dữ liệu"}</p>
                        </div>
                      </div>

                      <div>
                        {checkup.diagnosis && (
                          <div className="diagnosis-section">
                            <h5>Chẩn đoán</h5>
                            <p>{checkup.diagnosis}</p>
                          </div>
                        )}

                        {checkup.recommendations && (
                          <div className="recommendations-section">
                            <h5>Khuyến nghị</h5>
                            <p>{checkup.recommendations}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {checkup.followUpNeeded && (
                      <div className="follow-up-alert">
                        <i className="fas fa-exclamation-triangle"></i>
                        Cần theo dõi thêm
                      </div>
                    )}

                    {checkup.medicalStaffName && (
                      <div className="staff-info">
                        <p>{checkup.medicalStaffName}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB SỰ CỐ Y TẾ - Sử dụng Medical Incidents API */}
        {activeTab === "incidents" && (
          <div className="incidents-panel">
            <h3>Lịch sử sự cố y tế</h3>

            {incidentsError ? (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i> {incidentsError}
              </div>
            ) : isLoadingIncidents ? (
              <div className="data-loading">
                <div className="loading-spinner small"></div>
                <p>Đang tải dữ liệu sự cố y tế...</p>
              </div>
            ) : medicalIncidents.length === 0 ? (
              <div className="no-incidents">
                <i className="fas fa-band-aid"></i>
                <h4>Không có sự cố y tế</h4>
                <p>Học sinh chưa có ghi nhận sự cố y tế nào trong hệ thống.</p>
              </div>
            ) : (
              <div className="incidents-list">
                {medicalIncidents.map((incident) => (
                  <div
                    className={`incident-card ${incident.severityLevel.toLowerCase()}`}
                    key={incident.incidentId}
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
                        <i className="fas fa-calendar-alt"></i>
                        {formatDate(incident.dateTime)}
                      </div>
                    </div>

                    <div className="incident-details">
                      <div className="detail-row">
                        <span className="detail-label">
                          <i className="fas fa-info-circle"></i> Mô tả
                        </span>
                        <span className="detail-value">
                          {incident.description}
                        </span>
                      </div>

                      {incident.symptoms && (
                        <div className="detail-row">
                          <span className="detail-label">
                            <i className="fas fa-thermometer-half"></i> Triệu
                            chứng
                          </span>
                          <div className="symptoms-container">
                            <div className="symptoms-value">
                              {incident.symptoms}
                            </div>
                          </div>
                        </div>
                      )}

                      {incident.treatment && (
                        <div className="detail-row">
                          <span className="detail-label">
                            <i className="fas fa-first-aid"></i> Xử lý
                          </span>
                          <span className="detail-value">
                            {incident.treatment}
                          </span>
                        </div>
                      )}

                      {incident.medicationsUsed && (
                        <div className="detail-row">
                          <span className="detail-label">
                            <i className="fas fa-pills"></i> Thuốc đã dùng
                          </span>
                          <div className="medications-used">
                            {incident.medicationsUsed
                              .split(",")
                              .map((med, idx) => (
                                <span key={idx} className="medication-tag">
                                  <i className="fas fa-capsules"></i>{" "}
                                  {med.trim()}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                      {incident.requiresFollowUp && incident.followUpNotes && (
                        <div className="detail-row">
                          <span className="detail-label">
                            <i className="fas fa-clipboard-check"></i> Theo dõi
                          </span>
                          <div className="followup-container">
                            <div className="followup-title">
                              <i className="fas fa-exclamation-triangle"></i>{" "}
                              Yêu cầu theo dõi
                            </div>
                            <div className="followup-value">
                              {incident.followUpNotes}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="detail-row">
                        <span className="detail-label">
                          <i className="fas fa-bell"></i> Thông báo phụ huynh
                        </span>
                        <span className="notification-status">
                          {incident.parentNotified ? (
                            <>
                              <i className="fas fa-check-circle status-icon success"></i>
                              Đã thông báo cho phụ huynh
                            </>
                          ) : (
                            <>
                              <i className="fas fa-times-circle status-icon warning"></i>
                              Chưa thông báo cho phụ huynh
                            </>
                          )}
                        </span>
                      </div>

                      <div className="detail-row">
                        <span className="detail-label">
                          <i className="fas fa-clock"></i> Thời gian xảy ra
                        </span>
                        <div className="incident-time">
                          <span className="incident-time-value">
                            {formatTimeOnly(incident.dateTime)}
                          </span>
                          <span className="detail-date">
                            <i className="fas fa-calendar-day"></i>{" "}
                            {formatDateOnly(incident.dateTime)}
                          </span>
                        </div>
                      </div>

                      {/* Hiển thị ảnh thu nhỏ nếu có */}
                      {incident.imgUrl && (
                        <div className="detail-row">
                          <span className="detail-label">
                            <i className="fas fa-image"></i> Hình ảnh
                          </span>
                          <div
                            className="incident-image-container"
                            onClick={() => openImageModal(incident.imgUrl)}
                          >
                            <img
                              src={incident.imgUrl}
                              alt="Hình ảnh sự cố"
                              className="incident-image"
                            />
                            <div className="image-overlay">
                              <i className="fas fa-search-plus"></i> Phóng to
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="incident-footer">
                      <p>
                        <i className="fas fa-user-md"></i>{" "}
                        {incident.staffName || "Không xác định"}
                      </p>

                      {incident.imgUrl ? (
                        <button
                          className="view-image-btn"
                          onClick={() => openImageModal(incident.imgUrl)}
                        >
                          <i className="fas fa-search-plus"></i> Xem hình ảnh
                        </button>
                      ) : (
                        <span className="no-image-text">
                          <i className="fas fa-image-slash"></i> Không có hình
                          ảnh
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="medical-record-footer">
        <button className="print-button" onClick={() => window.print()}>
          <i className="fas fa-print"></i> In hồ sơ y tế
        </button>
      </div>

      {isModalOpen && (
        <div className="image-modal" onClick={closeImageModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeImageModal}>
              <i className="fas fa-times"></i>
            </button>
            {modalImage ? (
              <img
                src={modalImage}
                alt="Hình ảnh sự cố y tế"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.parentNode.innerHTML = `
              <div class="image-placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Không thể tải hình ảnh</p>
              </div>
            `;
                }}
              />
            ) : (
              <div className="image-placeholder">
                <i className="fas fa-image"></i>
                <p>Không có hình ảnh</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return "Không có dữ liệu";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Không có dữ liệu";

    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch (err) {
    console.error("Error formatting date:", err);
    return "Không có dữ liệu";
  }
};

// Format date with time for display
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "Không có dữ liệu";
  try {
    const dateTime = new Date(dateTimeString);
    if (isNaN(dateTime.getTime())) return "Không có dữ liệu";

    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateTime);
  } catch (err) {
    console.error("Error formatting date time:", err);
    return "Không có dữ liệu";
  }
};

const formatTimeOnly = (dateTimeString) => {
  if (!dateTimeString) return "Không có dữ liệu";
  try {
    const dateTime = new Date(dateTimeString);
    if (isNaN(dateTime.getTime())) return "Không có dữ liệu";

    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateTime);
  } catch (err) {
    console.error("Error formatting time:", err);
    return "Không có dữ liệu";
  }
};

const formatDateOnly = (dateTimeString) => {
  if (!dateTimeString) return "Không có dữ liệu";
  try {
    const dateTime = new Date(dateTimeString);
    if (isNaN(dateTime.getTime())) return "Không có dữ liệu";

    return new Intl.DateTimeFormat("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(dateTime);
  } catch (err) {
    console.error("Error formatting date:", err);
    return "Không có dữ liệu";
  }
};

// Determine BMI status
const getBMIStatus = (bmi) => {
  if (!bmi || isNaN(parseFloat(bmi))) return "Không có dữ liệu";

  const bmiValue = parseFloat(bmi);
  if (bmiValue < 18.5) return "Gầy";
  if (bmiValue >= 18.5 && bmiValue < 24.9) return "Bình thường";
  if (bmiValue >= 25 && bmiValue < 29.9) return "Thừa cân";
  return "Béo phì";
}

export default MedicalRecord;
