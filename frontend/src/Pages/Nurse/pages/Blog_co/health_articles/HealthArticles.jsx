import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import SuccessNotification from './SuccessNotification';
import HealthArticleDetailModal from './HealthArticleDetailModal';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../../context/AuthContext';
import * as healthArticleService from '../../../../../services/APINurse/blogService';
import {  getAuthorDisplayName } from '../../../../../context/NurseContext/BlogContext';
import './HealthArticles.css';

// Custom styles for delete modal
const deleteModalStyles = `
  /* Health Article Delete Modal - Namespaced Styles */
  .health-article-delete-modal-overlay {
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

  .health-article-delete-modal-dialog {
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    margin: 1rem;
  }

  .health-article-delete-modal-content {
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: 90vh;
  }

  .health-article-delete-modal-header {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
    padding: 1.25rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: none;
  }

  .health-article-delete-modal-title {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 600;
    display: flex;
    align-items: center;
  }

  .health-article-delete-btn-close {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.25rem;
    transition: background-color 0.2s ease;
  }

  .health-article-delete-btn-close:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .health-article-delete-modal-body {
    padding: 1.75rem;
    flex: 1;
    overflow-y: auto;
  }

  .health-article-delete-text-center {
    text-align: center;
  }

  .health-article-delete-mb-4 {
    margin-bottom: 1.5rem;
  }

  .health-article-delete-mb-3 {
    margin-bottom: 1rem;
  }

  .health-article-delete-warning-icon {
    font-size: 3.5rem;
    color: #ffc107;
    margin-bottom: 1rem;
  }

  .health-article-delete-confirmation-text {
    font-size: 1.1rem;
    font-weight: 500;
    color: #495057;
    margin-bottom: 1rem;
  }

  .health-article-delete-article-name {
    font-size: 1rem;
    font-weight: 600;
    color: #dc3545;
    background-color: #f8d7da;
    padding: 0.75rem;
    border-radius: 0.375rem;
    margin-bottom: 1.5rem;
    border: 1px solid #f5c6cb;
  }

  .health-article-delete-alert {
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

  .health-article-delete-modal-footer {
    background-color: #f8f9fa;
    padding: 1.25rem 1.5rem;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .health-article-delete-btn {
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

  .health-article-delete-btn-secondary {
    background-color: #6c757d;
    border-color: #6c757d;
    color: white;
  }

  .health-article-delete-btn-secondary:hover {
    background-color: #5a6268;
    border-color: #545b62;
  }

  .health-article-delete-btn-danger {
    background-color: #dc3545;
    border-color: #dc3545;
    color: white;
  }

  .health-article-delete-btn-danger:hover {
    background-color: #c82333;
    border-color: #bd2130;
  }

  .health-article-delete-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .health-article-delete-modal-dialog {
      width: 95%;
      margin: 0.5rem;
    }

    .health-article-delete-modal-body {
      padding: 1.25rem;
    }
  }

  /* Utility Classes */
  .health-article-delete-me-1 { margin-right: 0.25rem; }
  .health-article-delete-me-2 { margin-right: 0.5rem; }
`;

