import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

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
      console.log("🏥 Fetching health articles from API:", `${BASE_URL}/health-articles`);
      
      const response = await axios.get(`${BASE_URL}/health-articles`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("✅ Health articles response:", response);
      console.log("✅ Health articles data:", response.data);
      console.log("🔍 Response structure analysis:");
      console.log("- response.data type:", typeof response.data);
      console.log("- response.data is array:", Array.isArray(response.data));
      console.log("- response.data length:", response.data?.length);
      
      // API trả về array trực tiếp
      if (Array.isArray(response.data)) {
        console.log("📄 Using direct array structure, length:", response.data.length);
        return response.data;
      }
      
      console.warn("⚠️ Unexpected API response structure, returning empty array");
      console.warn("⚠️ Full response for debugging:", JSON.stringify(response.data, null, 2));
      return [];
      
    } catch (error) {
      console.error("❌ Error fetching health articles:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
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
      console.log("🏥 Fetching article by ID:", articleId);
      
      const response = await axios.get(`${BASE_URL}/health-articles/${articleId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("✅ Article detail response:", response.data);
      console.log("🔍 Article response analysis:");
      console.log("- response.data type:", typeof response.data);
      console.log("- response.data.id:", response.data?.id);
      console.log("- response.data.title:", response.data?.title);
      
      // API trả về object trực tiếp
      if (response.data && response.data.id) {
        console.log("📄 Using direct object structure");
        return { article: response.data };
      }
      
      throw new Error("Invalid article data received");
      
    } catch (error) {
      console.error(`❌ Error fetching article with ID ${articleId}:`, error);
      
      // Thử tìm trong danh sách tất cả articles
      try {
        console.log("🔄 Fallback: searching in all articles");
        const allArticles = await HealthGuideService.getAllArticles();
        const article = allArticles.find(a => a.id == articleId);
        
        if (article) {
          console.log("✅ Found article in list:", article.title);
          return { article };
        }
      } catch (fallbackError) {
        console.error("❌ Fallback also failed:", fallbackError);
      }
      
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
        .filter(article => article.id != currentArticleId && article.category === category)
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
        article.title?.toLowerCase().includes(term) ||
        article.summary?.toLowerCase().includes(term) ||
        article.content?.toLowerCase().includes(term) ||
        (article.tags && article.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    } catch (error) {
      console.error(`Error searching articles with term "${searchTerm}":`, error);
      throw error;
    }
  }
};

export default HealthGuideService;