import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaSync } from "react-icons/fa";
import medicationService from "../../../../../services/APIAdmin/medicationService";
import MedicationDetailModal from "./MedicationDetailModal";
import ReportHeader from "./ReportHeader";
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchMedications();
    fetchStatistics();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, stockFilter]);

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
      return { class: "expiring-soon", text: "Sắp hết thuốc" };
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
      <div className="reports-medication-list-container theme-green">
        <div className="reports-medication-loading-section">
          <div className="reports-medication-loading-spinner"></div>
          <p>Đang tải danh sách thuốc...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-medication-list-container theme-green">
      {/* Header */}
      <ReportHeader
        title="Báo cáo thuốc và vật tư y tế"
        subtitle="Danh sách tất cả thuốc và vật tư y tế trong kho"
        icon="fas fa-pills"
        onBack={onBack}
        colorTheme="green"
      />

      {/* Statistics Cards */}
      {statistics && (
        <div className="reports-medication-stats">
          <div className="reports-medication-stat-card reports-medication-total">
            <div className="reports-medication-stat-icon">
              <i className="fas fa-pills"></i>
            </div>
            <div className="reports-medication-stat-content">
              <h3>{statistics.total}</h3>
              <p>Tổng số loại thuốc</p>
            </div>
          </div>

          <div className="reports-medication-stat-card reports-medication-low-stock">
            <div className="reports-medication-stat-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="reports-medication-stat-content">
              <h3>{statistics.lowStock}</h3>
              <p>Sắp hết hàng</p>
            </div>
          </div>

          <div className="reports-medication-stat-card reports-medication-near-expiry">
            <div className="reports-medication-stat-icon">
              <i className="fas fa-calendar-times"></i>
            </div>
            <div className="reports-medication-stat-content">
              <h3>{statistics.nearExpiry}</h3>
              <p>Sắp hết hạn</p>
            </div>
          </div>

          <div className="reports-medication-stat-card reports-medication-types">
            <div className="reports-medication-stat-icon">
              <i className="fas fa-tags"></i>
            </div>
            <div className="reports-medication-stat-content">
              <h3>{Object.keys(statistics.byType).length}</h3>
              <p>Loại thuốc</p>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="admin-history-toolbar">
        <div className="admin-search-filter-group">
          <div className="admin-search-box">
            <FaSearch className="admin-search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên thuốc hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="admin-filter-dropdown">
            <FaFilter className="admin-filter-icon" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Tất cả loại</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-filter-dropdown">
            <FaFilter className="admin-filter-icon" />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="all">Tất cả tình trạng</option>
              <option value="low">Sắp hết hàng</option>
              <option value="out">Hết hàng</option>
            </select>
          </div>
        </div>

        <div className="admin-toolbar-buttons">
          <div className="admin-results-count">
            Tổng cộng {filteredMedications.length} / {medications.length} loại
            thuốc
          </div>
          <button
            className="admin-refresh-button"
            onClick={fetchMedications}
            disabled={loading}
          >
            <FaSync />
            Làm mới
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="reports-medication-error-message">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
          <button onClick={fetchMedications}>Thử lại</button>
        </div>
      )}

      {/* Medication Table */}
      {filteredMedications.length > 0 ? (
        (() => {
          // Calculate pagination
          const totalPages = Math.ceil(
            filteredMedications.length / itemsPerPage
          );
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const currentMedications = filteredMedications.slice(
            startIndex,
            endIndex
          );

          return (
            <div className="reports-medication-table-container">
              <table className="reports-medication-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên thuốc</th>
                    <th>Loại</th>
                    <th>Đơn vị</th>
                    <th>Tồn kho</th>
                    <th>Hết hạn</th>
                    <th>Trạng thái kho</th>
                    <th>Trạng thái hạn</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMedications.map((medication, index) => {
                    const stockStatus = getStockStatus(
                      medication.stockQuantity
                    );
                    const expiryStatus = getExpiryStatus(medication.expiryDate);

                    return (
                      <tr
                        key={medication.itemId}
                        className="reports-medication-table-row"
                      >
                        <td className="reports-medication-table-stt">
                          {startIndex + index + 1}
                        </td>
                        <td className="reports-medication-table-name">
                          <div className="reports-medication-name-info">
                            <strong className="reports-medication-item-name">
                              {medication.itemName || "Chưa có tên"}
                            </strong>
                            <div className="reports-medication-item-description">
                              {medication.itemDescription &&
                              medication.itemDescription.length > 60
                                ? `${medication.itemDescription.substring(
                                    0,
                                    60
                                  )}...`
                                : medication.itemDescription ||
                                  "Không có mô tả"}
                            </div>
                          </div>
                        </td>
                        <td className="reports-medication-table-type">
                          <span className="reports-medication-type-badge">
                            {medication.itemType || "N/A"}
                          </span>
                        </td>
                        <td className="reports-medication-table-unit">
                          {medication.unit || "N/A"}
                        </td>
                        <td className="reports-medication-table-stock">
                          <span
                            className={`reports-medication-stock-badge reports-medication-${stockStatus.class}`}
                          >
                            {typeof medication.stockQuantity === "number"
                              ? medication.stockQuantity
                              : "N/A"}
                          </span>
                        </td>
                        <td className="reports-medication-table-expiry">
                          <span
                            className={`reports-medication-expiry-badge reports-medication-${expiryStatus.class}`}
                          >
                            {medication.expiryDate
                              ? formatDate(medication.expiryDate)
                              : "N/A"}
                          </span>
                        </td>
                        <td className="reports-medication-table-stock-status">
                          <span
                            className={`reports-medication-status-badge reports-medication-${stockStatus.class}`}
                          >
                            {stockStatus.text}
                          </span>
                        </td>
                        <td className="reports-medication-table-expiry-status">
                          <span
                            className={`reports-medication-status-badge reports-medication-${expiryStatus.class}`}
                          >
                            {expiryStatus.text}
                          </span>
                        </td>
                        <td className="reports-medication-table-actions">
                          <button
                            className="reports-medication-action-button"
                            onClick={() => handleViewDetail(medication)}
                            title="Xem chi tiết"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="admin-pagination">
                  <div className="admin-pagination-info">
                    Hiển thị {startIndex + 1}-
                    {Math.min(endIndex, filteredMedications.length)} của{" "}
                    {filteredMedications.length} thuốc
                  </div>
                  <div className="admin-pagination-controls">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="admin-pagination-btn"
                    >
                      ‹ Trước
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="admin-pagination-ellipsis">
                              ...
                            </span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`admin-pagination-btn ${
                              currentPage === page ? "active" : ""
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="admin-pagination-btn"
                    >
                      Tiếp ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()
      ) : (
        <div className="reports-medication-no-data">
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
          theme="green"
        />
      )}
    </div>
  );
};

export default MedicationListView;
