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
   * 1. Lấy danh sách bài đăng có phân trang
   * GET /community/posts?page=1&size=10
   */
  getPosts: async (page = 1, size = 10, category = null, search = null) => {
    try {
      let url = `${API_URL}/community/posts?page=${page}&size=${size}`;
      
      // Thêm tham số lọc nếu có
      if (category) url += `&category=${encodeURIComponent(category)}`;
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
   * 2. Tạo bài đăng mới
   * POST /community/posts
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
   * 3. Lấy chi tiết một bài đăng
   * GET /community/posts/{postId}
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
   * 4. Like/unlike một bài đăng
   * POST /community/posts/{postId}/like
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
   * 5. Lấy bình luận của một bài đăng
   * GET /community/posts/{postId}/comments?page=1&size=10
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
   * 5. Thêm bình luận mới cho bài đăng
   * POST /community/posts/{postId}/comments
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
   * 6. Cập nhật bình luận
   * PUT /community/comments/{commentId}
   */
  updateComment: async (commentId, content) => {
    try {
      const response = await axios.put(
        `${API_URL}/community/comments/${commentId}`,
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
      console.error(`Error updating comment ${commentId}:`, error);
      throw error;
    }
  },

  /**
   * 7. Xóa bình luận
   * DELETE /community/comments/{commentId}
   */
  deleteComment: async (commentId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/community/comments/${commentId}`,
        {
          headers: getAuthHeader()
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error deleting comment ${commentId}:`, error);
      throw error;
    }
  },

  /**
   * 8. Toggle like cho bình luận
   * POST /community/comments/{commentId}/like
   */
  toggleCommentLike: async (commentId) => {
    try {
      const response = await axios.post(
        `${API_URL}/community/comments/${commentId}/like`,
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
   * 9. Tạo phản hồi cho bình luận
   * POST /community/comments/{commentId}/replies
   */
  addReply: async (commentId, content) => {
    try {
      const response = await axios.post(
        `${API_URL}/community/comments/${commentId}/replies`,
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
      console.error(`Error adding reply to comment ${commentId}:`, error);
      throw error;
    }
  },

  /**
   * 10. Toggle like cho phản hồi bình luận
   * POST /community/replies/{replyId}/like
   */
  toggleReplyLike: async (replyId) => {
    try {
      const response = await axios.post(
        `${API_URL}/community/replies/${replyId}/like`,
        {},
        {
          headers: getAuthHeader()
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error toggling like for reply ${replyId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phản hồi của bình luận
   * GET /community/comments/{commentId}/replies?page=1&size=10
   */
  getReplies: async (commentId, page = 1, size = 10) => {
    try {
      const response = await axios.get(
        `${API_URL}/community/comments/${commentId}/replies?page=${page}&size=${size}`,
        {
          headers: getAuthHeader()
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching replies for comment ${commentId}:`, error);
      throw error;
    }
  },

  /**
   * Cập nhật phản hồi
   * PUT /community/replies/{replyId}
   */
  updateReply: async (replyId, content) => {
    try {
      const response = await axios.put(
        `${API_URL}/community/replies/${replyId}`,
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
      console.error(`Error updating reply ${replyId}:`, error);
      throw error;
    }
  },

  /**
   * Xóa phản hồi
   * DELETE /community/replies/{replyId}
   */
  deleteReply: async (replyId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/community/replies/${replyId}`,
        {
          headers: getAuthHeader()
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error deleting reply ${replyId}:`, error);
      throw error;
    }
  },

  /**
   * Ghim/bỏ ghim bài viết
   * POST /community/posts/{postId}/bookmark
   */
  toggleBookmark: async (postId) => {
    try {
      const response = await axios.post(
        `${API_URL}/community/posts/${postId}/bookmark`,
        {},
        {
          headers: getAuthHeader()
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error toggling bookmark for post ${postId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách bài viết đã ghim
   * GET /community/posts/bookmarked
   */
  getBookmarkedPosts: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/community/posts/bookmarked`,
        {
          headers: getAuthHeader()
        }
      );
      
      return response.data;
    } catch (error) {
      console.error("Error fetching bookmarked posts:", error);
      throw error;
    }
  }
};

export default communityService;