import axios from "axios";
import sessionService from '../sessionService';

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

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
      
      const token = sessionService.getToken();
      const response = await axios.get(`${BASE_URL}/health-articles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Extend session on API activity
      if (token) {
        sessionService.extendSession();
      }
      
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
          'Authorization': `Bearer ${sessionService.getToken()}`,
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
          console.log("✅ Found article in fallback search");
          return { article };
        }
      } catch (fallbackError) {
        console.error("❌ Fallback search also failed:", fallbackError);
      }
      
      throw error;
    }
  },

  /**
   * Tìm kiếm bài viết theo từ khóa
   * @param {string} query - Từ khóa tìm kiếm
   * @returns {Promise} Promise chứa danh sách bài viết phù hợp
   */
  searchArticles: async (query) => {
    try {
      console.log("🔍 Searching articles with query:", query);
      
      const token = sessionService.getToken();
      const response = await axios.get(`${BASE_URL}/health-articles/search`, {
        params: { q: query },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Extend session on API activity
      if (token) {
        sessionService.extendSession();
      }
      
      console.log("✅ Search results:", response.data);
      
      // API trả về array trực tiếp
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Nếu không có endpoint search, fallback về client-side search
      console.log("🔄 Fallback: client-side search");
      const allArticles = await HealthGuideService.getAllArticles();
      const filteredArticles = allArticles.filter(article => 
        article.title?.toLowerCase().includes(query.toLowerCase()) ||
        article.content?.toLowerCase().includes(query.toLowerCase()) ||
        article.summary?.toLowerCase().includes(query.toLowerCase())
      );
      
      return filteredArticles;
      
    } catch (error) {
      console.error("❌ Error searching articles:", error);
      
      // Fallback to client-side search if API fails
      try {
        console.log("🔄 Fallback: client-side search due to API error");
        const allArticles = await HealthGuideService.getAllArticles();
        const filteredArticles = allArticles.filter(article => 
          article.title?.toLowerCase().includes(query.toLowerCase()) ||
          article.content?.toLowerCase().includes(query.toLowerCase()) ||
          article.summary?.toLowerCase().includes(query.toLowerCase())
        );
        
        return filteredArticles;
      } catch (fallbackError) {
        console.error("❌ Fallback search also failed:", fallbackError);
        throw error;
      }
    }
  },

  /**
   * Lấy bài viết theo danh mục
   * @param {string} category - Danh mục bài viết
   * @returns {Promise} Promise chứa danh sách bài viết theo danh mục
   */
  getArticlesByCategory: async (category) => {
    try {
      console.log("🏥 Fetching articles by category:", category);
      
      const token = sessionService.getToken();
      const response = await axios.get(`${BASE_URL}/health-articles/category/${category}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Extend session on API activity
      if (token) {
        sessionService.extendSession();
      }
      
      console.log("✅ Category articles:", response.data);
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Fallback to client-side filtering
      console.log("🔄 Fallback: client-side category filtering");
      const allArticles = await HealthGuideService.getAllArticles();
      const categoryArticles = allArticles.filter(article => 
        article.category?.toLowerCase() === category.toLowerCase()
      );
      
      return categoryArticles;
      
    } catch (error) {
      console.error("❌ Error fetching articles by category:", error);
      
      // Fallback to client-side filtering
      try {
        console.log("🔄 Fallback: client-side category filtering due to API error");
        const allArticles = await HealthGuideService.getAllArticles();
        const categoryArticles = allArticles.filter(article => 
          article.category?.toLowerCase() === category.toLowerCase()
        );
        
        return categoryArticles;
      } catch (fallbackError) {
        console.error("❌ Fallback category filtering also failed:", fallbackError);
        throw error;
      }
    }
  }
};

export default HealthGuideService;
