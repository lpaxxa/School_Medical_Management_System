import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
// Import mới của CSS
import "./styles/index.css";
import { useStudentData } from "../../../../context/StudentDataContext";
import medicalService from "../../../../services/medicalService";
import eventBus from "../../../../services/eventBus";
import { FaPrint, FaArrowLeft, FaTimes, FaImage } from "react-icons/fa";

// Import các component khác
import ErrorBoundary from "../../../../components/ErrorBoundary";
import StudentSelector from "./components/StudentSelector";
import TabNavigation from "./components/TabNavigation";
import GeneralTab from "./components/tabs/GeneralTab";
import CheckupsTab from "./components/tabs/CheckupsTab";
import VaccinationsTab from "./components/tabs/VaccinationsTab";
import IncidentsTab from "./components/tabs/IncidentsTab";
import GrowthTab from "./components/tabs/GrowthTab";

// Import utils
import { cacheData, getCachedData } from "./utils/helpers";

const MedicalRecord = () => {
  // Đổi từ healthProfileId thành studentId
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  const [isLoadingGeneral, setIsLoadingGeneral] = useState(true);
  const [healthProfileData, setHealthProfileData] = useState(null);
  const [healthProfileError, setHealthProfileError] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { students, parentInfo } = useStudentData();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Thêm vào đây
  const openImageModal = (imageUrl) => {
    setModalImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  // Khởi tạo selectedStudent dựa vào studentId từ URL
  useEffect(() => {
    if (!students) return;

    if (students.length === 0) {
      setSelectedStudent(null);
      setSelectedStudentId(null);
      setHasInitialized(true);
      return;
    }

    // Tìm học sinh phù hợp với studentId từ URL
    let foundStudent = students.find(
      (s) => s && String(s.id) === String(studentId)
    );

    // Nếu không tìm thấy, dùng học sinh đầu tiên
    if (!foundStudent && students.length > 0) {
      foundStudent = students[0];
    }

    setSelectedStudent(foundStudent || null);
    setSelectedStudentId(foundStudent ? foundStudent.id : null);
    setHasInitialized(true);
  }, [students, studentId]);

  // Handler cho sự kiện thay đổi học sinh
  const handleStudentChange = (e) => {
    try {
      const selectedId = e.target.value;
      const student = students.find(
        (s) => s && String(s.id) === String(selectedId)
      );

      if (!student) return;

      setSelectedStudent(student);
      setSelectedStudentId(student.id);

      // Navigate với student ID thay vì healthProfileId
      navigate(`/health-profile/student/${student.id}`, {
        replace: true,
      });
    } catch (err) {
      console.error("Error in handleStudentChange:", err);
    }
  };

  // Fetch dữ liệu sức khỏe tổng quát từ API khi selectedStudent thay đổi
  const fetchHealthProfile = async (useCache = false) => {
    if (!selectedStudent || !selectedStudent.id) return;

    setIsLoadingGeneral(true);
    setHealthProfileError(null);

    try {
      const cacheKey = `healthProfile_${selectedStudent.id}`;

      // Chỉ sử dụng cache khi useCache = true
      if (useCache) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          setHealthProfileData(cachedData);
          setIsLoadingGeneral(false);
          return;
        }
      }

      // Luôn gọi API để lấy dữ liệu mới nhất
      console.log(
        "Fetching fresh health profile data for student:",
        selectedStudent.id
      );
      const response = await medicalService.getHealthProfile(
        selectedStudent.id
      );
      setHealthProfileData(response);

      // Cache data mới (optional)
      cacheData(cacheKey, response);
    } catch (err) {
      console.error("Error fetching health profile:", err);
      setHealthProfileError(
        "Không thể tải dữ liệu hồ sơ sức khỏe. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoadingGeneral(false);
    }
  };

  // Thêm useEffect để gọi API mỗi khi selectedStudent thay đổi (không dùng cache)
  useEffect(() => {
    if (!selectedStudent || !selectedStudent.id || !hasInitialized) return;

    console.log("Selected student changed, fetching fresh data");
    fetchHealthProfile(false); // Không sử dụng cache
  }, [selectedStudent, hasInitialized]);

  // Thêm useEffect để gọi API mỗi khi activeTab thay đổi về "general"
  useEffect(() => {
    if (activeTab === "general" && selectedStudent && selectedStudent.id) {
      console.log("General tab activated, fetching fresh data");
      fetchHealthProfile(false); // Không sử dụng cache
    }
  }, [activeTab, selectedStudent]);

  // Thêm useEffect để đăng ký lắng nghe sự kiện cập nhật hồ sơ sức khỏe
  useEffect(() => {
    if (!selectedStudent || !selectedStudent.id) return;

    const handleProfileUpdate = (studentId, data) => {
      if (studentId === selectedStudent.id) {
        console.log(
          "Received health profile update event for student:",
          studentId,
          data
        );

        // Xóa cache cũ và fetch lại
        const cacheKey = `healthProfile_${selectedStudent.id}`;
        localStorage.removeItem(cacheKey);

        fetchHealthProfile(false); // Không sử dụng cache
      }
    };

    const unsubscribe = eventBus.subscribe(
      "healthProfileUpdated",
      handleProfileUpdate
    );

    return () => {
      unsubscribe();
    };
  }, [selectedStudent]);

  // Hiển thị trạng thái loading
  if (isLoadingGeneral && !healthProfileData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải hồ sơ y tế...</p>
      </div>
    );
  }

  // Hiển thị trạng thái loading khi context chưa sẵn sàng
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

  // Render UI chính
  return (
    <ErrorBoundary>
      <div className="medical-record-container">
        <div className="medical-record-header">
          <div className="header-content">
            <h1>Hồ Sơ Y Tế</h1>

            {/* Chọn học sinh */}
            {students && students.length > 0 && (
              <StudentSelector
                students={students}
                selectedStudentId={selectedStudentId}
                onStudentChange={handleStudentChange}
                isLoading={isLoadingGeneral}
              />
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

        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="medical-content">
          {/* TAB THÔNG TIN CHUNG */}
          {activeTab === "general" && (
            <GeneralTab
              healthProfileData={healthProfileData}
              isLoading={isLoadingGeneral}
              error={healthProfileError}
              studentId={selectedStudentId}
              onRefresh={() => fetchHealthProfile(false)} // Force fresh data
            />
          )}

          {/* TAB KIỂM TRA ĐỊNH KỲ */}
          {activeTab === "checkups" && (
            <CheckupsTab studentId={selectedStudentId} />
          )}

          {/* TAB TIÊM CHỦNG */}
          {activeTab === "vaccinations" && (
            <VaccinationsTab
              studentId={selectedStudentId}
              parentInfo={parentInfo}
              studentCode={selectedStudent?.studentId}
            />
          )}

          {/* TAB SỰ CỐ Y TẾ */}
          {activeTab === "incidents" && (
            <IncidentsTab studentId={selectedStudentId} />
          )}

          {/* TAB TĂNG TRƯỞNG */}
          {activeTab === "growth" && (
            <GrowthTab studentId={selectedStudentId} />
          )}
        </div>

        <div className="medical-record-footer">
          <button className="print-button" onClick={() => window.print()}>
            <FaPrint /> In hồ sơ y tế
          </button>
        </div>

        {isModalOpen && (
          <div className="image-modal" onClick={closeImageModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-modal" onClick={closeImageModal}>
                <FaTimes />
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
                  <FaImage />
                  <p>Không có hình ảnh</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default MedicalRecord;
