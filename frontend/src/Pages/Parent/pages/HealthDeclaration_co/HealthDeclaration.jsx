import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useStudentData } from "../../../../context/StudentDataContext";
// Thay thế các import CSS cũ bằng CSS mới
import "./HealthDeclarationFix.css";
import "./HealthDeclaration.css";

//http://localhost:8080/api/parent-medication-requests/my-requests
//xem lịch sử khai báo sức khỏe của học sinh

//put cập nhật khai báo sức khỏe của học sinh
//delete xóa khai báo sức khỏe của học sinh

// Mock data cho trường học
const MOCK_SCHOOL = {
  id: "SCH001",
  name: "THCS Nguyễn Đình Chiểu",
  address: "123 Nguyễn Du, Quận 1, TP.HCM",
  phone: "028.1234.5678",
  email: "thcsnguyendu@edu.vn",
  logo: "/school-logo.png",
};

// Mock data cho user hiện tại - sẽ được thay thế bằng AuthContext thực tế
const MOCK_CURRENT_USER = {
  id: "PH001",
  fullName: "Nguyễn Văn Bình",
  email: "nguyenvanbinh@gmail.com",
  phone: "0912345678",
};

// Mock lịch sử khai báo - sẽ được lấy từ API backend
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
    studentId: "ST001",
    studentName: "Nguyễn Văn An",
    date: "2023-04-20",
    status: "approved",
    symptoms: ["Đau họng"],
    temperature: 37.2,
    notes: "Cần theo dõi thêm",
    attendanceDecision: "Đi học bình thường",
    reviewedBy: "Y tá Trần Văn Nam",
    reviewedAt: "2023-04-20 08:45:00",
  },
  {
    id: "DEC003",
    studentId: "ST002",
    studentName: "Nguyễn Thị Bình",
    date: "2023-05-10",
    status: "pending",
    symptoms: ["Ho", "Sổ mũi"],
    temperature: 36.8,
    notes: "Ho nhiều vào buổi sáng",
    attendanceDecision: "Chờ xác nhận",
    reviewedBy: null,
    reviewedAt: null,
  },
];

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

