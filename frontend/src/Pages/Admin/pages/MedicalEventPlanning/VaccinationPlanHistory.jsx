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

  // Dropdown states
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(null); // ID của plan đang mở dropdown

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
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/vaccination-plans`
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

  // Handle status click - toggle dropdown
  const handleStatusClick = (plan, event) => {
    event.stopPropagation(); // Prevent row click
    if (statusDropdownOpen === plan.id) {
      setStatusDropdownOpen(null); // Close if already open
    } else {
      setStatusDropdownOpen(plan.id); // Open dropdown for this plan
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setStatusDropdownOpen(null);
    };

    if (statusDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [statusDropdownOpen]);

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
        return "admin-status-waiting";
      case "IN_PROGRESS":
        return "admin-status-progress";
      case "COMPLETED":
        return "admin-status-completed";
      case "CANCELED":
        return "admin-status-canceled";
      default:
        return "admin-status-default";
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case "WAITING_PARENT":
        return "Chờ phụ huynh";
      case "IN_PROGRESS":
        return "Đang triển khai";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELED":
        return "Đã hủy";
      default:
        return "Chờ phụ huynh";
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
    <div className="admin-vaccination-plan-history">
      {/* Header */}
      <div className="admin-vac-plan-history-header">
        <h2>Lịch Sử Kế Hoạch Tiêm Chủng</h2>
        <p>Xem và quản lý tất cả các kế hoạch tiêm chủng đã tạo</p>
      </div>

      {/* Statistics */}
      <div className="admin-vac-plan-statistics-row">
        <div className="admin-vac-plan-stat-card total">
          <div className="admin-stat-info">
            <span className="admin-stat-number">{stats.total}</span>
            <span className="admin-stat-label">Tổng kế hoạch</span>
          </div>
        </div>

        <div className="admin-vac-plan-stat-card ongoing">
          <div className="admin-stat-info">
            <span className="admin-stat-number">{stats.waiting}</span>
            <span className="admin-stat-label">Chờ phụ huynh</span>
          </div>
        </div>

        <div className="admin-vac-plan-stat-card ongoing">
          <div className="admin-stat-info">
            <span className="admin-stat-number">{stats.progress}</span>
            <span className="admin-stat-label">Đang triển khai</span>
          </div>
        </div>

        <div className="admin-vac-plan-stat-card completed">
          <div className="admin-stat-info">
            <span className="admin-stat-number">{stats.completed}</span>
            <span className="admin-stat-label">Hoàn thành</span>
          </div>
        </div>

        <div className="admin-vac-plan-stat-card cancelled">
          <div className="admin-stat-info">
            <span className="admin-stat-number">{stats.canceled}</span>
            <span className="admin-stat-label">Đã hủy</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-history-toolbar">
        <div className="admin-search-filter-group">
          <div className="admin-search-box">
            <FaSearch className="admin-search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên vaccine hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="admin-filter-dropdown">
            <FaFilter className="admin-filter-icon" />
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

        <div className="admin-toolbar-buttons">
          <button
            className="admin-sort-button"
            onClick={toggleSortOrder}
            title={
              sortOrder === "newest"
                ? "Sắp xếp từ cũ nhất"
                : "Sắp xếp từ mới nhất"
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 16px",
              backgroundColor: "#f8fafc",
              border: "2px solid #e2e8f0",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "14px",
              color: "#475569",
              transition: "all 0.3s ease",
              marginRight: "12px",
              fontWeight: "600",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
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
            className="admin-refresh-button"
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
        <div className="admin-error-banner">
          <FaInfoCircle className="admin-error-banner-icon" />
          <span>{error}</span>
          <button
            className="admin-error-close-btn"
            onClick={() => setError(null)}
            title="Đóng thông báo"
          >
            ×
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="admin-loading-section">
          <FaSpinner className="admin-spinning admin-large" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="admin-error-section">
          <FaInfoCircle className="admin-error-icon" />
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button className="admin-retry-button" onClick={loadVaccinationPlans}>
            Thử lại
          </button>
        </div>
      ) : filteredPlans.length > 0 ? (
        <>
          <div className="admin-plans-table-container">
            <table className="admin-plans-table">
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
                {paginatedPlans.map((plan, index) => {
                  const timeStatus = vaccinationPlanService.getTimeStatus(
                    plan.vaccinationDate,
                    plan.deadlineDate
                  );

                  return (
                    <tr key={plan.id}>
                      <td className="admin-plan-id-cell">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>

                      <td className="admin-plan-name-cell">
                        <div className="admin-name-with-icon">
                          {/* <FaSyringe className="admin-vaccine-icon" /> */}
                          <span>{plan.name}</span>
                        </div>
                      </td>

                      <td className="admin-date-cell">
                        {vaccinationPlanService.formatVaccinationDate(
                          plan.vaccinationDate
                        )}
                      </td>

                      <td className="admin-deadline-cell">
                        {vaccinationPlanService.formatDate(plan.deadlineDate)}
                      </td>

                      <td className="admin-status-cell">
                        <div className="admin-status-dropdown-container">
                          <span
                            className={`admin-status-badge ${getStatusBadgeClass(
                              plan.status
                            )} admin-clickable`}
                            onClick={(e) => handleStatusClick(plan, e)}
                            title="Click để thay đổi trạng thái"
                          >
                            {getStatusLabel(plan.status)}
                          </span>

                          {/* Status Dropdown */}
                          {statusDropdownOpen === plan.id && (
                            <div
                              className="admin-status-dropdown"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {[
                                {
                                  value: "WAITING_PARENT",
                                  label: "Chờ phụ huynh",
                                  color: "admin-status-waiting",
                                },
                                {
                                  value: "IN_PROGRESS",
                                  label: "Đang triển khai",
                                  color: "admin-status-progress",
                                },
                                {
                                  value: "COMPLETED",
                                  label: "Hoàn thành",
                                  color: "admin-status-completed",
                                },
                                {
                                  value: "CANCELED",
                                  label: "Đã hủy",
                                  color: "admin-status-canceled",
                                },
                              ]
                                .filter(
                                  (status) => status.value !== plan.status
                                ) // Loại bỏ trạng thái hiện tại
                                .map((status) => (
                                  <div
                                    key={status.value}
                                    className={`admin-status-dropdown-item ${status.color}`}
                                    onClick={() => {
                                      handleStatusChange(plan.id, status.value);
                                      setStatusDropdownOpen(null);
                                    }}
                                  >
                                    <span
                                      className={`admin-status-badge ${status.color}`}
                                    >
                                      {status.label}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          )}

                          {statusChanging[plan.id] && (
                            <FaSpinner className="admin-status-spinner spinning" />
                          )}
                        </div>
                      </td>

                      <td className="admin-time-status-cell">
                        <span
                          className={`admin-time-status-badge ${timeStatus.type}`}
                          style={{ color: timeStatus.color }}
                        >
                          {timeStatus.text}
                        </span>
                      </td>

                      <td className="admin-description-cell">
                        <div className="admin-description-text">
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
              <div className="admin-pagination-container">
                <div className="admin-pagination-info">
                  <span>
                    Hiển thị {startIndex}-{endIndex} trong tổng số{" "}
                    {filteredPlans.length} kế hoạch
                  </span>
                </div>

                <div className="admin-pagination-controls">
                  <button
                    className={`admin-pagination-btn ${
                      !hasPreviousPage ? "admin-disabled" : ""
                    }`}
                    onClick={handlePreviousPage}
                    disabled={!hasPreviousPage}
                    title="Trang trước"
                  >
                    <FaChevronLeft />
                  </button>

                  <div className="admin-pagination-pages">
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
                            <span
                              key={page}
                              className="admin-pagination-ellipsis"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <button
                          key={page}
                          className={`admin-pagination-page ${
                            isCurrentPage ? "admin-active" : ""
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
        <div className="admin-no-data-section">
          <FaSyringe className="admin-no-data-icon" />
          <h3>Không có dữ liệu hiển thị</h3>
          <p>
            {searchTerm || statusFilter !== "ALL"
              ? "Không tìm thấy kế hoạch nào phù hợp với bộ lọc"
              : "Không có dữ liệu từ API hoặc chưa tải thành công"}
          </p>
          <button className="admin-retry-button" onClick={loadVaccinationPlans}>
            Thử tải lại từ API
          </button>
        </div>
      )}
    </div>
  );
};

export default VaccinationPlanHistory;
