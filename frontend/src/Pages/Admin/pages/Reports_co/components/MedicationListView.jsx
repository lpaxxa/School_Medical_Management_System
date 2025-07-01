import React, { useState, useEffect } from "react";
import medicationService from "../../../../../services/APIAdmin/medicationService";
import MedicationDetailModal from "./MedicationDetailModal";
import "./MedicationListView.css";

const MedicationListView = ({ onBack }) => {
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statistics, setStatistics] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  useEffect(() => {
    fetchMedications();
    fetchStatistics();
  }, []);

  useEffect(() => {
    filterMedications();
  }, [medications, searchTerm, typeFilter, stockFilter]);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const result = await medicationService.getAllMedicationItems();

      if (result.success) {
        setMedications(result.data);
        setError(null);
      } else {
        setError(result.message);
        setMedications([]);
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tải dữ liệu thuốc");
      setMedications([]);
      console.error("Error fetching medications:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const result = await medicationService.getMedicationStatistics();
      if (result.success) {
        setStatistics(result.data);
      }
    } catch (err) {
      console.error("Error fetching statistics:", err);
    }
  };

  const filterMedications = () => {
    let filtered = [...medications];

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.itemDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((item) => item.itemType === typeFilter);
    }

    // Filter by stock level
    if (stockFilter === "low") {
      filtered = filtered.filter((item) => item.stockQuantity < 20);
    } else if (stockFilter === "out") {
      filtered = filtered.filter((item) => item.stockQuantity === 0);
    }

    setFilteredMedications(filtered);
  };

  const handleViewDetail = (medication) => {
    setSelectedMedication(medication);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMedication(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { class: "out-of-stock", text: "Hết hàng" };
    if (quantity < 20) return { class: "low-stock", text: "Sắp hết" };
    return { class: "in-stock", text: "Còn hàng" };
  };

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return { class: "expired", text: "Đã hết hạn" };
    if (daysUntilExpiry <= 30)
      return { class: "expiring-soon", text: "Sắp hết hạn" };
    if (daysUntilExpiry <= 180)
      return { class: "expiring-warning", text: "Cần theo dõi" };
    return { class: "expiry-good", text: "Còn hạn" };
  };

  // Get unique medication types for filter
  const uniqueTypes = [
    ...new Set(medications.map((item) => item.itemType).filter(Boolean)),
  ];

  if (loading) {
    return (
      <div className="medication-list-container">
        <div className="loading-section">
          <i className="fas fa-spinner fa-spin fa-2x"></i>
          <p>Đang tải danh sách thuốc...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="medication-list-container">
      {/* Header */}
      <div className="medication-header">
        <div className="header-actions">
          <button className="back-button" onClick={onBack}>
            <i className="fas fa-arrow-left"></i> Quay lại
          </button>
          <h2>
            <i className="fas fa-pills"></i> Báo cáo thuốc và vật tư y tế
          </h2>
        </div>
        <p>Danh sách tất cả thuốc và vật tư y tế trong kho</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="medication-stats">
          <div className="stat-card total">
            <div className="stat-icon">
              <i className="fas fa-pills"></i>
            </div>
            <div className="stat-content">
              <h3>{statistics.total}</h3>
              <p>Tổng số mặt hàng</p>
            </div>
          </div>

          <div className="stat-card low-stock">
            <div className="stat-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="stat-content">
              <h3>{statistics.lowStock}</h3>
              <p>Sắp hết hàng</p>
            </div>
          </div>

          <div className="stat-card near-expiry">
            <div className="stat-icon">
              <i className="fas fa-calendar-times"></i>
            </div>
            <div className="stat-content">
              <h3>{statistics.nearExpiry}</h3>
              <p>Sắp hết hạn</p>
            </div>
          </div>

          <div className="stat-card types">
            <div className="stat-icon">
              <i className="fas fa-tags"></i>
            </div>
            <div className="stat-content">
              <h3>{Object.keys(statistics.byType).length}</h3>
              <p>Loại thuốc</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="medication-filters">
        <div className="filter-group">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên thuốc hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả loại</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả tình trạng</option>
            <option value="low">Sắp hết hàng</option>
            <option value="out">Hết hàng</option>
          </select>
        </div>

        <div className="results-count">
          Hiển thị {filteredMedications.length} / {medications.length} mặt hàng
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
          <button onClick={fetchMedications}>Thử lại</button>
        </div>
      )}

      {/* Medication List */}
      {filteredMedications.length > 0 ? (
        <div className="medication-grid">
          {filteredMedications.map((medication) => {
            const stockStatus = getStockStatus(medication.stockQuantity);
            const expiryStatus = getExpiryStatus(medication.expiryDate);

            return (
              <div
                key={medication.itemId}
                className="medication-card"
                onClick={() => handleViewDetail(medication)}
              >
                <div className="medication-card-header">
                  <h3 className="medication-name">{medication.itemName}</h3>
                  <div className="medication-badges">
                    <span className={`stock-badge ${stockStatus.class}`}>
                      {stockStatus.text}
                    </span>
                    <span className={`expiry-badge ${expiryStatus.class}`}>
                      {expiryStatus.text}
                    </span>
                  </div>
                </div>

                <div className="medication-card-body">
                  <div className="medication-info">
                    <div className="info-row">
                      <span className="label">Loại:</span>
                      <span className="value">{medication.itemType}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Đơn vị:</span>
                      <span className="value">{medication.unit}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Tồn kho:</span>
                      <span className={`value stock-${stockStatus.class}`}>
                        {medication.stockQuantity} {medication.unit}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">Hết hạn:</span>
                      <span className="value">
                        {formatDate(medication.expiryDate)}
                      </span>
                    </div>
                  </div>

                  <div className="medication-description">
                    {medication.itemDescription.length > 100
                      ? `${medication.itemDescription.substring(0, 100)}...`
                      : medication.itemDescription}
                  </div>
                </div>

                <div className="medication-card-footer">
                  <span className="medication-id">ID: {medication.itemId}</span>
                  <button className="view-detail-btn">
                    <i className="fas fa-eye"></i> Xem chi tiết
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-data">
          <i className="fas fa-pills fa-3x"></i>
          <h3>Không tìm thấy thuốc nào</h3>
          <p>
            {searchTerm || typeFilter !== "all" || stockFilter !== "all"
              ? "Không có thuốc nào phù hợp với bộ lọc"
              : "Chưa có dữ liệu thuốc trong hệ thống"}
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedMedication && (
        <MedicationDetailModal
          medication={selectedMedication}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default MedicationListView;
