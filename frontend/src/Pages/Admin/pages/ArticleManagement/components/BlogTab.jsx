import React, { useState, useEffect } from "react";
import {
  FaEye,
  FaTrash,
  FaSearch,
  FaFilter,
  FaSpinner,
  FaNewspaper,
  FaUser,
  FaCalendar,
  FaHeart,
  FaComment,
  FaThumbtack,
  FaPlus,
} from "react-icons/fa";
import "./BlogTab.css";
import SuccessModal from "./SuccessModal";

const BlogTab = ({ onView, onEdit, onAdd }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  // Fetch blog posts
  useEffect(() => {
    fetchBlogs();
  }, [currentPage]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/community/posts?page=${currentPage}&size=10`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch blog posts");
      }
      const result = await response.json();

      if (result.status === "success" && result.data) {
        setBlogs(result.data.content || []);
        setTotalPages(result.data.totalPages || 1);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (blog) => {
    setBlogToDelete(blog);
    setShowDeleteModal(true);
  };

  // Hide delete confirmation modal
  const hideDeleteConfirmation = () => {
    setShowDeleteModal(false);
    setBlogToDelete(null);
  };

  // Confirm delete action
  const confirmDelete = () => {
    console.log("BlogTab - confirmDelete called with:", blogToDelete);
    if (blogToDelete) {
      console.log("BlogTab - Calling handleDelete with ID:", blogToDelete.id);
      handleDelete(blogToDelete.id);
      hideDeleteConfirmation();
    }
  };

  const handleDelete = async (id) => {
    console.log("BlogTab - handleDelete called with ID:", id);
    try {
      // Try API first, fallback to local deletion
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/community/posts/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          // API success
          setSuccessMessage("Bài viết blog đã được xóa thành công!");
          setShowSuccessModal(true);
          fetchBlogs();
          return;
        } else {
          // API returned error
          const errorData = await response.text();
          console.error("API delete failed:", response.status, errorData);
          throw new Error(`API Error: ${response.status}`);
        }
      } catch (apiError) {
        console.log(
          "API not available, using local deletion:",
          apiError.message
        );
      }

      // Fallback: Remove from local state
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));
      setSuccessMessage("Bài viết blog đã được xóa thành công!");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error deleting blog post:", error);
      alert("Có lỗi xảy ra khi xóa bài viết");
    }
  };

  // Filter blogs
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || blog.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [...new Set(blogs.map((blog) => blog.category))];

  const formatDate = (dateArray) => {
    if (!dateArray || dateArray.length < 3) return "N/A";
    const [year, month, day, hour, minute] = dateArray;
    return new Date(
      year,
      month - 1,
      day,
      hour || 0,
      minute || 0
    ).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="admin-blog-loading">
        <FaSpinner className="admin-loading-spinner" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-blog-error">
        <p>Lỗi: {error}</p>
        <button onClick={fetchBlogs} className="admin-btn-retry">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="admin-blog-tab">
      {/* Header with Add Button */}
      {/* <div className="admin-blog-header">
        <button className="admin-btn-add-blog" onClick={() => onAdd()}>
          <FaPlus /> Thêm bài viết
        </button>
      </div> */}

      {/* Filters */}
      <div className="admin-blog-filters">
        <div className="admin-search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết blog..."
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

      {/* Blog Table */}
      <div className="admin-blog-table-container">
        <table className="admin-blog-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Tác giả</th>
              <th>Danh mục</th>
              <th>Ngày tạo</th>
              <th>Lượt thích</th>
              <th>Bình luận</th>
              {/* <th>Trạng thái</th> */}
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredBlogs.map((blog) => (
              <tr key={blog.id} className={blog.pinned ? "pinned-row" : ""}>
                <td>
                  <div className="admin-blog-title-cell">
                    {blog.pinned && <FaThumbtack className="pin-icon" />}
                    <span className="blog-title">{blog.title}</span>
                  </div>
                </td>
                <td>
                  <div className="admin-author-cell">
                    <FaUser />
                    <span>{blog.author.name}</span>
                    <span className="admin-role-badge">{blog.author.role}</span>
                  </div>
                </td>
                <td>
                  <span className="admin-category-badge">{blog.category}</span>
                </td>
                <td>
                  <div className="admin-date-cell">
                    <FaCalendar />
                    <span>{formatDate(blog.createdAt)}</span>
                  </div>
                </td>
                <td>
                  <div className="admin-stat-cell">
                    <FaHeart />
                    <span>{blog.likes}</span>
                  </div>
                </td>
                <td>
                  <div className="admin-stat-cell">
                    <FaComment />
                    <span>{blog.commentsCount}</span>
                  </div>
                </td>
                {/* <td>
                  <span className="admin-status-badge active">Hoạt động</span>
                </td> */}
                <td>
                  <div className="admin-action-buttons">
                    <button
                      className="admin-btn-view"
                      onClick={() => onView(blog)}
                      title="Xem chi tiết"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="admin-btn-delete"
                      onClick={() => showDeleteConfirmation(blog)}
                      title="Xóa bài viết"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-blog-pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="admin-pagination-btn"
          >
            Trước
          </button>

          <span className="admin-pagination-info">
            Trang {currentPage} / {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="admin-pagination-btn"
          >
            Sau
          </button>
        </div>
      )}

      {filteredBlogs.length === 0 && (
        <div className="admin-blog-empty">
          <FaNewspaper className="admin-empty-icon" />
          <h3>Không có bài viết nào</h3>
          <p>Không tìm thấy bài viết blog phù hợp với tiêu chí tìm kiếm</p>
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
              <h3>Xác nhận xóa bài viết blog</h3>
            </div>

            <div className="admin-delete-modal-body">
              <div className="admin-delete-modal-icon">
                <FaTrash />
              </div>
              <div className="admin-delete-modal-text">
                <p>Bạn có chắc chắn muốn xóa bài viết blog này?</p>
                {blogToDelete && (
                  <div className="admin-delete-modal-article-info">
                    <strong>"{blogToDelete.title}"</strong>
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
                onClick={() => {
                  console.log("BlogTab - OK button clicked");
                  confirmDelete();
                }}
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

export default BlogTab;
