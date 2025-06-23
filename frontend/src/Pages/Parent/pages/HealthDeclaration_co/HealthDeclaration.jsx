import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useStudentData } from "../../../../context/StudentDataContext";
import api from "../../../../services/api";
import "../shared/student-selector.css"; // Import CSS shared trước
import "./HealthDeclaration.css"; // CSS chung của component
import "./HealthDeclarationFix.css"; // CSS override và fix lỗi

// Mock data cho trường học
const MOCK_SCHOOL = {
  id: "SCH001",
  name: "THCS Nguyễn Đình Chiểu",
  address: "123 Nguyễn Du, Quận 1, TP.HCM",
  phone: "028.1234.5678",
  email: "thcsnguyendu@edu.vn",
  logo: "/school-logo.png",
};

// Danh sách triệu chứng
const SYMPTOM_OPTIONS = [
  { id: "fever", label: "Sốt" },
  { id: "cough", label: "Ho" },
  { id: "headache", label: "Đau đầu" },
  { id: "sore_throat", label: "Đau họng" },
  { id: "runny_nose", label: "Sổ mũi" },
  { id: "fatigue", label: "Mệt mỏi" },
  { id: "muscle_pain", label: "Đau cơ" },
  { id: "dizziness", label: "Chóng mặt" },
  { id: "nausea", label: "Buồn nôn" },
  { id: "diarrhea", label: "Tiêu chảy" },
  { id: "breathing_difficulty", label: "Khó thở" },
  { id: "rash", label: "Phát ban" },
];

// Mock data for history display
const MOCK_DECLARATIONS = [
  {
    id: "DEC001",
    studentId: "ST001",
    studentName: "Nguyễn Văn An",
    date: "2023-05-15",
    status: "approved",
    symptoms: ["Sốt nhẹ", "Ho"],
    temperature: 37.8,
    notes: "Đã cho uống thuốc hạ sốt",
    attendanceDecision: "Nghỉ học",
    reviewedBy: "Y tá Nguyễn Thị Hoa",
    reviewedAt: "2023-05-15 09:30:00",
  },
  {
    id: "DEC002",
    studentId: "ST002",
    studentName: "Trần Thị Bình",
    date: "2023-05-14",
    status: "pending",
    symptoms: ["Không có triệu chứng"],
    temperature: 36.5,
    notes: "",
    attendanceDecision: "Chờ xác nhận",
    reviewedBy: null,
    reviewedAt: null,
  },
  {
    id: "DEC003",
    studentId: "ST001",
    studentName: "Nguyễn Văn An",
    date: "2023-05-10",
    status: "rejected",
    symptoms: ["Đau bụng", "Nôn"],
    temperature: 36.8,
    notes: "Học sinh có biểu hiện đau bụng, đã uống thuốc tại nhà",
    attendanceDecision: "Cần đến cơ sở y tế",
    reviewedBy: "Bác sĩ Lê Văn Hải",
    reviewedAt: "2023-05-10 08:15:00",
  },
];

