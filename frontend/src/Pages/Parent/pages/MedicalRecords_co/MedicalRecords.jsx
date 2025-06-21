import React, { useState, useEffect, useContext } from "react";
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
  // --- TẤT CẢ HOOKS PHẢI ĐƯỢC KHAI BÁO Ở ĐÂY ---
  const { healthProfileId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  const [isLoadingGeneral, setIsLoadingGeneral] = useState(true);
  const [healthProfileData, setHealthProfileData] = useState(null);
  const [healthProfileError, setHealthProfileError] = useState(null);
  const [isLoadingCheckups, setIsLoadingCheckups] = useState(false);
  const [checkupsData, setCheckupsData] = useState([]);
  const [checkupsError, setCheckupsError] = useState(null);
  const [medicalIncidents, setMedicalIncidents] = useState([]);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(false);
  const [incidentsError, setIncidentsError] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { students } = useStudentData();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // --- THÊM HOOK CHO MODAL CHECKUP Ở ĐÂY ---
  const [isCheckupModalOpen, setIsCheckupModalOpen] = useState(false);
  const [selectedCheckup, setSelectedCheckup] = useState(null);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

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
    if (!students) return; // Đợi context sẵn sàng
    if (students.length === 0) {
      setSelectedStudent(null);
      setSelectedStudentId(null);
      setHasInitialized(true);
      return;
    }

    let foundStudent = students.find(
      (s) => s && s.healthProfileId?.toString() === healthProfileId?.toString()
    );

    setSelectedStudent(foundStudent || null);
    setSelectedStudentId(foundStudent ? foundStudent.id : null);
    setHasInitialized(true);
  }, [students, healthProfileId]);

  // Handler cho sự kiện thay đổi học sinh
  const handleStudentChange = (e) => {
    try {
      const selectedId = parseInt(e.target.value);
      const student = students.find((s) => s && s.id === selectedId);

      if (!student) return;

      setSelectedStudent(student);
      setSelectedStudentId(student.id);

      // Chỉ navigate nếu có healthProfileId
      if (student.healthProfileId) {
        navigate(`/parent/health-profile/${student.healthProfileId}`, {
          replace: true,
        });
      } else {
        // Nếu không có healthProfileId, có thể chỉ set state mà không navigate
        // hoặc navigate về một route mặc định nếu muốn
      }
    } catch (err) {
      console.error("Error in handleStudentChange:", err);
    }
  };

  // Fetch dữ liệu sức khỏe tổng quát từ API khi selectedStudentId thay đổi
  useEffect(() => {
    if (!selectedStudentId || !hasInitialized) return;

    const fetchHealthProfileData = async () => {
      setIsLoadingGeneral(true);
      setHealthProfileError(null);

      try {
        const response = await api.get(
          `/health-profiles/student/${selectedStudentId}`
        );
        setHealthProfileData(response.data || null);
      } catch (err) {
        setHealthProfileError(
          "Không thể tải dữ liệu sức khỏe tổng quát. Vui lòng thử lại sau."
        );
        setHealthProfileData(null);
      } finally {
        setIsLoadingGeneral(false);
      }
    };

    fetchHealthProfileData();
  }, [selectedStudentId, hasInitialized]);

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
    if (!dateTimeString) return "Chưa cập nhật";

    try {
      const options = {
        year: "numeric",
        month: "long", // Cập nhật để hiển thị tháng đầy đủ
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateTimeString).toLocaleDateString("vi-VN", options);
    } catch (error) {
      console.error("Error formatting datetime:", error);
      return "Định dạng không hợp lệ";
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

  // Cập nhật hàm fetchHealthProfile để lấy dữ liệu mới nhất từ API
  // Cập nhật hàm fetchHealthProfile
  const fetchHealthProfile = async () => {
    if (!selectedStudentId) return;

    setIsLoadingGeneral(true);
    setHealthProfileError(null);

    try {
      console.log(`Fetching health profile for student: ${selectedStudentId}`);

      // SỬA: Sử dụng đúng endpoint API để lấy hồ sơ y tế của học sinh
      const response = await api.get(
        `/health-profiles/student/${selectedStudentId}`,
        {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      if (response.data) {
        console.log("Health profile data received:", response.data);
        setHealthProfileData(response.data);

        // Lưu dữ liệu vào localStorage để dự phòng
        localStorage.setItem(
          `healthProfile_${selectedStudentId}`,
          JSON.stringify(response.data)
        );
      } else {
        console.log("No health profile data available from API");
        // Thử lấy từ localStorage nếu không có data từ API
        const cachedData = localStorage.getItem(
          `healthProfile_${selectedStudentId}`
        );
        if (cachedData) {
          setHealthProfileData(JSON.parse(cachedData));
        } else {
          setHealthProfileData(null);
        }
      }
    } catch (err) {
      console.error("Error fetching health profile:", err);

      // Nếu lỗi 404 (không tìm thấy hồ sơ), không hiển thị lỗi
      if (err.response?.status === 404) {
        console.log("No health profile found for student");
        setHealthProfileData(null);
        return;
      }

      // Thử lấy từ localStorage nếu API lỗi
      try {
        const cachedData = localStorage.getItem(
          `healthProfile_${selectedStudentId}`
        );
        if (cachedData) {
          setHealthProfileData(JSON.parse(cachedData));
        } else {
          setHealthProfileError(
            "Không thể tải thông tin sức khỏe. Vui lòng thử lại sau."
          );
        }
      } catch (storageErr) {
        console.error("Error accessing localStorage:", storageErr);
        setHealthProfileError(
          "Không thể tải thông tin sức khỏe. Vui lòng thử lại sau."
        );
      }
    } finally {
      setIsLoadingGeneral(false);
    }
  };
  // Thêm useEffect để gọi API mỗi khi selectedStudentId thay đổi
  useEffect(() => {
    if (selectedStudentId && hasInitialized) {
      fetchHealthProfile();
    }
  }, [selectedStudentId, hasInitialized]);

  // Thêm useEffect để đăng ký lắng nghe sự kiện cập nhật hồ sơ sức khỏe
  useEffect(() => {
    const handleHealthProfileUpdate = (studentId, profileData) => {
      console.log(
        `Received healthProfileUpdated event for student ID: ${studentId}`
      );
      console.log("Profile data received:", profileData);

      if (
        selectedStudentId &&
        parseInt(selectedStudentId) === parseInt(studentId)
      ) {
        console.log("Refreshing health profile due to update event");

        // Cập nhật trực tiếp với dữ liệu từ sự kiện
        if (profileData) {
          console.log("Updating with provided data:", profileData);

          // Đảm bảo dữ liệu có đầy đủ các trường cần thiết
          const completeProfileData = {
            // Dữ liệu mặc định
            height: 0,
            weight: 0,
            bmi: 0,
            bloodType: "Chưa cập nhật",
            allergies: "Không",
            chronicDiseases: "Không",
            visionLeft: "Chưa kiểm tra",
            visionRight: "Chưa kiểm tra",
            hearingStatus: "Bình thường",
            dietaryRestrictions: "Không",
            emergencyContactInfo: "Không có",
            immunizationStatus: "Không",
            specialNeeds: "Không",
            lastPhysicalExamDate: new Date().toISOString().split("T")[0],
            lastUpdated: new Date().toISOString(),
            // Ghi đè với dữ liệu thực tế
            ...profileData,
          };

          setHealthProfileData(completeProfileData);

          // Lưu vào localStorage
          try {
            localStorage.setItem(
              `healthProfile_${studentId}`,
              JSON.stringify(completeProfileData)
            );
          } catch (storageErr) {
            console.warn("Could not save to localStorage:", storageErr);
          }
        } else {
          // Nếu không có dữ liệu kèm theo, gọi API để lấy dữ liệu mới nhất
          fetchHealthProfile();
        }
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
  if (isLoadingGeneral) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải hồ sơ y tế...</p>
      </div>
    );
  }

  // Hiển thị trạng thái loading khi context chưa sẵn sàng hoặc chưa khởi tạo xong
  if (!students || !hasInitialized) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải danh sách học sinh...</p>
      </div>
    );
  }

  // Hiển thị thông báo nếu không có học sinh hoặc không tìm thấy học sinh phù hợp
  if ((!selectedStudent || !selectedStudentId) && hasInitialized) {
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

  // Thêm vào đây
  const displayData = healthProfileData
    ? {
        ...healthProfileData,
        dietaryRestrictions:
          healthProfileData.dietaryRestrictions || "Không có hạn chế đặc biệt",
        immunizationStatus:
          healthProfileData.immunizationStatus || "Chưa có thông tin",
        emergencyContactInfo:
          healthProfileData.emergencyContactInfo || "Chưa cập nhật",
      }
    : null;

  // State cho modal hiển thị chi tiết checkup
  const openCheckupModal = (checkup) => {
    setSelectedCheckup(checkup);
    setIsCheckupModalOpen(true);
  };

  const closeCheckupModal = () => {
    setIsCheckupModalOpen(false);
    setSelectedCheckup(null);
  };

  // State cho modal hiển thị chi tiết sự cố y tế
  const openIncidentModal = (incident) => {
    setSelectedIncident(incident);
    setIsIncidentModalOpen(true);
  };

  const closeIncidentModal = () => {
    setIsIncidentModalOpen(false);
    setSelectedIncident(null);
  };

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
            ) : !healthProfileData ? (
              <div className="no-data-message">
                <i className="fas fa-info-circle"></i>
                <h4>Chưa có thông tin sức khỏe</h4>
                <p>Học sinh chưa có thông tin sức khỏe trong hệ thống.</p>
                <p>
                  Vui lòng thực hiện khai báo sức khỏe để cập nhật thông tin.
                </p>
              </div>
            ) : (
              // Nội dung hiển thị khi có dữ liệu
              <>
                {/* Hiển thị thời gian cập nhật gần nhất */}
                {healthProfileData && healthProfileData.lastUpdated && (
                  <div className="last-update-info">
                    <p>
                      Cập nhật lần cuối:{" "}
                      <strong>
                        {formatDateTime(healthProfileData.lastUpdated)}
                      </strong>
                    </p>
                    {healthProfileData.lastPhysicalExamDate && (
                      <p>
                        Ngày khám gần nhất:{" "}
                        <strong>
                          {formatDate(healthProfileData.lastPhysicalExamDate)}
                        </strong>
                      </p>
                    )}
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
                      <p>{healthProfileData?.height || 0} cm</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaWeight />
                    </div>
                    <div className="stat-content">
                      <h4>Cân nặng</h4>
                      <p>{healthProfileData?.weight || 0} kg</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaChartLine />
                    </div>
                    <div className="stat-content">
                      <h4>Chỉ số BMI</h4>
                      <p>
                        {healthProfileData?.bmi
                          ? Number(healthProfileData.bmi).toFixed(1)
                          : "N/A"}
                      </p>
                      <small>{getBMIStatus(healthProfileData?.bmi)}</small>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaHeartbeat />
                    </div>
                    <div className="stat-content">
                      <h4>Nhóm máu</h4>
                      <p>{healthProfileData?.bloodType || "Chưa cập nhật"}</p>
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
                        {healthProfileData?.visionLeft || "Chưa kiểm tra"}
                      </p>
                      <p>
                        Mắt phải:{" "}
                        {healthProfileData?.visionRight || "Chưa kiểm tra"}
                      </p>
                    </div>
                  </div>

                  <div className="medical-detail">
                    <h4>
                      <FaStethoscope /> Thính lực
                    </h4>
                    <p>{healthProfileData?.hearingStatus || "Chưa kiểm tra"}</p>
                  </div>

                  <div className="medical-detail">
                    <h4>
                      <FaAllergies /> Dị ứng
                    </h4>
                    <p>{healthProfileData?.allergies || "Không có"}</p>
                  </div>

                  <div className="medical-detail">
                    <h4>
                      <FaNotesMedical /> Bệnh mãn tính
                    </h4>
                    <p>{healthProfileData?.chronicDiseases || "Không có"}</p>
                  </div>

                  <div className="medical-detail">
                    <h4>
                      <FaUtensils /> Chế độ ăn uống đặc biệt
                    </h4>
                    <p>
                      {healthProfileData?.dietaryRestrictions ||
                        "Không có hạn chế đặc biệt"}
                    </p>
                  </div>

                  <div className="medical-detail">
                    <h4>
                      <FaShieldVirus /> Tình trạng tiêm chủng
                    </h4>
                    <p>
                      {healthProfileData?.immunizationStatus ||
                        "Chưa có thông tin"}
                    </p>
                  </div>

                  <div className="medical-detail">
                    <h4>
                      <FaWheelchair /> Nhu cầu đặc biệt
                    </h4>
                    <p>{healthProfileData?.specialNeeds || "Không có"}</p>
                  </div>

                  <div className="medical-detail emergency-info">
                    <h4>
                      <FaPhoneVolume /> Thông tin liên hệ khẩn cấp
                    </h4>
                    <p>
                      {healthProfileData?.emergencyContactInfo ||
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
              <div className="checkups-compact-list">
                {checkupsData.map((checkup) => (
                  <div
                    className="checkup-compact-card"
                    key={checkup.id}
                    onClick={() => openCheckupModal(checkup)}
                  >
                    <div className="compact-header">
                      <div className="compact-date-time">
                        <i className="fas fa-calendar-check"></i>
                        <span className="compact-time">
                          lúc {formatTimeOnly(checkup.checkupDate)}
                        </span>
                        <span className="compact-date">
                          {formatDateOnly(checkup.checkupDate)}
                        </span>
                      </div>

                      <button className="view-details-btn">Tổng quát</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal hiển thị chi tiết checkup */}
            {isCheckupModalOpen && selectedCheckup && (
              <div
                className="checkup-modal-overlay"
                onClick={closeCheckupModal}
              >
                <div
                  className="checkup-modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <h3>Chi tiết kiểm tra sức khỏe</h3>
                    <button
                      className="close-modal-btn"
                      onClick={closeCheckupModal}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="checkup-details-group">
                      <div className="checkup-stats-detailed">
                        <div className="stats-row">
                          <div className="stat-box height-box">
                            <div className="stat-icon">
                              <i className="fas fa-ruler-vertical"></i>
                            </div>
                            <div className="stat-info">
                              <span className="stat-label">CHIỀU CAO</span>
                              <span className="stat-value">
                                {selectedCheckup.height} cm
                              </span>
                            </div>
                          </div>

                          <div className="stat-box weight-box">
                            <div className="stat-icon">
                              <i className="fas fa-weight"></i>
                            </div>
                            <div className="stat-info">
                              <span className="stat-label">CÂN NẶNG</span>
                              <span className="stat-value">
                                {selectedCheckup.weight} kg
                              </span>
                            </div>
                          </div>

                          <div className="stat-box bmi-box">
                            <div className="stat-icon">
                              <i className="fas fa-chart-line"></i>
                            </div>
                            <div className="stat-info">
                              <span className="stat-label">BMI</span>
                              <span className="stat-value">
                                {Number(selectedCheckup.bmi).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="stats-row">
                          <div className="stat-box blood-pressure-box">
                            <div className="stat-icon">
                              <i className="fas fa-heartbeat"></i>
                            </div>
                            <div className="stat-info">
                              <span className="stat-label">HUYẾT ÁP</span>
                              <span className="stat-value">
                                {selectedCheckup.bloodPressure || "120/80"}
                              </span>
                            </div>
                          </div>

                          <div className="stat-box temperature-box">
                            <div className="stat-icon">
                              <i className="fas fa-thermometer-half"></i>
                            </div>
                            <div className="stat-info">
                              <span className="stat-label">NHIỆT ĐỘ</span>
                              <span className="stat-value">
                                {formatTemperature(
                                  selectedCheckup.bodyTemperature
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="stat-box heart-rate-box">
                            <div className="stat-icon">
                              <i className="fas fa-heart"></i>
                            </div>
                            <div className="stat-info">
                              <span className="stat-label">NHỊP TIM</span>
                              <span className="stat-value">
                                {selectedCheckup.heartRate || "75"} BPM
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="detailed-sections">
                        <div className="detail-section vision-section">
                          <div className="section-header">
                            <h4>Thị lực</h4>
                          </div>
                          <div className="vision-details">
                            <p>
                              Mắt trái: {selectedCheckup.visionLeft || "10/10"}
                            </p>
                            <p>
                              Mắt phải: {selectedCheckup.visionRight || "10/10"}
                            </p>
                          </div>
                        </div>

                        <div className="detail-section hearing-section">
                          <div className="section-header">
                            <h4>Thính lực</h4>
                          </div>
                          <div className="hearing-details">
                            <p>
                              {selectedCheckup.hearingStatus || "Bình thường"}
                            </p>
                          </div>
                        </div>

                        <div className="detail-section diagnosis-section">
                          <div className="section-header">
                            <h4>
                              <i className="fas fa-stethoscope"></i> Chẩn đoán
                            </h4>
                          </div>
                          <div className="diagnosis-content">
                            <p>{selectedCheckup.diagnosis || "Không vấn đề"}</p>
                          </div>
                        </div>

                        <div className="detail-section recommendations-section">
                          <div className="section-header">
                            <h4>
                              <i className="fas fa-lightbulb"></i> Khuyến nghị
                            </h4>
                          </div>
                          <div className="recommendations-content">
                            <p>
                              {selectedCheckup.recommendations ||
                                "Duy trì tập luyện"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Thông tin nhân viên y tế */}
                    <div className="staff-signature">
                      <div className="staff-info">
                        <i className="fas fa-user-md"></i>
                        <span>
                          {selectedCheckup.medicalStaffName ||
                            "Nguyễn Thị Y Tá"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
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
                    onClick={() => openIncidentModal(incident)} // Thêm dòng này
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

      {isIncidentModalOpen && selectedIncident && (
        <div className="checkup-modal-overlay" onClick={closeIncidentModal}>
          <div
            className="checkup-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Chi tiết sự cố y tế</h3>
              <button className="close-modal-btn" onClick={closeIncidentModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="incident-details-modal">
                <div className="stats-row">
                  <div className="stat-box">
                    <span className="stat-label">Thời gian</span>
                    <span className="stat-value">
                      {formatDateTime(selectedIncident.dateTime)}
                    </span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Mức độ</span>
                    <span
                      className={`severity-tag ${selectedIncident.severityLevel
                        .replace(" ", "_")
                        .toLowerCase()}`}
                    >
                      {selectedIncident.severityLevel}
                    </span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Loại sự cố</span>
                    <span className="stat-value">
                      {selectedIncident.incidentType}
                    </span>
                  </div>
                </div>
                <div className="detail-section">
                  <h4>Mô tả</h4>
                  <p>{selectedIncident.description}</p>
                </div>
                {selectedIncident.symptoms && (
                  <div className="detail-section">
                    <h4>Triệu chứng</h4>
                    <p>{selectedIncident.symptoms}</p>
                  </div>
                )}
                {selectedIncident.treatment && (
                  <div className="detail-section">
                    <h4>Xử lý</h4>
                    <p>{selectedIncident.treatment}</p>
                  </div>
                )}
                {selectedIncident.medicationsUsed && (
                  <div className="detail-section">
                    <h4>Thuốc đã dùng</h4>
                    <p>{selectedIncident.medicationsUsed}</p>
                  </div>
                )}
                {selectedIncident.requiresFollowUp &&
                  selectedIncident.followUpNotes && (
                    <div className="detail-section">
                      <h4>Theo dõi</h4>
                      <p>{selectedIncident.followUpNotes}</p>
                    </div>
                  )}
                <div className="detail-section">
                  <h4>Nhân viên y tế</h4>
                  <p>{selectedIncident.staffName || "Không xác định"}</p>
                </div>
                {selectedIncident.imgUrl && (
                  <div className="detail-section">
                    <h4>Hình ảnh</h4>
                    <img
                      src={selectedIncident.imgUrl}
                      alt="Hình ảnh sự cố"
                      className="incident-image"
                      style={{ maxWidth: "100%", borderRadius: 8 }}
                    />
                  </div>
                )}
              </div>
            </div>
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
  if (!dateTimeString) return "Chưa cập nhật";

  try {
    const options = {
      year: "numeric",
      month: "long", // Cập nhật để hiển thị tháng đầy đủ
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateTimeString).toLocaleDateString("vi-VN", options);
  } catch (error) {
    console.error("Error formatting datetime:", error);
    return "Định dạng không hợp lệ";
  }
};

const formatTimeOnly = (dateTimeString) => {
  if (!dateTimeString) return "00:00";
  try {
    const dateTime = new Date(dateTimeString);
    if (isNaN(dateTime.getTime())) return "00:00";

    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateTime);
  } catch (err) {
    console.error("Error formatting time:", err);
    return "00:00";
  }
};

const formatDateOnly = (dateTimeString) => {
  if (!dateTimeString) return "Không có dữ liệu";
  try {
    const dateTime = new Date(dateTimeString);
    if (isNaN(dateTime.getTime())) return "Không có dữ liệu";

    return new Intl.DateTimeFormat("vi-VN", {
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
  if (!bmi || bmi === 0 || isNaN(bmi)) return "Chưa có dữ liệu";

  const bmiValue = parseFloat(bmi);
  if (isNaN(bmiValue)) return "Chưa có dữ liệu";

  if (bmiValue < 18.5) return "Thiếu cân";
  if (bmiValue < 25) return "Bình thường";
  if (bmiValue < 30) return "Thừa cân";
  return "Béo phì";
};

export default MedicalRecord;
