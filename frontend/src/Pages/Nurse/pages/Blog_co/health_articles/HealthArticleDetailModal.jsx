import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Spinner, Badge } from 'react-bootstrap';
import './HealthArticleDetailModal.css';

const HealthArticleDetailModal = ({
  show,
  onHide,
  selectedArticle,
  detailLoading,
  currentUser,
  getAuthorDisplayName,
  formatDate,
  canEditDelete,
  handleEditArticle
}) => {
  // Manage body scroll when modal is open
  useEffect(() => {
    if (show) {
      document.body.classList.add('health-article-detail-modal-open');
    } else {
      document.body.classList.remove('health-article-detail-modal-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('health-article-detail-modal-open');
    };
  }, [show]);

  if (!show) return null;

  const modalContent = (
    <div className="health-article-detail-modal-overlay" onClick={onHide}>
      <div className="health-article-detail-modal-dialog">
        <div className="health-article-detail-modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="health-article-detail-modal-header">
              <h5 className="health-article-detail-modal-title" style={{color: 'white'}}>
                <i className="fas fa-file-medical health-article-detail-me-2" style={{color: 'white'}}></i>
                Chi tiết bài viết y tế
              </h5>
              <button
                type="button"
                className="health-article-detail-btn-close"
                onClick={onHide}
                aria-label="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="health-article-detail-modal-body">
              {detailLoading ? (
                <div className="health-article-detail-loading-container">
                  <Spinner
                    animation="border"
                    variant="primary"
                    className="health-article-detail-loading-spinner"
                  />
                  <p className="health-article-detail-loading-text">
                    Đang tải chi tiết bài viết...
                  </p>
                </div>
              ) : selectedArticle ? (
                <div className="health-article-detail-article-detail-content">
                  {selectedArticle.imageUrl && (
                    <div className="health-article-detail-article-image-container">
                      <img
                        src={selectedArticle.imageUrl}
                        alt={selectedArticle.title}
                        className="health-article-detail-article-image"
                        onError={(e) => {e.target.style.display = 'none'}}
                      />
                    </div>
                  )}

                  <div className="health-article-detail-article-content-wrapper">
                    <h3 className="health-article-detail-article-title">
                      {selectedArticle.title}
                    </h3>

                    {/* <div className="article-meta-container">
                      <div className="meta-header">
                        <div className="author-section">
                          <div className="author-avatar">
                            <i className="fas fa-user-md"></i>
                          </div>
                          <div className="author-info">
                            <div className="author-name">
                              {getAuthorDisplayName(selectedArticle, currentUser)}
                            </div>
                          </div>
                        </div>

                        <Badge className="category-badge">
                          <i className="fas fa-stethoscope me-2"></i>
                          {selectedArticle.category || 'Chưa phân loại'}
                        </Badge>
                      </div>

                      <div className="meta-footer">
                        <div className="info-item">
                          <i className="fas fa-eye me-2"></i>
                          <span>Bài viết y tế chuyên nghiệp</span>
                        </div>
                        <div className="verified-item">
                          <i className="fas fa-shield-alt me-2"></i>
                          <span>Đã xác thực</span>
                        </div>
                      </div>
                    </div> */}

                    {selectedArticle.summary && (
                      <div className="health-article-detail-summary-section">
                        <div className="health-article-detail-summary-header">
                          <i className="fas fa-lightbulb health-article-detail-me-2"></i>
                          Tóm tắt nội dung
                        </div>
                        <div className="health-article-detail-summary-content">
                          {selectedArticle.summary}
                        </div>
                      </div>
                    )}

                    <div className="health-article-detail-content-section">
                      <div className="health-article-detail-content-header">
                        <i className="fas fa-file-text health-article-detail-me-2"></i>
                        Nội dung chi tiết
                      </div>
                      <div className="health-article-detail-content-body">
                        {selectedArticle.content}
                      </div>
                    </div>

                    {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                      <div className="health-article-detail-tags-section">
                        <div className="health-article-detail-tags-header">
                          <i className="fas fa-tags health-article-detail-me-2"></i>
                          Thẻ bài viết
                        </div>
                        <div className="health-article-detail-tags-container">
                          {selectedArticle.tags.map((tag, index) => (
                            <Badge key={index} className="health-article-detail-tag-badge">
                              <i className="fas fa-hashtag health-article-detail-me-1"></i>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="health-article-detail-metadata-section">
                      <div className="health-article-detail-metadata-header">
                        <i className="fas fa-info-circle health-article-detail-me-2"></i>
                        Thông tin bài viết
                      </div>
                      <div className="health-article-detail-metadata-grid">
                        <div className="health-article-detail-metadata-item">
                          <strong>ID bài viết:</strong> {selectedArticle.id}
                        </div>
                        <div className="health-article-detail-metadata-item">
                          <strong>ID tác giả:</strong> {selectedArticle.memberId || 'N/A'}
                        </div>
                        <div className="health-article-detail-metadata-item">
                          <strong>Tên tác giả:</strong> {selectedArticle.author || 'N/A'}
                        </div>
                        <div className="health-article-detail-metadata-item">
                          <strong>Tên thành viên:</strong> {selectedArticle.memberName || 'N/A'}
                        </div>
                        <div className="health-article-detail-metadata-item">
                          <strong>Ngày đăng: </strong>
                          <span className="health-article-detail-publish-date-info">
                            {/* <i className="fas fa-clock me-2"></i> */}
                            {formatDate(selectedArticle.publishDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="health-article-detail-no-data-container">
                  <i className="fas fa-exclamation-triangle"></i>
                  <p>Không tìm thấy thông tin bài viết</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="health-article-detail-modal-footer">
              <button
                type="button"
                className="health-article-detail-btn health-article-detail-btn-secondary"
                onClick={onHide}
              >
                <i className="fas fa-times health-article-detail-me-1"></i>
                Đóng
              </button>
              {selectedArticle && canEditDelete(selectedArticle) && (
                <button
                  type="button"
                  className="health-article-detail-btn health-article-detail-btn-primary"
                  onClick={() => {
                    onHide();
                    handleEditArticle(selectedArticle);
                  }}
                >
                  <i className="fas fa-edit health-article-detail-me-1"></i>
                  Chỉnh sửa
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
  );

  return createPortal(modalContent, document.body);
};

export default HealthArticleDetailModal;
