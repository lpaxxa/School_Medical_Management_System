import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./HealthGuideDetail.css";
import { CATEGORIES } from "./HealthGuide";
import HealthGuideService from "../../../../services/HealthGuideService";

const HealthGuideDetail = () => {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticleDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch article details
        const articleData = await HealthGuideService.getArticleById(articleId);
        const currentArticle = articleData.article;
        setArticle(currentArticle);

        // Fetch related articles if we have a category
        if (currentArticle && currentArticle.category) {
          const related = await HealthGuideService.getRelatedArticles(
            articleId,
            currentArticle.category,
            3
          );
          setRelatedArticles(related);
        }
      } catch (err) {
        console.error("Error loading article:", err);
        setError("Đã xảy ra lỗi khi tải bài viết. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
        // Scroll to top when article changes
        window.scrollTo(0, 0);
      }
    };

    fetchArticleDetails();
  }, [articleId]);

  // Hiển thị loading spinner
  if (isLoading) {
    return (
      <div className="loading-container article-loading">
        <div className="spinner-container">
          <div className="spinner-border"></div>
        </div>
        <p>Đang tải bài viết...</p>
      </div>
    );
  }

  // Hiển thị thông báo lỗi
  if (error || !article) {
    return (
      <div className="article-not-found">
        <i className="fas fa-exclamation-triangle"></i>
        <h2>Không tìm thấy bài viết</h2>
        <p>
          {error || "Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."}
        </p>
        <Link to="/parent/health-guide" className="btn-back">
          <i className="fas fa-arrow-left"></i> Quay lại trang Cẩm nang
        </Link>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  // Estimated reading time
  const estimateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const textLength = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const readingTime = Math.ceil(textLength / wordsPerMinute);
    return readingTime;
  };

  const readingTime = estimateReadingTime(article.content);

  return (
    <div className="article-detail-container">
      <div className="article-detail-header">
        <Link to="/parent/health-guide" className="btn-back">
          <i className="fas fa-arrow-left"></i> Quay lại danh sách
        </Link>
        <div className="article-meta">
          <span className="article-category">
            <i className="fas fa-folder"></i>
            {article.category || "Chưa phân loại"}
          </span>
          <span className="article-date">
            <i className="far fa-calendar-alt"></i>
            {formatDate(article.publishDate)}
          </span>
          <span className="article-reading-time">
            <i className="far fa-clock"></i>
            {readingTime} phút đọc
          </span>
        </div>
        <h1 className="article-title">{article.title}</h1>
        <div className="article-author">
          <i className="fas fa-user-md"></i>
          <span>Tác giả: {article.author}</span>
        </div>
      </div>

      <div className="article-detail-content">
        <div className="article-main-image">
          <img src={article.imageUrl} alt={article.title} />
        </div>

        <div className="article-summary">
          <p>{article.summary}</p>
        </div>

        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: article.content }}
        ></div>

        <div className="article-tags">
          <h4>Từ khóa:</h4>
          <div className="tags-list">
            {article.tags.map((tag, index) => (
              <span key={index} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {relatedArticles.length > 0 && (
          <div className="related-articles">
            <h3>Bài viết liên quan</h3>
            <div className="related-articles-grid">
              {relatedArticles.map((relatedArticle) => (
                <div key={relatedArticle.id} className="related-article-card">
                  <Link to={`/parent/health-guide/${relatedArticle.id}`}>
                    <div className="related-article-image">
                      <img
                        src={relatedArticle.imageUrl}
                        alt={relatedArticle.title}
                      />
                    </div>
                    <div className="related-article-content">
                      <h4>{relatedArticle.title}</h4>
                      <p className="related-summary">
                        {relatedArticle.summary.substring(0, 80)}...
                      </p>
                      <div className="related-meta">
                        <span className="related-article-date">
                          <i className="far fa-calendar-alt"></i>
                          {formatDate(relatedArticle.publishDate)}
                        </span>
                        <span className="related-article-category">
                          {relatedArticle.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthGuideDetail;
