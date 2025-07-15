import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaFilter,
  FaSync,
  FaCalendarAlt,
  FaSyringe,
  FaInfoCircle,
  FaSpinner,
  FaClock,
  FaChevronLeft,
  FaChevronRight,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import { safeParseDate } from "../../utils/dateUtils";
import vaccinationPlanService from "../../../../services/APIAdmin/vaccinationPlanService";
import "./VaccinationPlanHistory.css";

const VaccinationPlanHistory = () => {
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" hoặc "oldest"

  // Status change state
  const [statusChanging, setStatusChanging] = useState({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [paginatedPlans, setPaginatedPlans] = useState([]);

  // Load data khi component mount
  useEffect(() => {
    loadVaccinationPlans();
  }, []);

  // Filter plans khi search term, status filter, hoặc sort order thay đổi
  useEffect(() => {
    filterPlans();
  }, [plans, searchTerm, statusFilter, sortOrder]);

  // Handle pagination when filteredPlans changes
  useEffect(() => {
    const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);

    // Reset to page 1 if current page is out of bounds
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
      return;
    }

    // Calculate start and end indices for current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Get plans for current page
    const plansForCurrentPage = filteredPlans.slice(startIndex, endIndex);
    setPaginatedPlans(plansForCurrentPage);
  }, [filteredPlans, currentPage, itemsPerPage]);

  // Hàm load danh sách kế hoạch
  const loadVaccinationPlans = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Đang tải danh sách kế hoạch tiêm chủng...");
      console.log(
        "📍 API URL:",
        "http://localhost:8080/api/v1/vaccination-plans"
      );

      const result = await vaccinationPlanService.getVaccinationPlans();
      console.log("📥 API Response:", result);

      if (result.success && result.data) {
        // Validate data structure
        if (Array.isArray(result.data)) {
          setPlans(result.data);
          console.log(
            "✅ Đã tải thành công từ API:",
            result.data.length,
            "items"
          );
          console.log("📊 Data sample:", result.data[0]);
        } else {
          console.error(
            "❌ API response data không phải array:",
            typeof result.data
          );
          setError("Dữ liệu API không đúng định dạng (không phải array)");
          setPlans([]);
        }
      } else {
        console.error("❌ API không thành công:", result.message);
        setError(result.message || "Không thể tải dữ liệu từ API");
        setPlans([]);
      }
    } catch (err) {
      console.error("❌ Exception khi gọi API:", err);
      setError("Có lỗi kết nối đến API: " + err.message);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm filter plans
  const filterPlans = () => {
    let filtered = [...plans];

    // Filter theo search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (plan) =>
          plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter theo status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((plan) => plan.status === statusFilter);
    }

    // Sort theo ngày tiêm
    filtered.sort((a, b) => {
      const dateA = safeParseDate(a.vaccinationDate);
      const dateB = safeParseDate(b.vaccinationDate);

      if (sortOrder === "newest") {
        return dateB - dateA; // Mới nhất trước
      } else {
        return dateA - dateB; // Cũ nhất trước
      }
    });

    setFilteredPlans(filtered);
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder((current) => (current === "newest" ? "oldest" : "newest"));
  };

  // Handle status change
  const handleStatusChange = async (planId, newStatus) => {
    setStatusChanging((prev) => ({ ...prev, [planId]: true }));

    try {
      console.log(
        `🔄 Thay đổi trạng thái kế hoạch ${planId} thành:`,
        newStatus
      );

      const result = await vaccinationPlanService.updateVaccinationPlanStatus(
        planId,
        newStatus
      );

      if (result.success) {
        console.log("✅ Thay đổi trạng thái thành công!");
        loadVaccinationPlans(); // Reload data to reflect changes
      } else {
        console.error("❌ Thay đổi trạng thái thất bại:", result.message);
        setError("Thay đổi trạng thái thất bại: " + result.message);
      }
    } catch (err) {
      console.error("❌ Exception khi thay đổi trạng thái:", err);
      setError("Có lỗi khi thay đổi trạng thái: " + err.message);
    } finally {
      setStatusChanging((prev) => ({ ...prev, [planId]: false }));
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "WAITING_PARENT":
        return "status-waiting";
      case "IN_PROGRESS":
        return "status-progress";
      case "COMPLETED":
        return "status-completed";
      case "CANCELED":
        return "status-canceled";
      default:
        return "status-default";
    }
  };

  // Get statistics
  const getStatistics = () => {
    const total = plans.length;
    const waiting = plans.filter((p) => p.status === "WAITING_PARENT").length;
    const progress = plans.filter((p) => p.status === "IN_PROGRESS").length;
    const completed = plans.filter((p) => p.status === "COMPLETED").length;
    const canceled = plans.filter((p) => p.status === "CANCELED").length;

    return { total, waiting, progress, completed, canceled };
  };

  const stats = getStatistics();

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Calculate pagination info
  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredPlans.length);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  return (
    <div className="vaccination-plan-history">
      {/* Header */}
      <div className="vac-plan-history-header">
        <h2>Lịch Sử Kế Hoạch Tiêm Chủng</h2>
        <p>Xem và quản lý tất cả các kế hoạch tiêm chủng đã tạo</p>
      </div>

      {/* Statistics */}
      <div className="vac-plan-statistics-row">
        <div className="vac-plan-stat-card total">
          <div className="stat-info">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Tổng kế hoạch</span>
          </div>
        </div>

        <div className="vac-plan-stat-card ongoing">
          <div className="stat-info">
            <span className="stat-number">{stats.waiting}</span>
            <span className="stat-label">Chờ phụ huynh</span>
          </div>
        </div>

        <div className="vac-plan-stat-card ongoing">
          <div className="stat-info">
            <span className="stat-number">{stats.progress}</span>
            <span className="stat-label">Đang triển khai</span>
          </div>
        </div>

        <div className="vac-plan-stat-card completed">
          <div className="stat-info">
            <span className="stat-number">{stats.completed}</span>
            <span className="stat-label">Hoàn thành</span>
          </div>
        </div>

        <div className="vac-plan-stat-card cancelled">
          <div className="stat-info">
            <span className="stat-number">{stats.canceled}</span>
            <span className="stat-label">Đã hủy</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="history-toolbar">
        <div className="search-filter-group">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên vaccine hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-dropdown">
            <FaFilter className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="WAITING_PARENT">Chờ phụ huynh</option>
              <option value="IN_PROGRESS">Đang triển khai</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELED">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="toolbar-buttons">
          <button
            className="sort-button"
            onClick={toggleSortOrder}
            title={
              sortOrder === "newest"
                ? "Sắp xếp từ cũ nhất"
                : "Sắp xếp từ mới nhất"
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              backgroundColor: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              color: "#495057",
              transition: "all 0.2s ease",
              marginRight: "8px",
            }}
          >
            {sortOrder === "newest" ? (
              <>
                <FaSortAmountDown />
                Mới nhất
              </>
            ) : (
              <>
                <FaSortAmountUp />
                Cũ nhất
              </>
            )}
          </button>

          <button
            className="refresh-button"
            onClick={loadVaccinationPlans}
            disabled={loading}
          >
            {loading ? <FaSpinner className="spinning" /> : <FaSync />}
            Làm mới
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <FaInfoCircle className="error-banner-icon" />
          <span>{error}</span>
          <button
            className="error-close-btn"
            onClick={() => setError(null)}
            title="Đóng thông báo"
          >
            ×
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="loading-section">
          <FaSpinner className="spinning large" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="error-section">
          <FaInfoCircle className="error-icon" />
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={loadVaccinationPlans}>
            Thử lại
          </button>
        </div>
      ) : filteredPlans.length > 0 ? (
        <>
          <div className="plans-table-container">
            <table className="plans-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên Kế Hoạch</th>
                  <th>Ngày Tiêm</th>
                  <th>Hạn Đăng Ký</th>
                  <th>Trạng Thái</th>
                  <th>Thời Gian</th>
                  <th>Mô Tả</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPlans.map((plan) => {
                  const timeStatus = vaccinationPlanService.getTimeStatus(
                    plan.vaccinationDate,
                    plan.deadlineDate
                  );

                  return (
                    <tr key={plan.id}>
                      <td className="plan-id-cell">{plan.id}</td>

                      <td className="plan-name-cell">
                        <div className="name-with-icon">
                          <FaSyringe className="vaccine-icon" />
                          <span>{plan.name}</span>
                        </div>
                      </td>

                      <td className="date-cell">
                        {vaccinationPlanService.formatVaccinationDate(
                          plan.vaccinationDate
                        )}
                      </td>

                      <td className="deadline-cell">
                        {vaccinationPlanService.formatDate(plan.deadlineDate)}
                      </td>

                      <td className="status-cell">
                        <select
                          className={`status-select ${getStatusBadgeClass(
                            plan.status
                          )}`}
                          value={plan.status}
                          onChange={(e) =>
                            handleStatusChange(plan.id, e.target.value)
                          }
                          disabled={statusChanging[plan.id]}
                        >
                          <option value="WAITING_PARENT">Chờ phụ huynh</option>
                          <option value="IN_PROGRESS">Đang triển khai</option>
                          <option value="COMPLETED">Hoàn thành</option>
                          <option value="CANCELED">Đã hủy</option>
                        </select>
                        {statusChanging[plan.id] && (
                          <FaSpinner className="status-spinner spinning" />
                        )}
                      </td>

                      <td className="time-status-cell">
                        <span
                          className={`time-status-badge ${timeStatus.type}`}
                          style={{ color: timeStatus.color }}
                        >
                          {timeStatus.text}
                        </span>
                      </td>

                      <td className="description-cell">
                        <div className="description-text">
                          {plan.description}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {filteredPlans.length > itemsPerPage && (
              <div className="pagination-container">
                <div className="pagination-info">
                  <span>
                    Hiển thị {startIndex}-{endIndex} trong tổng số{" "}
                    {filteredPlans.length} kế hoạch
                  </span>
                </div>

                <div className="pagination-controls">
                  <button
                    className={`pagination-btn ${
                      !hasPreviousPage ? "disabled" : ""
                    }`}
                    onClick={handlePreviousPage}
                    disabled={!hasPreviousPage}
                    title="Trang trước"
                  >
                    <FaChevronLeft />
                  </button>

                  <div className="pagination-pages">
                    {Array.from({ length: totalPages }, (_, index) => {
                      const page = index + 1;
                      const isCurrentPage = page === currentPage;

                      // Show first page, last page, current page, and pages around current page
                      const showPage =
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1);

                      if (!showPage) {
                        // Show ellipsis for gaps
                        if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span key={page} className="pagination-ellipsis">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <button
                          key={page}
                          className={`pagination-page ${
                            isCurrentPage ? "active" : ""
                          }`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    className={`pagination-btn ${
                      !hasNextPage ? "disabled" : ""
                    }`}
                    onClick={handleNextPage}
                    disabled={!hasNextPage}
                    title="Trang sau"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="no-data-section">
          <FaSyringe className="no-data-icon" />
          <h3>Không có dữ liệu hiển thị</h3>
          <p>
            {searchTerm || statusFilter !== "ALL"
              ? "Không tìm thấy kế hoạch nào phù hợp với bộ lọc"
              : "Không có dữ liệu từ API hoặc chưa tải thành công"}
          </p>
          <button className="retry-button" onClick={loadVaccinationPlans}>
            Thử tải lại từ API
          </button>
        </div>
      )}
    </div>
  );
};

export default VaccinationPlanHistory;
