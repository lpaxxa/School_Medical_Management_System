import axios from "axios";

const BASE_URL = "http://localhost:8080";

/**
 * Service quản lý các API liên quan đến Health Guide (Cẩm nang y tế)
 */
const HealthGuideService = {
  /**
   * Lấy danh sách tất cả bài viết y tế
   * @returns {Promise} Promise chứa dữ liệu trả về từ API
   */
  getAllArticles: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/health-articles`);
      return response.data;
    } catch (error) {
      console.error("Error fetching health articles:", error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết bài viết theo ID
   * @param {string|number} articleId - ID của bài viết cần lấy chi tiết
   * @returns {Promise} Promise chứa dữ liệu chi tiết bài viết
   */
  getArticleById: async (articleId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/health-articles/${articleId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching article with ID ${articleId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy bài viết theo danh mục
   * @param {string} category - Danh mục cần lọc
   * @returns {Promise} Promise chứa danh sách bài viết theo danh mục
   */
  getArticlesByCategory: async (category) => {
    try {
      const allArticles = await HealthGuideService.getAllArticles();
      return allArticles.filter(article => article.category === category);
    } catch (error) {
      console.error(`Error fetching articles for category ${category}:`, error);
      throw error;
    }
  },

  /**
   * Lấy các bài viết liên quan (cùng danh mục, không bao gồm bài viết hiện tại)
   * @param {string|number} currentArticleId - ID của bài viết hiện tại
   * @param {string} category - Danh mục của bài viết hiện tại
   * @param {number} limit - Số lượng bài viết liên quan cần lấy
   * @returns {Promise} Promise chứa danh sách bài viết liên quan
   */
  getRelatedArticles: async (currentArticleId, category, limit = 3) => {
    try {
      const allArticles = await HealthGuideService.getAllArticles();
      return allArticles
        .filter(article => article.id !== parseInt(currentArticleId) && article.category === category)
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching related articles:", error);
      throw error;
    }
  },

  /**
   * Tìm kiếm bài viết theo từ khóa
   * @param {string} searchTerm - Từ khóa tìm kiếm
   * @returns {Promise} Promise chứa danh sách bài viết phù hợp với từ khóa
   */
  searchArticles: async (searchTerm) => {
    try {
      const allArticles = await HealthGuideService.getAllArticles();
      const term = searchTerm.toLowerCase();
      
      return allArticles.filter(article => 
        article.title.toLowerCase().includes(term) ||
        article.summary.toLowerCase().includes(term) ||
        article.content.toLowerCase().includes(term) ||
        article.tags.some(tag => tag.toLowerCase().includes(term))
      );
    } catch (error) {
      console.error(`Error searching articles with term "${searchTerm}":`, error);
      throw error;
    }
  }
};

export default HealthGuideService;