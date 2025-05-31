import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./MedicalRecords.css";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useStudentData } from "../../context/StudentDataContext";

const MedicalRecords = () => {
  const { students, healthMetrics, medicalRecords, isLoading } =
    useStudentData();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("medical");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    // Tự động chọn học sinh đầu tiên khi dữ liệu được tải
    if (!isLoading && students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0].id);
    }
  }, [isLoading, students, selectedStudent]);

  const handleStudentChange = (e) => {
    setSelectedStudent(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDateChange = (e) => {
    setFilterDate(e.target.value);
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
  };

  const getFilteredRecords = () => {
    if (!selectedStudent) return [];

    return medicalRecords.filter((record) => {
      // Lọc theo học sinh
      if (record.studentId !== selectedStudent) return false;

      // Lọc theo từ khóa tìm kiếm
      if (
        searchTerm &&
        !record.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !record.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Lọc theo ngày
      if (filterDate && record.date !== filterDate) return false;

      // Lọc theo loại bệnh án
      if (filterType !== "all" && record.type !== filterType) return false;

      return true;
    });
  };

  const getRecordTypeText = (type) => {
    switch (type) {
      case "examination":
        return "Khám định kỳ";
      case "illness":
        return "Bệnh tật";
      case "injury":
        return "Chấn thương";
      case "vaccination":
        return "Tiêm chủng";
      default:
        return "Khác";
    }
  };

  const getRecordTypeIcon = (type) => {
    switch (type) {
      case "examination":
        return "fa-stethoscope";
      case "illness":
        return "fa-virus";
      case "injury":
        return "fa-band-aid";
      case "vaccination":
        return "fa-syringe";
      default:
        return "fa-notes-medical";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getCurrentHealthMetrics = (studentId) => {
    if (!healthMetrics || !healthMetrics[studentId]) return null;

    const metrics = healthMetrics[studentId];
    const currentHeight =
      metrics.height.length > 0
        ? metrics.height[metrics.height.length - 1]
        : null;
    const currentWeight =
      metrics.weight.length > 0
        ? metrics.weight[metrics.weight.length - 1]
        : null;
    const currentBMI =
      metrics.bmi.length > 0 ? metrics.bmi[metrics.bmi.length - 1] : null;
    const currentVision =
      metrics.vision.length > 0
        ? metrics.vision[metrics.vision.length - 1]
        : null;

    return {
      height: currentHeight,
      weight: currentWeight,
      bmi: currentBMI,
      vision: currentVision,
      allergies: metrics.allergies,
      chronicConditions: metrics.chronicConditions,
      bloodType: metrics.bloodType,
      immunizations: metrics.immunizations,
    };
  };

  const renderHealthMetricsTab = () => {
    if (!selectedStudent || !healthMetrics || !healthMetrics[selectedStudent]) {
      return <p>Không có dữ liệu sức khỏe cho học sinh này.</p>;
    }

    const metrics = healthMetrics[selectedStudent];
    const currentMetrics = getCurrentHealthMetrics(selectedStudent);

    if (!currentMetrics) return null;

    return (
      <div className="health-metrics-container">
        <div className="metrics-summary">
          <div className="metric-card">
            <div className="metric-icon">
              <i className="fas fa-ruler-vertical"></i>
            </div>
            <div className="metric-data">
              <span className="metric-value">
                {currentMetrics.height?.value} cm
              </span>
              <span className="metric-label">Chiều cao</span>
              <span className="metric-date">
                Cập nhật: {formatDate(currentMetrics.height?.date)}
              </span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <i className="fas fa-weight"></i>
            </div>
            <div className="metric-data">
              <span className="metric-value">
                {currentMetrics.weight?.value} kg
              </span>
              <span className="metric-label">Cân nặng</span>
              <span className="metric-date">
                Cập nhật: {formatDate(currentMetrics.weight?.date)}
              </span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <i className="fas fa-calculator"></i>
            </div>
            <div className="metric-data">
              <span className="metric-value">{currentMetrics.bmi?.value}</span>
              <span className="metric-label">
                BMI - {currentMetrics.bmi?.status}
              </span>
              <span className="metric-date">
                Cập nhật: {formatDate(currentMetrics.bmi?.date)}
              </span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <i className="fas fa-eye"></i>
            </div>
            <div className="metric-data">
              <span className="metric-value">
                T: {currentMetrics.vision?.left} | P:{" "}
                {currentMetrics.vision?.right}
              </span>
              <span className="metric-label">Thị lực</span>
              <span className="metric-date">
                Cập nhật: {formatDate(currentMetrics.vision?.date)}
              </span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <i className="fas fa-tint"></i>
            </div>
            <div className="metric-data">
              <span className="metric-value">{currentMetrics.bloodType}</span>
              <span className="metric-label">Nhóm máu</span>
            </div>
          </div>
        </div>

        <div className="health-details">
          <h3>Thông tin sức khỏe chi tiết</h3>

          <div className="health-detail-section">
            <h4>
              <i className="fas fa-exclamation-triangle"></i> Dị ứng
            </h4>
            <ul>
              {currentMetrics.allergies.map((allergy, index) => (
                <li key={index}>{allergy}</li>
              ))}
            </ul>
          </div>

          <div className="health-detail-section">
            <h4>
              <i className="fas fa-heartbeat"></i> Bệnh mãn tính
            </h4>
            <ul>
              {currentMetrics.chronicConditions.map((condition, index) => (
                <li key={index}>{condition}</li>
              ))}
            </ul>
          </div>

          <div className="health-detail-section">
            <h4>
              <i className="fas fa-syringe"></i> Tiêm chủng
            </h4>
            <ul className="immunization-list">
              {currentMetrics.immunizations?.map((vaccine, index) => (
                <li key={index}>
                  <span className="vaccine-name">{vaccine.name}</span>
                  <span className="vaccine-date">
                    {formatDate(vaccine.date)}
                  </span>
                  <span
                    className={`vaccine-status ${
                      vaccine.status === "Hoàn thành" ? "completed" : "pending"
                    }`}
                  >
                    {vaccine.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="health-detail-section">
            <h4>
              <i className="fas fa-chart-line"></i> Biểu đồ phát triển
            </h4>
            <div className="chart-placeholder">
              <p>
                [Biểu đồ phát triển chiều cao và cân nặng sẽ được hiển thị tại
                đây]
              </p>
              <button className="view-history-btn">
                <i className="fas fa-history"></i> Xem lịch sử chỉ số
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMedicalRecordsTab = () => {
    const filteredRecords = getFilteredRecords();

    if (filteredRecords.length === 0) {
      return (
        <div className="no-records-message">
          <i className="fas fa-file-medical-alt"></i>
          <p>
            Không tìm thấy hồ sơ bệnh án nào phù hợp với điều kiện tìm kiếm.
          </p>
          {searchTerm || filterDate || filterType !== "all" ? (
            <button
              className="clear-filters-btn"
              onClick={() => {
                setSearchTerm("");
                setFilterDate("");
                setFilterType("all");
              }}
            >
              <i className="fas fa-sync"></i> Xóa bộ lọc
            </button>
          ) : null}
        </div>
      );
    }

    return (
      <div className="records-list">
        {filteredRecords.map((record) => (
          <div className="record-card" key={record.id}>
            <div className="record-header">
              <div className="record-type">
                <i className={`fas ${getRecordTypeIcon(record.type)}`}></i>
                <span>{getRecordTypeText(record.type)}</span>
              </div>
              <span className="record-date">{formatDate(record.date)}</span>
            </div>

            <div className="record-body">
              <h3 className="record-title">{record.title}</h3>
              <p className="record-description">{record.description}</p>

              {record.treatment && (
                <div className="record-treatment">
                  <strong>
                    <i className="fas fa-pills"></i> Điều trị:
                  </strong>{" "}
                  {record.treatment}
                </div>
              )}

              {record.notes && (
                <div className="record-notes">
                  <strong>
                    <i className="fas fa-clipboard"></i> Ghi chú:
                  </strong>{" "}
                  {record.notes}
                </div>
              )}
            </div>

            <div className="record-footer">
              <div className="record-doctor">
                <i className="fas fa-user-md"></i> {record.doctor}
              </div>

              {record.attachments && record.attachments.length > 0 && (
                <div className="record-attachments">
                  <i className="fas fa-paperclip"></i>
                  <span>Tài liệu đính kèm ({record.attachments.length})</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner text="Đang tải dữ liệu hồ sơ bệnh án..." />;
  }

  return (
    <div className="medical-records-container">
      <div className="medical-records-header">
        <h1>Hồ sơ bệnh án học sinh</h1>
        <p>
          Thông tin y tế và lịch sử bệnh án của học sinh do nhà trường theo dõi
        </p>
      </div>

      <div className="medical-records-content">
        <div className="student-selector">
          <label htmlFor="student-select">Chọn học sinh:</label>
          <select
            id="student-select"
            value={selectedStudent || ""}
            onChange={handleStudentChange}
            disabled={students.length === 0}
          >
            {students.length === 0 && (
              <option value="">Không có học sinh</option>
            )}
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} - Lớp {student.class}
              </option>
            ))}
          </select>
        </div>

        {selectedStudent && (
          <>
            <div className="student-info">
              <div className="student-avatar">
                <i className="fas fa-user-graduate"></i>
              </div>
              <div className="student-details">
                <h2>{students.find((s) => s.id === selectedStudent)?.name}</h2>
                <div className="student-meta">
                  <span>
                    <i className="fas fa-graduation-cap"></i> Lớp:{" "}
                    {students.find((s) => s.id === selectedStudent)?.class}
                  </span>
                  <span>
                    <i className="fas fa-birthday-cake"></i> Tuổi:{" "}
                    {students.find((s) => s.id === selectedStudent)?.age}
                  </span>
                  <span>
                    <i className="fas fa-venus-mars"></i> Giới tính:{" "}
                    {students.find((s) => s.id === selectedStudent)?.gender}
                  </span>
                </div>
              </div>
            </div>

            <div className="tabs-container">
              <div className="tabs-header">
                <button
                  className={`tab-btn ${
                    activeTab === "medical" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("medical")}
                >
                  <i className="fas fa-file-medical"></i> Hồ sơ bệnh án
                </button>
                <button
                  className={`tab-btn ${
                    activeTab === "health" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("health")}
                >
                  <i className="fas fa-heartbeat"></i> Thông tin sức khỏe
                </button>
              </div>

              {activeTab === "medical" && (
                <>
                  <div className="filters-container">
                    <div className="filter-group">
                      <div className="search-box">
                        <input
                          type="text"
                          placeholder="Tìm kiếm bệnh án..."
                          value={searchTerm}
                          onChange={handleSearchChange}
                        />
                        <button className="search-btn">
                          <i className="fas fa-search"></i>
                        </button>
                      </div>
                    </div>

                    <div className="filter-group">
                      <label htmlFor="date-filter">Ngày:</label>
                      <input
                        type="date"
                        id="date-filter"
                        value={filterDate}
                        onChange={handleDateChange}
                      />
                    </div>

                    <div className="filter-group">
                      <label htmlFor="type-filter">Loại:</label>
                      <select
                        id="type-filter"
                        value={filterType}
                        onChange={handleFilterTypeChange}
                      >
                        <option value="all">Tất cả</option>
                        <option value="examination">Khám định kỳ</option>
                        <option value="illness">Bệnh tật</option>
                        <option value="injury">Chấn thương</option>
                        <option value="vaccination">Tiêm chủng</option>
                      </select>
                    </div>

                    {(searchTerm || filterDate || filterType !== "all") && (
                      <button
                        className="clear-filters-btn"
                        onClick={() => {
                          setSearchTerm("");
                          setFilterDate("");
                          setFilterType("all");
                        }}
                      >
                        <i className="fas fa-times"></i> Xóa bộ lọc
                      </button>
                    )}
                  </div>

                  <div className="tab-content">{renderMedicalRecordsTab()}</div>
                </>
              )}

              {activeTab === "health" && (
                <div className="tab-content">{renderHealthMetricsTab()}</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MedicalRecords;
