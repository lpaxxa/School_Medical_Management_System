import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useBlog } from '../../../../../context/NurseContext/BlogContext';
import { useAuth } from '../../../../../context/AuthContext';
import * as blogService from '../../../../../services/APINurse/blogService';
import Swal from 'sweetalert2';
import './Posts.css';

// Avatar mặc định cho người dùng
const DEFAULT_AVATAR = 'https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg';

// Custom styles for delete modal
const deleteModalStyles = `
  /* Posts Delete Modal - Namespaced Styles */
  .posts-delete-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050;
    opacity: 1;
    visibility: visible;
  }

  .posts-delete-modal-dialog {
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    margin: 1rem;
  }

  .posts-delete-modal-content {
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: 90vh;
  }

  .posts-delete-modal-header {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
    padding: 1.25rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: none;
  }

  .posts-delete-modal-title {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 600;
    display: flex;
    align-items: center;
  }

  .posts-delete-btn-close {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.25rem;
    transition: background-color 0.2s ease;
  }

  .posts-delete-btn-close:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .posts-delete-modal-body {
    padding: 1.75rem;
    flex: 1;
    overflow-y: auto;
  }

  .posts-delete-text-center {
    text-align: center;
  }

  .posts-delete-mb-4 {
    margin-bottom: 1.5rem;
  }

  .posts-delete-mb-3 {
    margin-bottom: 1rem;
  }

  .posts-delete-warning-icon {
    font-size: 3.5rem;
    color: #ffc107;
    margin-bottom: 1rem;
  }

  .posts-delete-confirmation-text {
    font-size: 1.1rem;
    font-weight: 500;
    color: #495057;
    margin-bottom: 1rem;
  }

  .posts-delete-post-name {
    font-size: 1rem;
    font-weight: 600;
    color: #dc3545;
    background-color: #f8d7da;
    padding: 0.75rem;
    border-radius: 0.375rem;
    margin-bottom: 1.5rem;
    border: 1px solid #f5c6cb;
  }

  .posts-delete-alert {
    padding: 1rem 1.25rem;
    border: 1px solid #ffeaa7;
    border-radius: 0.5rem;
    background-color: #fff8e1;
    color: #856404;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .posts-delete-modal-footer {
    background-color: #f8f9fa;
    padding: 1.25rem 1.5rem;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .posts-delete-btn {
    display: inline-flex;
    align-items: center;
    padding: 0.6rem 1.25rem;
    font-size: 0.9rem;
    font-weight: 500;
    line-height: 1.5;
    border-radius: 0.375rem;
    border: 1px solid transparent;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .posts-delete-btn-secondary {
    background-color: #6c757d;
    border-color: #6c757d;
    color: white;
  }

  .posts-delete-btn-secondary:hover {
    background-color: #5a6268;
    border-color: #545b62;
  }

  .posts-delete-btn-danger {
    background-color: #dc3545;
    border-color: #dc3545;
    color: white;
  }

  .posts-delete-btn-danger:hover {
    background-color: #c82333;
    border-color: #bd2130;
  }

  .posts-delete-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .posts-delete-modal-dialog {
      width: 95%;
      margin: 0.5rem;
    }

    .posts-delete-modal-body {
      padding: 1.25rem;
    }
  }

  /* Utility Classes */
  .posts-delete-me-1 { margin-right: 0.25rem; }
  .posts-delete-me-2 { margin-right: 0.5rem; }
`;

