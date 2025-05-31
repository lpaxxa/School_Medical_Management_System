import React, { useState, useEffect } from "react";
import "./Contact.css";
import { useAuth } from "../../context/AuthContext";
import { useStudentData } from "../../context/StudentDataContext";

// Mock data cho lịch sử liên hệ (giữ nguyên vì không có trong StudentDataContext)
const MOCK_CONTACT_HISTORY = [
  {
    id: "CH001",
    title: "Yêu cầu thông tin sức khỏe",
    status: "completed",
    respondedBy: "Y tá Nguyễn Thị Hoa",
    date: "15/05/2023",
    subject: "health_report",
  },
  {
    id: "CH002",
    title: "Câu hỏi về lịch tiêm chủng",
    status: "pending",
    respondedBy: null,
    date: "20/05/2023",
    subject: "vaccination",
  },
  {
    id: "CH003",
    title: "Thông tin về thuốc đã kê cho con",
    status: "in_progress",
    respondedBy: "Bác sĩ Lê Văn Đức",
    date: "22/04/2023",
    subject: "medication",
  },
];

// Mock API responses (giữ nguyên)
const mockApiResponses = {
  sendContactSuccess: {
    status: "success",
    message:
      "Cảm ơn! Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi sớm nhất có thể.",
    ticketId: "TK" + Math.floor(Math.random() * 10000),
  },
  sendContactError: {
    status: "error",
    message: "Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.",
  },
};

