import axios from "axios";

const API_URL = "http://localhost:8080/api/v1";

// Hàm trợ giúp để lấy token xác thực
const getAuthHeader = () => {
  const token = localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${token}`
  };
};

const communityService = {
  /**
   * Lấy danh sách bài đăng có phân trang
   * @param {number} page - Trang hiện tại (bắt đầu từ 1)
   * @param {number} size - Số lượng bài đăng mỗi trang
   * @param {string} category - Danh mục để lọc (tùy chọn)
   * @param {string} search - Từ khóa tìm kiếm (tùy chọn)
   */
  getPosts: async (page = 1, size = 10, category = null, search = null) => {
    try {
      let url = `${API_URL}/community/posts?page=${page}&size=${size}`;
      
      // Thêm tham số lọc nếu có
      if (category) url += `&category=${category}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      const response = await axios.get(url, {
        headers: getAuthHeader()
      });
      
      return response.data;
    } catch (error) {
      console.error("Error fetching community posts:", error);
      throw error;
    }
  },
  
  /**
   * Lấy chi tiết một bài đăng
   * @param {number} postId - ID của bài đăng
   */
  getPostDetail: async (postId) => {
    try {
      const response = await axios.get(`${API_URL}/community/posts/${postId}`, {
        headers: getAuthHeader()
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching post ${postId} detail:`, error);
      throw error;
    }
  },
  
  /**
   * Tạo bài đăng mới
   * @param {object} postData - Dữ liệu bài đăng mới
   */
  createPost: async (postData) => {
    try {
      const response = await axios.post(`${API_URL}/community/posts`, postData, {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json"
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },
  
  /**
   * Like/unlike một bài đăng
   * @param {number} postId - ID của bài đăng
   */
  toggleLike: async (postId) => {
    try {
      const response = await axios.post(
        `${API_URL}/community/posts/${postId}/like`,
        {}, // Body rỗng
        {
          headers: getAuthHeader()
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error toggling like for post ${postId}:`, error);
      throw error;
    }
  },
  
  /**
   * Lấy thông tin về lượt like của bài đăng
   * @param {number} postId - ID của bài đăng
   */
  getLikeInfo: async (postId) => {
    try {
      const response = await axios.get(
        `${API_URL}/community/posts/${postId}/like`,
        {
          headers: getAuthHeader()
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error getting likes for post ${postId}:`, error);
      throw error;
    }
  },
  
  /**
   * Lấy bình luận của một bài đăng
   * @param {number} postId - ID của bài viết
   * @param {number} page - Số trang
   * @param {number} size - Số lượng bình luận mỗi trang
   */
  getComments: async (postId, page = 1, size = 10) => {
    try {
      const response = await axios.get(
        `${API_URL}/community/posts/${postId}/comments?page=${page}&size=${size}`,
        {
          headers: getAuthHeader()
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      throw error;
    }
  },

  /**
   * Thêm bình luận mới cho bài đăng
   * @param {number} postId - ID của bài viết
   * @param {string} content - Nội dung bình luận
   */
  addComment: async (postId, content) => {
    try {
      const response = await axios.post(
        `${API_URL}/community/posts/${postId}/comments`,
        { content },
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error adding comment to post ${postId}:`, error);
      throw error;
    }
  },

  /**
   * Toggle like cho bình luận
   * @param {number} postId - ID của bài đăng
   * @param {number} commentId - ID của bình luận
   */
  toggleCommentLike: async (postId, commentId) => {
    try {
      const response = await axios.post(
        `${API_URL}/community/posts/${postId}/comments/${commentId}/like`,
        {},
        {
          headers: getAuthHeader()
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error toggling like for comment ${commentId}:`, error);
      throw error;
    }
  },

  /**
   * Xóa bình luận
   * @param {number} postId - ID của bài đăng
   * @param {number} commentId - ID của bình luận
   */
  deleteComment: async (postId, commentId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/community/posts/${postId}/comments/${commentId}`,
        {
          headers: getAuthHeader()
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error deleting comment ${commentId}:`, error);
      throw error;
    }
  }
};

export default communityService;