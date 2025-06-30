import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaFilter,
  FaSync,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaSyringe,
  FaInfoCircle,
  FaSpinner,
  FaSave,
  FaTimes,
} from "react-icons/fa";
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

  // Edit modal state
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    vaccineName: "",
    vaccinationDate: "",
    status: "",
    description: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load data khi component mount
  useEffect(() => {
    loadVaccinationPlans();
  }, []);

  // Filter plans khi search term hoặc status filter thay đổi
  useEffect(() => {
    filterPlans();
  }, [plans, searchTerm, statusFilter]);

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
          plan.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter theo status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((plan) => plan.status === statusFilter);
    }

    setFilteredPlans(filtered);
  };

  // Handle edit button click
  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setEditFormData({
      vaccineName: plan.vaccineName,
      vaccinationDate: plan.vaccinationDate,
      status: plan.status,
      description: plan.description,
    });
    setShowEditModal(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!selectedPlan) return;

    setEditLoading(true);
    try {
      console.log("🔄 Đang cập nhật kế hoạch tiêm chủng...", editFormData);

      const result = await vaccinationPlanService.updateVaccinationPlan(
        selectedPlan.id,
        editFormData
      );

      if (result.success) {
        console.log("✅ Cập nhật thành công!");
        setShowEditModal(false);
        loadVaccinationPlans(); // Reload data
      } else {
        console.error("❌ Cập nhật thất bại:", result.message);
        setError("Cập nhật thất bại: " + result.message);
      }
    } catch (err) {
      console.error("❌ Exception khi cập nhật:", err);
      setError("Có lỗi khi cập nhật: " + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete button click
  const handleDeletePlan = (plan) => {
    setPlanToDelete(plan);
    setShowDeleteConfirm(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!planToDelete) return;

    setDeleteLoading(true);
    try {
      console.log("🗑️ Đang xóa kế hoạch tiêm chủng:", planToDelete.id);

      const result = await vaccinationPlanService.deleteVaccinationPlan(
        planToDelete.id
      );

      if (result.success) {
        console.log("✅ Xóa thành công!");
        setShowDeleteConfirm(false);
        setPlanToDelete(null);
        loadVaccinationPlans(); // Reload data
      } else {
        console.error("❌ Xóa thất bại:", result.message);
        setError("Xóa thất bại: " + result.message);
      }
    } catch (err) {
      console.error("❌ Exception khi xóa:", err);
      setError("Có lỗi khi xóa: " + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format date for input
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "PENDING":
        return "status-pending";
      case "ONGOING":
        return "status-ongoing";
      case "COMPLETED":
        return "status-completed";
      case "CANCELLED":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ thực hiện";
      case "ONGOING":
        return "Đang diễn ra";
      case "COMPLETED":
        return "Đã hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // Get statistics
  const getStatistics = () => {
    const total = plans.length;
    const ongoing = plans.filter((p) => p.status === "ONGOING").length;
    const completed = plans.filter((p) => p.status === "COMPLETED").length;
    const cancelled = plans.filter((p) => p.status === "CANCELLED").length;
    const pending = plans.filter((p) => p.status === "PENDING").length;

    return { total, ongoing, completed, cancelled, pending };
  };

  const stats = getStatistics();

  return (
    <div className="vaccination-plan-history">
      {/* Header */}
      <div className="history-header">
        <h2>Lịch Sử Kế Hoạch Tiêm Chủng</h2>
        <p>Xem và quản lý tất cả các kế hoạch tiêm chủng đã tạo</p>
      </div>

      {/* Statistics */}
      <div className="statistics-row">
        <div className="stat-card total">
          <div className="stat-info">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Tổng kế hoạch</span>
          </div>
        </div>

        <div className="stat-card ongoing">
          <div className="stat-info">
            <span className="stat-number">{stats.ongoing}</span>
            <span className="stat-label">Đang diễn ra</span>
          </div>
        </div>

        <div className="stat-card completed">
          <div className="stat-info">
            <span className="stat-number">{stats.completed}</span>
            <span className="stat-label">Đã hoàn thành</span>
          </div>
        </div>

        <div className="stat-card cancelled">
          <div className="stat-info">
            <span className="stat-number">{stats.cancelled}</span>
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
              <option value="PENDING">Chờ thực hiện</option>
              <option value="ONGOING">Đang diễn ra</option>
              <option value="COMPLETED">Đã hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="toolbar-buttons">
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
        <div className="plans-grid">
          {filteredPlans.map((plan) => (
            <div key={plan.id} className="plan-card">
              <div className="plan-card-header">
                <div className="vaccine-info">
                  <FaSyringe className="vaccine-icon" />
                  <h3>{plan.vaccineName}</h3>
                </div>
                <div
                  className={`status-badge ${getStatusBadgeClass(plan.status)}`}
                >
                  {plan.statusVietnamese || getStatusLabel(plan.status)}
                </div>
              </div>

              <div className="plan-card-body">
                <div className="plan-meta">
                  <div className="meta-item">
                    <FaCalendarAlt className="meta-icon" />
                    <span>Ngày tiêm: {formatDate(plan.vaccinationDate)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="plan-id">ID: {plan.id}</span>
                  </div>
                </div>

                <p className="plan-description">
                  {plan.description.length > 150
                    ? `${plan.description.substring(0, 150)}...`
                    : plan.description}
                </p>

                <div className="plan-dates">
                  <span>Tạo: {formatDate(plan.createdAt)}</span>
                  <span>Cập nhật: {formatDate(plan.updatedAt)}</span>
                </div>
              </div>

              <div className="plan-card-footer">
                <button
                  className="edit-button"
                  onClick={() => handleEditPlan(plan)}
                >
                  <FaEdit /> Sửa
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDeletePlan(plan)}
                >
                  <FaTrash /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
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

      {/* Edit Modal */}
      {showEditModal && selectedPlan && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div
            className="modal-content edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>✏️ Chỉnh Sửa Kế Hoạch Tiêm Chủng</h2>
              <button
                className="close-button"
                onClick={() => setShowEditModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Tên vaccine:</label>
                <input
                  type="text"
                  value={editFormData.vaccineName}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      vaccineName: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Ngày tiêm:</label>
                <input
                  type="date"
                  value={formatDateForInput(editFormData.vaccinationDate)}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      vaccinationDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Trạng thái:</label>
                <select
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="PENDING">Chờ thực hiện</option>
                  <option value="ONGOING">Đang diễn ra</option>
                  <option value="COMPLETED">Đã hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>

              <div className="form-group">
                <label>Mô tả:</label>
                <textarea
                  rows="4"
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => setShowEditModal(false)}
              >
                <FaTimes /> Hủy
              </button>
              <button
                className="save-button"
                onClick={handleSaveEdit}
                disabled={editLoading}
              >
                {editLoading ? <FaSpinner className="spinning" /> : <FaSave />}
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && planToDelete && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="modal-content delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>🗑️ Xác Nhận Xóa</h2>
            </div>

            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa kế hoạch tiêm chủng này?</p>
              <div className="delete-info">
                <strong>{planToDelete.vaccineName}</strong>
                <br />
                Ngày tiêm: {formatDate(planToDelete.vaccinationDate)}
              </div>
              <p className="warning-text">Hành động này không thể hoàn tác!</p>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <FaTimes /> Hủy
              </button>
              <button
                className="delete-confirm-button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <FaSpinner className="spinning" />
                ) : (
                  <FaTrash />
                )}
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccinationPlanHistory;
