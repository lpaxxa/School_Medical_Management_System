import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useStudentData } from "../../context/StudentDataContext";
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

// Mock data cho user hiện tại
const MOCK_CURRENT_USER = {
  id: "PH001",
  fullName: "Nguyễn Văn Bình",
  email: "nguyenvanbinh@gmail.com",
  phone: "0912345678",
};

// Mock lịch sử khai báo
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

  // Người dùng hiện tại
  const user = currentUser || MOCK_CURRENT_USER;

  // States
  const [declarations, setDeclarations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("form");

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

  // Tải dữ liệu khai báo
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setDeclarations(MOCK_DECLARATIONS);
      setIsLoading(false);
    }, 800);
  }, []);

  // Cập nhật học sinh đầu tiên khi có dữ liệu
  useEffect(() => {
    if (students.length > 0 && !formData.studentId) {
      setFormData((prev) => ({
        ...prev,
        studentId: students[0].id,
      }));
    }
  }, [students, formData.studentId]);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Xóa lỗi
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Xử lý chọn triệu chứng
  const handleSymptomChange = (symptomId) => {
    setFormData((prev) => {
      const currentSymptoms = [...prev.symptoms];

      if (currentSymptoms.includes(symptomId)) {
        return {
          ...prev,
          symptoms: currentSymptoms.filter((id) => id !== symptomId),
        };
      } else {
        return {
          ...prev,
          symptoms: [...currentSymptoms, symptomId],
        };
      }
    });

    // Xóa lỗi triệu chứng
    if (formErrors.symptoms) {
      setFormErrors((prev) => ({
        ...prev,
        symptoms: "",
      }));
    }
  };

  // Xác thực form
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
      (formData.temperature < 35 || formData.temperature > 42)
    ) {
      errors.temperature = "Nhiệt độ phải nằm trong khoảng 35°C đến 42°C";
    }

    return errors;
  };

  // Xử lý gửi form
  const handleSubmit = (e) => {
    e.preventDefault();

    // Xác thực form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Gửi form
    setIsSubmitting(true);

    // Giả lập API
    setTimeout(() => {
      try {
        // Tạo khai báo mới
        const newDeclaration = {
          id: `DEC${Math.floor(Math.random() * 10000)}`,
          studentId: formData.studentId,
          studentName:
            students.find((s) => s.id === formData.studentId)?.name || "",
          date: formData.date,
          status: "pending",
          symptoms: formData.symptoms.map(
            (id) =>
              SYMPTOM_OPTIONS.find((option) => option.id === id)?.label || id
          ),
          temperature: parseFloat(formData.temperature) || 0,
          notes: formData.notes,
          attendanceDecision: "Chờ xác nhận",
          reviewedBy: null,
          reviewedAt: null,
        };

        // Thêm vào danh sách
        setDeclarations((prev) => [newDeclaration, ...prev]);

        // Hiển thị thông báo thành công
        setFormSubmitStatus({
          submitted: true,
          success: true,
          message:
            "Khai báo sức khỏe đã được gửi thành công và đang chờ xác nhận từ y tá.",
        });

        // Đặt lại form
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

        // Ẩn thông báo sau 5 giây
        setTimeout(() => {
          setFormSubmitStatus({
            submitted: false,
            success: false,
            message: "",
          });
        }, 5000);

        // Chuyển tab sang lịch sử nếu là khai báo đầu tiên
        if (getStudentDeclarations(studentId).length === 1) {
          setTimeout(() => {
            setActiveTab("history");
          }, 1000);
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

  // Lấy học sinh đã chọn
  const selectedStudent = students.find((s) => s.id === formData.studentId);

  // Lấy class cho trạng thái
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

  // Format ngày tháng
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  // Tính tuổi
  const calculateAge = (dob) => {
    if (!dob) return "";

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

  // Lọc khai báo theo học sinh
  const getStudentDeclarations = (studentId) => {
    return declarations.filter(
      (declaration) => declaration.studentId === studentId
    );
  };

  // Render component chính
  return (
    <div className="health-declaration">
      {/* Header */}
      <div className="health-declaration__header">
        <div className="health-declaration__school-info">
          <img
            src={MOCK_SCHOOL.logo || "/default-school-logo.png"}
            alt={MOCK_SCHOOL.name}
            className="health-declaration__school-logo"
          />
          <div className="health-declaration__header-text">
            <h1>Khai báo sức khỏe học sinh</h1>
            <p>{MOCK_SCHOOL.name}</p>
          </div>
        </div>
        <p className="health-declaration__description">
          Thông tin khai báo sẽ được gửi đến y tá/bác sĩ của trường để theo dõi
          sức khỏe của học sinh
        </p>
      </div>

      {/* Tabs */}
      <div className="health-declaration__tabs">
        <div className="health-declaration__tab-navigation">
          <button
            className={`health-declaration__tab-btn ${
              activeTab === "form" ? "active" : ""
            }`}
            onClick={() => setActiveTab("form")}
          >
            <i className="fas fa-file-medical"></i> Biểu mẫu khai báo
          </button>
          <button
            className={`health-declaration__tab-btn ${
              activeTab === "history" ? "active" : ""
            }`}
            onClick={() => setActiveTab("history")}
          >
            <i className="fas fa-history"></i> Lịch sử khai báo
          </button>
        </div>

        {/* Nội dung tab */}
        <div className="health-declaration__tab-content">
          {activeTab === "form" ? (
            <div className="health-declaration__form-container">
              {/* Thông báo gửi form */}
              {formSubmitStatus.submitted && (
                <div
                  className={`health-declaration__message ${
                    formSubmitStatus.success ? "success" : "error"
                  }`}
                >
                  <i
                    className={`fas ${
                      formSubmitStatus.success
                        ? "fa-check-circle"
                        : "fa-exclamation-circle"
                    }`}
                  ></i>
                  <span>{formSubmitStatus.message}</span>
                </div>
              )}

              {/* Form khai báo */}
              <form
                className="health-declaration__form"
                onSubmit={handleSubmit}
              >
                {/* Phần 1: Thông tin học sinh */}
                <div className="health-declaration__section">
                  <h3 className="health-declaration__section-title">
                    <span>1. Thông tin học sinh</span>
                  </h3>

                  {/* Loading */}
                  {studentsLoading ? (
                    <div className="health-declaration__loading">
                      <div className="health-declaration__spinner"></div>
                      <p>Đang tải thông tin học sinh...</p>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="health-declaration__empty-state">
                      <i className="fas fa-exclamation-triangle"></i>
                      <p>
                        Không tìm thấy thông tin học sinh. Vui lòng liên hệ với
                        nhà trường.
                      </p>
                    </div>
                  ) : (
                    <div className="health-declaration__student-selection">
                      {students.length > 1 ? (
                        <div className="health-declaration__multi-students">
                          <p className="health-declaration__label">
                            Chọn học sinh:
                          </p>
                          <div className="health-declaration__student-list">
                            {students.map((student) => (
                              <button
                                key={student.id}
                                type="button"
                                className={`health-declaration__student-item ${
                                  formData.studentId === student.id
                                    ? "active"
                                    : ""
                                }`}
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    studentId: student.id,
                                  }))
                                }
                              >
                                <div className="health-declaration__student-avatar-wrapper">
                                  <img
                                    src={
                                      student.avatar ||
                                      "https://i.pravatar.cc/150?img=11"
                                    }
                                    alt={student.name}
                                    className="health-declaration__student-avatar"
                                  />
                                </div>
                                <div className="health-declaration__student-info">
                                  <span className="health-declaration__student-name">
                                    {student.name}
                                  </span>
                                  <span className="health-declaration__student-class">
                                    Lớp {student.class}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="health-declaration__single-student">
                          <div className="health-declaration__student-avatar-wrapper">
                            <img
                              src={
                                students[0].avatar ||
                                "https://i.pravatar.cc/150?img=11"
                              }
                              alt={students[0].name}
                              className="health-declaration__student-avatar"
                            />
                          </div>
                          <div className="health-declaration__student-info">
                            <span className="health-declaration__student-name">
                              {students[0].name}
                            </span>
                            <span className="health-declaration__student-class">
                              Lớp {students[0].class} - {MOCK_SCHOOL.name}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Chi tiết học sinh */}
                      {selectedStudent && (
                        <div className="health-declaration__student-details">
                          <div className="health-declaration__student-header">
                            <div className="health-declaration__student-avatar-wrapper large">
                              <img
                                src={
                                  selectedStudent.avatar ||
                                  "https://i.pravatar.cc/150?img=11"
                                }
                                alt={selectedStudent.name}
                                className="health-declaration__student-avatar"
                              />
                            </div>
                            <div className="health-declaration__student-header-info">
                              <h4>{selectedStudent.name}</h4>
                              <p>Lớp {selectedStudent.class}</p>
                              <p className="health-declaration__school-name">
                                {MOCK_SCHOOL.name}
                              </p>
                            </div>
                          </div>

                          <div className="health-declaration__student-data">
                            <div className="health-declaration__data-row">
                              <div className="health-declaration__data-item">
                                <span className="health-declaration__data-label">
                                  Ngày sinh:
                                </span>
                                <span className="health-declaration__data-value">
                                  {selectedStudent.dob || "Chưa cập nhật"}
                                </span>
                              </div>
                              <div className="health-declaration__data-item">
                                <span className="health-declaration__data-label">
                                  Tuổi:
                                </span>
                                <span className="health-declaration__data-value">
                                  {selectedStudent.age ||
                                    calculateAge(selectedStudent.dob) ||
                                    "Chưa cập nhật"}
                                  {selectedStudent.age ||
                                  calculateAge(selectedStudent.dob)
                                    ? " tuổi"
                                    : ""}
                                </span>
                              </div>
                            </div>
                            <div className="health-declaration__data-row">
                              <div className="health-declaration__data-item">
                                <span className="health-declaration__data-label">
                                  Giới tính:
                                </span>
                                <span className="health-declaration__data-value">
                                  {selectedStudent.gender || "Chưa cập nhật"}
                                </span>
                              </div>
                              <div className="health-declaration__data-item">
                                <span className="health-declaration__data-label">
                                  Tình trạng sức khỏe:
                                </span>
                                <span className="health-declaration__health-status">
                                  {selectedStudent.healthStatus ||
                                    "Cập nhật từ hồ sơ y tế"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Khai báo gần đây */}
                          {getStudentDeclarations(selectedStudent.id).length >
                            0 && (
                            <div className="health-declaration__recent">
                              <h5>Khai báo gần đây nhất:</h5>
                              <div
                                className={`health-declaration__recent-status ${getStatusBadgeClass(
                                  getStudentDeclarations(selectedStudent.id)[0]
                                    .status
                                )}`}
                              >
                                <div className="health-declaration__recent-date">
                                  <i className="far fa-calendar-alt"></i>
                                  {formatDate(
                                    getStudentDeclarations(
                                      selectedStudent.id
                                    )[0].date
                                  )}
                                </div>
                                <div className="health-declaration__recent-decision">
                                  {
                                    getStudentDeclarations(
                                      selectedStudent.id
                                    )[0].attendanceDecision
                                  }
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Hiển thị lỗi */}
                      {formErrors.studentId && (
                        <div className="health-declaration__error">
                          {formErrors.studentId}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Phần 2: Thông tin khai báo */}
                <div className="health-declaration__section">
                  <h3 className="health-declaration__section-title">
                    <span>2. Thông tin khai báo</span>
                  </h3>

                  {/* Ngày khai báo */}
                  <div className="health-declaration__form-group">
                    <label htmlFor="date">
                      Ngày khai báo{" "}
                      <span className="health-declaration__required">*</span>
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      max={new Date().toISOString().split("T")[0]}
                      required
                      className="health-declaration__input"
                    />
                    {formErrors.date && (
                      <div className="health-declaration__error">
                        {formErrors.date}
                      </div>
                    )}
                  </div>

                  {/* Triệu chứng */}
                  <div className="health-declaration__form-group">
                    <label className="health-declaration__symptoms-label">
                      Triệu chứng{" "}
                      <span className="health-declaration__required">*</span>
                    </label>
                    <div className="health-declaration__symptoms-grid">
                      {SYMPTOM_OPTIONS.map((symptom) => (
                        <div
                          className="health-declaration__symptom"
                          key={symptom.id}
                        >
                          <input
                            type="checkbox"
                            id={`symptom-${symptom.id}`}
                            checked={formData.symptoms.includes(symptom.id)}
                            onChange={() => handleSymptomChange(symptom.id)}
                            disabled={formData.symptoms.includes("none")}
                            className="health-declaration__checkbox"
                          />
                          <label
                            htmlFor={`symptom-${symptom.id}`}
                            className="health-declaration__symptom-label"
                          >
                            {symptom.label}
                          </label>
                        </div>
                      ))}
                      <div className="health-declaration__symptom health-declaration__symptom--none">
                        <input
                          type="checkbox"
                          id="symptom-none"
                          checked={formData.symptoms.includes("none")}
                          onChange={() => {
                            if (!formData.symptoms.includes("none")) {
                              setFormData((prev) => ({
                                ...prev,
                                symptoms: ["none"],
                              }));
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                symptoms: [],
                              }));
                            }
                          }}
                          className="health-declaration__checkbox"
                        />
                        <label
                          htmlFor="symptom-none"
                          className="health-declaration__symptom-label"
                        >
                          Không có triệu chứng
                        </label>
                      </div>
                    </div>
                    {formErrors.symptoms && (
                      <div className="health-declaration__error">
                        {formErrors.symptoms}
                      </div>
                    )}
                  </div>

                  {/* Nhiệt độ */}
                  <div className="health-declaration__form-group">
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
                      className="health-declaration__input"
                    />
                    {formErrors.temperature && (
                      <div className="health-declaration__error">
                        {formErrors.temperature}
                      </div>
                    )}
                  </div>

                  {/* Ghi chú */}
                  <div className="health-declaration__form-group">
                    <label htmlFor="notes">Ghi chú bổ sung</label>
                    <textarea
                      id="notes"
                      name="notes"
                      placeholder="Nhập các thông tin bổ sung về tình trạng sức khỏe của học sinh..."
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="4"
                      className="health-declaration__textarea"
                    ></textarea>
                  </div>
                </div>

                {/* Nút gửi */}
                <div className="health-declaration__actions">
                  <button
                    type="submit"
                    className="health-declaration__submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="health-declaration__submitting">
                        <div className="health-declaration__spinner-small"></div>
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

              {/* Thông tin lưu ý */}
              <div className="health-declaration__info-box">
                <h3>
                  <i className="fas fa-info-circle"></i> Lưu ý quan trọng
                </h3>
                <ul>
                  <li>
                    Thông tin khai báo sẽ được gửi trực tiếp đến y tá/bác sĩ của{" "}
                    {MOCK_SCHOOL.name}.
                  </li>
                  <li>
                    Vui lòng khai báo thông tin chính xác để nhà trường có biện
                    pháp theo dõi và hỗ trợ kịp thời.
                  </li>
                  <li>
                    Với các triệu chứng nghiêm trọng, phụ huynh nên đưa học sinh
                    đến cơ sở y tế để được khám và điều trị.
                  </li>
                  <li>
                    Y tá nhà trường sẽ liên hệ với phụ huynh nếu cần thêm thông
                    tin.
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="health-declaration__history">
              {/* Filter học sinh */}
              {students.length > 0 && (
                <div className="health-declaration__filter">
                  <h3>Lịch sử khai báo sức khỏe</h3>
                  <div className="health-declaration__filter-tabs">
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
              )}

              {/* Danh sách khai báo */}
              {isLoading ? (
                <div className="health-declaration__loading">
                  <div className="health-declaration__spinner"></div>
                  <p>Đang tải lịch sử khai báo...</p>
                </div>
              ) : declarations.length === 0 ? (
                <div className="health-declaration__empty-state">
                  <i className="fas fa-folder-open"></i>
                  <p>Chưa có khai báo sức khỏe nào được ghi nhận</p>
                </div>
              ) : (
                <div className="health-declaration__list">
                  {declarations
                    .filter((declaration) =>
                      formData.studentId
                        ? declaration.studentId === formData.studentId
                        : true
                    )
                    .map((declaration) => (
                      <div
                        className="health-declaration__card"
                        key={declaration.id}
                      >
                        <div className="health-declaration__card-header">
                          <div>
                            <h4>{declaration.studentName}</h4>
                            <p>
                              <i className="far fa-calendar-alt"></i>{" "}
                              {formatDate(declaration.date)}
                            </p>
                          </div>
                          <div
                            className={`health-declaration__status ${getStatusBadgeClass(
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

                        <div className="health-declaration__card-body">
                          <div className="health-declaration__card-item">
                            <span className="health-declaration__card-label">
                              Triệu chứng:
                            </span>
                            <div className="health-declaration__tags">
                              {declaration.symptoms.length > 0 ? (
                                declaration.symptoms.map((symptom, index) => (
                                  <span
                                    className="health-declaration__tag"
                                    key={index}
                                  >
                                    {symptom}
                                  </span>
                                ))
                              ) : (
                                <span className="health-declaration__no-symptoms">
                                  Không có triệu chứng
                                </span>
                              )}
                            </div>
                          </div>

                          {declaration.temperature > 0 && (
                            <div className="health-declaration__card-item">
                              <span className="health-declaration__card-label">
                                Nhiệt độ:
                              </span>
                              <span
                                className={`health-declaration__temperature ${
                                  declaration.temperature >= 37.5 ? "high" : ""
                                }`}
                              >
                                {declaration.temperature}°C
                              </span>
                            </div>
                          )}

                          {declaration.notes && (
                            <div className="health-declaration__card-item">
                              <span className="health-declaration__card-label">
                                Ghi chú:
                              </span>
                              <div className="health-declaration__notes">
                                {declaration.notes}
                              </div>
                            </div>
                          )}

                          <div className="health-declaration__card-item">
                            <span className="health-declaration__card-label">
                              Kết quả:
                            </span>
                            <span className="health-declaration__decision">
                              {declaration.attendanceDecision}
                            </span>
                          </div>
                        </div>

                        {declaration.reviewedBy && (
                          <div className="health-declaration__card-footer">
                            <p>
                              <i className="fas fa-user-nurse"></i>
                              <span>
                                Phản hồi bởi: {declaration.reviewedBy}
                              </span>
                            </p>
                            <p>
                              <i className="far fa-clock"></i>
                              <span>Thời gian: {declaration.reviewedAt}</span>
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
      </div>
    </div>
  );
};

export default HealthDeclaration;
