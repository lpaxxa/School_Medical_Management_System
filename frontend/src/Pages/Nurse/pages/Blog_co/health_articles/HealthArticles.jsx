import React, { useState, useEffect } from 'react';
import SuccessNotification from './SuccessNotification';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Modal, Spinner, Nav, Pagination } from 'react-bootstrap';
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

  // Fetch health articles
  const fetchHealthArticles = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await healthArticleService.getAllHealthArticles();
      // Sắp xếp theo publishDate mới nhất trước
      const sortedArticles = (response || []).sort((a, b) => {
        const dateA = new Date(a.publishDate);
        const dateB = new Date(b.publishDate);
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
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

      {/* Search and filter */}
      <Row className="mb-4">
        <Col md={4}>
          <InputGroup>
            <InputGroup.Text>
              <i className="fas fa-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            {healthCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={5} className="text-end">
          <small className="text-muted">
            Tìm thấy {totalArticles} bài viết
            {totalArticles > 0 && (
              <> • Trang {currentPage} / {totalPages}</>
            )}
          </small>
        </Col>
      </Row>

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

          {/* Pagination */}
          {totalPages > 1 && (
            <Row className="mt-4">
              <Col className="d-flex justify-content-center">
                <Pagination>
                  <Pagination.First 
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  
                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;
                    // Show only relevant page numbers
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                    ) {
                      return (
                        <Pagination.Item
                          key={pageNumber}
                          active={pageNumber === currentPage}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </Pagination.Item>
                      );
                    } else if (
                      pageNumber === currentPage - 3 ||
                      pageNumber === currentPage + 3
                    ) {
                      return <Pagination.Ellipsis key={pageNumber} />;
                    }
                    return null;
                  })}
                  
                  <Pagination.Next 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last 
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
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