const HealthDeclaration = () => {
  const { currentUser } = useAuth();
  const { students, isLoading: studentsLoading } = useStudentData();

  // Giả lập user hiện tại là phụ huynh nếu chưa đăng nhập
  const user = currentUser || MOCK_CURRENT_USER;

  const [declarations, setDeclarations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("form"); // "form" or "history"

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
    temperature: "",
    notes: "",
    attendanceDecision: "decision_pending",
  });

  const [formErrors, setFormErrors] = useState({});
  const [formSubmitStatus, setFormSubmitStatus] = useState({
    submitted: false,
    success: false,
    message: "",
  });

  // Load mock declarations data
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

  // Theo dõi thay đổi từ context students và cập nhật form
  useEffect(() => {
    if (students.length > 0 && !formData.studentId) {
      setFormData((prev) => ({
        ...prev,
        studentId: students[0].id,
      }));
    }
  }, [students, formData.studentId]);

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

    if (!formData.studentId) {
      errors.studentId = "Vui lòng chọn học sinh";
    }

    if (!formData.date) {
      errors.date = "Vui lòng chọn ngày khai báo";
    }

    if (formData.symptoms.length === 0) {
      errors.symptoms =
        "Vui lòng chọn ít nhất một triệu chứng hoặc chọn 'Không có triệu chứng'";
    }

    if (
      formData.temperature &&
      (parseFloat(formData.temperature) < 35 ||
        parseFloat(formData.temperature) > 42)
    ) {
      errors.temperature = "Nhiệt độ phải nằm trong khoảng 35°C đến 42°C";
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Submit form
    setIsSubmitting(true);

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
        ...response
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
      message: "Khai báo sức khỏe đã được gửi thành công và đã cập nhật vào hồ sơ y tế!",
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
        errorMessage = error.response.data?.message || `Lỗi server: ${error.response.status}`;
      } else if (error.request) {
        // Không nhận được phản hồi từ server
        errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
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
  const selectedStudent = students.find((s) => s.id === formData.studentId);

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

          <form className="health-declaration-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>
                <i className="fas fa-user-graduate"></i> 1. Thông tin học sinh
              </h3>

              {studentsLoading ? (
                <div className="loading-container form-loading">
                  <div className="spinner-container">
                    <div className="spinner-border"></div>
                  </div>
                  <p>Đang tải thông tin học sinh...</p>
                </div>
              ) : students.length > 0 ? (
                <div className="student-selection">
                  {students.length > 1 ? (
                    <div className="student-tabs-container">
                      <p className="selection-label">Chọn học sinh:</p>
                      <div className="student-tabs">
                        {students.map((student) => (
                          <div
                            key={student.id}
                            className={`student-tab ${
                              formData.studentId === student.id ? "active" : ""
                            }`}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                studentId: student.id,
                              }));
                            }}
                          >
                            <img
                              src={
                                student.avatar ||
                                "https://i.pravatar.cc/150?img=11"
                              }
                              alt={student.name}
                              className="student-avatar"
                            />
                            <div className="student-tab-info">
                              <span className="student-name">
                                {student.name}
                              </span>
                              <span className="student-class">
                                Lớp {student.class}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="single-student-info">
                      <img
                        src={
                          students[0].avatar ||
                          "https://i.pravatar.cc/150?img=11"
                        }
                        alt={students[0].name}
                        className="student-avatar"
                      />
                      <div className="student-details">
                        <h4>{students[0].name}</h4>
                        <p>
                          Lớp {students[0].class} • {MOCK_SCHOOL.name}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedStudent && (
                    <div className="selected-student-details">
                      <div className="student-profile-header">
                        <img
                          src={
                            selectedStudent.avatar ||
                            "https://i.pravatar.cc/150?img=11"
                          }
                          alt={selectedStudent.name}
                          className="profile-avatar"
                        />
                        <div className="profile-basic-info">
                          <h4>{selectedStudent.name}</h4>
                          <p>Lớp {selectedStudent.class}</p>
                          <p className="school-name">{MOCK_SCHOOL.name}</p>
                        </div>
                      </div>

                      <div className="student-profile-details">
                        <div className="detail-item">
                          <span className="label">Ngày sinh:</span>
                          <span className="value">
                            {selectedStudent.dob || "Chưa cập nhật"}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Tuổi:</span>
                          <span className="value">
                            {selectedStudent.age ||
                              calculateAge(selectedStudent.dob) ||
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
                            {selectedStudent.healthStatus ||
                              "Cập nhật từ hồ sơ y tế"}
                          </span>
                        </div>
                      </div>

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
                                getStudentDeclarations(selectedStudent.id)[0]
                                  .date
                              )}
                            </div>
                            <div className="recent-decision">
                              {
                                getStudentDeclarations(selectedStudent.id)[0]
                                  .attendanceDecision
                              }
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {formErrors.studentId && (
                    <div className="error-message">{formErrors.studentId}</div>
                  )}
                </div>
              ) : (
                <div className="no-student-info">
                  <i className="fas fa-exclamation-triangle"></i>
                  <p>
                    Không tìm thấy thông tin học sinh. Vui lòng liên hệ với nhà
                    trường.
                  </p>
                </div>
              )}
            </div>

            <div className="form-section">
              <h3>2. Thông tin khai báo</h3>

              <div className="form-group">
                <label htmlFor="date">
                  Ngày khai báo <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
                {formErrors.date && (
                  <div className="error-message">{formErrors.date}</div>
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
                <label htmlFor="temperature">Nhiệt độ cơ thể (°C)</label>
                <input
                  type="number"
                  id="temperature"
                  name="temperature"
                  placeholder="Ví dụ: 37.5"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  min="35"
                  max="42"
                  step="0.1"
                />
                {formErrors.temperature && (
                  <div className="error-message">{formErrors.temperature}</div>
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
                disabled={isSubmitting}
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
                    >
                      {student.name}
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