const ParentContact = () => {
  // Sử dụng context auth
  const { currentUser } = useAuth();

  // Sử dụng StudentDataContext thay vì mock data
  const { students, isLoading: studentsLoading } = useStudentData();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    studentId: "",
    attachments: [],
  });

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: "",
    ticketId: "",
  });

  const [contactHistory, setContactHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Fetch data khi component mount
  useEffect(() => {
    fetchUserData();
    fetchContactHistory();
  }, [currentUser]);

  // Giả lập API gọi dữ liệu người dùng - từ currentUser của AuthContext
  const fetchUserData = () => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: currentUser.fullName || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
      }));
    }
  };

  // Giả lập API gọi lịch sử liên hệ
  const fetchContactHistory = () => {
    setIsLoading(true);
    // Mô phỏng độ trễ mạng
    setTimeout(() => {
      setContactHistory(MOCK_CONTACT_HISTORY);
      setIsLoading(false);
    }, 1000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Kiểm tra kích thước và loại file
    const validFiles = files.filter((file) => {
      const sizeInMB = file.size / (1024 * 1024);
      const validExtensions = ["jpg", "jpeg", "png", "pdf"];
      const extension = file.name.split(".").pop().toLowerCase();

      return sizeInMB <= 5 && validExtensions.includes(extension);
    });

    if (validFiles.length !== files.length) {
      alert(
        "Một số file không hợp lệ. Chỉ chấp nhận JPG, PNG, PDF và kích thước tối đa 5MB."
      );
    }

    // Cập nhật danh sách file đã upload
    setUploadedFiles((prev) => [...prev, ...validFiles]);

    // Thêm file vào formData
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles],
    }));
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate data
    if (
      !formData.name ||
      !formData.email ||
      !formData.message ||
      !formData.studentId
    ) {
      setFormStatus({
        submitted: true,
        success: false,
        message: "Vui lòng điền đầy đủ các trường bắt buộc và chọn học sinh.",
      });
      setIsLoading(false);
      return;
    }

    // Mô phỏng API gửi thông tin liên hệ
    setTimeout(() => {
      // Giả lập có 10% xác suất lỗi để test xử lý lỗi
      const isError = Math.random() < 0.1;

      if (isError) {
        setFormStatus({
          submitted: true,
          success: false,
          message: mockApiResponses.sendContactError.message,
        });
      } else {
        const response = mockApiResponses.sendContactSuccess;
        setFormStatus({
          submitted: true,
          success: true,
          message: response.message,
          ticketId: response.ticketId,
        });

        // Thêm vào lịch sử liên hệ
        const newContact = {
          id: response.ticketId,
          title: formData.subject
            ? getSubjectLabel(formData.subject)
            : "Yêu cầu mới",
          status: "pending",
          respondedBy: null,
          date: new Date().toLocaleDateString("vi-VN"),
          subject: formData.subject || "other",
        };

        setContactHistory((prev) => [newContact, ...prev]);

        // Reset form
        setFormData((prev) => ({
          ...prev,
          subject: "",
          message: "",
          studentId: "",
          attachments: [],
        }));

        setUploadedFiles([]);
      }

      setIsLoading(false);

      // Clear message sau 5 giây
      setTimeout(() => {
        setFormStatus({
          submitted: false,
          success: false,
          message: "",
          ticketId: "",
        });
      }, 5000);
    }, 1500);
  };

  // Helper function để chuyển đổi mã subject thành label
  const getSubjectLabel = (subjectCode) => {
    const subjects = {
      health_report: "Báo cáo sức khỏe",
      medication: "Thông tin thuốc",
      vaccination: "Lịch tiêm chủng",
      emergency: "Tình huống khẩn cấp",
      other: "Yêu cầu khác",
    };
    return subjects[subjectCode] || "Yêu cầu mới";
  };

  // Helper function để lấy class CSS dựa trên trạng thái
  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "completed";
      case "pending":
        return "pending";
      case "in_progress":
        return "in-progress";
      default:
        return "pending";
    }
  };

  // Helper function để lấy icon dựa trên trạng thái
  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "fas fa-check-circle";
      case "pending":
        return "fas fa-clock";
      case "in_progress":
        return "fas fa-spinner fa-spin";
      default:
        return "fas fa-clock";
    }
  };

  // Hàm để người dùng có thể chọn học sinh
  const handleStudentSelect = (studentId) => {
    setFormData((prev) => ({
      ...prev,
      studentId,
    }));
  };

  return (
    <div className="parent-contact-page">
      <div className="contact-header">
        <div className="contact-header-content">
          <h1>Liên hệ với nhà trường</h1>
          <p>Gửi thắc mắc và nhận hỗ trợ về sức khỏe của con em bạn</p>
        </div>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <div className="info-card">
            <div className="info-icon">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <h3>Địa chỉ</h3>
            <p>
              Lô E2a-7, Đường D1, Đ. D1, Long Thạnh Mỹ, Thành Phố Thủ Đức, Thành
              phố Hồ Chí Minh
            </p>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <i className="fas fa-phone-alt"></i>
            </div>
            <h3>Số điện thoại</h3>
            <p>+84 28 7300 5588</p>
            <p>+84 28 7300 5599</p>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <i className="fas fa-envelope"></i>
            </div>
            <h3>Email</h3>
            <p>health@school.edu.vn</p>
            <p>support@school.edu.vn</p>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <i className="fas fa-clock"></i>
            </div>
            <h3>Giờ làm việc</h3>
            <p>Thứ Hai - Thứ Sáu: 8:00 - 17:00</p>
            <p>Thứ Bảy: 8:00 - 12:00</p>
          </div>

          {contactHistory.length > 0 && (
            <div className="previous-contacts">
              <h3>Tin nhắn gần đây</h3>
              <div className="contact-history">
                {contactHistory.map((item) => (
                  <div key={item.id} className="history-item">
                    <div
                      className={`history-status ${getStatusClass(
                        item.status
                      )}`}
                    >
                      <i className={getStatusIcon(item.status)}></i>
                    </div>
                    <div className="history-content">
                      <h4>{item.title}</h4>
                      {item.respondedBy ? (
                        <p>Đã trả lời bởi: {item.respondedBy}</p>
                      ) : (
                        <p>Đang xử lý</p>
                      )}
                      <span className="history-date">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="contact-form-container">
          <h2>Gửi tin nhắn cho nhà trường</h2>

          {formStatus.submitted && (
            <div
              className={`form-message ${
                formStatus.success ? "success" : "error"
              }`}
            >
              {formStatus.message}
              {formStatus.ticketId && (
                <div className="ticket-info">
                  Mã yêu cầu của bạn: <strong>{formStatus.ticketId}</strong>
                </div>
              )}
            </div>
          )}

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">
                  Họ và tên phụ huynh <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  required
                  readOnly={!!currentUser?.fullName}
                  className={currentUser?.fullName ? "filled" : ""}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  required
                  readOnly={!!currentUser?.email}
                  className={currentUser?.email ? "filled" : ""}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Số điện thoại</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0912345678"
                  readOnly={!!currentUser?.phone}
                  className={currentUser?.phone ? "filled" : ""}
                />
              </div>

              <div className="form-group">
                <label>
                  Học sinh <span className="required">*</span>
                </label>
                {studentsLoading ? (
                  <div className="loading-indicator">
                    <i className="fas fa-spinner fa-spin"></i> Đang tải...
                  </div>
                ) : students.length > 0 ? (
                  <div className="student-selection">
                    <select
                      name="studentId"
                      value={formData.studentId}
                      onChange={(e) => handleStudentSelect(e.target.value)}
                      required
                    >
                      <option value="">-- Chọn học sinh --</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} - Lớp {student.class}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="no-student-info">
                    Không tìm thấy thông tin học sinh. Vui lòng liên hệ với nhà
                    trường.
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="subject">Chủ đề</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
              >
                <option value="">Chọn chủ đề</option>
                <option value="health_report">Báo cáo sức khỏe</option>
                <option value="medication">Thông tin thuốc</option>
                <option value="vaccination">Lịch tiêm chủng</option>
                <option value="emergency">Tình huống khẩn cấp</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message">
                Nội dung tin nhắn <span className="required">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows="6"
                value={formData.message}
                onChange={handleChange}
                placeholder="Nội dung tin nhắn của bạn..."
                required
              ></textarea>
            </div>

            <div className="form-group file-upload">
              <label>Tài liệu đính kèm (nếu có)</label>
              <div className="upload-box">
                <i className="fas fa-cloud-upload-alt"></i>
                <p>Kéo thả file vào đây hoặc nhấn để chọn</p>
                <input
                  type="file"
                  className="file-input"
                  multiple
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.pdf"
                />
              </div>
              <p className="file-info">
                Hỗ trợ: JPG, PNG, PDF. Kích thước tối đa: 5MB
              </p>

              {/* Hiển thị các file đã upload */}
              {uploadedFiles.length > 0 && (
                <div className="uploaded-files">
                  <h4>File đã tải lên:</h4>
                  <ul>
                    {uploadedFiles.map((file, index) => (
                      <li key={index}>
                        <div className="file-preview">
                          <i
                            className={`fas ${
                              file.type.includes("image")
                                ? "fa-file-image"
                                : "fa-file-pdf"
                            }`}
                          ></i>
                          <span>{file.name}</span>
                          <span className="file-size">
                            ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          className="remove-file"
                          onClick={() => removeFile(index)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              type="submit"
              className={`submit-btn ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span>Đang gửi...</span>
                  <i className="fas fa-spinner fa-spin"></i>
                </>
              ) : (
                <>
                  <span>Gửi tin nhắn</span>
                  <i className="fas fa-paper-plane"></i>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ParentContact;
