import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./StudentProfile.css";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { useAuth } from "../../../../context/AuthContext";
import { useStudentData } from "../../../../context/StudentDataContext";
import axios from "axios";

// API URL từ mockapi.io của bạn
const API_URL = "https://68425631e1347494c31c7892.mockapi.io/api/vi";

export default function StudentProfile() {
  const { currentUser } = useAuth();
  const { students, isLoading } = useStudentData();

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [error, setError] = useState(null);
  const [currentParent, setCurrentParent] = useState(null);
  const [extendedStudent, setExtendedStudent] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Lấy thông tin phụ huynh từ API
  useEffect(() => {
    const fetchParentInfo = async () => {
      if (!currentUser) return;

      try {
        const response = await axios.get(`${API_URL}/users/${currentUser.id}`);
        setCurrentParent(response.data);
      } catch (err) {
        console.error("Error fetching parent info:", err);
        // Nếu API lỗi, sử dụng currentUser làm fallback
        setCurrentParent(currentUser);
      }
    };

    fetchParentInfo();
  }, [currentUser]);

  // Tự động chọn học sinh đầu tiên khi dữ liệu được tải
  useEffect(() => {
    if (!isLoading && students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [isLoading, students, selectedStudentId]);

  // Lấy thông tin chi tiết của học sinh đã chọn
  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!selectedStudentId) return;

      try {
        setLoadingDetails(true);
        // Gọi API để lấy thông tin chi tiết học sinh
        const studentResponse = await axios.get(
          `${API_URL}/hocsinh/hocsinh/${selectedStudentId}`
        );
        let studentData = studentResponse.data;

        // Lấy thông tin trường học
        try {
          const schoolResponse = await axios.get(
            `${API_URL}/schools/${studentData.schoolId}`
          );
          studentData.schoolName = schoolResponse.data.name;
        } catch (err) {
          console.warn("Error fetching school info:", err);
          studentData.schoolName = "THCS Nguyễn Đình Chiểu"; // Fallback
        }

        // Lấy thông tin y tế
        try {
          const medicalResponse = await axios.get(
            `${API_URL}/medicalRecords?studentId=${selectedStudentId}`
          );
          if (medicalResponse.data.length > 0) {
            const medicalRecord = medicalResponse.data[0];
            studentData = { ...studentData, ...medicalRecord };
          }
        } catch (err) {
          console.warn("Error fetching medical records:", err);
        }

        // Lấy thông tin phụ huynh bổ sung
        try {
          if (studentData.parentId) {
            const parentResponse = await axios.get(
              `${API_URL}/users/${studentData.parentId}`
            );
            const parentData = parentResponse.data;

            studentData = {
              ...studentData,
              father: parentData.name,
              fatherPhone: parentData.phone,
              fatherEmail: parentData.email,
              fatherOccupation: parentData.occupation || "Chưa cập nhật",
              mother: parentData.spouseName || "Chưa cập nhật",
              motherPhone: parentData.spousePhone || "Chưa cập nhật",
              motherEmail: parentData.spouseEmail || "Chưa cập nhật",
              motherOccupation: parentData.spouseOccupation || "Chưa cập nhật",
              address: parentData.address || "Chưa cập nhật",
            };
          }
        } catch (err) {
          console.warn("Error fetching parent details:", err);
        }

        setExtendedStudent(studentData);
      } catch (err) {
        console.error("Error fetching student details:", err);
        setError(
          "Không thể tải thông tin chi tiết học sinh. Vui lòng thử lại sau."
        );
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchStudentDetails();
  }, [selectedStudentId]);

  // Tính tuổi từ ngày sinh
  const calculateAge = (dob) => {
    if (!dob) return "";

    // Nếu dob chỉ là năm (ví dụ: "2010"), thêm tháng và ngày
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

  // Format ngày sinh
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const selectedStudent = students.find(
    (student) => student.id === selectedStudentId
  );

  if (isLoading) {
    return <LoadingSpinner text="Đang tải thông tin học sinh..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="no-students-container">
        <i className="fas fa-user-graduate"></i>
        <p>Không tìm thấy thông tin học sinh nào.</p>
      </div>
    );
  }

  return (
    <div className="main-content-container">
      <div className="student-profile-container">
        {/* Header với thông tin phụ huynh và selector học sinh */}
        <div className="profile-header">
          <div className="profile-info">
            <h1>Hồ sơ học sinh</h1>
            <p className="parent-info">
              Phụ huynh:{" "}
              <strong>
                {currentParent?.name ||
                  currentParent?.fullName ||
                  "Đang tải..."}
              </strong>
            </p>

            {/* Selector để chọn con */}
            {students.length > 1 && (
              <div className="student-selector">
                <label htmlFor="student-select">Chọn con:</label>
                <select
                  id="student-select"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="student-select"
                >
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.class}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {selectedStudent && (
            <div className="profile-avatar-container">
              <div className="profile-avatar">
                {loadingDetails ? (
                  <div className="avatar-loading">
                    <i className="fas fa-spinner fa-pulse"></i>
                  </div>
                ) : (
                  <img
                    src={
                      selectedStudent.avatar ||
                      "https://i.pravatar.cc/150?img=11"
                    }
                    alt={selectedStudent.name}
                  />
                )}
              </div>
              <div className="avatar-edit-button" title="Thay đổi ảnh đại diện">
                <i className="fas fa-camera"></i>
              </div>
            </div>
          )}
        </div>

        {loadingDetails ? (
          <div className="loading-details">
            <LoadingSpinner text="Đang tải thông tin chi tiết..." />
          </div>
        ) : (
          extendedStudent && (
            <div className="profile-content">
              {/* Banner thông báo kết nối API */}
              <div className="api-banner">
                <i className="fas fa-cloud"></i>
                <span>Dữ liệu được tải từ API: {API_URL}/hocsinh/hocsinh</span>
              </div>

              {/* Thông tin cơ bản */}
              <div className="profile-section basic-info">
                <h2>Thông tin cơ bản</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Mã học sinh:</span>
                    <span className="info-value">{extendedStudent.id}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Họ tên học sinh:</span>
                    <span className="info-value">{extendedStudent.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Giới tính:</span>
                    <span className="info-value">
                      {extendedStudent.gender || "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Ngày sinh:</span>
                    <span className="info-value">
                      {formatDate(extendedStudent.dob) || "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Tuổi:</span>
                    <span className="info-value">
                      {extendedStudent.age ||
                        calculateAge(extendedStudent.dob) ||
                        "Chưa cập nhật"}{" "}
                      tuổi
                    </span>
                  </div>
                </div>
              </div>

              {/* Thông tin gia đình */}
              <div className="profile-section family-info">
                <h2>Thông tin gia đình</h2>
                <div className="info-grid">
                  {/* Thông tin về cha */}
                  <div className="family-member">
                    <h3 className="family-member-title">Thông tin cha</h3>
                    <div className="family-member-details">
                      <div className="info-item">
                        <span className="info-label">Họ tên:</span>
                        <span className="info-value">
                          {extendedStudent.father || "Chưa cập nhật"}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Số điện thoại:</span>
                        <span className="info-value">
                          {extendedStudent.fatherPhone ? (
                            <a href={`tel:${extendedStudent.fatherPhone}`}>
                              {extendedStudent.fatherPhone}
                            </a>
                          ) : (
                            "Chưa cập nhật"
                          )}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Email:</span>
                        <span className="info-value">
                          {extendedStudent.fatherEmail ? (
                            <a href={`mailto:${extendedStudent.fatherEmail}`}>
                              {extendedStudent.fatherEmail}
                            </a>
                          ) : (
                            "Chưa cập nhật"
                          )}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Nghề nghiệp:</span>
                        <span className="info-value">
                          {extendedStudent.fatherOccupation || "Chưa cập nhật"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin về mẹ */}
                  <div className="family-member">
                    <h3 className="family-member-title">Thông tin mẹ</h3>
                    <div className="family-member-details">
                      <div className="info-item">
                        <span className="info-label">Họ tên:</span>
                        <span className="info-value">
                          {extendedStudent.mother || "Chưa cập nhật"}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Số điện thoại:</span>
                        <span className="info-value">
                          {extendedStudent.motherPhone ? (
                            <a href={`tel:${extendedStudent.motherPhone}`}>
                              {extendedStudent.motherPhone}
                            </a>
                          ) : (
                            "Chưa cập nhật"
                          )}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Email:</span>
                        <span className="info-value">
                          {extendedStudent.motherEmail ? (
                            <a href={`mailto:${extendedStudent.motherEmail}`}>
                              {extendedStudent.motherEmail}
                            </a>
                          ) : (
                            "Chưa cập nhật"
                          )}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Nghề nghiệp:</span>
                        <span className="info-value">
                          {extendedStudent.motherOccupation || "Chưa cập nhật"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Địa chỉ */}
                  <div className="info-item full-width">
                    <span className="info-label">Địa chỉ:</span>
                    <span className="info-value">
                      {extendedStudent.address || "Chưa cập nhật"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thông tin học tập */}
              <div className="profile-section study-info">
                <h2>Thông tin học tập</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Lớp:</span>
                    <span className="info-value">
                      {extendedStudent.class || "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Trường:</span>
                    <span className="info-value">
                      {extendedStudent.schoolName || "Chưa cập nhật"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thông tin sức khỏe */}
              <div className="profile-section health-info">
                <div className="section-header-with-action">
                  <h2>Thông tin sức khỏe</h2>
                  <Link
                    to="/parent/medical-records"
                    className="edit-medical-record"
                    title="Xem hồ sơ bệnh án"
                  >
                    <i className="fas fa-file-medical"></i>
                  </Link>
                </div>
                <div className="info-grid single-column">
                  <div className="info-item">
                    <span className="info-label">Tình trạng sức khỏe:</span>
                    <span
                      className={`info-value health-status ${
                        extendedStudent.healthStatus
                          ?.toLowerCase()
                          .includes("khỏe mạnh")
                          ? "healthy"
                          : extendedStudent.healthStatus
                              ?.toLowerCase()
                              .includes("cần theo dõi")
                          ? "monitor"
                          : extendedStudent.healthStatus
                              ?.toLowerCase()
                              .includes("cần điều trị")
                          ? "needs-treatment"
                          : ""
                      }`}
                    >
                      {extendedStudent.healthStatus || "Chưa cập nhật"}
                    </span>
                  </div>
                  {extendedStudent.bloodType && (
                    <div className="info-item">
                      <span className="info-label">Nhóm máu:</span>
                      <span className="info-value blood-type">
                        {extendedStudent.bloodType}
                      </span>
                    </div>
                  )}
                  {extendedStudent.allergies &&
                    extendedStudent.allergies.length > 0 && (
                      <div className="info-item full-width allergies">
                        <span className="info-label">Dị ứng:</span>
                        <span className="info-value">
                          {Array.isArray(extendedStudent.allergies)
                            ? extendedStudent.allergies.join(", ")
                            : extendedStudent.allergies}
                        </span>
                      </div>
                    )}
                  {extendedStudent.chronicConditions &&
                    extendedStudent.chronicConditions.length > 0 && (
                      <div className="info-item full-width chronic">
                        <span className="info-label">Bệnh mãn tính:</span>
                        <span className="info-value">
                          {Array.isArray(extendedStudent.chronicConditions)
                            ? extendedStudent.chronicConditions.join(", ")
                            : extendedStudent.chronicConditions}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )
        )}

        <div className="profile-actions">
          <button className="action-button primary">
            <i className="fas fa-edit"></i> Cập nhật thông tin
          </button>
          <button className="action-button secondary">
            <i className="fas fa-print"></i> In hồ sơ
          </button>
          <Link
            to="/parent/health-declaration"
            className="action-button health-declaration"
          >
            <i className="fas fa-heartbeat"></i> Khai báo sức khỏe
          </Link>
        </div>
      </div>
    </div>
  );
}
