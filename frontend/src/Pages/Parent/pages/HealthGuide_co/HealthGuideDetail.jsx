import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./HealthGuideDetail.css";
import HealthGuideService from "../../../../services/HealthGuideService";

const HealthGuideDetail = () => {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug logs
  console.log("🏥 HealthGuideDetail component loaded");
  console.log("🏥 Article ID from params:", articleId);
  console.log("🏥 Current states:", { article, isLoading, error });

  useEffect(() => {
    const fetchArticleDetails = async () => {
      try {
        console.log("🏥 Starting to fetch article details for ID:", articleId);
        setIsLoading(true);
        setError(null);

        // Fetch article details
        console.log("🏥 Calling HealthGuideService.getArticleById...");
        const articleData = await HealthGuideService.getArticleById(articleId);
        console.log("✅ Article data received:", articleData);

        const currentArticle = articleData.article || articleData;
        console.log("✅ Current article processed:", currentArticle);
        setArticle(currentArticle);

        // Fetch related articles if we have a category
        if (currentArticle && currentArticle.category) {
          console.log(
            "🔗 Fetching related articles for category:",
            currentArticle.category
          );
          const related = await HealthGuideService.getRelatedArticles(
            articleId,
            currentArticle.category,
            3
          );
          console.log("✅ Related articles:", related);
          setRelatedArticles(related);
        }
      } catch (err) {
        console.error("❌ Error loading article:", err);
        console.error("❌ Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        setError("Đã xảy ra lỗi khi tải bài viết. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
        // Scroll to top when article changes
        // Remove scroll to prevent conflicts with layout
        console.log("🏥 Fetch article completed");
      }
    };

    if (articleId) {
      fetchArticleDetails();
    } else {
      console.error("❌ No articleId provided");
      setError("Không tìm thấy ID bài viết");
      setIsLoading(false);
    }
  }, [articleId]);

  // Debug panel
  const debugInfo = (
    <div
      style={{
        background: "#fef3c7",
        padding: "15px",
        margin: "10px 0",
        borderRadius: "8px",
        fontSize: "14px",
        border: "1px solid #f59e0b",
      }}
    >
      <strong>🏥 HealthGuideDetail Debug Info:</strong>
      <div>
        • Article ID: <strong>{articleId || "NOT_FOUND"}</strong>
      </div>
      <div>
        • Loading: <strong>{isLoading ? "YES" : "NO"}</strong>
      </div>
      <div>
        • Error: <strong>{error || "NONE"}</strong>
      </div>
      <div>
        • Article loaded: <strong>{article ? "YES" : "NO"}</strong>
      </div>
      {article && (
        <div>
          • Article title: <strong>"{article.title}"</strong>
        </div>
      )}
      <div>
        • Related articles: <strong>{relatedArticles.length}</strong>
      </div>

      <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
        <button
          onClick={async () => {
            console.clear();
            console.log("🧪 Testing Article Detail API...");
            try {
              const testResponse = await fetch(
                `${
                  import.meta.env.VITE_BACKEND_URL
                }/api/health-articles/${articleId}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                      "authToken"
                    )}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              console.log("📡 API Response status:", testResponse.status);

              if (testResponse.ok) {
                const data = await testResponse.json();
                console.log("✅ Article API Response:", data);
                console.log("✅ Data type:", typeof data);
                console.log("✅ Article ID:", data?.id);
                console.log("✅ Article title:", data?.title);

                alert(
                  `✅ Article API Success!\n\nStatus: ${
                    testResponse.status
                  }\nArticle ID: ${data?.id}\nTitle: "${
                    data?.title
                  }"\n\nJSON Preview:\n${JSON.stringify(
                    data,
                    null,
                    2
                  ).substring(0, 300)}...`
                );
              } else {
                const errorText = await testResponse.text();
                console.error("❌ Article API Error:", errorText);
                alert(
                  `❌ Article API Error!\n\nStatus: ${testResponse.status}\n\nError: ${errorText}`
                );
              }
            } catch (error) {
              console.error("❌ Article API Test failed:", error);
              alert(`❌ Network Error!\n\n${error.message}`);
            }
          }}
          style={{
            background: "#10b981",
            color: "white",
            border: "none",
            padding: "6px 10px",
            borderRadius: "4px",
            fontSize: "11px",
            cursor: "pointer",
          }}
        >
          🧪 Test API
        </button>

        {article && (
          <button
            onClick={() => {
              console.clear();
              console.log("📋 Current Article JSON:");
              console.log(JSON.stringify(article, null, 2));

              // Tạo popup window để hiển thị JSON
              const jsonWindow = window.open(
                "",
                "_blank",
                "width=800,height=600"
              );
              jsonWindow.document.write(`
                <html>
                  <head><title>Article JSON - ID: ${articleId}</title></head>
                  <body style="font-family: monospace; padding: 20px;">
                    <h2>🏥 Article JSON Data (ID: ${articleId})</h2>
                    <h3>"${article.title}"</h3>
                    <pre style="background: #f5f5f5; padding: 15px; border-radius: 8px; overflow: auto;">${JSON.stringify(
                      article,
                      null,
                      2
                    )}</pre>
                  </body>
                </html>
              `);
            }}
            style={{
              background: "#6366f1",
              color: "white",
              border: "none",
              padding: "6px 10px",
              borderRadius: "4px",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            📋 Show JSON
          </button>
        )}
      </div>
    </div>
  );

  // Format date
  const formatDate = (dateInput) => {
    // Check if dateInput is valid
    if (!dateInput) {
      return "Chưa có ngày";
    }

    let date;

    // Handle array format from Java LocalDateTime [year, month, day, hour, minute, second, nanosecond]
    if (Array.isArray(dateInput) && dateInput.length >= 3) {
      // Note: JavaScript months are 0-indexed, but Java months are 1-indexed
      const [year, month, day] = dateInput;
      date = new Date(year, month - 1, day);
    } else {
      // Handle string format
      date = new Date(dateInput);
    }

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Ngày không hợp lệ";
    }

    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("vi-VN", options);
  };

  // Estimated reading time
  const estimateReadingTime = (content) => {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const textLength = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const readingTime = Math.ceil(textLength / wordsPerMinute);
    return readingTime;
  };

  const readingTime = article ? estimateReadingTime(article.content) : 1;

  // Debug mode flag - set to true only when needed for debugging
  const isDebugMode = false;

  return (
    <div className="parent-content-wrapper">
      <div className="article-detail-container">
        {/* Debug Info - only show in debug mode */}
        {isDebugMode && debugInfo}

        {isLoading ? (
          <div className="loading-container article-loading">
            <div className="spinner-container">
              <div className="spinner-border"></div>
            </div>
            <p>Đang tải bài viết...</p>
          </div>
        ) : error || !article ? (
          <div className="article-not-found">
            <i className="fas fa-exclamation-triangle"></i>
            <h2>Không tìm thấy bài viết</h2>
            <p>
              {error ||
                "Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."}
            </p>
            <div style={{ margin: "20px 0" }}>
              <p>
                <strong>Debug Info:</strong>
              </p>
              <ul style={{ textAlign: "left", display: "inline-block" }}>
                <li>Article ID: {articleId}</li>
                <li>Error: {error || "No specific error"}</li>
                <li>URL: {window.location.href}</li>
              </ul>
            </div>
            <Link to="/parent/health-guide" className="btn-back">
              <i className="fas fa-arrow-left"></i> Quay lại trang Cẩm nang
            </Link>
          </div>
        ) : (
          // Render article content normally
          <>
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
                      <div
                        key={relatedArticle.id}
                        className="related-article-card"
                      >
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
          </>
        )}
      </div>
    </div>
  );
};

export default HealthGuideDetail;
