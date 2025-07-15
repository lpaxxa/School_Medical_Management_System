import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaSync,
  FaEye,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaHeartbeat,
  FaInfoCircle,
  FaSpinner,
  FaTimes,
  FaSave,
  FaFileAlt,
  FaBell,
  FaPaperPlane,
  FaPlus,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import SuccessModal from "../../components/SuccessModal";
import ErrorModal from "../../components/ErrorModal";
import ConfirmModal from "../../components/ConfirmModal";
import { useSuccessModal } from "../../hooks/useSuccessModal";
import { useErrorModal } from "../../hooks/useErrorModal";
import { useConfirmModal } from "../../hooks/useConfirmModal";
import "./HealthCampaignHistory.css";

const HealthCampaignHistory = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" hoặc "oldest"

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Modal hooks
  const {
    isOpen: isSuccessOpen,
    modalData: successData,
    showSuccess,
    hideSuccess,
  } = useSuccessModal();

  const {
    isOpen: isErrorOpen,
    modalData: errorData,
    showError,
    hideError,
  } = useErrorModal();

  const {
    isOpen: isConfirmOpen,
    modalData: confirmData,
    showConfirm,
    hideConfirm,
  } = useConfirmModal();

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    notes: "",
    status: "",
    specialCheckupItems: [],
  });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // State for managing special checkup items in edit form
  const [newEditCheckupItem, setNewEditCheckupItem] = useState("");

  // States for notification modal
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [isAllGradesSelected, setIsAllGradesSelected] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [paginatedCampaigns, setPaginatedCampaigns] = useState([]);

  // Load data when component mounts
  useEffect(() => {
    loadHealthCampaigns();
  }, []);

  // Filter campaigns when search term, status filter, or sort order changes
  useEffect(() => {
    filterCampaigns();
  }, [campaigns, searchTerm, statusFilter, sortOrder]);

  // Handle pagination when filteredCampaigns changes
  useEffect(() => {
    const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);

    // Reset to page 1 if current page is out of bounds
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
      return;
    }

    // Calculate start and end indices for current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Get campaigns for current page
    const campaignsForCurrentPage = filteredCampaigns.slice(
      startIndex,
      endIndex
    );
    setPaginatedCampaigns(campaignsForCurrentPage);
  }, [filteredCampaigns, currentPage, itemsPerPage]);

  // Load health campaigns from API
  const loadHealthCampaigns = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Loading health campaigns...");

      // Get auth token from localStorage
      const token = localStorage.getItem("authToken");
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        "http://localhost:8080/api/v1/health-campaigns",
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📥 API Response:", data);

      if (Array.isArray(data)) {
        setCampaigns(data);
        console.log("✅ Loaded successfully:", data.length, "items");
      } else {
        console.error("❌ API response is not an array:", typeof data);
        setError("Invalid data format from API");
        setCampaigns([]);
      }
    } catch (err) {
      console.error("❌ Error loading campaigns:", err);
      setError("Connection error: " + err.message);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter campaigns
  const filterCampaigns = () => {
    let filtered = [...campaigns];

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (campaign.notes &&
            campaign.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(
        (campaign) => campaign.status === statusFilter
      );
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);

      if (sortOrder === "newest") {
        return dateB - dateA; // Mới nhất trước
      } else {
        return dateA - dateB; // Cũ nhất trước
      }
    });

    setFilteredCampaigns(filtered);
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder((current) => (current === "newest" ? "oldest" : "newest"));
  };

  // Handle row click to show details
  const handleRowClick = (campaign) => {
    setSelectedCampaign(campaign);
    setShowDetailModal(true);
  };

  // Handle edit campaign
  const handleEditCampaign = (campaign, event) => {
    event.stopPropagation(); // Prevent row click
    setSelectedCampaign(campaign);
    setEditFormData({
      title: campaign.title || "",
      description: campaign.description || "",
      startDate: campaign.startDate || "",
      endDate: campaign.endDate || "",
      notes: campaign.notes || "",
      status: campaign.status || "PREPARING",
      specialCheckupItems: campaign.specialCheckupItems || [],
    });
    setNewEditCheckupItem(""); // Reset new item input
    setShowEditModal(true);
  };

  // Handle delete campaign
  const handleDeleteCampaign = (campaign, event) => {
    event.stopPropagation(); // Prevent row click
    setSelectedCampaign(campaign);
    setShowDeleteModal(true);
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!selectedCampaign) return;

    // Validate required fields
    if (!editFormData.title.trim()) {
      showError("Thiếu thông tin", "Vui lòng nhập tiêu đề chiến dịch!");
      return;
    }

    if (!editFormData.startDate) {
      showError("Thiếu thông tin", "Vui lòng chọn ngày bắt đầu!");
      return;
    }

    if (!editFormData.endDate) {
      showError("Thiếu thông tin", "Vui lòng chọn ngày kết thúc!");
      return;
    }

    if (new Date(editFormData.startDate) > new Date(editFormData.endDate)) {
      showError(
        "Ngày không hợp lệ",
        "Ngày bắt đầu không thể sau ngày kết thúc!"
      );
      return;
    }

    setEditLoading(true);
    try {
      console.log("🔄 Updating campaign...", editFormData);

      const url = `http://localhost:8080/api/v1/health-campaigns/${selectedCampaign.id}`;
      console.log("📡 PUT API URL:", url);
      console.log("📡 Request body:", JSON.stringify(editFormData, null, 2));

      // Get auth token from localStorage
      const token = localStorage.getItem("authToken");
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(editFormData),
      });

      console.log("📊 Response status:", response.status);

      if (!response.ok) {
        let errorText;
        try {
          // Clone response để có thể đọc nhiều lần nếu cần
          const responseClone = response.clone();
          const errorData = await responseClone.json();
          errorText =
            errorData.message ||
            errorData.error ||
            `HTTP ${response.status} - ${response.statusText}`;
          console.error("❌ API Error Response:", errorData);
        } catch (e) {
          // Nếu không parse được JSON, thử đọc text
          try {
            errorText = await response.text();
            console.error("❌ API Error Response:", errorText);
          } catch (textError) {
            errorText = `HTTP ${response.status} - ${response.statusText}`;
            console.error("❌ Cannot read response:", textError);
          }
        }
        throw new Error(errorText);
      }

      const result = await response.json();
      console.log("✅ Update successful:", result);
      setShowEditModal(false);
      setSelectedCampaign(null);
      loadHealthCampaigns(); // Reload data
      showSuccess(
        "Cập nhật thành công!",
        "Chiến dịch đã được cập nhật thành công.",
        `Chiến dịch "${editFormData.title}" đã được lưu với các thông tin mới.`
      );
    } catch (err) {
      console.error("❌ Update failed:", err);
      alert("Cập nhật thất bại: " + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedCampaign) return;

    setDeleteLoading(true);
    try {
      console.log("🗑️ Deleting campaign:", selectedCampaign.id);

      // Get auth token from localStorage
      const token = localStorage.getItem("authToken");
      const headers = {
        Accept: "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `http://localhost:8080/api/v1/health-campaigns/${selectedCampaign.id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      console.log("📊 Delete response status:", response.status);

      if (!response.ok) {
        let errorText;
        try {
          // Clone response để có thể đọc nhiều lần nếu cần
          const responseClone = response.clone();
          const errorData = await responseClone.json();
          errorText =
            errorData.message ||
            errorData.error ||
            `HTTP ${response.status} - ${response.statusText}`;
          console.error("❌ API Error Response:", errorData);
        } catch (e) {
          // Nếu không parse được JSON, thử đọc text
          try {
            errorText = await response.text();
            console.error("❌ API Error Response:", errorText);
          } catch (textError) {
            errorText = `HTTP ${response.status} - ${response.statusText}`;
            console.error("❌ Cannot read response:", textError);
          }
        }
        throw new Error(errorText);
      }

      console.log("✅ Delete successful");
      setShowDeleteModal(false);
      setSelectedCampaign(null);
      loadHealthCampaigns(); // Reload data
      showSuccess(
        "Xóa thành công!",
        "Chiến dịch đã được xóa khỏi hệ thống.",
        `Chiến dịch "${selectedCampaign.title}" đã được xóa vĩnh viễn.`
      );
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Xóa thất bại: " + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle send notification
  const handleSendNotification = async (campaign) => {
    if (!campaign) return;

    setSelectedCampaign(campaign);
    setShowNotificationModal(true);

    // Load students data when opening notification modal
    await loadStudents();
  };

  // Load students data
  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      console.log("� Loading students...");

      // Get auth token from localStorage
      const token = localStorage.getItem("authToken");
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:8080/api/v1/students", {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📥 Students API Response:", data);

      if (Array.isArray(data)) {
        setStudents(data);
        console.log(
          "✅ Students loaded successfully:",
          data.length,
          "students"
        );
      } else {
        console.error("❌ Students API response is not an array:", typeof data);
        setStudents([]);
      }
    } catch (err) {
      console.error("❌ Error loading students:", err);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Handle grade selection
  const handleGradeSelection = (grade) => {
    if (isAllGradesSelected) {
      setIsAllGradesSelected(false);
      setSelectedGrades([grade]);
    } else {
      setSelectedGrades((prev) => {
        if (prev.includes(grade)) {
          return prev.filter((g) => g !== grade);
        } else {
          return [...prev, grade];
        }
      });
    }
  };

  // Handle select all grades
  const handleSelectAllGrades = () => {
    if (isAllGradesSelected) {
      setIsAllGradesSelected(false);
      setSelectedGrades([]);
    } else {
      setIsAllGradesSelected(true);
      setSelectedGrades([1, 2, 3, 4, 5]);
    }
  };

  // Get student IDs by selected grades
  const getStudentIdsByGrades = () => {
    if (isAllGradesSelected) {
      return students.map((student) => student.id);
    }

    return students
      .filter((student) => {
        const className = student.className || student.class_name || "";
        return selectedGrades.some((grade) =>
          className.toString().startsWith(grade.toString())
        );
      })
      .map((student) => student.id);
  };

  // Get students count by grade
  const getStudentsCountByGrade = (grade) => {
    return students.filter((student) => {
      const className = student.className || student.class_name || "";
      return className.toString().startsWith(grade.toString());
    }).length;
  };

  // Reset notification modal state
  const resetNotificationModal = () => {
    setShowNotificationModal(false);
    setSelectedCampaign(null);
    setSelectedGrades([]);
    setIsAllGradesSelected(false);
    setStudents([]);
  };

  // Send notification to selected students
  const handleConfirmSendNotification = async () => {
    if (
      !selectedCampaign ||
      (!isAllGradesSelected && selectedGrades.length === 0)
    ) {
      alert("Vui lòng chọn ít nhất một khối học sinh!");
      return;
    }

    const studentIds = getStudentIdsByGrades();

    if (studentIds.length === 0) {
      alert("Không tìm thấy học sinh nào thuộc khối đã chọn!");
      return;
    }

    setSendingNotification(true);
    try {
      console.log("📧 Sending notification for campaign:", selectedCampaign.id);
      console.log("👥 Selected student IDs:", studentIds);
      console.log("📝 Campaign details:", selectedCampaign);
      console.log("📊 Request payload:", {
        campaignId: selectedCampaign.id,
        studentIds: studentIds,
        totalStudents: studentIds.length,
      });

      // Get auth token from localStorage
      const token = localStorage.getItem("authToken");
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `http://localhost:8080/api/v1/health-campaigns/${selectedCampaign.id}/send-notifications`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(studentIds),
        }
      );

      console.log("📊 Send notification response status:", response.status);

      if (!response.ok) {
        let errorText;
        try {
          const responseClone = response.clone();
          const errorData = await responseClone.json();
          errorText =
            errorData.message ||
            errorData.error ||
            `HTTP ${response.status} - ${response.statusText}`;
          console.error("❌ API Error Response:", errorData);
        } catch (e) {
          try {
            errorText = await response.text();
            console.error("❌ API Error Response:", errorText);
          } catch (textError) {
            errorText = `HTTP ${response.status} - ${response.statusText}`;
            console.error("❌ Cannot read response:", textError);
          }
        }
        throw new Error(errorText);
      }

      const result = await response.json();
      console.log("✅ Send notification successful:", result);

      resetNotificationModal();

      const gradeText = isAllGradesSelected
        ? "tất cả các khối"
        : `khối ${selectedGrades.join(", ")}`;

      showSuccess(
        "Gửi thông báo thành công!",
        `Thông báo đã được gửi đến ${studentIds.length} học sinh.`,
        `Thông báo về chiến dịch "${selectedCampaign.title}" đã được gửi đến ${gradeText}.`
      );
    } catch (err) {
      console.error("❌ Send notification failed:", err);

      // Check for specific database constraint errors
      if (
        err.message.includes("consent_given") &&
        err.message.includes("NULL")
      ) {
        alert(
          "Lỗi cơ sở dữ liệu: Thiếu trường 'consent_given' bắt buộc.\n\n" +
            "Đây là lỗi từ hệ thống backend. Vui lòng liên hệ đội phát triển để sửa lỗi này.\n\n" +
            "Chi tiết kỹ thuật: " +
            err.message
        );
      } else {
        alert("Gửi thông báo thất bại: " + err.message);
      }
    } finally {
      setSendingNotification(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (campaign, newStatus) => {
    if (!campaign || !newStatus) return;

    try {
      console.log(
        `🔄 Updating status for campaign ${campaign.id} from ${campaign.status} to ${newStatus}...`
      );

      const url = `http://localhost:8080/api/v1/health-campaigns/${campaign.id}/status?status=${newStatus}`;
      console.log("📡 PATCH API URL:", url);

      // Get auth token from localStorage
      const token = localStorage.getItem("authToken");
      const headers = {
        "Content-Type": "application/json",
        Accept: "*/*",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: "PATCH",
        headers,
      });

      console.log("📊 Response status:", response.status);
      console.log(
        "📊 Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        let errorText;
        try {
          // Clone response để có thể đọc nhiều lần nếu cần
          const responseClone = response.clone();
          const errorData = await responseClone.json();
          errorText =
            errorData.message ||
            errorData.error ||
            `HTTP ${response.status} - ${response.statusText}`;
          console.error("❌ API Error Response:", errorData);
        } catch (e) {
          // Nếu không parse được JSON, thử đọc text
          try {
            errorText = await response.text();
            console.error("❌ API Error Response:", errorText);
          } catch (textError) {
            errorText = `HTTP ${response.status} - ${response.statusText}`;
            console.error("❌ Cannot read response:", textError);
          }
        }
        throw new Error(errorText);
      }

      // Xử lý response thành công
      const contentType = response.headers.get("content-type");
      console.log("📊 Content-Type:", contentType);

      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
          console.log("✅ Status updated successfully (JSON):", result);
        } else {
          result = await response.text();
          console.log("✅ Status updated successfully (Text):", result);
        }
      } catch (e) {
        // Nếu không đọc được response (có thể là empty response)
        console.log("✅ Status updated successfully (Empty response)");
        result = "Status updated successfully";
      }

      // Reload data to reflect changes
      await loadHealthCampaigns();
      showSuccess(
        "Cập nhật trạng thái thành công!",
        "Trạng thái chiến dịch đã được thay đổi.",
        `Chiến dịch "${
          campaign.title
        }" đã chuyển sang trạng thái "${getStatusLabel(newStatus)}".`
      );
    } catch (err) {
      console.error("❌ Status update failed:", err);
      alert("Cập nhật trạng thái thất bại: " + err.message);
    }
  };

  // Handle status click
  const handleStatusClick = (campaign, event) => {
    event.stopPropagation(); // Prevent row click
    setSelectedCampaign(campaign);
    setShowStatusModal(true);
  };

  // Add special checkup item to edit form
  const addEditCheckupItem = () => {
    if (
      newEditCheckupItem.trim() &&
      !editFormData.specialCheckupItems.includes(newEditCheckupItem.trim())
    ) {
      setEditFormData((prev) => ({
        ...prev,
        specialCheckupItems: [
          ...prev.specialCheckupItems,
          newEditCheckupItem.trim(),
        ],
      }));
      setNewEditCheckupItem("");
    }
  };

  // Remove special checkup item from edit form
  const removeEditCheckupItem = (index) => {
    setEditFormData((prev) => ({
      ...prev,
      specialCheckupItems: prev.specialCheckupItems.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Ngày không hợp lệ";
      }

      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Ngày không hợp lệ";
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    const statusMap = {
      PREPARING: "Đang chuẩn bị",
      ONGOING: "Đang thực hiện",
      COMPLETED: "Đã hoàn thành",
      CANCELLED: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  // Get status class
  const getStatusClass = (status) => {
    const classMap = {
      PREPARING: "preparing",
      ONGOING: "ongoing",
      COMPLETED: "completed",
      CANCELLED: "cancelled",
    };
    return classMap[status] || "preparing";
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
    const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Calculate pagination info
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(
    currentPage * itemsPerPage,
    filteredCampaigns.length
  );
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const stats = getStatistics();

  return (
    <div className="health-campaign-history">
      {/* Header */}
      <div className="health-campaign-page-header">
        <div className="health-campaign-header-content">
          <h1>Lịch Sử Chiến Dịch Kiểm Tra Sức Khỏe</h1>
          {/* <p>Xem và quản lý các chiến dịch kiểm tra sức khỏe định kỳ</p> */}
        </div>
      </div>

      {/* Statistics */}
      <div className="statistics-section">
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">
              <FaHeartbeat />
            </div>
            <div className="stat-info">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Tổng chiến dịch</div>
            </div>
          </div>

          <div className="stat-card preparing">
            <div className="stat-icon">
              <FaCalendarAlt />
            </div>
            <div className="stat-info">
              <div className="stat-number">{stats.preparing}</div>
              <div className="stat-label">Đang chuẩn bị</div>
            </div>
          </div>

          <div className="stat-card ongoing">
            <div className="stat-icon">
              <FaSpinner />
            </div>
            <div className="stat-info">
              <div className="stat-number">{stats.ongoing}</div>
              <div className="stat-label">Đang thực hiện</div>
            </div>
          </div>

          <div className="stat-card completed">
            <div className="stat-icon">
              <FaHeartbeat />
            </div>
            <div className="stat-info">
              <div className="stat-number">{stats.completed}</div>
              <div className="stat-label">Đã hoàn thành</div>
            </div>
          </div>

          <div className="stat-card cancelled">
            <div className="stat-icon">
              <FaTimes />
            </div>
            <div className="stat-info">
              <div className="stat-number">{stats.cancelled}</div>
              <div className="stat-label">Đã hủy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="search-group">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề hoặc ghi chú..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PREPARING">Đang chuẩn bị</option>
            <option value="ONGOING">Đang thực hiện</option>
            <option value="COMPLETED">Đã hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>

          <button
            className="sort-btn"
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
            className="refresh-btn"
            onClick={loadHealthCampaigns}
            disabled={loading}
          >
            <FaSync className={loading ? "spinning" : ""} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <FaSpinner className="loading-spinner" />
            <h3>Đang tải dữ liệu...</h3>
            <p>Vui lòng chờ trong giây lát</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <FaInfoCircle />
            <h3>Có lỗi xảy ra</h3>
            <p>{error}</p>
            <button onClick={loadHealthCampaigns} className="retry-btn">
              <FaSync /> Thử lại
            </button>
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <>
            <table className="campaigns-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tiêu đề</th>
                  <th>Ngày bắt đầu</th>
                  <th>Trạng thái</th>
                  <th>Gửi thông báo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCampaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    onClick={() => handleRowClick(campaign)}
                    className="table-row"
                  >
                    <td>#{campaign.id}</td>
                    <td className="title-cell">{campaign.title}</td>
                    <td>{formatDate(campaign.startDate)}</td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          campaign.status
                        )} clickable`}
                        onClick={(e) => handleStatusClick(campaign, e)}
                        title="Click để thay đổi trạng thái"
                      >
                        {getStatusLabel(campaign.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-btn notify"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendNotification(campaign);
                        }}
                        title="Gửi thông báo"
                      >
                        <FaPaperPlane />
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view"
                          onClick={(e) => handleRowClick(campaign)}
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="action-btn edit"
                          onClick={(e) => handleEditCampaign(campaign, e)}
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={(e) => handleDeleteCampaign(campaign, e)}
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {filteredCampaigns.length > itemsPerPage && (
              <div className="pagination-container">
                <div className="pagination-info">
                  <span>
                    Hiển thị {startIndex}-{endIndex} trong tổng số{" "}
                    {filteredCampaigns.length} chiến dịch
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
          </>
        ) : (
          <div className="empty-state">
            <FaHeartbeat />
            <h3>Chưa có chiến dịch nào</h3>
            <p>Hiện tại chưa có chiến dịch kiểm tra sức khỏe nào được tạo.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedCampaign && (
        <div
          className="hch-modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="hch-modal-content hch-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hch-modal-header">
              <h2>
                <FaEye /> Chi Tiết Chiến Dịch
              </h2>
              <button
                className="hch-close-btn"
                onClick={() => setShowDetailModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="hch-modal-body">
              <div className="hch-detail-grid">
                <div className="hch-detail-item">
                  <label>ID:</label>
                  <span>#{selectedCampaign.id}</span>
                </div>
                <div className="hch-detail-item">
                  <label>Tiêu đề:</label>
                  <span>{selectedCampaign.title}</span>
                </div>
                <div className="hch-detail-item">
                  <label>Mô tả:</label>
                  <span>
                    {selectedCampaign.description || "Không có mô tả"}
                  </span>
                </div>
                <div className="hch-detail-item">
                  <label>Ngày bắt đầu:</label>
                  <span>{formatDate(selectedCampaign.startDate)}</span>
                </div>
                <div className="hch-detail-item">
                  <label>Ngày kết thúc:</label>
                  <span>{formatDate(selectedCampaign.endDate)}</span>
                </div>
                <div className="hch-detail-item">
                  <label>Trạng thái:</label>
                  <span
                    className={`status-badge ${getStatusClass(
                      selectedCampaign.status
                    )}`}
                  >
                    {getStatusLabel(selectedCampaign.status)}
                  </span>
                </div>
                <div className="hch-detail-item full-width">
                  <label>Ghi chú:</label>
                  <p>{selectedCampaign.notes || "Không có ghi chú"}</p>
                </div>
                {selectedCampaign.specialCheckupItems &&
                  selectedCampaign.specialCheckupItems.length > 0 && (
                    <div className="hch-detail-item full-width">
                      <label>Mục kiểm tra đặc biệt:</label>
                      <div className="hch-checkup-items">
                        {selectedCampaign.specialCheckupItems.map(
                          (item, index) => (
                            <span key={index} className="hch-checkup-item">
                              {item}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCampaign && (
        <div
          className="hch-modal-overlay"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="hch-modal-content hch-edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hch-modal-header">
              <h2>
                <FaEdit /> Chỉnh Sửa Chiến Dịch
              </h2>
              <button
                className="hch-close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="hch-modal-body">
              <div className="hch-form-grid">
                <div className="hch-form-group">
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
                <div className="hch-form-group">
                  <label>Mô tả:</label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="hch-form-group">
                  <label>Ngày bắt đầu:</label>
                  <input
                    type="date"
                    value={editFormData.startDate}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="hch-form-group">
                  <label>Ngày kết thúc:</label>
                  <input
                    type="date"
                    value={editFormData.endDate}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="hch-form-group">
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
                <div className="hch-form-group full-width">
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

                {/* Special Checkup Items Section */}
                <div className="hch-form-group full-width">
                  <label>Mục kiểm tra đặc biệt:</label>

                  {/* Current items */}
                  {editFormData.specialCheckupItems.length > 0 ? (
                    <div className="hch-current-edit-items">
                      <div className="hch-edit-items-list">
                        {editFormData.specialCheckupItems.map((item, index) => (
                          <div key={index} className="hch-edit-item-tag">
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() => removeEditCheckupItem(index)}
                              className="hch-remove-edit-item"
                              title="Xóa mục này"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="hch-empty-checkup-hint">
                      <FaFileAlt style={{ marginRight: "8px", opacity: 0.6 }} />
                      Chưa có mục kiểm tra đặc biệt nào. Thêm mục mới bên dưới.
                    </div>
                  )}

                  {/* Add new item */}
                  <div className="hch-add-edit-item-section">
                    <div className="hch-edit-input-with-button">
                      <input
                        type="text"
                        placeholder="Nhập tên mục kiểm tra mới..."
                        value={newEditCheckupItem}
                        onChange={(e) => setNewEditCheckupItem(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addEditCheckupItem())
                        }
                      />
                      <button
                        type="button"
                        onClick={addEditCheckupItem}
                        className="hch-add-edit-button"
                        disabled={!newEditCheckupItem.trim()}
                        title="Thêm mục kiểm tra"
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hch-modal-footer">
              <button
                className="hch-btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                <FaTimes /> Hủy
              </button>
              <button
                className="hch-btn-primary"
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

      {/* Delete Modal */}
      {showDeleteModal && selectedCampaign && (
        <div
          className="hch-modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="hch-modal-content hch-delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hch-modal-header">
              <h2>
                <FaTrash /> Xác Nhận Xóa
              </h2>
              <button
                className="hch-close-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="hch-modal-body">
              <p>Bạn có chắc chắn muốn xóa chiến dịch này?</p>
              <div className="hch-delete-info">
                <strong>{selectedCampaign.title}</strong>
                <br />
                Ngày bắt đầu: {formatDate(selectedCampaign.startDate)}
              </div>
              <p className="hch-warning">
                <FaInfoCircle /> Hành động này không thể hoàn tác!
              </p>
            </div>
            <div className="hch-modal-footer">
              <button
                className="hch-btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                <FaTimes /> Hủy
              </button>
              <button
                className="hch-btn-danger"
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

      {/* Status Modal */}
      {showStatusModal && selectedCampaign && (
        <div
          className="hch-modal-overlay"
          onClick={() => setShowStatusModal(false)}
        >
          <div
            className="hch-modal-content hch-status-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hch-modal-header">
              <h2>
                <FaHeartbeat /> Thay Đổi Trạng Thái
              </h2>
              <button
                className="hch-close-btn"
                onClick={() => setShowStatusModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="hch-modal-body">
              <p>Chọn trạng thái mới cho chiến dịch:</p>
              <div className="hch-status-info">
                <strong>{selectedCampaign.title}</strong>
                <br />
                Trạng thái hiện tại:{" "}
                <span
                  className={`status-badge ${getStatusClass(
                    selectedCampaign.status
                  )}`}
                >
                  {getStatusLabel(selectedCampaign.status)}
                </span>
              </div>

              <div className="hch-status-options">
                {[
                  {
                    value: "PREPARING",
                    label: "Đang chuẩn bị",
                    color: "preparing",
                  },
                  {
                    value: "ONGOING",
                    label: "Đang thực hiện",
                    color: "ongoing",
                  },
                  {
                    value: "COMPLETED",
                    label: "Đã hoàn thành",
                    color: "completed",
                  },
                  { value: "CANCELLED", label: "Đã hủy", color: "cancelled" },
                ].map((status) => (
                  <button
                    key={status.value}
                    className={`hch-status-option ${status.color} ${
                      selectedCampaign.status === status.value ? "current" : ""
                    }`}
                    onClick={() => {
                      if (selectedCampaign.status !== status.value) {
                        handleStatusChange(selectedCampaign, status.value);
                        setShowStatusModal(false);
                      }
                    }}
                    disabled={selectedCampaign.status === status.value}
                  >
                    <span className={`status-badge ${status.color}`}>
                      {status.label}
                    </span>
                    {selectedCampaign.status === status.value && (
                      <span className="hch-current-indicator">(Hiện tại)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotificationModal && selectedCampaign && (
        <div className="hch-modal-overlay" onClick={resetNotificationModal}>
          <div
            className="hch-modal-content hch-notification-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hch-modal-header">
              <h2>
                <FaBell /> Gửi Thông Báo
              </h2>
              <button
                className="hch-close-btn"
                onClick={resetNotificationModal}
              >
                <FaTimes />
              </button>
            </div>
            <div className="hch-modal-body">
              <div className="hch-notification-info">
                <h3>Chiến dịch: {selectedCampaign.title}</h3>
                <p>Chọn khối học sinh để gửi thông báo:</p>
              </div>

              {loadingStudents ? (
                <div className="hch-loading-students">
                  <FaSpinner className="spinning" />
                  <p>Đang tải danh sách học sinh...</p>
                </div>
              ) : (
                <div className="hch-grade-selection">
                  <div className="hch-grade-options">
                    <label className="hch-grade-option all-grades">
                      <input
                        type="checkbox"
                        checked={isAllGradesSelected}
                        onChange={handleSelectAllGrades}
                      />
                      <span className="hch-grade-label">Tất cả các khối</span>
                      <span className="hch-student-count">
                        ({students.length} học sinh)
                      </span>
                    </label>

                    {[1, 2, 3, 4, 5].map((grade) => {
                      return (
                        <label
                          key={grade}
                          className={`hch-grade-option ${
                            selectedGrades.includes(grade) ? "selected" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={
                              selectedGrades.includes(grade) ||
                              isAllGradesSelected
                            }
                            onChange={() => handleGradeSelection(grade)}
                            disabled={isAllGradesSelected}
                          />
                          <span className="hch-grade-label">Khối {grade}</span>
                          <span className="hch-student-count">
                            ({getStudentsCountByGrade(grade)} học sinh)
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="hch-selected-summary">
                    <h4>Tóm tắt:</h4>
                    <p>
                      Sẽ gửi thông báo đến{" "}
                      <strong>{getStudentIdsByGrades().length}</strong> học sinh
                      {isAllGradesSelected
                        ? " (tất cả các khối)"
                        : selectedGrades.length > 0
                        ? ` (khối ${selectedGrades.join(", ")})`
                        : ""}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="hch-modal-footer">
              <button
                className="hch-btn-secondary"
                onClick={resetNotificationModal}
              >
                <FaTimes /> Hủy
              </button>
              <button
                className="hch-btn-primary"
                onClick={handleConfirmSendNotification}
                disabled={
                  sendingNotification ||
                  loadingStudents ||
                  (!isAllGradesSelected && selectedGrades.length === 0)
                }
              >
                {sendingNotification ? (
                  <FaSpinner className="spinning" />
                ) : (
                  <FaPaperPlane />
                )}
                Gửi Thông Báo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={hideSuccess}
        title={successData.title}
        message={successData.message}
        details={successData.details}
        autoClose={successData.autoClose}
        autoCloseDelay={successData.autoCloseDelay}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={isErrorOpen}
        onClose={hideError}
        title={errorData.title}
        message={errorData.message}
        details={errorData.details}
        autoClose={errorData.autoClose}
        autoCloseDelay={errorData.autoCloseDelay}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={hideConfirm}
        onConfirm={confirmData.onConfirm}
        title={confirmData.title}
        message={confirmData.message}
        confirmText={confirmData.confirmText}
        cancelText={confirmData.cancelText}
        type={confirmData.type}
      />
    </div>
  );
};

export default HealthCampaignHistory;
