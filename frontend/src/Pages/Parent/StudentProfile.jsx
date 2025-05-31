import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./StudentProfile.css";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";
import { useStudentData } from "../../context/StudentDataContext";

// Mock data cho phụ huynh - có thể dùng từ AuthContext sau này
const MOCK_PARENTS = [
  {
    id: "PH001",
    fullName: "Nguyễn Văn An",
    email: "nguyenvanbinh@gmail.com",
    phone: "0912345678",
  },
];

export default function StudentProfile() {
  const { currentUser } = useAuth();
  const { students, isLoading } = useStudentData();

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [error, setError] = useState(null);
  const [currentParent, setCurrentParent] = useState(null);

  // TODO: Thay thế bằng useAuth() khi có AuthContext thực tế
  const parentId = currentUser?.id || "PH001"; // Sử dụng ID từ AuthContext nếu có, nếu không dùng ID mẫu

  useEffect(() => {
    // Lấy thông tin phụ huynh
    const parent = MOCK_PARENTS.find((p) => p.id === parentId);
    setCurrentParent(parent);

    // Tự động chọn học sinh đầu tiên khi dữ liệu được tải
    if (!isLoading && students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [isLoading, students, selectedStudentId, parentId]);

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

  // Dữ liệu bổ sung để hiển thị chi tiết học sinh (giả lập từ data context)
  const getExtendedStudentInfo = (student) => {
    if (!student) return null;

    return {
      ...student,
      schoolName: "THCS Nguyễn Đình Chiểu",
      healthStatus: "Khỏe mạnh",
      father: "Nguyễn Văn Bình",
      fatherPhone: "0912345678",
      fatherEmail: "nguyenvanbinh@gmail.com",
      fatherOccupation: "Kỹ sư xây dựng",
      mother: "Trần Thị Cúc",
      motherPhone: "0923456789",
      motherEmail: "tranthicuc@gmail.com",
      motherOccupation: "Giáo viên",
      address: "123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
    };
  };

  const extendedStudent = selectedStudent
    ? getExtendedStudentInfo(selectedStudent)
    : null;

  return (
    <div className="main-content-container">
      <div className="student-profile-container">
        {/* Header với thông tin phụ huynh và selector học sinh */}
        <div className="profile-header">
          <div className="profile-info">
            <h1>Hồ sơ học sinh</h1>
            <p className="parent-info">
              Phụ huynh: <strong>{currentParent?.fullName}</strong>
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

          {extendedStudent && (
            <div className="profile-avatar-container">
              <div className="profile-avatar">
                <img
                  src={
                    extendedStudent.avatar || "https://i.pravatar.cc/150?img=11"
                  }
                  alt={extendedStudent.name}
                />
              </div>
              <div className="avatar-edit-button" title="Thay đổi ảnh đại diện">
                <i className="fas fa-camera"></i>
              </div>
            </div>
          )}
        </div>

        {extendedStudent && (
          <div className="profile-content">
            {/* Banner thông báo sử dụng dữ liệu giả */}
            <div className="demo-banner">
              <i className="fas fa-info-circle"></i>
              <span>
                Đang sử dụng dữ liệu mẫu trong quá trình phát triển. Dữ liệu
                thực tế sẽ được kết nối từ server.
              </span>
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
                  <span className="info-value">{extendedStudent.gender}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Ngày sinh:</span>
                  <span className="info-value">
                    {formatDate(extendedStudent.dob)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Tuổi:</span>
                  <span className="info-value">
                    {extendedStudent.age || calculateAge(extendedStudent.dob)}{" "}
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
                        {extendedStudent.father}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Số điện thoại:</span>
                      <span className="info-value">
                        <a href={`tel:${extendedStudent.fatherPhone}`}>
                          {extendedStudent.fatherPhone}
                        </a>
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">
                        <a href={`mailto:${extendedStudent.fatherEmail}`}>
                          {extendedStudent.fatherEmail}
                        </a>
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Nghề nghiệp:</span>
                      <span className="info-value">
                        {extendedStudent.fatherOccupation}
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
                        {extendedStudent.mother}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Số điện thoại:</span>
                      <span className="info-value">
                        <a href={`tel:${extendedStudent.motherPhone}`}>
                          {extendedStudent.motherPhone}
                        </a>
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">
                        <a href={`mailto:${extendedStudent.motherEmail}`}>
                          {extendedStudent.motherEmail}
                        </a>
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Nghề nghiệp:</span>
                      <span className="info-value">
                        {extendedStudent.motherOccupation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Địa chỉ */}
                <div className="info-item full-width">
                  <span className="info-label">Địa chỉ:</span>
                  <span className="info-value">{extendedStudent.address}</span>
                </div>
              </div>
            </div>

            {/* Thông tin học tập */}
            <div className="profile-section study-info">
              <h2>Thông tin học tập</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Lớp:</span>
                  <span className="info-value">{extendedStudent.class}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Trường:</span>
                  <span className="info-value">
                    {extendedStudent.schoolName}
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
                  <span className="info-value health-status">
                    {extendedStudent.healthStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
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
