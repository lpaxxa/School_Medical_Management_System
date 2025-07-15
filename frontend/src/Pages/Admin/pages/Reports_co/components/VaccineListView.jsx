import React, { useState, useEffect } from "react";
import vaccineService from "../../../../../services/APIAdmin/vaccineService";
import VaccineDetailModal from "./VaccineDetailModal";
import ReportHeader from "./ReportHeader";
import "./VaccineListView.css";

const VaccineListView = ({ onBack }) => {
  const [vaccines, setVaccines] = useState([]);
  const [filteredVaccines, setFilteredVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statistics, setStatistics] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [doseFilter, setDoseFilter] = useState("all");

  useEffect(() => {
    fetchVaccines();
    fetchStatistics();
  }, []);

  useEffect(() => {
    filterVaccines();
  }, [vaccines, searchTerm, statusFilter, ageFilter, doseFilter]);

  const fetchVaccines = async () => {
    try {
      setLoading(true);
      const result = await vaccineService.getAllVaccines();

      if (result.success) {
        setVaccines(result.data);
        setError(null);
      } else {
        setError(result.message);
        setVaccines([]);
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tải dữ liệu vaccine");
      setVaccines([]);
      console.error("Error fetching vaccines:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const result = await vaccineService.getVaccineStatistics();
      if (result.success) {
        setStatistics(result.data);
      }
    } catch (err) {
      console.error("Error fetching statistics:", err);
    }
  };

  const filterVaccines = () => {
    let filtered = [...vaccines];

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (vaccine) =>
          vaccine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vaccine.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter === "active") {
      filtered = filtered.filter((vaccine) => vaccine.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((vaccine) => !vaccine.isActive);
    }

    // Filter by age group
    if (ageFilter === "infant") {
      filtered = filtered.filter((vaccine) => vaccine.minAgeMonths <= 12);
    } else if (ageFilter === "children") {
      filtered = filtered.filter(
        (vaccine) => vaccine.minAgeMonths > 12 && vaccine.maxAgeMonths <= 60
      );
    } else if (ageFilter === "teens") {
      filtered = filtered.filter((vaccine) => vaccine.minAgeMonths > 60);
    }

    // Filter by dose count
    if (doseFilter === "single") {
      filtered = filtered.filter((vaccine) => vaccine.totalDoses === 1);
    } else if (doseFilter === "multiple") {
      filtered = filtered.filter((vaccine) => vaccine.totalDoses > 1);
    }

    setFilteredVaccines(filtered);
  };

  const handleViewDetail = (vaccine) => {
    setSelectedVaccine(vaccine);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVaccine(null);
  };

  const getAgeGroup = (vaccine) => {
    if (vaccine.maxAgeMonths <= 12) return "Trẻ sơ sinh";
    if (vaccine.minAgeMonths <= 60 && vaccine.maxAgeMonths > 12)
      return "Trẻ em";
    if (vaccine.minAgeMonths > 60) return "Thiếu niên";
    return "Đa độ tuổi";
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="reports-vaccine-status-badge reports-vaccine-active">
        <i className="fas fa-check-circle"></i> Đang sử dụng
      </span>
    ) : (
      <span className="reports-vaccine-status-badge reports-vaccine-inactive">
        <i className="fas fa-pause-circle"></i> Tạm dừng
      </span>
    );
  };

  if (loading) {
    return (
      <div className="reports-vaccine-list-container">
        <div className="reports-vaccine-loading-section">
          <i className="fas fa-spinner fa-spin fa-2x"></i>
          <p>Đang tải danh sách vaccine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-vaccine-list-container">
      {/* Header */}
      <ReportHeader
        title="Báo cáo vaccine"
        subtitle="Danh sách tất cả vaccine trong chương trình tiêm chủng"
        icon="fas fa-syringe"
        onBack={onBack}
        colorTheme="blue"
      />

      {/* Statistics Cards */}
      {statistics && (
        <div className="reports-vaccine-stats">
          <div className="reports-vaccine-stat-card reports-vaccine-total">
            <div className="reports-vaccine-stat-icon">
              <i className="fas fa-syringe"></i>
            </div>
            <div className="reports-vaccine-stat-content">
              <h3>{statistics.total}</h3>
              <p>Tổng số vaccine</p>
            </div>
          </div>

          <div className="reports-vaccine-stat-card reports-vaccine-active">
            <div className="reports-vaccine-stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="reports-vaccine-stat-content">
              <h3>{statistics.active}</h3>
              <p>Đang sử dụng</p>
            </div>
          </div>

          <div className="reports-vaccine-stat-card reports-vaccine-multi-dose">
            <div className="reports-vaccine-stat-icon">
              <i className="fas fa-redo"></i>
            </div>
            <div className="reports-vaccine-stat-content">
              <h3>{statistics.multiDose}</h3>
              <p>Nhiều liều</p>
            </div>
          </div>

          <div className="reports-vaccine-stat-card reports-vaccine-age-groups">
            <div className="reports-vaccine-stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="reports-vaccine-stat-content">
              <h3>3</h3>
              <p>Nhóm tuổi</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="reports-vaccine-filters">
        <div className="reports-vaccine-filter-group">
          <div className="reports-vaccine-search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên vaccine hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="reports-vaccine-filter-select"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang sử dụng</option>
            <option value="inactive">Tạm dừng</option>
          </select>

          <select
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
            className="reports-vaccine-filter-select"
          >
            <option value="all">Tất cả độ tuổi</option>
            <option value="infant">Trẻ sơ sinh (0-1 tuổi)</option>
            <option value="children">Trẻ em (1-5 tuổi)</option>
            <option value="teens">Thiếu niên (5+ tuổi)</option>
          </select>

          <select
            value={doseFilter}
            onChange={(e) => setDoseFilter(e.target.value)}
            className="reports-vaccine-filter-select"
          >
            <option value="all">Tất cả loại liều</option>
            <option value="single">Tiêm 1 lần</option>
            <option value="multiple">Nhiều liều</option>
          </select>
        </div>

        <div className="reports-vaccine-results-count">
          Hiển thị {filteredVaccines.length} / {vaccines.length} vaccine
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="reports-vaccine-error-message">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
          <button onClick={fetchVaccines}>Thử lại</button>
        </div>
      )}

      {/* Vaccine Table */}
      {filteredVaccines.length > 0 ? (
        <div className="reports-vaccine-table-container">
          <table className="reports-vaccine-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên vaccine</th>
                <th>Nhóm tuổi</th>
                <th>Số liều</th>
                <th>Khoảng cách</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredVaccines.map((vaccine, index) => (
                <tr key={vaccine.id} className="reports-vaccine-table-row">
                  <td className="reports-vaccine-table-stt">{index + 1}</td>
                  <td className="reports-vaccine-table-name">
                    <div className="reports-vaccine-name-info">
                      <strong className="reports-vaccine-item-name">
                        {vaccine.name}
                      </strong>
                      <div className="reports-vaccine-item-description">
                        {vaccine.description.length > 60
                          ? `${vaccine.description.substring(0, 60)}...`
                          : vaccine.description}
                      </div>
                    </div>
                  </td>
                  <td className="reports-vaccine-table-age-range">
                    <span className="reports-vaccine-age-badge">
                      {vaccineService.getAgeRange(vaccine)}
                    </span>
                  </td>
                  <td className="reports-vaccine-table-dose-count">
                    <span className="reports-vaccine-dose-badge">
                      {vaccine.totalDoses} liều
                    </span>
                  </td>
                  <td className="reports-vaccine-table-interval">
                    {vaccine.intervalDays > 0
                      ? `${vaccine.intervalDays} ngày`
                      : "Không có"}
                  </td>
                  <td className="reports-vaccine-table-status">
                    {getStatusBadge(vaccine.isActive)}
                  </td>
                  <td className="reports-vaccine-table-actions">
                    <button
                      className="reports-vaccine-action-button"
                      onClick={() => handleViewDetail(vaccine)}
                      title="Xem chi tiết"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="reports-vaccine-no-data">
          <i className="fas fa-syringe fa-3x"></i>
          <h3>Không tìm thấy vaccine nào</h3>
          <p>
            {searchTerm ||
            statusFilter !== "all" ||
            ageFilter !== "all" ||
            doseFilter !== "all"
              ? "Không có vaccine nào phù hợp với bộ lọc"
              : "Chưa có dữ liệu vaccine trong hệ thống"}
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedVaccine && (
        <VaccineDetailModal
          vaccine={selectedVaccine}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default VaccineListView;
