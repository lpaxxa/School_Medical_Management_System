import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaFilter,
  FaSync,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaHeartbeat,
  FaInfoCircle,
  FaSpinner,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import healthCampaignService from "../../../../services/APIAdmin/healthCampaignService";
import "./HealthCampaignHistory.css";

const HealthCampaignHistory = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Edit modal state
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    startDate: "",
    notes: "",
    status: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load data khi component mount
  useEffect(() => {
    loadHealthCampaigns();
  }, []);

  // Filter campaigns khi search term hoặc status filter thay đổi
  useEffect(() => {
    filterCampaigns();
  }, [campaigns, searchTerm, statusFilter]);

  // Hàm load danh sách chiến dịch
  const loadHealthCampaigns = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Đang tải danh sách chiến dịch kiểm tra sức khỏe...");

      const result = await healthCampaignService.getHealthCampaigns();
      console.log("📥 API Response:", result);

      if (result.success && result.data) {
        if (Array.isArray(result.data)) {
          setCampaigns(result.data);
          console.log(
            "✅ Đã tải thành công từ API:",
            result.data.length,
            "items"
          );
        } else {
          console.error(
            "❌ API response data không phải array:",
            typeof result.data
          );
          setError("Dữ liệu API không đúng định dạng");
          setCampaigns([]);
        }
      } else {
        console.error("❌ API không thành công:", result.message);
        setError(result.message || "Không thể tải dữ liệu từ API");
        setCampaigns([]);
      }
    } catch (err) {
      console.error("❌ Exception khi gọi API:", err);
      setError("Có lỗi kết nối đến API: " + err.message);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm filter campaigns
  const filterCampaigns = () => {
    let filtered = [...campaigns];

    // Filter theo search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter theo status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(
        (campaign) => campaign.status === statusFilter
      );
    }

    setFilteredCampaigns(filtered);
  };

  // Handle edit button click
  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setEditFormData({
      title: campaign.title,
      startDate: campaign.startDate,
      notes: campaign.notes,
      status: campaign.status,
    });
    setShowEditModal(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!selectedCampaign) return;

    setEditLoading(true);
    try {
      console.log(
        "🔄 Đang cập nhật chiến dịch kiểm tra sức khỏe...",
        editFormData
      );

      const result = await healthCampaignService.updateHealthCampaign(
        selectedCampaign.id,
        editFormData
      );

      if (result.success) {
        console.log("✅ Cập nhật thành công!");
        setShowEditModal(false);
        loadHealthCampaigns(); // Reload data
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
  const handleDeleteCampaign = (campaign) => {
    setCampaignToDelete(campaign);
    setShowDeleteConfirm(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!campaignToDelete) return;

    setDeleteLoading(true);
    try {
      console.log(
        "🗑️ Đang xóa chiến dịch kiểm tra sức khỏe:",
        campaignToDelete.id
      );

      const result = await healthCampaignService.deleteHealthCampaign(
        campaignToDelete.id
      );

      if (result.success) {
        console.log("✅ Xóa thành công!");
        setShowDeleteConfirm(false);
        setCampaignToDelete(null);
        loadHealthCampaigns(); // Reload data
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
      case "PREPARING":
        return "status-preparing";
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
      case "PREPARING":
        return "Đang chuẩn bị";
      case "ONGOING":
        return "Đang thực hiện";
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
    const total = campaigns.length;
    const preparing = campaigns.filter((c) => c.status === "PREPARING").length;
    const ongoing = campaigns.filter((c) => c.status === "ONGOING").length;
    const completed = campaigns.filter((c) => c.status === "COMPLETED").length;
    const cancelled = campaigns.filter((c) => c.status === "CANCELLED").length;

    return { total, preparing, ongoing, completed, cancelled };
  };

  const stats = getStatistics();

  return (
    <div className="health-campaign-history">
      {/* Header */}
      <div className="history-header">
        <h2>Lịch Sử Chiến Dịch Kiểm Tra Sức Khỏe</h2>
        <p>Xem và quản lý các chiến dịch kiểm tra sức khỏe định kỳ</p>
      </div>

      {/* Statistics */}
      <div className="statistics-row">
        <div className="stat-card total">
          <div className="stat-info">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Tổng chiến dịch</span>
          </div>
        </div>

        <div className="stat-card preparing">
          <div className="stat-info">
            <span className="stat-number">{stats.preparing}</span>
            <span className="stat-label">Đang chuẩn bị</span>
          </div>
        </div>

        <div className="stat-card ongoing">
          <div className="stat-info">
            <span className="stat-number">{stats.ongoing}</span>
            <span className="stat-label">Đang thực hiện</span>
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
              placeholder="Tìm kiếm theo tiêu đề hoặc ghi chú..."
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
              <option value="PREPARING">Đang chuẩn bị</option>
              <option value="ONGOING">Đang thực hiện</option>
              <option value="COMPLETED">Đã hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="toolbar-buttons">
          <button
            className="refresh-button"
            onClick={loadHealthCampaigns}
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
          <button className="retry-button" onClick={loadHealthCampaigns}>
            Thử lại
          </button>
        </div>
      ) : filteredCampaigns.length > 0 ? (
        <div className="campaigns-grid">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="campaign-card">
              <div className="campaign-card-header">
                <div className="campaign-info">
                  <FaHeartbeat className="campaign-icon" />
                  <h3>{campaign.title}</h3>
                </div>
                <div
                  className={`status-badge ${getStatusBadgeClass(
                    campaign.status
                  )}`}
                >
                  {getStatusLabel(campaign.status)}
                </div>
              </div>

              <div className="campaign-card-body">
                <div className="campaign-meta">
                  <div className="meta-item">
                    <FaCalendarAlt className="meta-icon" />
                    <span>Ngày bắt đầu: {formatDate(campaign.startDate)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="campaign-id">#{campaign.id}</span>
                  </div>
                </div>

                <div className="campaign-description">{campaign.notes}</div>
              </div>

              <div className="campaign-card-footer">
                <button
                  className="edit-button"
                  onClick={() => handleEditCampaign(campaign)}
                >
                  <FaEdit /> Sửa
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteCampaign(campaign)}
                >
                  <FaTrash /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-data-section">
          <FaHeartbeat className="no-data-icon" />
          <h3>Chưa có chiến dịch nào</h3>
          <p>Hiện tại chưa có chiến dịch kiểm tra sức khỏe nào được tạo.</p>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCampaign && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div
            className="modal-content edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>✏️ Chỉnh Sửa Chiến Dịch Kiểm Tra Sức Khỏe</h2>
              <button
                className="close-button"
                onClick={() => setShowEditModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Tiêu đề:</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Ngày bắt đầu:</label>
                <input
                  type="date"
                  value={formatDateForInput(editFormData.startDate)}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      startDate: e.target.value,
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
                  <option value="PREPARING">Đang chuẩn bị</option>
                  <option value="ONGOING">Đang thực hiện</option>
                  <option value="COMPLETED">Đã hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ghi chú:</label>
                <textarea
                  rows="4"
                  value={editFormData.notes}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      notes: e.target.value,
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
      {showDeleteConfirm && campaignToDelete && (
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
              <p>Bạn có chắc chắn muốn xóa chiến dịch kiểm tra sức khỏe này?</p>
              <div className="delete-info">
                <strong>{campaignToDelete.title}</strong>
                <br />
                Ngày bắt đầu: {formatDate(campaignToDelete.startDate)}
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

export default HealthCampaignHistory;
