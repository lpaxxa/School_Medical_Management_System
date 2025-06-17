import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./MedicalRecords.css";
import { useStudentData } from "../../../../context/StudentDataContext";
import api from "../../../../services/api";
import eventBus from "../../../../services/eventBus";
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
  FaBandAid,
  FaProcedures,
  FaChartLine,
  FaUserGraduate,
  FaExchangeAlt,
  FaUtensils, // Thêm biểu tượng nhà hàng cho chế độ ăn
  FaPhoneVolume, // Thêm biểu tượng điện thoại cho liên hệ khẩn cấp
  FaCalendarAlt, // Thêm biểu tượng lịch cho ngày khám gần nhất
  FaWheelchair, // Thêm biểu tượng xe lăn cho nhu cầu đặc biệt
  FaShieldVirus, // Thêm biểu tượng bảo vệ cho tình trạng tiêm chủng
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

  const [hasInitialized, setHasInitialized] = useState(false);

  // Lấy thông tin học sinh từ context
  const { students, isLoading: studentsLoading } = useStudentData();

  // State lưu trữ học sinh được chọn và ID của học sinh
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

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
          `health-profiles/student/${selectedStudentId}`
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
          `medical-checkups/student/${selectedStudentId}`
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
        fetchHealthProfileData();
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
          className={`coming-soon ${activeTab === "history" ? "active" : ""}`}
          onClick={() => alert("Tính năng đang được phát triển!")}
          title="Tính năng đang được phát triển"
        >
          <FaFileMedicalAlt /> Bệnh án
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
                <button
                  className="refresh-btn"
                  onClick={() => fetchHealthProfile()}
                >
                  <i className="fas fa-sync-alt"></i> Thử lại
                </button>
              </div>
            ) : isLoadingGeneral ? (
              <div className="data-loading">
                <div className="loading-spinner small"></div>
                <p>Đang tải dữ liệu sức khỏe...</p>
              </div>
            ) : (
              <>
                {/* Hiển thị thời gian cập nhật gần nhất */}
                {healthProfileData.lastUpdated && (
                  <div className="last-update-info">
                    <p>
                      Cập nhật lần cuối:{" "}
                      <strong>
                        {formatDateTime(healthProfileData.lastUpdated)}
                      </strong>
                    </p>
                    <p>
                      Ngày khám gần nhất:{" "}
                      <strong>
                        {formatDate(healthProfileData.lastPhysicalExamDate)}
                      </strong>
                    </p>
                  </div>
                )}

                {/* Phần hiển thị thông tin sức khỏe cơ bản */}
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
                      <FaChartLine />
                    </div>
                    <div className="stat-content">
                      <h4>Chỉ số BMI</h4>
                      <p>{healthProfileData.bmi}</p>
                      <small>{getBMIStatus(healthProfileData.bmi)}</small>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaHeartbeat />
                    </div>
                    <div className="stat-content">
                      <h4>Nhóm máu</h4>
                      <p>{healthProfileData.bloodType}</p>
                    </div>
                  </div>
                </div>

                {/* Phần hiển thị chi tiết thông tin sức khỏe */}
                <div className="medical-details-section">
                  <div className="medical-detail">
                    <h4>
                      <FaEye /> Thị lực
                    </h4>
                    <div className="detail-content">
                      <p>
                        Mắt trái:{" "}
                        {healthProfileData.visionLeft || "Chưa kiểm tra"}
                      </p>
                      <p>
                        Mắt phải:{" "}
                        {healthProfileData.visionRight || "Chưa kiểm tra"}
                      </p>
                    </div>
                  </div>

                  <div className="medical-detail">
                    <h4>
                      <FaStethoscope /> Thính lực
                    </h4>
                    <p>{healthProfileData.hearingStatus || "Chưa kiểm tra"}</p>
                  </div>

                  <div className="medical-detail">
                    <h4>
                      <FaAllergies /> Dị ứng
                    </h4>
                    <p>{healthProfileData.allergies || "Không có"}</p>
                  </div>

                  <div className="medical-detail">
                    <h4>
                      <FaNotesMedical /> Bệnh mãn tính
                    </h4>
                    <p>{healthProfileData.chronicDiseases || "Không có"}</p>
                  </div>

                  <div className="medical-detail">
                    <h4>
                      <FaUtensils /> Chế độ ăn uống đặc biệt
                    </h4>
                    <p>
                      {healthProfileData.dietaryRestrictions ||
                        "Không có hạn chế đặc biệt"}
                    </p>
                  </div>

                  <div className="medical-detail">
                    <h4>
                      <FaShieldVirus /> Tình trạng tiêm chủng
                    </h4>
                    <p>
                      {healthProfileData.immunizationStatus ||
                        "Chưa có thông tin"}
                    </p>
                  </div>

                  <div className="medical-detail">
                    <h4>
                      <FaWheelchair /> Nhu cầu đặc biệt
                    </h4>
                    <p>{healthProfileData.specialNeeds || "Không có"}</p>
                  </div>

                  <div className="medical-detail emergency-info">
                    <h4>
                      <FaPhoneVolume /> Thông tin liên hệ khẩn cấp
                    </h4>
                    <p>
                      {healthProfileData.emergencyContactInfo ||
                        "Chưa cập nhật"}
                    </p>
                  </div>
                </div>

                {/* Thêm nút làm mới dữ liệu */}
                <button
                  className="refresh-button"
                  onClick={() => fetchHealthProfile()}
                  disabled={isLoadingGeneral}
                >
                  <i className="fas fa-sync-alt"></i> Làm mới dữ liệu
                </button>
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
                        <i className="fas fa-calendar"></i>
                        Ngày khám: {formatDateTime(checkup.checkupDate)}
                      </div>
                      {checkup.checkupType && (
                        <div className="checkup-type">
                          <span>{checkup.checkupType}</span>
                        </div>
                      )}
                    </div>

                    <div className="checkup-stats-grid">
                      <div className="checkup-stat">
                        <span className="stat-label">Chiều cao:</span>
                        <span className="stat-value">{checkup.height} cm</span>
                      </div>
                      <div className="checkup-stat">
                        <span className="stat-label">Cân nặng:</span>
                        <span className="stat-value">{checkup.weight} kg</span>
                      </div>
                      <div className="checkup-stat">
                        <span className="stat-label">BMI:</span>
                        <span className="stat-value">{checkup.bmi}</span>
                      </div>
                      <div className="checkup-stat">
                        <span className="stat-label">Huyết áp:</span>
                        <span className="stat-value">
                          {checkup.bloodPressure || "N/A"}
                        </span>
                      </div>
                      <div className="checkup-stat">
                        <span className="stat-label">Nhiệt độ:</span>
                        <span className="stat-value">
                          {formatTemperature(checkup.bodyTemperature)}
                        </span>
                      </div>
                      <div className="checkup-stat">
                        <span className="stat-label">Nhịp tim:</span>
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

                    {checkup.followUpNeeded && (
                      <div className="follow-up-alert">
                        <i className="fas fa-exclamation-circle"></i>
                        Cần theo dõi thêm
                      </div>
                    )}

                    {checkup.medicalStaffName && (
                      <div className="staff-info">
                        <p>Nhân viên y tế: {checkup.medicalStaffName}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Các tab khác hiển thị thông báo "Tính năng đang phát triển" */}
        {activeTab === "vaccinations" && (
          <div className="vaccinations-panel">
            <div className="feature-coming-soon">
              <div className="coming-soon-icon">
                <FaSyringe />
              </div>
              <h3>Tính năng đang phát triển</h3>
              <p>
                Dữ liệu tiêm chủng sẽ được cập nhật trong thời gian tới. Vui
                lòng quay lại sau.
              </p>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="history-panel">
            <div className="feature-coming-soon">
              <div className="coming-soon-icon">
                <FaFileMedicalAlt />
              </div>
              <h3>Tính năng đang phát triển</h3>
              <p>
                Dữ liệu bệnh án sẽ được cập nhật trong thời gian tới. Vui lòng
                quay lại sau.
              </p>
            </div>
          </div>
        )}

        {activeTab === "growth" && (
          <div className="growth-panel">
            <div className="feature-coming-soon">
              <div className="coming-soon-icon">
                <FaChartLine />
              </div>
              <h3>Tính năng đang phát triển</h3>
              <p>
                Dữ liệu tăng trưởng sẽ được cập nhật trong thời gian tới. Vui
                lòng quay lại sau.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="medical-record-footer">
        <button className="print-button" onClick={() => window.print()}>
          <i className="fas fa-print"></i> In hồ sơ y tế
        </button>
      </div>
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

// Determine BMI status
const getBMIStatus = (bmi) => {
  if (!bmi || isNaN(parseFloat(bmi))) return "Không có dữ liệu";

  const bmiValue = parseFloat(bmi);
  if (bmiValue < 18.5) return "Thiếu cân";
  if (bmiValue < 25) return "Bình thường";
  if (bmiValue < 30) return "Thừa cân";
  return "Béo phì";
};

// Export component với Error Boundary
export default function MedicalRecordWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <MedicalRecord />
    </ErrorBoundary>
  );
}