const Posts = () => {
  const { 
    posts, 
    postsLoading, 
    postsError, 
    postCategories,
    currentPage,
    pageSize,
    fetchPosts,
    getPostById,
    removePost,
    likePost,
    unlikePost
  } = useBlog();
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentLocalPage, setCurrentLocalPage] = useState(1);
  const [postsWithLikeStatus, setPostsWithLikeStatus] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Fetch posts when component mounts
  useEffect(() => {
    fetchPosts(1, 10);
  }, [fetchPosts]);

  // Load like status for posts
  useEffect(() => {
    const loadLikeAndBookmarkStatus = async () => {
      if (posts && posts.length > 0) {
        // Debug logging để kiểm tra format dữ liệu
        console.log("=== POSTS DATA DEBUG ===");
        console.log("First post:", posts[0]);
        console.log("CreatedAt format:", posts[0]?.createdAt);
        console.log("CreatedAt type:", typeof posts[0]?.createdAt);
        console.log("Is array:", Array.isArray(posts[0]?.createdAt));

        try {
          const postsWithStatusData = await Promise.all(
            posts.map(async (post) => {
              try {
                const [likeResponse, bookmarkResponse] = await Promise.all([
                  blogService.getPostLikeStatus(post.id),
                  blogService.getPostBookmarkStatus(post.id)
                ]);
                
                return {
                  ...post,
                  liked: likeResponse?.data?.liked || false,
                  likesCount: likeResponse?.data?.likesCount || 0,
                  bookmarked: bookmarkResponse?.data?.bookmarked || false
                };
              } catch (error) {
                console.error(`Error loading status for post ${post.id}:`, error);
                return {
                  ...post,
                  liked: false,
                  likesCount: 0,
                  bookmarked: false
                };
              }
            })
          );
          
          setPostsWithLikeStatus(postsWithStatusData);
        } catch (error) {
          console.error('Error loading post statuses:', error);
        }
      }
    };

    loadLikeAndBookmarkStatus();
  }, [posts]);

  // Helper function to parse date from various formats
  const parseDate = (dateInput) => {
    if (!dateInput) return new Date(0); // Return epoch for null/undefined

    try {
      // Handle array format from backend: [year, month, day, hour, minute, second, nanosecond]
      if (Array.isArray(dateInput)) {
        const [year, month, day, hour = 0, minute = 0, second = 0, nanosecond = 0] = dateInput;
        // Month in JavaScript Date is 0-indexed, so subtract 1
        return new Date(year, month - 1, day, hour, minute, second, Math.floor(nanosecond / 1000000));
      } else {
        // Handle string format
        return new Date(dateInput);
      }
    } catch (error) {
      console.error("Error parsing date:", error, "Input:", dateInput);
      return new Date(0); // Return epoch for invalid dates
    }
  };

  // Format date - handle both string and array formats
  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';

    try {
      let dateObj;

      // Handle array format from backend: [year, month, day, hour, minute, second, nanosecond]
      if (Array.isArray(dateInput)) {
        const [year, month, day, hour = 0, minute = 0, second = 0, nanosecond = 0] = dateInput;
        // Month in JavaScript Date is 0-indexed, so subtract 1
        dateObj = new Date(year, month - 1, day, hour, minute, second, Math.floor(nanosecond / 1000000));
      } else {
        // Handle string format
        dateObj = new Date(dateInput);
      }

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn("Invalid date detected:", dateInput);
        return "Thời gian không hợp lệ";
      }

      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return dateObj.toLocaleDateString('vi-VN', options);
    } catch (error) {
      console.error("Lỗi khi định dạng ngày tháng:", error, "Input:", dateInput);
      return "Lỗi định dạng thời gian";
    }
  };

  // Filter posts based on search term, category, and date range
  const filteredPosts = (postsWithLikeStatus.length > 0 ? postsWithLikeStatus : posts).filter(post => {
    const matchesSearch =
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.tags && Array.isArray(post.tags) &&
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesCategory = selectedCategory === '' || post.category === selectedCategory;

    // Date range filtering
    let matchesDateRange = true;
    if (dateFrom || dateTo) {
      const postDate = parseDate(post.createdAt);

      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0); // Start of day
        matchesDateRange = matchesDateRange && postDate >= fromDate;
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        matchesDateRange = matchesDateRange && postDate <= toDate;
      }
    }

    return matchesSearch && matchesCategory && matchesDateRange;
  }).sort((a, b) => {
    // Sắp xếp theo bookmark trước (bài ghim lên đầu), sau đó theo createdAt (mới nhất trước)
    if (a.bookmarked && !b.bookmarked) return -1;
    if (!a.bookmarked && b.bookmarked) return 1;

    // Use parseDate helper for proper date comparison
    const dateA = parseDate(a.createdAt);
    const dateB = parseDate(b.createdAt);
    return dateB - dateA; // Newest first
  });

  // Pagination logic
  const postsPerPage = 6;
  const totalPosts = filteredPosts.length;
  const totalPagesLocal = Math.ceil(totalPosts / postsPerPage);
  
  // Calculate posts for current page
  const startIndex = (currentLocalPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPagePosts = filteredPosts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentLocalPage(1);
  }, [searchTerm, selectedCategory, dateFrom, dateTo]);

  // Handle view post detail
  const handleViewPostDetail = (post) => {
    navigate(`/nurse/blog-management/posts/${post.id}`);
  };

  // Handle edit post
  const handleEditPost = (post) => {
    // Check if user is author
    if (currentUser?.id !== post.author?.id) {
      alert('Bạn không có quyền chỉnh sửa bài viết này');
      return;
    }
    navigate(`/nurse/blog-management/posts/edit/${post.id}`);
  };

  // Handle delete post
  const handleDeletePost = (post) => {
    // Check if user is author
    if (currentUser?.id !== post.author?.id) {
      alert('Bạn không có quyền xóa bài viết này');
      return;
    }
    setSelectedPost(post);
    setShowDeleteModal(true);
  };

  // Confirm delete post
  const confirmDeletePost = async () => {
    if (!selectedPost) return;

    try {
      await blogService.deletePost(selectedPost.id);
      setShowDeleteModal(false);
      setSelectedPost(null);
      setCurrentLocalPage(1);

      // Refresh posts list
      fetchPosts(currentPage, pageSize);

      // Show success notification with Sweet2
      Swal.fire({
        icon: 'success',
        title: 'Xóa thành công!',
        text: `Bài viết "${selectedPost.title}" đã được xóa thành công.`,
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#0d6efd',
        timer: 3000,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });
    } catch (error) {
      console.error('Error deleting post:', error);

      // Show error notification with Sweet2
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Có lỗi xảy ra khi xóa bài viết. Vui lòng thử lại sau.',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#dc3545',
        showClass: {
          popup: 'animate__animated animate__shakeX'
        }
      });
    }
  };

  // Handle add new post
  const handleAddPost = () => {
    navigate('/nurse/blog-management/posts/add');
  };

  // Handle like/unlike post
  const handleToggleLike = async (post) => {
    try {
      const response = await blogService.togglePostLike(post.id);
      
      // Update local state
      if (response && response.data) {
        setPostsWithLikeStatus(prev => 
          prev.map(p => 
            p.id === post.id 
              ? { ...p, liked: response.data.liked, likesCount: response.data.likesCount }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Có lỗi xảy ra khi thích/hủy thích bài viết. Vui lòng thử lại sau.');
    }
  };

  // Handle bookmark/unbookmark post
  const handleToggleBookmark = async (post) => {
    try {
      const response = await blogService.togglePostBookmark(post.id);
      
      // Update local state
      if (response && response.data) {
        setPostsWithLikeStatus(prev => 
          prev.map(p => 
            p.id === post.id 
              ? { ...p, bookmarked: response.data.bookmarked }
              : p
          )
        );
        
        // Reload posts to refresh the sorting
        setTimeout(() => {
          fetchPosts(currentPage, pageSize);
        }, 500);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('Có lỗi xảy ra khi ghim/bỏ ghim bài viết. Vui lòng thử lại sau.');
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    fetchPosts(page, pageSize);
  };

  return (
    <Container fluid className="py-4 posts-wrapper">



      {/* Posts Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <Button variant="primary" className="btn-sm" onClick={handleAddPost}>
              <i className="fas fa-plus me-2"></i>
              Thêm bài viết
            </Button>
          </div>
        </Col>
      </Row>

      {/* Enhanced Search and Filter Section */}
      <div className="enhanced-filter-section-posts mb-4">
        <div className="filter-container-posts">
          <div className="filter-header-posts">
            <div className="filter-title-posts">
              <i className="fas fa-filter me-2"></i>
              Bộ lọc tìm kiếm
            </div>
            <div className="filter-stats-posts">
              Tìm thấy <span className="stats-number-posts">{filteredPosts.length}</span> bài viết
              {(searchTerm || selectedCategory || dateFrom || dateTo) && (
                <div className="active-filters-posts">
                  {searchTerm && <span className="filter-tag-posts">Tìm kiếm: "{searchTerm}"</span>}
                  {selectedCategory && <span className="filter-tag-posts">Danh mục: {selectedCategory}</span>}
                  {(dateFrom || dateTo) && (
                    <span className="filter-tag-posts">
                      Thời gian: {dateFrom ? new Date(dateFrom).toLocaleDateString('vi-VN') : '...'} → {dateTo ? new Date(dateTo).toLocaleDateString('vi-VN') : '...'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="filter-controls-posts">
            <div className="search-control-posts">
              <div className="search-wrapper-posts">
                <input
                  type="text"
                  className="search-input-posts"
                  placeholder="Tìm kiếm theo tiêu đề, nội dung, thẻ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {!searchTerm && <i className="fas fa-search search-icon-posts"></i>}
                {searchTerm && (
                  <button
                    className="clear-search-posts"
                    onClick={() => setSearchTerm('')}
                    type="button"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="category-control-posts">
              <div className="category-wrapper-posts">
                <i className="fas fa-tags category-icon-posts"></i>
                <select
                  className="category-select-posts"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Tất cả danh mục</option>
                  {postCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <i className="fas fa-chevron-down dropdown-arrow-posts"></i>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="date-range-control-posts">
              <div className="date-filters-posts">
                <div className="date-control-posts">
                  <label className="date-label-posts">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    className="date-input-posts"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    max={dateTo || undefined}
                  />
                </div>
                <div className="date-control-posts">
                  <label className="date-label-posts">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    className="date-input-posts"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    min={dateFrom || undefined}
                  />
                </div>
              </div>
            </div>

            {(searchTerm || selectedCategory || dateFrom || dateTo) && (
              <div className="reset-filters-posts">
                <button
                  className="reset-btn-posts"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setDateFrom('');
                    setDateTo('');
                  }}
                  type="button"
                >
                  <i className="fas fa-undo me-1"></i>
                  Đặt lại
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {postsLoading && (
        <div className="posts-loading-posts">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
          <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Error state */}
      {postsError && !postsLoading && (
        <div className="posts-error-posts">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {postsError}
          <Button
            variant="outline-danger"
            size="sm"
            className="ms-3"
            onClick={() => fetchPosts(currentPage, pageSize)}
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* Posts list */}
      {!postsLoading && !postsError && (
        <Row>
          {currentPagePosts.map(post => (
            <Col md={6} lg={4} key={post.id} className="mb-4">
              <Card className="h-100 enhanced-post-card-posts">
                <Card.Body className="d-flex flex-column card-body-posts">
                  {/* Bookmark Badge - moved to top right of card */}
                  {post.bookmarked && (
                    <div className="bookmark-badge-top-posts">
                      <i className="fas fa-bookmark me-1"></i>
                      Ghim
                    </div>
                  )}
                  {/* Header Badges */}
                  <div className="card-header-badges-posts mb-3">
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      <Badge className="id-badge-posts">
                        ID: {post.id}
                      </Badge>
                      <Badge className="category-badge-posts">
                        <i className="fas fa-tag me-1"></i>
                        {post.category || 'Chưa phân loại'}
                      </Badge>
                    </div>
                  </div>

                  {/* Title */}
                  <Card.Title className="card-title-posts mb-3">
                    {post.title}
                  </Card.Title>

                  {/* Content Preview */}
                  <Card.Text className="card-content-posts flex-grow-1 mb-3">
                    {post.excerpt || post.content?.substring(0, 120) + '...'}
                  </Card.Text>

                  {/* Tags */}
                  {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                    <div className="tags-container-posts mb-3">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} className="tag-badge-posts">
                          #{tag}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <Badge className="tag-more-posts">
                          +{post.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Author & Date Info */}
                  <div className="card-meta-posts mb-3">
                    <div className="author-info-posts">
                      <i className="fas fa-user-circle me-2"></i>
                      <span>{post.author?.name || 'Không có tác giả'}</span>
                    </div>
                    <div className="date-info-posts">
                      <i className="fas fa-clock me-2"></i>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>

                  {/* Interaction Stats */}
                  <div className="interaction-stats-posts mb-3">
                    <div
                      className={`like-stat-posts ${post.liked ? 'liked' : ''}`}
                      onClick={() => handleToggleLike(post)}
                      title={post.liked ? 'Bỏ thích bài viết' : 'Thích bài viết'}
                    >
                      <i className={`${post.liked ? 'fas' : 'far'} fa-heart`}></i>
                      <span>{post.likesCount || 0}</span>
                    </div>
                    <div
                      className={`bookmark-stat-posts ${post.bookmarked ? 'bookmarked' : ''}`}
                      onClick={() => handleToggleBookmark(post)}
                      title={post.bookmarked ? 'Bỏ ghim bài viết' : 'Ghim bài viết'}
                    >
                      <i className={`${post.bookmarked ? 'fas' : 'far'} fa-bookmark`}></i>
                      <span>{post.bookmarked ? 'Đã ghim' : 'Ghim'}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="card-actions-posts">
                    <Button
                      className="view-btn-posts"
                      onClick={() => handleViewPostDetail(post)}
                    >
                      <i className="fas fa-eye me-2"></i>
                      Xem chi tiết
                    </Button>

                    {/* Author-only actions */}
                    {currentUser?.id === post.author?.id && (
                      <div className="author-actions-posts">
                        <Button
                          className="edit-btn-posts"
                          onClick={() => handleEditPost(post)}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          className="delete-btn-posts"
                          onClick={() => handleDeletePost(post)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Empty state */}
      {!postsLoading && !postsError && filteredPosts.length === 0 && (
        <Row>
          <Col>
            <div className="posts-empty-posts">
              <i className="fas fa-search fa-3x mb-3"></i>
              <h5 className="text-muted">Không tìm thấy bài viết nào</h5>
              <p className="text-muted">Thử thay đổi từ khóa tìm kiếm hoặc thêm bài viết mới</p>
            </div>
          </Col>
        </Row>
      )}

      {/* Simple Pagination with "1 / 3" style */}
      {!postsLoading && !postsError && totalPagesLocal > 1 && (
        <Row className="mt-4">
          <Col>
            <div className="pagination-controls-posts d-flex justify-content-between align-items-center">
              {/* Showing entries info */}
              <div className="pagination-info-posts">
                <small>
                  Showing {startIndex + 1} to {Math.min(endIndex, totalPosts)} of {totalPosts} posts
                </small>
              </div>

              {/* Pagination controls */}
              <div className="d-flex align-items-center gap-2">
                {/* First page button */}
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={currentLocalPage === 1}
                  onClick={() => setCurrentLocalPage(1)}
                  title="Trang đầu"
                  style={{ minWidth: '40px' }}
                >
                  <i className="fas fa-angle-double-left"></i>
                </button>

                {/* Previous page button */}
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={currentLocalPage === 1}
                  onClick={() => setCurrentLocalPage(currentLocalPage - 1)}
                  title="Trang trước"
                  style={{ minWidth: '40px' }}
                >
                  <i className="fas fa-angle-left"></i>
                </button>

                {/* Current page indicator */}
                <div
                  className="px-3 py-1 bg-primary text-white rounded"
                  style={{
                    minWidth: '60px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {currentLocalPage} / {totalPagesLocal}
                </div>

                {/* Next page button */}
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={currentLocalPage === totalPagesLocal}
                  onClick={() => setCurrentLocalPage(currentLocalPage + 1)}
                  title="Trang tiếp"
                  style={{ minWidth: '40px' }}
                >
                  <i className="fas fa-angle-right"></i>
                </button>

                {/* Last page button */}
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={currentLocalPage === totalPagesLocal}
                  onClick={() => setCurrentLocalPage(totalPagesLocal)}
                  title="Trang cuối"
                  style={{ minWidth: '40px' }}
                >
                  <i className="fas fa-angle-double-right"></i>
                </button>
              </div>
            </div>
          </Col>
        </Row>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && createPortal(
        <>
          <style>{deleteModalStyles}</style>
          <div className="posts-delete-modal-overlay">
            <div className="posts-delete-modal-dialog">
              <div className="posts-delete-modal-content">
                {/* Modal Header */}
                <div className="posts-delete-modal-header">
                  <h5 className="posts-delete-modal-title" style={{color: 'white'}}>
                    <i className="fas fa-trash-alt posts-delete-me-2" style={{color: 'white'}}></i>
                    Xác nhận xóa bài viết
                  </h5>
                  <button
                    type="button"
                    className="posts-delete-btn-close"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                {/* Modal Body */}
                <div className="posts-delete-modal-body">
                  <div className="posts-delete-text-center posts-delete-mb-4">
                    <i className="fas fa-exclamation-triangle posts-delete-warning-icon"></i>
                  </div>

                  <div className="posts-delete-text-center posts-delete-mb-4">
                    <p className="posts-delete-confirmation-text">
                      Bạn có chắc chắn muốn xóa bài viết này không?
                    </p>
                    <div className="posts-delete-post-name">
                      "{selectedPost?.title}"
                    </div>
                  </div>

                  <div className="posts-delete-alert">
                    <i className="fas fa-exclamation-triangle posts-delete-me-2"></i>
                    <span><strong>Lưu ý:</strong> Hành động này không thể hoàn tác.</span>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="posts-delete-modal-footer">
                  <button
                    type="button"
                    className="posts-delete-btn posts-delete-btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    <i className="fas fa-times posts-delete-me-1"></i>
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="posts-delete-btn posts-delete-btn-danger"
                    onClick={confirmDeletePost}
                  >
                    <i className="fas fa-trash posts-delete-me-1"></i>
                    Xóa bài viết
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </Container>
  );
};

export default Posts;
