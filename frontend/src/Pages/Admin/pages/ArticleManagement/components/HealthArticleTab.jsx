import React, { useState, useEffect } from "react";
import {
  FaEye,
  FaTrash,
  FaSearch,
  FaFilter,
  FaSpinner,
  FaBook,
  FaUser,
  FaCalendar,
  FaTag,
  FaPlus,
} from "react-icons/fa";
import "./HealthArticleTab.css";
import SuccessModal from "./SuccessModal";
// import APITester from "./APITester";

const HealthArticleTab = ({ onView, onEdit, onAdd }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  // Fetch health articles
  useEffect(() => {
    fetchHealthArticles();
  }, []);

  // Test API connection
  const testDeleteAPI = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/health-articles/test",
        {
          method: "GET",
        }
      );
      console.log("API Test Response:", response.status);
    } catch (error) {
      console.log("API Test Failed:", error.message);
    }
  };

  useEffect(() => {
    testDeleteAPI();
  }, []);

  const fetchHealthArticles = async () => {
    try {
      setLoading(true);

      // Mock data for testing
      const mockData = [
        {
          id: 1,
          title: "Phòng ngừa cảm cúm mùa đông",
          summary: "Các biện pháp hiệu quả để bảo vệ sức khỏe mùa đông",
          category: "Phòng bệnh",
          author: "Y tá Lan",
          publishDate: "2024-01-15",
          imageUrl: "/images/default-article.jpg",
        },
        {
          id: 2,
          title: "Tầm quan trọng của việc tiêm vaccine cho trẻ em",
          summary: "Giải thích về lợi ích của việc tiêm vaccine đúng lịch",
          category: "Chăm sóc trẻ em",
          author: "Y tá Hoa",
          publishDate: "2024-01-10",
          imageUrl: "/images/default-article.jpg",
        },
        {
          id: 3,
          title: "Dinh dưỡng học đường: Chế độ ăn uống lành mạnh cho học sinh",
          summary:
            "Hướng dẫn xây dựng chế độ ăn khoa học giúp học sinh phát triển toàn diện",
          category: "Dinh dưỡng",
          author: "Y tá Lan",
          publishDate: "2024-01-05",
          imageUrl: "/images/default-article.jpg",
        },
      ];

      // Try to fetch from API, fallback to mock data
      try {
        // Try to get auth headers, but don't fail if not authenticated for read operations
        let headers = { "Content-Type": "application/json" };
        try {
          headers = getAuthHeaders();
        } catch (authError) {
          console.log(
            "No authentication token, using basic headers for read operation"
          );
        }

        const response = await fetch(
          "http://localhost:8080/api/health-articles",
          {
            method: "GET",
            headers: headers,
          }
        );

        if (response.ok) {
          const data = await response.json();
          setArticles(data);
        } else if (response.status === 401 || response.status === 403) {
          console.log("Authentication required for API, using mock data");
          setArticles(mockData);
        } else {
          setArticles(mockData);
        }
      } catch (apiError) {
        console.log("API not available, using mock data");
        setArticles(mockData);
      }
    } catch (error) {
      console.error("Error fetching health articles:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Chưa đăng nhập. Vui lòng đăng nhập lại.");
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (article) => {
    setArticleToDelete(article);
    setShowDeleteModal(true);
  };

  // Hide delete confirmation modal
  const hideDeleteConfirmation = () => {
    setShowDeleteModal(false);
    setArticleToDelete(null);
  };

  // Confirm delete action
  const confirmDelete = () => {
    if (articleToDelete) {
      handleDelete(articleToDelete.id);
      hideDeleteConfirmation();
    }
  };

  const handleDelete = async (id) => {
    try {
      // Check authentication first
      const authHeaders = getAuthHeaders();

      // Try API first with authentication
      const response = await fetch(
        `http://localhost:8080/api/health-articles/${id}`,
        {
          method: "DELETE",
          headers: authHeaders,
        }
      );

      if (response.ok) {
        // API success
        setSuccessMessage("Bài viết đã được xóa thành công!");
        setShowSuccessModal(true);
        // Remove from local state immediately for better UX
        setArticles((prevArticles) =>
          prevArticles.filter((article) => article.id !== id)
        );
        return;
      } else {
        // Handle specific error status codes
        if (response.status === 401) {
          throw new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          );
        } else if (response.status === 403) {
          throw new Error("Bạn không có quyền xóa bài viết này.");
        } else if (response.status === 404) {
          throw new Error("Bài viết không tồn tại hoặc đã bị xóa.");
        } else {
          const errorData = await response.text();
          console.error("API Error:", response.status, errorData);
          throw new Error(`Lỗi máy chủ: ${response.status}`);
        }
      }
    } catch (error) {
      console.error("Error deleting article:", error);

      // Check if it's an authentication error
      if (
        error.message.includes("đăng nhập") ||
        error.message.includes("quyền")
      ) {
        alert(error.message);
        return;
      }

      // Check if it's a network error or API not available
      if (
        error.message.includes("fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("Failed to fetch")
      ) {
        // Network error - use fallback
        console.log("Network error, using local deletion fallback");
        setArticles((prevArticles) =>
          prevArticles.filter((article) => article.id !== id)
        );
        setSuccessMessage("Bài viết đã được xóa thành công!");
        setShowSuccessModal(true);
      } else {
        // Other errors
        alert("Có lỗi xảy ra khi xóa bài viết: " + error.message);
      }
    }
  };

  // Filter articles
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || article.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [...new Set(articles.map((article) => article.category))];

  const formatDate = (dateArray) => {
    if (!dateArray || dateArray.length < 3) return "N/A";
    const [year, month, day] = dateArray;
    return new Date(year, month - 1, day).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="admin-health-article-loading">
        <FaSpinner className="admin-loading-spinner" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-health-article-error">
        <p>Lỗi: {error}</p>
        <button onClick={fetchHealthArticles} className="admin-btn-retry">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="admin-health-article-tab">
      {/* API Tester - Remove in production */}
      {/* <APITester /> */}

      {/* Authentication Warning */}
      {!isAuthenticated && (
        <div className="admin-auth-warning">
          <div className="admin-auth-warning-content">
            <FaUser className="admin-auth-warning-icon" />
            <div>
              <strong>Lưu ý:</strong> Bạn cần đăng nhập để có thể xóa bài viết.
              Hiện tại bạn chỉ có thể xem danh sách bài viết.
            </div>
          </div>
        </div>
      )}

      {/* Header with Add Button */}
      {/* <div className="admin-health-article-header">
        <button className="admin-btn-add-article" onClick={() => onAdd()}>
          <FaPlus /> Thêm bài viết
        </button>
      </div> */}

      {/* Filters */}
      <div className="admin-health-article-filters">
        <div className="admin-search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="admin-filter-group">
          <FaFilter />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="admin-health-article-table-container">
        <table className="admin-health-article-table">
          <thead>
            <tr>
              <th>Tiêu đề bài viết</th>
              {/* <th>Tóm tắt</th> */}
              <th>Tác giả</th>
              <th>Ngày đăng</th>
              <th>Danh mục</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.map((article) => (
              <tr key={article.id}>
                <td>
                  <div className="admin-article-title-cell">
                    <span className="article-title">{article.title}</span>
                  </div>
                </td>
                {/* <td>
                  <div className="admin-article-summary-cell">
                    <span className="article-summary">{article.summary}</span>
                  </div>
                </td> */}
                <td>
                  <div className="admin-author-cell">
                    <FaUser />
                    <span>{article.author}</span>
                  </div>
                </td>
                <td>
                  <div className="admin-date-cell">
                    <FaCalendar />
                    <span>{formatDate(article.publishDate)}</span>
                  </div>
                </td>
                <td>
                  <span className="admin-category-badge">
                    <FaTag />
                    {article.category}
                  </span>
                </td>
                <td>
                  <div className="admin-action-buttons">
                    <button
                      className="admin-btn-view"
                      onClick={() => onView(article)}
                      title="Xem chi tiết"
                    >
                      <FaEye />
                    </button>
                    <button
                      className={`admin-btn-delete ${
                        !isAuthenticated ? "disabled" : ""
                      }`}
                      onClick={() => showDeleteConfirmation(article)}
                      title={
                        isAuthenticated
                          ? "Xóa bài viết"
                          : "Cần đăng nhập để xóa bài viết"
                      }
                      disabled={!isAuthenticated}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredArticles.length === 0 && (
        <div className="admin-health-article-empty">
          <FaBook className="admin-empty-icon" />
          <h3>Không có bài viết nào</h3>
          <p>Không tìm thấy bài viết phù hợp với tiêu chí tìm kiếm</p>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
        title="Thành công!"
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="admin-delete-modal-overlay"
          onClick={hideDeleteConfirmation}
        >
          <div
            className="admin-delete-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-delete-modal-header">
              <h3>Xác nhận xóa bài viết</h3>
            </div>

            <div className="admin-delete-modal-body">
              <div className="admin-delete-modal-icon">
                <FaTrash />
              </div>
              <div className="admin-delete-modal-text">
                <p>Bạn có chắc chắn muốn xóa bài viết này?</p>
                {articleToDelete && (
                  <div className="admin-delete-modal-article-info">
                    <strong>"{articleToDelete.title}"</strong>
                  </div>
                )}
                <p className="admin-delete-modal-warning">
                  Hành động này không thể hoàn tác.
                </p>
              </div>
            </div>

            <div className="admin-delete-modal-footer">
              <button
                className="admin-delete-modal-btn admin-delete-modal-btn-cancel"
                onClick={hideDeleteConfirmation}
              >
                Hủy
              </button>
              <button
                className="admin-delete-modal-btn admin-delete-modal-btn-confirm"
                onClick={confirmDelete}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthArticleTab;
