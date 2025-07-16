import React from "react";
import {
  FaTimes,
  FaUser,
  FaCalendar,
  FaTag,
  FaHeart,
  FaComment,
  FaThumbtack,
  FaBook,
  FaNewspaper,
} from "react-icons/fa";
import "./ArticleModal.css";

const ArticleModal = ({ article, mode, type, onClose, onSave }) => {
  if (!article) return null;

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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isHealthArticle = type === "health-articles";
  const isBlog = type === "blog";

  return (
    <div className="admin-article-modal-overlay">
      <div className="admin-article-modal">
        {/* Header */}
        <div className="admin-article-modal-header">
          <div className="admin-modal-title">
            {isHealthArticle && <FaBook />}
            {isBlog && <FaNewspaper />}
            <h2>
              {mode === "view"
                ? "Chi tiết bài viết"
                : mode === "add"
                ? "Thêm bài viết mới"
                : "Chỉnh sửa bài viết"}
            </h2>
          </div>
          <button className="admin-modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="admin-article-modal-content">
          {/* Article Image */}
          {article.imageUrl && (
            <div className="admin-modal-image">
              <img
                src={article.imageUrl}
                alt={article.title}
                onError={(e) => {
                  e.target.src = "/images/default-article.jpg";
                }}
              />
            </div>
          )}

          {/* Article Info */}
          <div className="admin-modal-info">
            <h1 className="admin-modal-article-title">{article.title}</h1>

            {/* Meta Information */}
            <div className="admin-modal-meta">
              <div className="admin-modal-meta-row">
                <div className="admin-meta-item">
                  <FaUser />
                  <span>
                    {isHealthArticle
                      ? article.author
                      : article.author?.name || "N/A"}
                  </span>
                  {isBlog && article.author?.role && (
                    <span className="admin-role-badge">
                      {article.author.role}
                    </span>
                  )}
                </div>

                <div className="admin-meta-item">
                  <FaCalendar />
                  <span>
                    {formatDate(
                      isHealthArticle ? article.publishDate : article.createdAt
                    )}
                  </span>
                </div>
              </div>

              <div className="admin-modal-meta-row">
                <div className="admin-meta-item">
                  <FaTag />
                  <span className="admin-category-tag">{article.category}</span>
                </div>

                {isBlog && (
                  <>
                    {article.pinned && (
                      <div className="admin-meta-item">
                        <FaThumbtack />
                        <span className="admin-pinned-text">
                          Bài viết được ghim
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {isBlog && (
                <div className="admin-modal-meta-row">
                  <div className="admin-meta-item">
                    <FaHeart />
                    <span>{article.likes} lượt thích</span>
                  </div>

                  <div className="admin-meta-item">
                    <FaComment />
                    <span>{article.commentsCount} bình luận</span>
                  </div>
                </div>
              )}
            </div>

            {/* Summary/Excerpt */}
            {(article.summary || article.excerpt) && (
              <div className="admin-modal-summary">
                <h3>Tóm tắt</h3>
                <p>{article.summary || article.excerpt}</p>
              </div>
            )}

            {/* Content */}
            <div className="admin-modal-article-content">
              <h3>Nội dung</h3>
              <div className="admin-content-text">{article.content}</div>
            </div>

            {/* Tags (for health articles) */}
            {isHealthArticle && article.tags && article.tags.length > 0 && (
              <div className="admin-modal-tags">
                <h3>Thẻ</h3>
                <div className="admin-tags-list">
                  {article.tags.map((tag, index) => (
                    <span key={index} className="admin-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info for Health Articles */}
            {isHealthArticle && (
              <div className="admin-modal-additional-info">
                <div className="admin-info-grid">
                  <div className="admin-info-item">
                    <strong>ID bài viết:</strong>
                    <span>{article.id}</span>
                  </div>
                  <div className="admin-info-item">
                    <strong>Mã thành viên:</strong>
                    <span>{article.memberId}</span>
                  </div>
                  <div className="admin-info-item">
                    <strong>Tên thành viên:</strong>
                    <span>{article.memberName}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Info for Blog */}
            {isBlog && (
              <div className="admin-modal-additional-info">
                <div className="admin-info-grid">
                  <div className="admin-info-item">
                    <strong>ID bài viết:</strong>
                    <span>{article.id}</span>
                  </div>
                  <div className="admin-info-item">
                    <strong>ID tác giả:</strong>
                    <span>{article.author?.id || "N/A"}</span>
                  </div>
                  <div className="admin-info-item">
                    <strong>Cập nhật lần cuối:</strong>
                    <span>{formatDate(article.updatedAt)}</span>
                  </div>
                  <div className="admin-info-item">
                    <strong>Trạng thái:</strong>
                    <span
                      className={`admin-status ${
                        article.pinned ? "pinned" : "normal"
                      }`}
                    >
                      {article.pinned ? "Được ghim" : "Bình thường"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="admin-article-modal-footer">
          <button className="admin-btn-close" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;
