import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../shared/header-fix.css";
import "../shared/Search.css"; // Giữ cái này cho các thành phần search khác
import "./HealthGuide.css";
import SearchBox from "../../../../components/SearchBox/SearchBox"; // Import SearchBox component
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import HealthGuideService from "../../../../services/HealthGuideService";

// Danh mục bài viết
export const CATEGORIES = [
  { id: "all", name: "Tất cả bài viết" },
  { id: "Phòng ngừa bệnh", name: "Phòng ngừa bệnh" },
  { id: "Dinh dưỡng học đường", name: "Dinh dưỡng học đường" },
  { id: "Sơ cấp cứu", name: "Sơ cấp cứu" },
  { id: "Sức khỏe tâm thần", name: "Sức khỏe tâm thần" },
  { id: "Vệ sinh học đường", name: "Vệ sinh học đường" },
];

const ARTICLES_PER_PAGE = 10; // Số bài viết mỗi trang

const HealthGuide = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Thêm state quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [displayedArticles, setDisplayedArticles] = useState([]);

  // Fetch articles from API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await HealthGuideService.getAllArticles();
        setArticles(data);
        setFilteredArticles(data);
      } catch (err) {
        setError("Không thể tải dữ liệu bài viết. Vui lòng thử lại sau.");
        console.error("Error fetching health articles:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Filter articles based on category and search term
  useEffect(() => {
    let filtered = articles;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (article) => article.category === selectedCategory
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(term) ||
          article.summary.toLowerCase().includes(term) ||
          article.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    setFilteredArticles(filtered);

    // Reset về trang đầu tiên khi thay đổi bộ lọc
    setCurrentPage(1);

    // Tính tổng số trang
    const calculatedTotalPages = Math.ceil(filtered.length / ARTICLES_PER_PAGE);
    setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
  }, [selectedCategory, searchTerm, articles]);

  // Cập nhật bài viết hiển thị dựa trên trang hiện tại
  useEffect(() => {
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    const endIndex = startIndex + ARTICLES_PER_PAGE;
    setDisplayedArticles(filteredArticles.slice(startIndex, endIndex));

    // Cuộn lên đầu khi chuyển trang
    // Remove scroll to prevent conflicts with layout
  }, [currentPage, filteredArticles]);

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search submission
  const handleSearch = () => {
    // Đã được xử lý tự động trong useEffect khi searchTerm thay đổi
    console.log("Searching for:", searchTerm);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="parent-content-wrapper">
      <div className="health-guide-container">
        <div className="health-guide-header">
          <div className="health-guide-header-content">
            <h1>Cẩm nang y tế học đường</h1>
            <p>
              Tài liệu và hướng dẫn y tế từ đội ngũ y tá và bác sĩ của nhà
              trường
            </p>
          </div>
        </div>

        <div className="health-guide-content">
          <aside className="health-guide-sidebar">
            {/* Sử dụng component SearchBox thay vì mã HTML trực tiếp */}
            <SearchBox
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
            />

            <div className="category-filter">
              <h3>Danh mục</h3>
              <ul>
                {CATEGORIES.map((category) => (
                  <li key={category.id}>
                    <button
                      className={
                        selectedCategory === category.id ? "active" : ""
                      }
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="recent-posts">
              <h3>Bài viết mới nhất</h3>
              <ul>
                {articles.slice(0, 3).map((article) => (
                  <li key={article.id}>
                    <Link to={`/parent/health-guide/${article.id}`}>
                      <div className="recent-post-image">
                        <img src={article.imageUrl} alt={article.title} />
                      </div>
                      <div className="recent-post-content">
                        <h4>{article.title}</h4>
                        <span className="post-date">
                          {formatDate(article.publishDate)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <main className="health-guide-articles">
            <div className="articles-header">
              <h2>
                {selectedCategory === "all"
                  ? "Tất cả bài viết"
                  : CATEGORIES.find((cat) => cat.id === selectedCategory)?.name}
              </h2>
              <p>
                {filteredArticles.length} bài viết được tìm thấy
                {searchTerm && ` cho "${searchTerm}"`}
                {filteredArticles.length > ARTICLES_PER_PAGE &&
                  ` (Trang ${currentPage}/${totalPages})`}
              </p>
            </div>

            {isLoading ? (
              <LoadingSpinner text="Đang tải bài viết..." />
            ) : error ? (
              <div className="error-message">
                <i className="fas fa-exclamation-triangle"></i>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>
                  Thử lại
                </button>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <p>Không tìm thấy bài viết phù hợp</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                >
                  Xem tất cả bài viết
                </button>
              </div>
            ) : (
              <>
                <div className="articles-grid">
                  {displayedArticles.map((article) => (
                    <div key={article.id} className="article-card">
                      <div className="article-image">
                        <img src={article.imageUrl} alt={article.title} />
                      </div>
                      <div className="article-content">
                        <div className="article-meta">
                          <span className="article-category">
                            {article.category}
                          </span>
                          <span className="article-date">
                            {formatDate(article.publishDate)}
                          </span>
                        </div>
                        <h3 className="article-title">
                          <Link to={`/parent/health-guide/${article.id}`}>
                            {article.title}
                          </Link>
                        </h3>
                        <div className="article-footer">
                          <div className="article-author">
                            <i className="fas fa-user-md"></i>
                            <span>{article.author}</span>
                          </div>
                          <Link
                            to={`/parent/health-guide/${article.id}`}
                            className="read-more"
                          >
                            Xem thêm <i className="fas fa-arrow-right"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Thêm phân trang */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <i className="fas fa-chevron-left"></i> Trang trước
                    </button>

                    <div className="pagination-info">
                      {/* Hiển thị số trang */}
                      <div className="pagination-pages">
                        {Array.from({ length: totalPages }, (_, index) => {
                          const pageNumber = index + 1;
                          // Hiển thị các trang xung quanh trang hiện tại
                          if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 1 &&
                              pageNumber <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                                className={`page-number ${
                                  currentPage === pageNumber ? "active" : ""
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          } else if (
                            pageNumber === currentPage - 2 ||
                            pageNumber === currentPage + 2
                          ) {
                            return (
                              <span key={pageNumber} className="page-ellipsis">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>

                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Trang sau <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default HealthGuide;
