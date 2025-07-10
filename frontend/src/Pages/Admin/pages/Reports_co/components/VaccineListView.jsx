import React, { useState, useEffect } from "react";
import vaccineService from "../../../../../services/APIAdmin/vaccineService";
import VaccineDetailModal from "./VaccineDetailModal";
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
      <span className="status-badge active">
        <i className="fas fa-check-circle"></i> Đang sử dụng
      </span>
    ) : (
      <span className="status-badge inactive">
        <i className="fas fa-pause-circle"></i> Tạm dừng
      </span>
    );
  };

  if (loading) {
    return (
      <div className="vaccine-list-container">
        <div className="loading-section">
          <i className="fas fa-spinner fa-spin fa-2x"></i>
          <p>Đang tải danh sách vaccine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vaccine-list-container">
      {/* Header */}
      <div className="vaccine-header">
        <div className="header-actions">
          <button className="back-button" onClick={onBack}>
            <i className="fas fa-arrow-left"></i> Quay lại
          </button>
          <h2>
            <i className="fas fa-syringe"></i> Báo cáo vaccine
          </h2>
        </div>
        <p>Danh sách tất cả vaccine trong chương trình tiêm chủng</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="vaccine-stats">
          <div className="stat-card total">
            <div className="stat-icon">
              <i className="fas fa-syringe"></i>
            </div>
            <div className="stat-content">
              <h3>{statistics.total}</h3>
              <p>Tổng số vaccine</p>
            </div>
          </div>

          <div className="stat-card active">
            <div className="stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <h3>{statistics.active}</h3>
              <p>Đang sử dụng</p>
            </div>
          </div>

          <div className="stat-card multi-dose">
            <div className="stat-icon">
              <i className="fas fa-redo"></i>
            </div>
            <div className="stat-content">
              <h3>{statistics.multiDose}</h3>
              <p>Nhiều liều</p>
            </div>
          </div>

          <div className="stat-card age-groups">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-content">
              <h3>3</h3>
              <p>Nhóm tuổi</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="vaccine-filters">
        <div className="filter-group">
          <div className="search-box">
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
            className="filter-select"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang sử dụng</option>
            <option value="inactive">Tạm dừng</option>
          </select>

          <select
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả độ tuổi</option>
            <option value="infant">Trẻ sơ sinh (0-1 tuổi)</option>
            <option value="children">Trẻ em (1-5 tuổi)</option>
            <option value="teens">Thiếu niên (5+ tuổi)</option>
          </select>

          <select
            value={doseFilter}
            onChange={(e) => setDoseFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả loại liều</option>
            <option value="single">Tiêm 1 lần</option>
            <option value="multiple">Nhiều liều</option>
          </select>
        </div>

        <div className="results-count">
          Hiển thị {filteredVaccines.length} / {vaccines.length} vaccine
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
          <button onClick={fetchVaccines}>Thử lại</button>
        </div>
      )}

      {/* Vaccine Table */}
      {filteredVaccines.length > 0 ? (
        <div className="vaccine-table-container">
          <table className="vaccine-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên vaccine</th>
                <th>Nhóm tuổi</th>
                <th>Số liều</th>
                <th>Khoảng cách</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredVaccines.map((vaccine) => (
                <tr key={vaccine.id} className="vaccine-row">
                  <td className="vaccine-id">{vaccine.id}</td>
                  <td className="vaccine-name">
                    <div className="name-info">
                      <strong>{vaccine.name}</strong>
                      <div className="description">
                        {vaccine.description.length > 60
                          ? `${vaccine.description.substring(0, 60)}...`
                          : vaccine.description}
                      </div>
                    </div>
                  </td>
                  <td className="age-range">
                    <span className="age-badge">
                      {vaccineService.getAgeRange(vaccine)}
                    </span>
                  </td>
                  <td className="dose-count">
                    <span className="dose-badge">
                      {vaccine.totalDoses} liều
                    </span>
                  </td>
                  <td className="interval">
                    {vaccine.intervalDays > 0
                      ? `${vaccine.intervalDays} ngày`
                      : "Không có"}
                  </td>
                  <td className="status">{getStatusBadge(vaccine.isActive)}</td>
                  <td className="actions">
                    <button
                      className="view-detail-btn"
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
        <div className="no-data">
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