const HealthDeclaration = () => {
  const { currentUser } = useAuth();

  // Lấy tất cả thông tin cần thiết từ StudentDataContext
  const {
    students,
    parentInfo,
    isLoading: studentsLoading,
    error: studentsError,
    refreshStudents,
    healthProfiles,
    isLoadingHealthProfiles,
    fetchHealthProfile,
    updateHealthProfile,
  } = useStudentData();

  // THÊM state quản lý trạng thái đang tải profile
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // State để lưu danh sách khai báo
  const [declarations, setDeclarations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("form"); // "form" or "history"
  const [fetchError, setFetchError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    id: "",
    bloodType: "",
    height: "",
    weight: "",
    allergies: "",
    chronicDiseases: "",
    visionLeft: "",
    visionRight: "",
    hearingStatus: "",
    dietaryRestrictions: "",
    emergencyContactInfo: "",
    immunizationStatus: "",
    lastPhysicalExamDate: new Date().toISOString().split("T")[0], // Ngày mặc định là hôm nay
    specialNeeds: "",
    symptoms: [],
    notes: "",
    studentId: "", // Dùng cho phần lọc history
  });

  const [formErrors, setFormErrors] = useState({});
  const [formSubmitStatus, setFormSubmitStatus] = useState({
    submitted: false,
    success: false,
    message: "",
  });

  // Fetch danh sách khai báo sức khỏe từ API
  useEffect(() => {
    if (currentUser && currentUser.role === "parent") {
      fetchHealthDeclarations();
    }
  }, [currentUser]);

  // Khi danh sách học sinh được tải xong, chọn học sinh đầu tiên và lấy thông tin sức khỏe
  useEffect(() => {
    if (students.length > 0 && !formData.id) {
      const firstStudent = students[0];
      setFormData((prev) => ({
        ...prev,
        id: firstStudent.id,
      }));

      // Load hồ sơ y tế của học sinh này
      fetchHealthProfile(firstStudent.id);
    }
  }, [students, formData.id, fetchHealthProfile]);

  // Kiểm tra kết nối API khi component mount
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        // Thử gọi một API endpoint đơn giản để kiểm tra kết nối
        await api.get("/ping");
        console.log("API connection check: OK");
        setFetchError(null);
      } catch (error) {
        console.warn("API connection check failed:", error.message);
        // Không hiển thị lỗi ngay lập tức để tránh làm người dùng lo lắng
      }
    };

    checkApiConnection();
  }, []);

  // Thêm useEffect để thiết lập fallback data nếu tải quá lâu
  useEffect(() => {
    let timeoutId;

    if (studentsLoading) {
      timeoutId = setTimeout(() => {
        console.warn("API taking too long, showing error message");
        // Hiển thị thông báo lỗi tải quá lâu
        setFetchError(
          "Tải dữ liệu mất nhiều thời gian hơn dự kiến. Vui lòng kiểm tra kết nối mạng và thử lại sau."
        );
      }, 10000); // 10 giây
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [studentsLoading]);

  // Fetch danh sách khai báo sức khỏe
  const fetchHealthDeclarations = async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      // Sử dụng mock data cho demo
      setTimeout(() => {
        setDeclarations(MOCK_DECLARATIONS);
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error("Error fetching health declarations:", error);
      setFetchError(
        "Không thể tải danh sách khai báo sức khỏe. Vui lòng thử lại sau."
      );
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle student change - also load their health profile
  const handleStudentChange = (studentId) => {
    if (!studentId) return;

    setFormData((prev) => ({
      ...prev,
      id: studentId,
      // Reset các trường về trạng thái rỗng
      bloodType: "",
      height: "",
      weight: "",
      allergies: "",
      chronicDiseases: "",
      visionLeft: "",
      visionRight: "",
      hearingStatus: "",
      dietaryRestrictions: "",
      emergencyContactInfo: "",
      immunizationStatus: "",
      specialNeeds: "",
      // Vẫn giữ ngày là ngày hiện tại
      lastPhysicalExamDate: new Date().toISOString().split("T")[0],
      symptoms: [],
      notes: "",
    }));

    setIsLoadingProfile(false); // Không cần loading profile nữa vì không lấy dữ liệu
  };

  // Handle checkbox changes for symptoms
  const handleSymptomChange = (symptomId) => {
    setFormData((prev) => {
      const currentSymptoms = [...prev.symptoms];

      if (symptomId === "none") {
        // If "none" is selected, clear all other symptoms
        return {
          ...prev,
          symptoms: currentSymptoms.includes("none") ? [] : ["none"],
        };
      } else {
        // If any other symptom is selected, remove "none" if present
        let newSymptoms = currentSymptoms.filter((id) => id !== "none");

        if (newSymptoms.includes(symptomId)) {
          // Remove the symptom if already selected
          newSymptoms = newSymptoms.filter((id) => id !== symptomId);
        } else {
          // Add the symptom if not selected
          newSymptoms.push(symptomId);
        }

        return {
          ...prev,
          symptoms: newSymptoms,
        };
      }
    });

    // Clear symptoms error if it exists
    if (formErrors.symptoms) {
      setFormErrors((prev) => ({
        ...prev,
        symptoms: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.id) {
      errors.id = "Vui lòng chọn học sinh";
    }

    if (!formData.lastPhysicalExamDate) {
      errors.lastPhysicalExamDate = "Vui lòng chọn ngày khai báo";
    } else {
      // Kiểm tra ngày hợp lệ
      const selectedDate = new Date(formData.lastPhysicalExamDate);
      const today = new Date();
      if (selectedDate > today) {
        errors.lastPhysicalExamDate = "Ngày khai báo không thể trong tương lai";
      }
    }

    // Validate height if entered
    if (formData.height) {
      const height = parseFloat(formData.height);
      if (isNaN(height) || height <= 0 || height > 250) {
        errors.height = "Chiều cao phải lớn hơn 0 và nhỏ hơn 250 cm";
      }
    }

    // Validate weight if entered
    if (formData.weight) {
      const weight = parseFloat(formData.weight);
      if (isNaN(weight) || weight <= 0 || weight > 200) {
        errors.weight = "Cân nặng phải lớn hơn 0 và nhỏ hơn 200 kg";
      }
    }

    return errors;
  };

  // Reset form
  const resetForm = () => {
    // Giữ lại id học sinh đã chọn
    const studentId = formData.id;

    setFormData({
      id: studentId,
      bloodType: "",
      height: "",
      weight: "",
      allergies: "",
      chronicDiseases: "",
      visionLeft: "",
      visionRight: "",
      hearingStatus: "",
      dietaryRestrictions: "",
      emergencyContactInfo: "",
      immunizationStatus: "",
      lastPhysicalExamDate: new Date().toISOString().split("T")[0],
      specialNeeds: "",
      symptoms: [],
      notes: "",
      studentId: formData.studentId, // Giữ lại giá trị lọc trong history
    });
  };

  // Thêm khai báo mới vào danh sách lịch sử
  const addToHistory = (healthProfileData) => {
    const student = students.find((s) => s.id === healthProfileData.id);

    const newDeclaration = {
      id: `DEC${Math.floor(Math.random() * 10000)}`,
      studentId: healthProfileData.id,
      studentName: student?.fullName || student?.name || "Học sinh",
      date: healthProfileData.lastPhysicalExamDate,
      status: "pending",
      symptoms: formData.symptoms.includes("none")
        ? ["Không có triệu chứng"]
        : formData.symptoms.map(
            (id) =>
              SYMPTOM_OPTIONS.find((option) => option.id === id)?.label || id
          ),
      notes: formData.notes || "",
      attendanceDecision: "Chờ xác nhận",
    };

    // Thêm vào đầu danh sách declarations
    setDeclarations((prev) => [newDeclaration, ...prev]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormSubmitStatus({
      submitted: false,
      success: false,
      message: "",
    });

    try {
      // Tính BMI trước khi gửi (server sẽ tính lại nhưng chúng ta cũng tính để hiển thị)
      const height = formData.height ? parseFloat(formData.height) : 0;
      const weight = formData.weight ? parseFloat(formData.weight) : 0;
      let calculatedBMI = 0;

      if (height > 0 && weight > 0) {
        calculatedBMI = weight / Math.pow(height / 100, 2);
        calculatedBMI = parseFloat(calculatedBMI.toFixed(1));
      }

      // QUAN TRỌNG: Đảm bảo dữ liệu đúng định dạng theo API
      const healthProfileData = {
        id: parseInt(formData.id), // ID học sinh
        bloodType: formData.bloodType || "Chưa cập nhật",
        height: formData.height ? parseFloat(formData.height) : 0,
        weight: formData.weight ? parseFloat(formData.weight) : 0,
        allergies: formData.allergies || "Không",
        chronicDiseases: formData.chronicDiseases || "Không",
        visionLeft: formData.visionLeft || "Bình thường",
        visionRight: formData.visionRight || "Bình thường",
        hearingStatus: formData.hearingStatus || "Bình thường",
        dietaryRestrictions: formData.dietaryRestrictions || "Không",
        emergencyContactInfo: formData.emergencyContactInfo || "Không có",
        immunizationStatus: formData.immunizationStatus || "Không",
        lastPhysicalExamDate: formData.lastPhysicalExamDate,
        specialNeeds: formData.specialNeeds || "Không",
      };

      // Validate dữ liệu trước khi gửi
      if (!healthProfileData.id || healthProfileData.id <= 0) {
        throw new Error("ID học sinh không hợp lệ");
      }

      if (!healthProfileData.lastPhysicalExamDate) {
        throw new Error("Ngày khai báo không được để trống");
      }

      console.log("Sending health profile data:", healthProfileData);

      // Gọi API qua context
      const response = await updateHealthProfile(healthProfileData);
      console.log("Health profile API response:", response);

      // Chuẩn bị dữ liệu đầy đủ để cập nhật UI (bao gồm cả BMI và lastUpdated từ server)
      const updatedProfileData = {
        ...healthProfileData,
        // Sử dụng dữ liệu từ server response nếu có
        bmi: response.bmi || calculatedBMI, // Server sẽ tính BMI chính xác
        lastUpdated: response.lastUpdated || new Date().toISOString(),
        // Merge tất cả dữ liệu từ server response
        ...response,
      };

      console.log("Complete profile data for event:", updatedProfileData);

      // Kích hoạt sự kiện để thông báo cập nhật hồ sơ y tế
      import("../../../../services/eventBus").then((module) => {
        const eventBus = module.default;
        eventBus.emit(
          "healthProfileUpdated",
          updatedProfileData.id,
          updatedProfileData // Gửi dữ liệu đầy đủ từ server
        );
        console.log("Đã gửi sự kiện cập nhật cho ID:", updatedProfileData.id);
      });

      // Hiển thị thông báo thành công
      setFormSubmitStatus({
        submitted: true,
        success: true,
        message:
          "Khai báo sức khỏe đã được gửi thành công và đã cập nhật vào hồ sơ y tế!",
      });

      // Thêm vào lịch sử với dữ liệu đầy đủ
      addToHistory(updatedProfileData);

      // Reset form
      resetForm();

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setFormSubmitStatus({
          submitted: false,
          success: false,
          message: "",
        });
      }, 5000);
    } catch (error) {
      console.error("Error submitting health declaration:", error);

      let errorMessage = "Không thể gửi khai báo sức khỏe.";

      if (error.response) {
        // Lỗi từ server
        console.error("Server error details:", error.response.data);
        errorMessage =
          error.response.data?.message ||
          `Lỗi server: ${error.response.status}`;
      } else if (error.request) {
        // Không nhận được phản hồi từ server
        errorMessage =
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
      } else {
        // Lỗi khác
        errorMessage = error.message || "Đã xảy ra lỗi không xác định.";
      }

      setFormSubmitStatus({
        submitted: true,
        success: false,
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Thêm hàm mới để tính toán trạng thái sức khỏe
  const calculateHealthStatus = (data) => {
    // Kiểm tra các điều kiện để xác định trạng thái sức khỏe
    if (
      data.symptoms &&
      data.symptoms.length > 0 &&
      !data.symptoms.includes("none")
    ) {
      return "Cần chú ý";
    }

    // Nếu có bệnh mãn tính
    if (data.chronicDiseases && data.chronicDiseases !== "Không có") {
      return "Theo dõi";
    }

    // Nếu có dị ứng đáng chú ý
    if (data.allergies && data.allergies !== "Không có") {
      return "Lưu ý dị ứng";
    }

    return "Bình thường";
  };

  // Get the selected student
  const selectedStudent = students.find((s) => s.id === formData.id);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  // Calculate age from birthdate
  const calculateAge = (dob) => {
    if (!dob) return "";

    // Handle year-only format
    const fullDob = dob.length === 4 ? `${dob}-01-01` : dob;

    const birthDate = new Date(fullDob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Filter declarations for the selected student
  const getStudentDeclarations = (studentId) => {
    return declarations.filter(
      (declaration) => declaration.studentId === studentId
    );
  };

  return (
    <div className="health-declaration-container">
      {/* Header */}
      <div className="health-declaration-header">
        <div className="school-info">
          <img
            src={MOCK_SCHOOL.logo || "/default-school-logo.png"}
            alt={MOCK_SCHOOL.name}
            className="school-logo"
          />
          <h1>Khai báo sức khỏe học sinh</h1>
          <p>{MOCK_SCHOOL.name}</p>
        </div>
        <p className="header-description">
          Thông tin khai báo sẽ được gửi đến y tá/bác sĩ của trường để theo dõi
          sức khỏe của học sinh
        </p>
      </div>

      {/* Tab navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "form" ? "active" : ""}`}
          onClick={() => setActiveTab("form")}
        >
          <i className="fas fa-file-medical"></i> Biểu mẫu khai báo
        </button>
        <button
          className={`tab-button ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <i className="fas fa-history"></i> Lịch sử khai báo
        </button>
      </div>

      {activeTab === "form" ? (
        <div className="declaration-form-section">
          {/* Thông báo lỗi kết nối */}
          {fetchError && (
            <div className="error-message global-error">
              <i className="fas fa-exclamation-triangle"></i> {fetchError}
            </div>
          )}

          {/* Thông báo trạng thái form */}
          {formSubmitStatus.submitted && (
            <div
              className={`form-message ${
                formSubmitStatus.success ? "success" : "error"
              }`}
            >
              <i
                className={`fas ${
                  formSubmitStatus.success
                    ? "fa-check-circle"
                    : "fa-exclamation-triangle"
                }`}
              ></i>
              {formSubmitStatus.message}
            </div>
          )}

          {/* Form khai báo sức khỏe */}
          <form className="health-declaration-form" onSubmit={handleSubmit}>
            {/* Phần 1: Thông tin học sinh - Đã sửa lại */}
            <div className="form-section" id="student-info-section">
              <h3>
                <i className="fas fa-user-graduate"></i> 1. Thông tin học sinh
              </h3>

              {studentsLoading ? (
                <div className="loading-container form-loading">
                  <div className="spinner-container">
                    <div className="spinner-border"></div>
                  </div>
                  <p>Đang tải thông tin học sinh...</p>
                  <button
                    onClick={refreshStudents}
                    className="retry-button"
                    type="button"
                  >
                    <i className="fas fa-sync"></i> Tải lại
                  </button>
                </div>
              ) : studentsError ? (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i>
                  <p>{studentsError}</p>
                  <button
                    onClick={refreshStudents}
                    className="retry-button"
                    type="button"
                  >
                    <i className="fas fa-sync"></i> Thử lại
                  </button>
                </div>
              ) : students.length === 0 ? (
                <div className="no-student-info">
                  <i className="fas fa-exclamation-triangle"></i>
                  <p>
                    Không tìm thấy thông tin học sinh. Vui lòng liên hệ với nhà
                    trường.
                  </p>
                </div>
              ) : (
                <>
                  {/* Phần chọn học sinh */}
                  <div className="student-tabs-container">
                    <p className="selection-label">Chọn học sinh:</p>
                    <div className="student-tabs">
                      {students.map((student) => (
                        <div
                          key={student.id}
                          className={`student-tab ${
                            formData.id === student.id ? "active" : ""
                          }`}
                          onClick={() => handleStudentChange(student.id)}
                        >
                          <div className="student-avatar">
                            <img
                              src={
                                student.avatar ||
                                "https://i.pravatar.cc/150?img=11"
                              }
                              alt={student.fullName || student.name}
                            />
                          </div>
                          <div className="student-tab-info">
                            <span className="student-name">
                              {student.fullName || student.name}
                            </span>
                            <span className="student-class">
                              Lớp {student.className || student.class}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hiển thị thông tin chi tiết học sinh đã chọn */}
                  {selectedStudent && (
                    <div className="selected-student-details">
                      {isLoadingProfile ? (
                        <div className="profile-loading">
                          <div className="spinner-border-sm"></div>
                          <span>Đang tải hồ sơ...</span>
                        </div>
                      ) : (
                        <>
                          {/* Phần header thông tin học sinh */}
                          <div className="student-profile-header">
                            <img
                              src={
                                selectedStudent.avatar ||
                                "https://i.pravatar.cc/150?img=11"
                              }
                              alt={
                                selectedStudent.fullName || selectedStudent.name
                              }
                              className="profile-avatar"
                            />
                            <div className="profile-basic-info">
                              <h4>
                                {selectedStudent.fullName ||
                                  selectedStudent.name}
                              </h4>
                              <p>
                                Lớp{" "}
                                {selectedStudent.className ||
                                  selectedStudent.class}
                              </p>
                              <p className="school-name">
                                {selectedStudent.schoolName || MOCK_SCHOOL.name}
                              </p>
                            </div>
                          </div>

                          {/* Thông tin chi tiết */}
                          <div className="student-profile-details">
                            <div className="detail-item">
                              <span className="label">Mã học sinh:</span>
                              <span className="value">
                                {selectedStudent.studentCode ||
                                  selectedStudent.id}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="label">Ngày sinh:</span>
                              <span className="value">
                                {formatDate(
                                  selectedStudent.dateOfBirth ||
                                    selectedStudent.dob
                                ) || "Chưa cập nhật"}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="label">Tuổi:</span>
                              <span className="value">
                                {selectedStudent.age ||
                                  calculateAge(
                                    selectedStudent.dateOfBirth ||
                                      selectedStudent.dob
                                  ) ||
                                  "N/A"}{" "}
                                tuổi
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="label">Giới tính:</span>
                              <span className="value">
                                {selectedStudent.gender || "Chưa cập nhật"}
                              </span>
                            </div>
                            <div className="detail-item health-status-item">
                              <span className="label">Tình trạng:</span>
                              <span className="value health-status">
                                {healthProfiles &&
                                healthProfiles[selectedStudent.id]
                                  ? healthProfiles[selectedStudent.id]
                                      .healthStatus || "Bình thường"
                                  : selectedStudent.healthStatus ||
                                    "Chưa có thông tin"}
                              </span>
                            </div>
                            {/* Hiển thị thông tin phụ huynh nếu có */}
                            {parentInfo && (
                              <div className="detail-item parent-info">
                                <span className="label">Phụ huynh:</span>
                                <span className="value">
                                  {parentInfo.fullName}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Hiển thị khai báo gần đây */}
                          {getStudentDeclarations(selectedStudent.id).length >
                            0 && (
                            <div className="recent-declaration">
                              <h5>Khai báo gần đây nhất:</h5>
                              <div
                                className={`recent-status ${getStatusBadgeClass(
                                  getStudentDeclarations(selectedStudent.id)[0]
                                    .status
                                )}`}
                              >
                                <div className="recent-date">
                                  <i className="far fa-calendar-alt"></i>{" "}
                                  {formatDate(
                                    getStudentDeclarations(
                                      selectedStudent.id
                                    )[0].date
                                  )}
                                </div>
                                <div className="recent-decision">
                                  {
                                    getStudentDeclarations(
                                      selectedStudent.id
                                    )[0].attendanceDecision
                                  }
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Hiển thị lỗi nếu có */}
                  {formErrors.id && (
                    <div className="error-message">{formErrors.id}</div>
                  )}
                </>
              )}
            </div>

            {/* Phần 2: Thông tin khai báo */}
            <div className="form-section">
              <h3>2. Thông tin sức khỏe cơ bản</h3>

              <div className="form-group">
                <label htmlFor="lastPhysicalExamDate">
                  Ngày khai báo <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="lastPhysicalExamDate"
                  name="lastPhysicalExamDate"
                  value={formData.lastPhysicalExamDate}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
                {formErrors.lastPhysicalExamDate && (
                  <div className="error-message">
                    {formErrors.lastPhysicalExamDate}
                  </div>
                )}
              </div>

              {/* Thêm các trường thông tin sức khỏe mới */}
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="height">Chiều cao (cm)</label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    placeholder="Nhập chiều cao (cm)"
                    value={formData.height}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                  />
                  {formErrors.height && (
                    <div className="error-message">{formErrors.height}</div>
                  )}
                </div>

                <div className="form-group half">
                  <label htmlFor="weight">Cân nặng (kg)</label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    placeholder="Nhập cân nặng (kg)"
                    value={formData.weight}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                  />
                  {formErrors.weight && (
                    <div className="error-message">{formErrors.weight}</div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="bloodType">Nhóm máu</label>
                  <select
                    id="bloodType"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Chọn nhóm máu --</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="Chưa xác định">Chưa xác định</option>
                  </select>
                </div>

                <div className="form-group half">
                  <label htmlFor="allergies">Dị ứng</label>
                  <input
                    type="text"
                    id="allergies"
                    name="allergies"
                    placeholder="Nhập thông tin dị ứng (nếu có)"
                    value={formData.allergies}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="chronicDiseases">Bệnh mãn tính</label>
                <input
                  type="text"
                  id="chronicDiseases"
                  name="chronicDiseases"
                  placeholder="Nhập thông tin về bệnh mãn tính (nếu có)"
                  value={formData.chronicDiseases}
                  onChange={handleInputChange}
                />
              </div>

              {/* Phần thị lực */}
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="visionLeft">Thị lực mắt trái</label>
                  <input
                    type="text"
                    id="visionLeft"
                    name="visionLeft"
                    placeholder="Ví dụ: 20/20"
                    value={formData.visionLeft}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group half">
                  <label htmlFor="visionRight">Thị lực mắt phải</label>
                  <input
                    type="text"
                    id="visionRight"
                    name="visionRight"
                    placeholder="Ví dụ: 20/20"
                    value={formData.visionRight}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="hearingStatus">Thính lực</label>
                <select
                  id="hearingStatus"
                  name="hearingStatus"
                  value={formData.hearingStatus}
                  onChange={handleInputChange}
                >
                  <option value="">-- Chọn tình trạng thính lực --</option>
                  <option value="Bình thường">Bình thường</option>
                  <option value="Giảm nhẹ">Giảm nhẹ</option>
                  <option value="Giảm trung bình">Giảm trung bình</option>
                  <option value="Giảm nặng">Giảm nặng</option>
                  <option value="Chưa kiểm tra">Chưa kiểm tra</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dietaryRestrictions">
                  Chế độ ăn uống đặc biệt
                </label>
                <input
                  type="text"
                  id="dietaryRestrictions"
                  name="dietaryRestrictions"
                  placeholder="Nhập thông tin về hạn chế ăn uống (nếu có)"
                  value={formData.dietaryRestrictions}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="immunizationStatus">
                  Tình trạng tiêm chủng
                </label>
                <select
                  id="immunizationStatus"
                  name="immunizationStatus"
                  value={formData.immunizationStatus}
                  onChange={handleInputChange}
                >
                  <option value="">-- Chọn tình trạng tiêm chủng --</option>
                  <option value="Đầy đủ">Đầy đủ</option>
                  <option value="Chưa đầy đủ">Chưa đầy đủ</option>
                  <option value="Đang cập nhật">Đang cập nhật</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="specialNeeds">Nhu cầu đặc biệt</label>
                <textarea
                  id="specialNeeds"
                  name="specialNeeds"
                  placeholder="Nhập thông tin về nhu cầu đặc biệt (nếu có)"
                  value={formData.specialNeeds}
                  onChange={handleInputChange}
                  rows="2"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="emergencyContactInfo">
                  Thông tin liên hệ khẩn cấp
                </label>
                <textarea
                  id="emergencyContactInfo"
                  name="emergencyContactInfo"
                  placeholder="Nhập thông tin liên hệ khẩn cấp"
                  value={formData.emergencyContactInfo}
                  onChange={handleInputChange}
                  rows="2"
                ></textarea>
              </div>
            </div>

            {/* Phần 3: Triệu chứng và ghi chú */}
            <div className="form-section">
              <h3>3. Triệu chứng và ghi chú</h3>

              <div className="form-group">
                <label>
                  Triệu chứng <span className="required">*</span>
                </label>
                <div className="symptoms-grid">
                  {SYMPTOM_OPTIONS.map((symptom) => (
                    <div className="symptom-checkbox" key={symptom.id}>
                      <input
                        type="checkbox"
                        id={`symptom-${symptom.id}`}
                        checked={formData.symptoms.includes(symptom.id)}
                        onChange={() => handleSymptomChange(symptom.id)}
                        disabled={formData.symptoms.includes("none")}
                      />
                      <label htmlFor={`symptom-${symptom.id}`}>
                        {symptom.label}
                      </label>
                    </div>
                  ))}
                  <div className="symptom-checkbox symptom-none">
                    <input
                      type="checkbox"
                      id="symptom-none"
                      checked={formData.symptoms.includes("none")}
                      onChange={() => handleSymptomChange("none")}
                    />
                    <label htmlFor="symptom-none">Không có triệu chứng</label>
                  </div>
                </div>
                {formErrors.symptoms && (
                  <div className="error-message">{formErrors.symptoms}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="notes">Ghi chú bổ sung</label>
                <textarea
                  id="notes"
                  name="notes"
                  placeholder="Nhập các thông tin bổ sung về tình trạng sức khỏe của học sinh..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                ></textarea>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting || isLoadingHealthProfiles}
              >
                {isSubmitting ? (
                  <div className="button-loading">
                    <div className="spinner-border-sm"></div>
                    <span>Đang gửi...</span>
                  </div>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i> Gửi khai báo
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="declaration-info">
            <h3>
              <i className="fas fa-info-circle"></i> Lưu ý quan trọng
            </h3>
            <ul>
              <li>
                Thông tin khai báo sẽ được gửi trực tiếp đến y tá/bác sĩ của{" "}
                {MOCK_SCHOOL.name}.
              </li>
              <li>
                Vui lòng khai báo thông tin chính xác để nhà trường có biện pháp
                theo dõi và hỗ trợ kịp thời.
              </li>
              <li>
                Với các triệu chứng nghiêm trọng, phụ huynh nên đưa học sinh đến
                cơ sở y tế để được khám và điều trị.
              </li>
              <li>
                Y tá nhà trường sẽ liên hệ với phụ huynh nếu cần thêm thông tin.
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="declaration-history-section">
          {students.length > 0 && (
            <div className="history-filter">
              <div className="filter-student">
                <h3>Lịch sử khai báo sức khỏe</h3>
                <div className="student-filter-tabs">
                  <button
                    className={formData.studentId === "" ? "active" : ""}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, studentId: "" }))
                    }
                    type="button"
                  >
                    Tất cả học sinh
                  </button>
                  {students.map((student) => (
                    <button
                      key={student.id}
                      className={
                        formData.studentId === student.id ? "active" : ""
                      }
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          studentId: student.id,
                        }))
                      }
                      type="button"
                    >
                      {student.fullName || student.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="loading-container">
              <div className="spinner-container">
                <div className="spinner-border"></div>
              </div>
              <p>Đang tải lịch sử khai báo...</p>
            </div>
          ) : declarations.length === 0 ? (
            <div className="no-declarations">
              <i className="fas fa-folder-open"></i>
              <p>Chưa có khai báo sức khỏe nào được ghi nhận</p>
            </div>
          ) : (
            <div className="declarations-list">
              {declarations
                .filter((declaration) =>
                  formData.studentId
                    ? declaration.studentId === formData.studentId
                    : true
                )
                .map((declaration) => (
                  <div className="declaration-card" key={declaration.id}>
                    <div className="declaration-header">
                      <div className="declaration-info">
                        <h3>{declaration.studentName}</h3>
                        <p className="declaration-date">
                          <i className="far fa-calendar-alt"></i>{" "}
                          {formatDate(declaration.date)}
                        </p>
                      </div>
                      <div
                        className={`status-badge ${getStatusBadgeClass(
                          declaration.status
                        )}`}
                      >
                        {declaration.status === "approved"
                          ? "Đã duyệt"
                          : declaration.status === "rejected"
                          ? "Từ chối"
                          : "Đang chờ"}
                      </div>
                    </div>

                    <div className="declaration-body">
                      <div className="declaration-item">
                        <span className="label">Triệu chứng:</span>
                        <div className="symptoms-list">
                          {declaration.symptoms.length > 0 ? (
                            declaration.symptoms.map((symptom, index) => (
                              <span className="symptom-tag" key={index}>
                                {symptom}
                              </span>
                            ))
                          ) : (
                            <span className="no-symptoms">
                              Không có triệu chứng
                            </span>
                          )}
                        </div>
                      </div>

                      {declaration.temperature > 0 && (
                        <div className="declaration-item">
                          <span className="label">Nhiệt độ:</span>
                          <span
                            className={`temperature-value ${
                              declaration.temperature >= 37.5 ? "high-temp" : ""
                            }`}
                          >
                            {declaration.temperature}°C
                          </span>
                        </div>
                      )}

                      {declaration.notes && (
                        <div className="declaration-item">
                          <span className="label">Ghi chú:</span>
                          <span className="notes-value">
                            {declaration.notes}
                          </span>
                        </div>
                      )}

                      <div className="declaration-item">
                        <span className="label">Kết quả:</span>
                        <span className="decision-value">
                          {declaration.attendanceDecision}
                        </span>
                      </div>
                    </div>

                    {declaration.reviewedBy && (
                      <div className="declaration-footer">
                        <p>
                          <i className="fas fa-user-nurse"></i> Phản hồi bởi:{" "}
                          {declaration.reviewedBy}
                        </p>
                        <p>
                          <i className="far fa-clock"></i> Thời gian:{" "}
                          {declaration.reviewedAt}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Sửa lỗi hàm formatDate
const formatDate = (dateString) => {
  if (!dateString) return "";

  try {
    // Handle year-only format
    const fullDate =
      dateString.length === 4 ? `${dateString}-01-01` : dateString;

    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(fullDate).toLocaleDateString("vi-VN", options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return ""; // Return empty string if can't format
  }
};

// Helper function for status badge classes
const getStatusBadgeClass = (status) => {
  switch (status) {
    case "approved":
      return "status-approved";
    case "rejected":
      return "status-rejected";
    case "pending":
      return "status-pending";
    default:
      return "";
  }
};

export default HealthDeclaration;