const HealthArticles = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage] = useState(6);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Success notification states
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('delete');

  // Health article categories
  const healthCategories = [
    "COVID-19 và trẻ em",
    "Dinh dưỡng học đường",
    "Sức khỏe tâm thần",
    "Tuổi dậy thì",
    "Vắc-xin cho học sinh",
    "Y tế học đường",
    "Phòng bệnh",
    "Sơ cứu",
    "Hoạt động thể chất",
    "Other"
  ];

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

  // Fetch health articles
  const fetchHealthArticles = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await healthArticleService.getAllHealthArticles();

      // Debug logging để kiểm tra format dữ liệu
      if (response && response.length > 0) {
        console.log("=== HEALTH ARTICLES DATA DEBUG ===");
        console.log("First article:", response[0]);
        console.log("PublishDate format:", response[0]?.publishDate);
        console.log("PublishDate type:", typeof response[0]?.publishDate);
        console.log("Is array:", Array.isArray(response[0]?.publishDate));
      }

      // Sắp xếp theo publishDate mới nhất trước sử dụng helper function
      const sortedArticles = (response || []).sort((a, b) => {
        const dateA = parseDate(a.publishDate);
        const dateB = parseDate(b.publishDate);
        return dateB - dateA; // Sắp xếp giảm dần (mới nhất trước)
      });
      setArticles(sortedArticles);
    } catch (error) {
      console.error('Error fetching health articles:', error);
      setError('Không thể tải danh sách bài viết y tế');
    } finally {
      setLoading(false);
    }
  };

  // Fetch health articles when component mounts
  useEffect(() => {
    fetchHealthArticles();
  }, []);

  // Handle add new article
  const handleAddArticle = () => {
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để tạo bài viết');
      return;
    }
    
    // Chỉ admin và nurse mới có thể tạo bài viết
    if (currentUser.role !== 'admin' && currentUser.role !== 'nurse') {
      toast.error('Bạn không có quyền tạo bài viết y tế');
      return;
    }
    
    navigate('/nurse/blog-management/health-articles/add');
  };

  // Handle edit article
  const handleEditArticle = (article) => {
    if (!canEditDelete(article)) {
      toast.error('Bạn không có quyền chỉnh sửa bài viết này');
      return;
    }
    navigate(`/nurse/blog-management/health-articles/edit/${article.id}`);
  };

  // Check if user can edit/delete article (strict permission check)
  const canEditDelete = (article) => {
    if (!currentUser || !article) {
      return false;
    }
    
    // Chỉ người tạo bài viết mới có quyền sửa/xóa (không phân biệt role)
    // Kiểm tra nghiêm ngặt: chỉ so sánh khi cả hai giá trị đều không rỗng
    const isAuthor = 
      (article.memberId && currentUser.memberId && article.memberId === currentUser.memberId) ||
      (article.memberId && currentUser.id && article.memberId === currentUser.id) ||
      (article.authorId && currentUser.memberId && article.authorId === currentUser.memberId) ||
      (article.authorId && currentUser.id && article.authorId === currentUser.id);
    
    return isAuthor;
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

  // Get difficulty badge variant - All badges will be blue
  const getDifficultyVariant = (category) => {
    // Return 'primary' for all categories to have consistent blue color
    return 'primary';
  };

  // Filter articles based on search term, category, and date range
  const filteredArticles = articles.filter(article => {
    const matchesSearch =
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.tags && Array.isArray(article.tags) &&
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesCategory = selectedCategory === '' || article.category === selectedCategory;

    // Date range filtering
    let matchesDateRange = true;
    if (dateFrom || dateTo) {
      const articleDate = parseDate(article.publishDate);

      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0); // Start of day
        matchesDateRange = matchesDateRange && articleDate >= fromDate;
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        matchesDateRange = matchesDateRange && articleDate <= toDate;
      }
    }

    return matchesSearch && matchesCategory && matchesDateRange;
  });

  // Pagination logic
  const totalArticles = filteredArticles.length;
  const totalPages = Math.ceil(totalArticles / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, dateFrom, dateTo]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle view article details
  const handleViewArticleDetail = async (article) => {
    try {
      setDetailLoading(true);
      setSelectedArticle(null);
      
      // Get the latest article data
      const articleDetail = await healthArticleService.getHealthArticleById(article.id);
      
      setSelectedArticle(articleDetail);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching article details:', error);
      toast.error('Không thể tải thông tin chi tiết bài viết. Vui lòng thử lại sau.');
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle delete article
  const handleDeleteArticle = (article) => {
    if (!canEditDelete(article)) {
      toast.error('Bạn không có quyền xóa bài viết này');
      return;
    }
    setSelectedArticle(article);
    setShowDeleteModal(true);
  };

  // Confirm delete article
  const confirmDeleteArticle = async () => {
    if (!selectedArticle) return;
    
    try {
      await healthArticleService.deleteHealthArticle(selectedArticle.id);
      setShowDeleteModal(false);
      setSelectedArticle(null);
      
      // Show success notification instead of toast
      setNotificationType('delete');
      setShowSuccessNotification(true);
      
      // Refresh articles list
      fetchHealthArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Có lỗi xảy ra khi xóa bài viết. Vui lòng thử lại sau.');
    }
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setShowSuccessNotification(false);
  };

  return (
    <Container fluid className="py-4 health-articles-wrapper">



      {/* Articles Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <Button
              variant="primary"
              onClick={handleAddArticle}
              className="btn-sm"
            >
              <i className="fas fa-plus me-2"></i>
              Thêm bài viết mới
            </Button>
          </div>
        </Col>
      </Row>

      {/* Enhanced Search and Filter Section */}
      <div className="enhanced-filter-section-health mb-4">
        <div className="filter-container-health">
          <div className="filter-header-health">
            <div className="filter-title-health">
              <i className="fas fa-filter me-2"></i>
              Bộ lọc tìm kiếm
            </div>
            <div className="filter-stats-health">
              Tìm thấy <span className="stats-number-health">{totalArticles}</span> bài viết
              {totalArticles > 0 && (
                <span className="page-info-health"> • Trang {currentPage} / {totalPages}</span>
              )}
              {(searchTerm || selectedCategory || dateFrom || dateTo) && (
                <div className="active-filters-health">
                  {searchTerm && <span className="filter-tag-health">Tìm kiếm: "{searchTerm}"</span>}
                  {selectedCategory && <span className="filter-tag-health">Danh mục: {selectedCategory}</span>}
                  {(dateFrom || dateTo) && (
                    <span className="filter-tag-health">
                      Thời gian: {dateFrom ? new Date(dateFrom).toLocaleDateString('vi-VN') : '...'} → {dateTo ? new Date(dateTo).toLocaleDateString('vi-VN') : '...'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="filter-controls-health">
            <div className="search-control-health">
              <div className="search-wrapper-health">
                <input
                  type="text"
                  className="search-input-health"
                  placeholder="Tìm kiếm theo tiêu đề, nội dung, thẻ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {!searchTerm && <i className="fas fa-search search-icon-health"></i>}
                {searchTerm && (
                  <button
                    className="clear-search-health"
                    onClick={() => setSearchTerm('')}
                    type="button"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="category-control-health">
              <div className="category-wrapper-health">
                <i className="fas fa-heartbeat category-icon-health"></i>
                <select
                  className="category-select-health"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Tất cả danh mục</option>
                  {healthCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <i className="fas fa-chevron-down dropdown-arrow-health"></i>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="date-range-control-health">
              <div className="date-filters-health">
                <div className="date-control-health">
                  <label className="date-label-health">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    className="date-input-health"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    max={dateTo || undefined}
                  />
                </div>
                <div className="date-control-health">
                  <label className="date-label-health">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    className="date-input-health"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    min={dateFrom || undefined}
                  />
                </div>
              </div>
            </div>

            {(searchTerm || selectedCategory || dateFrom || dateTo) && (
              <div className="reset-filters-health">
                <button
                  className="reset-btn-health"
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
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
          <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <Button 
            variant="outline-danger" 
            size="sm" 
            className="ms-3"
            onClick={fetchHealthArticles}
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* Articles list */}
      {!loading && !error && (
        <>
          <Row>
            {currentArticles.map(article => (
              <Col md={6} lg={4} key={article.id} className="mb-4">
                <Card className="h-100 shadow-sm">
                  {article.imageUrl && (
                    <Card.Img 
                      variant="top" 
                      src={article.imageUrl} 
                      style={{ height: '200px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Badge bg={getDifficultyVariant(article.category)} className="mb-2">{article.category || 'Chưa phân loại'}</Badge>
                      <Badge bg="secondary" className="mb-2">ID: {article.id}</Badge>
                    </div>
                    
                    <Card.Title className="h6 mb-2">{article.title}</Card.Title>
                    <Card.Text className="text-muted small flex-grow-1">
                      {article.summary || article.content?.substring(0, 150) + '...'}
                    </Card.Text>
                    
                    <div className="mb-2">
                      {article.tags && Array.isArray(article.tags) && article.tags.map((tag, index) => (
                        <Badge key={index} bg="primary" className="me-1 mb-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center text-muted small mb-2">
                      <span>
                        <i className="fas fa-user me-1"></i>
                        {getAuthorDisplayName(article, currentUser)}
                      </span>
                    </div>
                    
                    <div className="text-muted small mb-3">
                      <i className="fas fa-calendar me-1"></i>
                      {formatDate(article.publishDate)}
                    </div>
                    
                    <div className="d-flex gap-2">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="flex-fill"
                        onClick={() => handleViewArticleDetail(article)}
                      >
                        <i className="fas fa-eye me-1"></i>
                        Xem
                      </Button>
                      
                      {/* Show edit/delete buttons only for authorized users */}
                      {canEditDelete(article) && (
                        <>
                          <Button 
                            variant="outline-warning" 
                            size="sm" 
                            className="flex-fill"
                            onClick={() => handleEditArticle(article)}
                          >
                            <i className="fas fa-edit me-1"></i>
                            Sửa
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteArticle(article)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Simple Pagination with "1 / 3" style */}
          {totalPages > 1 && (
            <Row className="mt-4">
              <Col>
                <div className="d-flex justify-content-between align-items-center px-3">
                  {/* Showing entries info */}
                  <div className="text-muted">
                    <small>
                      Showing {startIndex + 1} to {Math.min(endIndex, totalArticles)} of {totalArticles} articles
                    </small>
                  </div>

                  {/* Pagination controls */}
                  <div className="d-flex align-items-center gap-2">
                    {/* First page button */}
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(1)}
                      title="Trang đầu"
                      style={{ minWidth: '40px' }}
                    >
                      <i className="fas fa-angle-double-left"></i>
                    </button>

                    {/* Previous page button */}
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
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
                      {currentPage} / {totalPages}
                    </div>

                    {/* Next page button */}
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      title="Trang tiếp"
                      style={{ minWidth: '40px' }}
                    >
                      <i className="fas fa-angle-right"></i>
                    </button>

                    {/* Last page button */}
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(totalPages)}
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
        </>
      )}

      {!loading && !error && filteredArticles.length === 0 && (
        <Row>
          <Col className="text-center py-5">
            <i className="fas fa-search fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">Không tìm thấy bài viết nào</h5>
            <p className="text-muted">Thử thay đổi từ khóa tìm kiếm hoặc danh mục</p>
          </Col>
        </Row>
      )}

      {/* Add/Edit Article Modal - Removed because we use separate pages */}
      
      {/* Article Detail Modal */}
      <HealthArticleDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        selectedArticle={selectedArticle}
        detailLoading={detailLoading}
        currentUser={currentUser}
        getAuthorDisplayName={getAuthorDisplayName}
        formatDate={formatDate}
        canEditDelete={canEditDelete}
        handleEditArticle={handleEditArticle}
      />



      {/* Delete Confirmation Modal */}
      {showDeleteModal && createPortal(
        <>
          <style>{deleteModalStyles}</style>
          <div className="health-article-delete-modal-overlay">
            <div className="health-article-delete-modal-dialog">
              <div className="health-article-delete-modal-content">
                {/* Modal Header */}
                <div className="health-article-delete-modal-header">
                  <h5 className="health-article-delete-modal-title" style={{color: 'white'}}>
                    <i className="fas fa-trash-alt health-article-delete-me-2" style={{color: 'white'}}></i>
                    Xác nhận xóa bài viết
                  </h5>
                  <button
                    type="button"
                    className="health-article-delete-btn-close"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                {/* Modal Body */}
                <div className="health-article-delete-modal-body">
                  <div className="health-article-delete-text-center health-article-delete-mb-4">
                    <i className="fas fa-exclamation-triangle health-article-delete-warning-icon"></i>
                  </div>

                  <div className="health-article-delete-text-center health-article-delete-mb-4">
                    <p className="health-article-delete-confirmation-text">
                      Bạn có chắc chắn muốn xóa bài viết
                    </p>
                    <div className="health-article-delete-article-name">
                      "{selectedArticle?.title}"
                    </div>
                  </div>

                  <div className="health-article-delete-alert">
                    <i className="fas fa-exclamation-triangle health-article-delete-me-2"></i>
                    <span><strong>Lưu ý:</strong> Hành động này không thể hoàn tác.</span>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="health-article-delete-modal-footer">
                  <button
                    type="button"
                    className="health-article-delete-btn health-article-delete-btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    <i className="fas fa-times health-article-delete-me-1"></i>
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="health-article-delete-btn health-article-delete-btn-danger"
                    onClick={confirmDeleteArticle}
                  >
                    <i className="fas fa-trash-alt health-article-delete-me-1"></i>
                    Xóa bài viết
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Success Notification Modal */}
      <SuccessNotification
        show={showSuccessNotification}
        onHide={handleNotificationClose}
        iconType={notificationType}
        autoHideDelay={3000}
      />
    </Container>
  );
};

export default HealthArticles;
