import React, { useState, useEffect } from 'react';
import SuccessNotification from './SuccessNotification';
import { Container, Row, Col, Card, Button, Badge, Modal, Spinner, Nav, Pagination } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../../context/AuthContext';
import * as healthArticleService from '../../../../../services/APINurse/blogService';
import {  getAuthorDisplayName } from '../../../../../context/NurseContext/BlogContext';
import './HealthArticles.css';

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

  // Get difficulty badge variant
  const getDifficultyVariant = (category) => {
    switch (category) {
      case 'Dinh dưỡng': return 'success';
      case 'Xương khớp': return 'warning';
      case 'Nhãn khoa': return 'danger';
      case 'Dinh dưỡng học đường': return 'success';
      case 'Sức khỏe học đường': return 'info';
      default: return 'secondary';
    }
  };

  // Filter articles based on search term and category
  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.tags && Array.isArray(article.tags) && 
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesCategory = selectedCategory === '' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
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
  }, [searchTerm, selectedCategory]);

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
    <Container fluid className="py-4">
      <style>
        {`
          /* Đồng bộ màu sắc với hệ thống */
          .btn-primary {
            background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%) !important;
            border-color: #0d6efd !important;
            box-shadow: 0 2px 8px rgba(13, 110, 253, 0.2) !important;
          }
          
          .btn-primary:hover {
            background: linear-gradient(135deg, #0b5ed7 0%, #0a58ca 100%) !important;
            border-color: #0b5ed7 !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3) !important;
          }
          
          .btn-outline-primary {
            color: #0d6efd !important;
            border-color: #0d6efd !important;
          }
          
          .btn-outline-primary:hover {
            background-color: #0d6efd !important;
            border-color: #0d6efd !important;
          }
          
          /* Badge ID đồng bộ với hệ thống */
          .badge.bg-info {
            background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%) !important;
            color: white !important;
          }
          
          /* Badge secondary (tags) đồng bộ với hệ thống */
          .badge.bg-secondary {
            background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%) !important;
            color: white !important;
          }
          
          /* Text primary cho các element khác */
          .text-primary {
            color: #0d6efd !important;
          }
          
          /* Focus state cho form controls */
          .form-control:focus {
            border-color: #86b7fe !important;
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
          }
          
          .form-select:focus {
            border-color: #86b7fe !important;
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
          }
          
          /* Fix dropdown arrow */
          .form-select {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e") !important;
            background-repeat: no-repeat !important;
            background-position: right 0.75rem center !important;
            background-size: 16px 12px !important;
            padding-right: 2.25rem !important;
            appearance: none !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
          }
          
          /* Ensure dropdown works properly */
          .form-select option {
            color: #212529 !important;
            background-color: #fff !important;
          }

          /* Enhanced Filter Section Styles for Health Articles */
          .enhanced-filter-section-health {
            background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(40, 167, 69, 0.2);
            backdrop-filter: blur(10px);
            margin-bottom: 2rem;
          }

          .filter-container-health {
            max-width: 100%;
          }

          .filter-header-health {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 12px;
          }

          .filter-title-health {
            font-size: 1.1rem;
            font-weight: 600;
            color: #155724;
            display: flex;
            align-items: center;
          }

          .filter-title-health i {
            color: #28a745;
            font-size: 1rem;
          }

          .filter-stats-health {
            font-size: 0.9rem;
            color: #6c757d;
            font-weight: 500;
          }

          .stats-number-health {
            color: #28a745;
            font-weight: 700;
            font-size: 1rem;
          }

          .page-info-health {
            color: #6c757d;
            font-size: 0.85rem;
          }

          .filter-controls-health {
            display: grid;
            grid-template-columns: 2fr 1fr auto;
            gap: 16px;
            align-items: end;
          }

          @media (max-width: 768px) {
            .filter-controls-health {
              grid-template-columns: 1fr;
              gap: 12px;
            }

            .filter-header-health {
              flex-direction: column;
              align-items: flex-start;
              gap: 8px;
            }
          }

          .search-control-health {
            position: relative;
          }

          .search-wrapper-health {
            position: relative;
            display: flex;
            align-items: center;
          }

          .search-input-health {
            width: 100%;
            padding: 12px 44px 12px 16px;
            border: 2px solid #d4edda;
            border-radius: 12px;
            font-size: 0.95rem;
            background: white;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(40, 167, 69, 0.1);
          }

          .search-input-health:focus {
            outline: none;
            border-color: #28a745;
            box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.15), 0 4px 12px rgba(40, 167, 69, 0.2);
            transform: translateY(-1px);
          }

          .search-input-health::placeholder {
            color: #adb5bd;
            font-style: italic;
          }



          .clear-search-health {
            position: absolute;
            right: 12px;
            background: none;
            border: none;
            color: #6c757d;
            cursor: pointer;
            padding: 4px;
            border-radius: 50%;
            transition: all 0.3s ease;
            z-index: 2;
          }

          .clear-search-health:hover {
            color: #dc3545;
            background-color: rgba(220, 53, 69, 0.1);
          }

          .category-control-health {
            position: relative;
          }

          .category-wrapper-health {
            position: relative;
            display: flex;
            align-items: center;
          }

          .category-select-health {
            width: 100%;
            padding: 12px 40px 12px 44px;
            border: 2px solid #d4edda;
            border-radius: 12px;
            font-size: 0.95rem;
            background: white !important;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(40, 167, 69, 0.1);
            appearance: none !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            background-image: none !important;
          }

          /* Loại bỏ mũi tên mặc định trên tất cả browser */
          .category-select-health::-ms-expand {
            display: none;
          }

          .category-select-health:focus {
            outline: none;
            border-color: #28a745;
            box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.15), 0 4px 12px rgba(40, 167, 69, 0.2);
            transform: translateY(-1px);
          }

          .category-icon-health {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: #6c757d;
            font-size: 0.9rem;
            z-index: 2;
            transition: color 0.3s ease;
            pointer-events: none;
          }

          .category-select-health:focus ~ .category-icon-health,
          .category-wrapper-health:hover .category-icon-health {
            color: #28a745;
          }

          .dropdown-arrow-health {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: #6c757d;
            font-size: 0.8rem;
            pointer-events: none;
            transition: all 0.3s ease;
          }

          .category-select-health:focus ~ .dropdown-arrow-health,
          .category-wrapper-health:hover .dropdown-arrow-health {
            color: #28a745;
            transform: translateY(-50%) rotate(180deg);
          }

          .reset-filters-health {
            display: flex;
            align-items: end;
          }

          .reset-btn-health {
            padding: 12px 20px;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
            white-space: nowrap;
          }

          .reset-btn-health:hover {
            background: linear-gradient(135deg, #218838 0%, #1e7e34 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
          }

          .reset-btn-health:active {
            transform: translateY(0);
          }
          
          .form-select:disabled {
            background-color: #e9ecef !important;
            opacity: 1 !important;
          }
          
          /* Modal styling đồng bộ hệ thống */
          .modal-header {
            border-bottom: 2px solid #dee2e6 !important;
          }
          
          /* Modal xóa - theme đỏ cho delete */
          .modal-header.delete-modal-header {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
            color: white !important;
            border-bottom: 2px solid #c82333 !important;
          }
          
          .modal-header.delete-modal-header .modal-title {
            color: white !important;
            font-weight: 600 !important;
          }
          
          .modal-header.delete-modal-header .btn-close {
            filter: brightness(0) invert(1) !important;
          }
          
          /* Button danger enhancement */
          .btn-danger {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
            border-color: #dc3545 !important;
            box-shadow: 0 2px 8px rgba(220, 53, 69, 0.2) !important;
          }
          
          .btn-danger:hover {
            background: linear-gradient(135deg, #c82333 0%, #b21e2f 100%) !important;
            border-color: #c82333 !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3) !important;
          }
          
          /* Button secondary enhancement */
          .btn-secondary {
            background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%) !important;
            border-color: #6c757d !important;
            box-shadow: 0 2px 4px rgba(108, 117, 125, 0.2) !important;
          }
          
          .btn-secondary:hover {
            background: linear-gradient(135deg, #5a6268 0%, #4e555b 100%) !important;
            border-color: #5a6268 !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 8px rgba(108, 117, 125, 0.3) !important;
          }
        `}
      </style>

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

            {(searchTerm || selectedCategory) && (
              <div className="reset-filters-health">
                <button
                  className="reset-btn-health"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
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
                      <Badge bg="info" className="mb-2">ID: {article.id}</Badge>
                    </div>
                    
                    <Card.Title className="h6 mb-2">{article.title}</Card.Title>
                    <Card.Text className="text-muted small flex-grow-1">
                      {article.summary || article.content?.substring(0, 150) + '...'}
                    </Card.Text>
                    
                    <div className="mb-2">
                      {article.tags && Array.isArray(article.tags) && article.tags.map((tag, index) => (
                        <Badge key={index} bg="secondary" className="me-1 mb-1">
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
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton className="system-modal-header" style={{
          background: 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)',
          color: 'white',
          borderBottom: '2px solid #0b5ed7'
        }}>
          <Modal.Title style={{ color: 'white', fontWeight: '600' }}>
            <i className="fas fa-file-alt me-2"></i>
            Chi tiết bài viết y tế
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Đang tải chi tiết bài viết...</p>
            </div>
          ) : selectedArticle ? (
            <div className="article-detail">
              {selectedArticle.imageUrl && (
                <div className="text-center mb-4">
                  <img 
                    src={selectedArticle.imageUrl} 
                    alt={selectedArticle.title}
                    className="img-fluid rounded mx-auto d-block" 
                    style={{ maxHeight: '300px', maxWidth: '100%' }}
                    onError={(e) => {e.target.style.display = 'none'}}
                  />
                </div>
              )}
              
              <h4 className="mb-3">{selectedArticle.title}</h4>
              
              <div className="d-flex justify-content-between text-muted small mb-3">
                <span>
                  <i className="fas fa-user me-1"></i>
                  {getAuthorDisplayName(selectedArticle, currentUser)}
                </span>
                <span>
                  <i className="fas fa-calendar me-1"></i>
                  {formatDate(selectedArticle.publishDate)}
                </span>
              </div>
              
              <Badge bg="info" className="mb-3" style={{
                background: 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)',
                color: 'white'
              }}>
                {selectedArticle.category || 'Chưa phân loại'}
              </Badge>
              
              {selectedArticle.summary && (
                <div className="summary mb-3 p-3 bg-light rounded">
                  <strong>Tóm tắt:</strong> {selectedArticle.summary}
                </div>
              )}
              
              <div className="content mb-4">
                <h6>Nội dung:</h6>
                <div className="p-2" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedArticle.content}
                </div>
              </div>
              
              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="tags mb-3">
                  <h6>Thẻ:</h6>
                  <div>
                    {selectedArticle.tags.map((tag, index) => (
                      <Badge key={index} bg="secondary" className="me-1 mb-1" style={{
                        background: 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)',
                        color: 'white'
                      }}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="metadata mt-4 pt-3 border-top">
                <small className="text-muted">
                  <strong>ID bài viết:</strong> {selectedArticle.id}<br />
                  <strong>ID tác giả:</strong> {selectedArticle.memberId || 'N/A'}<br />
                  <strong>Tên tác giả:</strong> {selectedArticle.author || 'N/A'}<br />
                  <strong>Tên thành viên:</strong> {selectedArticle.memberName || 'N/A'}
                </small>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted">Không tìm thấy thông tin bài viết</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
          {selectedArticle && canEditDelete(selectedArticle) && (
            <Button 
              variant="warning" 
              onClick={() => {
                setShowDetailModal(false);
                handleEditArticle(selectedArticle);
              }}
            >
              <i className="fas fa-edit me-1"></i> Chỉnh sửa
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="delete-modal-header">
          <Modal.Title>
            <i className="fas fa-exclamation-triangle me-2"></i>
            Xác nhận xóa bài viết
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <i className="fas fa-trash-alt fa-3x text-danger mb-3"></i>
          </div>
          <p className="text-center mb-3">Bạn có chắc chắn muốn xóa bài viết "{selectedArticle?.title}"?</p>
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <strong>Lưu ý:</strong> Hành động này không thể hoàn tác.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            <i className="fas fa-times me-1"></i>
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmDeleteArticle}>
            <i className="fas fa-trash me-1"></i>
            Xóa bài viết
          </Button>
        </Modal.Footer>
      </Modal>

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
