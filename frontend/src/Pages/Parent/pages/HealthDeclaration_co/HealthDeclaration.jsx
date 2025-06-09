import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useStudentData } from "../../../../context/StudentDataContext";
// Thay thế các import CSS cũ bằng CSS mới
import "./HealthDeclarationFix.css";
import "./HealthDeclaration.css";

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
    studentId: "",
    date: new Date().toISOString().split("T")[0],
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
    setIsLoading(true);
    setTimeout(() => {
      setDeclarations(MOCK_DECLARATIONS);
      setIsLoading(false);
    }, 800);
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

    // Simulate API call
    setTimeout(() => {
      try {
        // Generate a new declaration
        const newDeclaration = {
          id: `DEC${Math.floor(Math.random() * 10000)}`,
          studentId: formData.studentId,
          studentName:
            students.find((s) => s.id === formData.studentId)?.name || "",
          date: formData.date,
          status: "pending",
          symptoms: formData.symptoms.includes("none")
            ? ["Không có triệu chứng"]
            : formData.symptoms.map(
                (id) =>
                  SYMPTOM_OPTIONS.find((option) => option.id === id)?.label ||
                  id
              ),
          temperature: parseFloat(formData.temperature) || 0,
          notes: formData.notes,
          attendanceDecision: "Chờ xác nhận",
          reviewedBy: null,
          reviewedAt: null,
        };

        // Add to declarations list
        setDeclarations((prev) => [newDeclaration, ...prev]);

        // Show success message
        setFormSubmitStatus({
          submitted: true,
          success: true,
          message:
            "Khai báo sức khỏe đã được gửi thành công và đang chờ xác nhận từ y tá.",
        });

        // Reset form but keep student selection
        const studentId = formData.studentId;
        setFormData({
          studentId: studentId,
          date: new Date().toISOString().split("T")[0],
          symptoms: [],
          temperature: "",
          notes: "",
          attendanceDecision: "decision_pending",
        });

        setIsSubmitting(false);

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setFormSubmitStatus({
            submitted: false,
            success: false,
            message: "",
          });
        }, 5000);

        // Switch to history tab after successful submission
        if (getStudentDeclarations(studentId).length === 1) {
          setTimeout(() => {
            setActiveTab("history");
          }, 2000);
        }
      } catch (error) {
        console.error("Error submitting health declaration:", error);
        setFormSubmitStatus({
          submitted: true,
          success: false,
          message: "Có lỗi xảy ra khi gửi khai báo. Vui lòng thử lại sau.",
        });
        setIsSubmitting(false);
      }
    }, 1500);
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
