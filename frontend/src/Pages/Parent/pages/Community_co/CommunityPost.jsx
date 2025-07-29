import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./CommunityPost.css";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { useAuth } from "../../../../context/AuthContext";
import communityService from "../../../../services/APIParent/communityService"; // Import communityService
import sessionService from "../../../../services/sessionService";
import {
  formatDate,
  safeParseDate,
  areDatesDifferent,
} from "./utils/dateUtils"; // Import date utilities

const CommunityPost = () => {
  const { postId: postIdParam } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Convert postId từ URL parameter thành number
  const postId = parseInt(postIdParam);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentPage, setCommentPage] = useState(1); // Thêm state cho phân trang bình luận
  const [commentTotalPages, setCommentTotalPages] = useState(1); // Tổng số trang bình luận
  const [loadingComments, setLoadingComments] = useState(false); // State loading riêng cho bình luận
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showAllComments, setShowAllComments] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [relatedPosts, setRelatedPosts] = useState([]);

  // ✅ SYNC FIX: Add localStorage management like Community.jsx
  // Helper function để lấy unique key từ user info thay vì token
  const getUserStorageKey = (suffix) => {
    // Ưu tiên sử dụng currentUser.id, fallback về token, cuối cùng là guest
    if (currentUser?.id) {
      return `user_${currentUser.id}_${suffix}`;
    }

    const token = sessionService.getToken();
    if (token) {
      const tokenSuffix = token.slice(-10);
      return `token_${tokenSuffix}_${suffix}`;
    }

    return `guest_${suffix}`;
  };

  // ✅ SYNC FIX: Add likedPosts state management like Community.jsx
  const [likedPosts, setLikedPosts] = useState(() => {
    const saved = localStorage.getItem(getUserStorageKey("likedPosts"));
    return saved ? JSON.parse(saved) : [];
  });

  // States cho edit comments
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  // States cho replies
  const [showReplies, setShowReplies] = useState({});
  const [replyingToComment, setReplyingToComment] = useState(null);
  const [newReply, setNewReply] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState("");
  const [commentReplies, setCommentReplies] = useState({}); // Store replies by commentId

  // ✅ SYNC FIX: Effect để lưu trạng thái liked posts vào localStorage theo user info
  useEffect(() => {
    if (currentUser?.id || sessionService.getToken()) {
      localStorage.setItem(
        getUserStorageKey("likedPosts"),
        JSON.stringify(likedPosts)
      );
    }
  }, [likedPosts, currentUser?.id]);

  // ✅ SYNC FIX: Listen for like changes from Community.jsx
  useEffect(() => {
    const handlePostLikeChanged = (event) => {
      const { postId: eventPostId, liked, likesCount, source } = event.detail;

      // Only handle if it's for this post and from Community
      if (eventPostId === postId && source === "Community") {
        console.log("🔄 CommunityPost received postLikeChanged event:", {
          postId: eventPostId,
          liked,
          likesCount,
          source,
          currentLikedPosts: likedPosts,
        });

        // Update likedPosts state
        if (liked && !likedPosts.includes(postId)) {
          setLikedPosts((prev) => [
            ...prev.filter((id) => id !== postId),
            postId,
          ]);
        } else if (!liked && likedPosts.includes(postId)) {
          setLikedPosts((prev) => prev.filter((id) => id !== postId));
        }

        // Update post state
        setPost((prev) => (prev ? { ...prev, likes: likesCount } : prev));
      }
    };

    window.addEventListener("postLikeChanged", handlePostLikeChanged);

    return () => {
      window.removeEventListener("postLikeChanged", handlePostLikeChanged);
    };
  }, [postId, likedPosts]);

  // Lấy chi tiết bài đăng từ API
  useEffect(() => {
    const fetchPostDetail = async () => {
      // Validate postId
      if (!postId || isNaN(postId)) {
        console.error("❌ Invalid postId:", postIdParam);
        navigate("/parent/community");
        return;
      }

      setLoading(true);
      console.log("📄 Fetching post detail for ID:", postId);

      try {
        // Gọi API lấy chi tiết bài đăng
        const result = await communityService.getPostDetail(postId);
        console.log("📄 Post detail result:", result);

        if (result.status === "success") {
          setPost(result.data);

          // ✅ SYNC FIX: Check localStorage first, then API
          const isLikedInStorage = likedPosts.includes(postId);
          const isLikedFromAPI = result.data.likedByCurrentUser;

          console.log("📄 Post like state sync:", {
            postId,
            isLikedInStorage,
            isLikedFromAPI,
            likedPostsArray: likedPosts,
          });

          // ✅ SYNC FIX: Update localStorage if API has different state
          if (isLikedFromAPI && !isLikedInStorage) {
            setLikedPosts((prev) => [
              ...prev.filter((id) => id !== postId),
              postId,
            ]);
          }

          // Nếu có bài viết liên quan thì lưu vào state
          if (result.data.relatedPosts && result.data.relatedPosts.length > 0) {
            setRelatedPosts(result.data.relatedPosts);
          }
        } else {
          console.warn("⚠️ Post not found, redirecting to community");
          navigate("/parent/community");
        }
      } catch (error) {
        console.error("❌ Error fetching post detail:", error);
        console.error("❌ Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        navigate("/parent/community");
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetail();
  }, [postId, navigate, likedPosts]);

  // Lấy bình luận của bài đăng
  useEffect(() => {
    const fetchComments = async () => {
      if (!postId || isNaN(postId)) return;

      setLoadingComments(true);
      console.log(
        "💬 Fetching comments for post:",
        postId,
        "page:",
        commentPage
      );

      try {
        const result = await communityService.getComments(
          postId,
          commentPage,
          10
        );

        console.log("💬 Comments result:", result);

        if (result.status === "success") {
          // API có thể trả về comments trong nhiều structure khác nhau
          let commentsData = [];

          if (Array.isArray(result.data)) {
            // Trường hợp API trả về array trực tiếp
            commentsData = result.data;
          } else if (
            result.data.content &&
            Array.isArray(result.data.content)
          ) {
            // Trường hợp API trả về với pagination structure như posts
            commentsData = result.data.content;
            setCommentTotalPages(result.data.totalPages || 1);
          } else if (
            result.data.comments &&
            Array.isArray(result.data.comments)
          ) {
            // Trường hợp API trả về trong field comments
            commentsData = result.data.comments;
            setCommentTotalPages(
              result.data.totalPages || result.totalPages || 1
            );
          }

          console.log(
            "💬 Comments data processed:",
            commentsData.length,
            "comments"
          );
          setComments(commentsData);
        }
      } catch (error) {
        console.error("❌ Error fetching comments:", error);
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [postId, commentPage]);

  // Xử lý gửi bình luận mới
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    if (!currentUser) {
      alert("Vui lòng đăng nhập để bình luận");
      return;
    }

    setSubmittingComment(true);

    try {
      const result = await communityService.addComment(postId, newComment);

      if (result.status === "success") {
        // Thêm bình luận mới vào đầu danh sách
        setComments((prevComments) => [result.data, ...prevComments]);

        // Cập nhật số lượng bình luận trong post
        if (post) {
          setPost({
            ...post,
            commentsCount: (post.commentsCount || 0) + 1,
          });
        }

        // Xóa nội dung bình luận và reset form
        setNewComment("");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Không thể gửi bình luận. Vui lòng thử lại sau.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để thích bài viết");
      return;
    }

    // ✅ SYNC FIX: Check authentication like Community.jsx
    const token = sessionService.getToken();
    if (!token) {
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
      return;
    }

    const wasLiked = likedPosts.includes(postId);
    const currentLikeCount = post?.likes || 0;

    console.log("👍 BEFORE Like action (CommunityPost):", {
      postId,
      currentLikeCount,
      wasLiked,
      postTitle: post?.title?.substring(0, 50) + "...",
      likedPostsState: likedPosts.includes(postId),
    });

    try {
      const result = await communityService.toggleLike(postId);

      if (result.status === "success") {
        const { liked: isLiked, likesCount } = result.data;

        console.log("👍 AFTER API call (CommunityPost):", {
          isLiked,
          likesCount,
          expectedChange: wasLiked
            ? currentLikeCount - 1
            : currentLikeCount + 1,
        });

        // ✅ SYNC FIX: Update localStorage like Community.jsx
        const newLikedPosts = isLiked
          ? [...likedPosts.filter((id) => id !== postId), postId]
          : likedPosts.filter((id) => id !== postId);

        console.log("👍 Updating likedPosts (CommunityPost):", {
          before: likedPosts,
          after: newLikedPosts,
          action: isLiked ? "ADDED" : "REMOVED",
          postId: postId,
        });

        setLikedPosts(newLikedPosts);

        // Cập nhật số lượt like
        setPost((prevPost) => ({
          ...prevPost,
          likes: likesCount,
        }));

        // ✅ SYNC FIX: Dispatch custom event để thông báo cho Community.jsx
        window.dispatchEvent(
          new CustomEvent("postLikeChanged", {
            detail: {
              postId: postId,
              liked: isLiked,
              likesCount: likesCount,
              source: "CommunityPost",
            },
          })
        );

        console.log(
          `✅ ${
            isLiked ? "Đã thích" : "Đã bỏ thích"
          } bài viết thành công! Số like: ${likesCount}`
        );
      }
    } catch (error) {
      console.error("❌ Error toggling like (CommunityPost):", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        postId: postId,
        wasLiked: wasLiked,
        action: wasLiked ? "UNLIKE" : "LIKE",
      });

      // ✅ SYNC FIX: Enhanced error handling like Community.jsx
      if (error.response) {
        const status = error.response.status;

        switch (status) {
          case 401:
            alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
            break;
          case 400:
            alert("Lỗi yêu cầu không hợp lệ. Vui lòng thử lại");
            break;
          case 403:
            alert("Bạn không có quyền thực hiện thao tác này");
            break;
          case 404:
            alert("Bài viết không tồn tại hoặc đã bị xóa");
            break;
          case 500:
            alert("Lỗi server. Vui lòng thử lại sau");
            break;
          default:
            alert(`Lỗi server (${status}). Vui lòng thử lại sau`);
        }
      } else if (error.request) {
        alert("Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại");
      } else {
        alert("Có lỗi xảy ra. Vui lòng thử lại sau");
      }
    }
  };

  // Format date dưới dạng "DD thg MM, YYYY HH:MM"
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Hỏi đáp":
        return "fa-question-circle";
      case "Thông báo":
        return "fa-bullhorn";
      case "Hướng dẫn sức khỏe":
        return "fa-book-medical";
      case "Chia sẻ":
        return "fa-share-alt";
      case "Sức khỏe tâm thần":
        return "fa-brain";
      default:
        return "fa-clipboard";
    }
  };

  const getCategoryName = (category) => {
    return category || "Khác";
  };

  // Sắp xếp bình luận theo thời gian tạo
  const sortedComments =
    comments && Array.isArray(comments)
      ? [...comments].sort((a, b) => {
          const dateA = safeParseDate(a.createdAt);
          const dateB = safeParseDate(b.createdAt);

          if (sortBy === "latest") {
            return dateB.getTime() - dateA.getTime();
          }
          return dateA.getTime() - dateB.getTime();
        })
      : [];

  // Xử lý like comment
  const handleCommentLike = async (commentId) => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để thích bình luận");
      return;
    }

    try {
      console.log("👍 Toggling like for comment:", commentId);
      const result = await communityService.toggleCommentLike(commentId);
      console.log("👍 Comment like result:", result);

      if (result.status === "success") {
        const { liked, likesCount } = result.data;

        // Cập nhật comment trong danh sách
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? { ...comment, liked, likesCount }
              : comment
          )
        );
      }
    } catch (error) {
      console.error("❌ Error liking comment:", error);
      alert("Không thể thực hiện thao tác. Vui lòng thử lại sau.");
    }
  };

  // Xử lý edit comment
  const handleEditComment = async (commentId) => {
    if (!editCommentContent.trim()) return;

    try {
      console.log("✏️ Updating comment:", commentId);
      const result = await communityService.updateComment(
        commentId,
        editCommentContent
      );
      console.log("✏️ Update comment result:", result);

      if (result.status === "success") {
        // Cập nhật comment trong danh sách
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  content: result.data.content,
                  updatedAt: result.data.updatedAt,
                }
              : comment
          )
        );

        // Reset edit state
        setEditingCommentId(null);
        setEditCommentContent("");
      }
    } catch (error) {
      console.error("❌ Error updating comment:", error);
      alert("Không thể cập nhật bình luận. Vui lòng thử lại sau.");
    }
  };

  // Xử lý delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;

    try {
      console.log("🗑️ Deleting comment:", commentId);
      const result = await communityService.deleteComment(commentId);
      console.log("🗑️ Delete comment result:", result);

      if (result.status === "success") {
        // Xóa comment khỏi danh sách
        setComments((prev) =>
          prev.filter((comment) => comment.id !== commentId)
        );

        // Cập nhật số lượng comments trong post
        if (post) {
          setPost((prev) => ({
            ...prev,
            commentsCount: Math.max(0, (prev.commentsCount || 0) - 1),
          }));
        }
      }
    } catch (error) {
      console.error("❌ Error deleting comment:", error);
      alert("Không thể xóa bình luận. Vui lòng thử lại sau.");
    }
  };

  // Xử lý gửi reply
  const handleReplySubmit = async (commentId) => {
    if (!newReply.trim()) return;

    if (!currentUser) {
      alert("Vui lòng đăng nhập để phản hồi");
      return;
    }

    setSubmittingReply(true);

    try {
      console.log("💬 Adding reply to comment:", commentId);
      const result = await communityService.addReply(commentId, newReply);
      console.log("💬 Add reply result:", result);

      if (result.status === "success") {
        // Thêm reply vào danh sách replies của comment
        setCommentReplies((prev) => ({
          ...prev,
          [commentId]: [...(prev[commentId] || []), result.data],
        }));

        // Cập nhật replies count cho comment
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? { ...comment, repliesCount: (comment.repliesCount || 0) + 1 }
              : comment
          )
        );

        // Reset reply form
        setNewReply("");
        setReplyingToComment(null);
      }
    } catch (error) {
      console.error("❌ Error adding reply:", error);
      alert("Không thể gửi phản hồi. Vui lòng thử lại sau.");
    } finally {
      setSubmittingReply(false);
    }
  };

  // Load replies cho comment
  const loadReplies = async (commentId) => {
    try {
      console.log("📄 Loading replies for comment:", commentId);
      const result = await communityService.getReplies(commentId);
      console.log("📄 Replies result:", result);

      if (result.status === "success") {
        // API có thể trả về replies trong nhiều structure khác nhau
        let repliesData = [];

        if (Array.isArray(result.data)) {
          repliesData = result.data;
        } else if (result.data.content && Array.isArray(result.data.content)) {
          repliesData = result.data.content;
        } else if (result.data.replies && Array.isArray(result.data.replies)) {
          repliesData = result.data.replies;
        }

        console.log(
          "📄 Replies data processed:",
          repliesData.length,
          "replies"
        );
        setCommentReplies((prev) => ({
          ...prev,
          [commentId]: repliesData,
        }));
      }
    } catch (error) {
      console.error("❌ Error loading replies:", error);
    }
  };

  // Toggle hiển thị replies
  const toggleReplies = (commentId) => {
    const isShowing = showReplies[commentId];

    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !isShowing,
    }));

    // Load replies nếu chưa load và đang mở
    if (!isShowing && !commentReplies[commentId]) {
      loadReplies(commentId);
    }
  };

  // Xử lý like reply
  const handleReplyLike = async (replyId, commentId) => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để thích phản hồi");
      return;
    }

    try {
      console.log("👍 Toggling like for reply:", replyId);
      const result = await communityService.toggleReplyLike(replyId);
      console.log("👍 Reply like result:", result);

      if (result.status === "success") {
        const { liked, likesCount } = result.data;

        // Cập nhật reply trong danh sách
        setCommentReplies((prev) => ({
          ...prev,
          [commentId]: prev[commentId].map((reply) =>
            reply.id === replyId ? { ...reply, liked, likesCount } : reply
          ),
        }));
      }
    } catch (error) {
      console.error("❌ Error liking reply:", error);
      alert("Không thể thực hiện thao tác. Vui lòng thử lại sau.");
    }
  };

  if (loading) {
    return <LoadingSpinner text="Đang tải bài viết..." />;
  }

  if (!post) {
    return (
      <div className="parent-content-wrapper">
        <div className="parent-community-post-container">
          <div className="parent-error-container">
            <h2>Không tìm thấy bài viết</h2>
            <Link to="/parent/community" className="parent-back-link">
              <i className="fas fa-arrow-left"></i> Quay lại trang cộng đồng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="parent-content-wrapper">
      <div className="parent-community-post-container">
        <div className="parent-post-navigation">
          <Link to="/parent/community" className="parent-back-link">
            <i className="fas fa-arrow-left"></i> Quay lại cộng đồng
          </Link>
        </div>

        <article className="parent-post-content-container">
          <header className="parent-post-header">
            <div className="parent-post-meta">
              <div className="parent-post-category">
                <i className={`fas ${getCategoryIcon(post.category)}`}></i>
                {getCategoryName(post.category)}
              </div>
              <div className="parent-post-time">
                {formatDate(post.createdAt)}
              </div>
            </div>

            <h1 className="parent-post-title">{post.title}</h1>

            <div className="parent-post-author">
              {post.author.role === "PARENT" ? (
                // Icon cho phụ huynh
                <div className="parent-author-icon parent-icon">
                  <i className="fas fa-user-friends"></i>
                </div>
              ) : post.author.role === "NURSE" ? (
                // Icon cho y tá
                <div className="parent-author-icon nurse-icon">
                  <i className="fas fa-user-nurse"></i>
                </div>
              ) : (
                // Icon mặc định cho các vai trò khác
                <div className="parent-author-icon default-icon">
                  <i className="fas fa-user"></i>
                </div>
              )}
              <div className="parent-author-info">
                <div className="parent-author-name">
                  {post.author.name}
                  {post.author.role === "NURSE" && (
                    <span className="parent-author-badge nurse">
                      <i className="fas fa-user-nurse"></i> Y tá
                    </span>
                  )}
                  {post.author.role === "PARENT" && (
                    <span className="parent-author-badge parent">
                      <i className="fas fa-users"></i> Phụ huynh
                    </span>
                  )}
                </div>
              </div>
            </div>
          </header>

          {post.tags && post.tags.length > 0 && (
            <div className="parent-post-tags">
              {post.tags.map((tag, index) => (
                <span key={index} className="parent-post-tag">
                  <i className="fas fa-tag"></i> {tag}
                </span>
              ))}
            </div>
          )}

          <div
            className="parent-post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          ></div>

          <div className="parent-post-actions">
            <button
              className={`parent-like-button ${
                likedPosts.includes(postId) ? "liked" : ""
              }`}
              onClick={handleLike}
            >
              <i
                className={`${
                  likedPosts.includes(postId) ? "fas" : "far"
                } fa-heart`}
              ></i>
              <span>{post.likes} thích</span>
            </button>

            <button className="parent-share-button">
              <i className="fas fa-share-alt"></i>
              <span>Chia sẻ</span>
            </button>

            <button className="parent-report-button">
              <i className="fas fa-flag"></i>
              <span>Báo cáo</span>
            </button>
          </div>
        </article>

        {/* Phần bình luận */}
        <div className="parent-comments-section">
          <div className="parent-comments-header">
            <h3>Bình luận ({post.commentsCount || 0})</h3>
            <div className="parent-comments-filter">
              <label>Sắp xếp:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="latest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>
          </div>

          {/* Form thêm bình luận mới */}
          <form className="parent-comment-form" onSubmit={handleCommentSubmit}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận của bạn..."
              disabled={submittingComment}
              required
            ></textarea>
            <button
              type="submit"
              disabled={submittingComment || !newComment.trim()}
              className="parent-comment-submit-btn"
            >
              {submittingComment ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Đang gửi...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i> Gửi bình luận
                </>
              )}
            </button>
          </form>

          {/* Danh sách bình luận */}
          {loadingComments ? (
            <div className="parent-loading-comments">
              <LoadingSpinner text="Đang tải bình luận..." />
            </div>
          ) : comments.length === 0 ? (
            <div className="parent-no-comments">
              <i className="fas fa-comment-slash"></i>
              <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
            </div>
          ) : (
            <div className="parent-comments-list">
              {sortedComments.map((comment) => (
                <div key={comment.id} className="parent-comment-item">
                  <div className="parent-comment-header">
                    <div className="parent-comment-author">
                      {comment.author.role === "PARENT" ? (
                        <div className="parent-comment-author-icon parent-icon">
                          <i className="fas fa-user-friends"></i>
                        </div>
                      ) : comment.author.role === "NURSE" ? (
                        <div className="parent-comment-author-icon nurse-icon">
                          <i className="fas fa-user-nurse"></i>
                        </div>
                      ) : (
                        <div className="parent-comment-author-icon default-icon">
                          <i className="fas fa-user"></i>
                        </div>
                      )}
                      <div className="parent-comment-author-info">
                        <span className="parent-comment-author-name">
                          {comment.author.name}
                          {comment.author.role === "NURSE" && (
                            <span className="parent-author-badge nurse">
                              <i className="fas fa-user-nurse"></i> Y tá
                            </span>
                          )}
                        </span>
                        <span className="parent-comment-time">
                          {formatDate(comment.createdAt)}
                          {areDatesDifferent(
                            comment.updatedAt,
                            comment.createdAt
                          ) && (
                            <span className="parent-edited-indicator">
                              {" "}
                              • đã chỉnh sửa
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Actions menu cho comment của current user */}
                    {currentUser && currentUser.id === comment.author.id && (
                      <div className="comment-actions-menu">
                        <button
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditCommentContent(comment.content);
                          }}
                          className="edit-comment-btn"
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="delete-comment-btn"
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="comment-content">
                    {editingCommentId === comment.id ? (
                      <div className="edit-comment-form">
                        <textarea
                          value={editCommentContent}
                          onChange={(e) =>
                            setEditCommentContent(e.target.value)
                          }
                          className="edit-comment-textarea"
                          rows="3"
                        />
                        <div className="edit-comment-actions">
                          <button
                            onClick={() => handleEditComment(comment.id)}
                            className="save-edit-btn"
                          >
                            Lưu
                          </button>
                          <button
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditCommentContent("");
                            }}
                            className="cancel-edit-btn"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p>{comment.content}</p>
                    )}
                  </div>

                  <div className="comment-actions">
                    <button
                      className={`comment-like-btn ${
                        comment.liked ? "liked" : ""
                      }`}
                      onClick={() => handleCommentLike(comment.id)}
                    >
                      <i
                        className={`${comment.liked ? "fas" : "far"} fa-heart`}
                      ></i>
                      <span>{comment.likesCount || 0}</span>
                    </button>

                    <button
                      className="reply-btn"
                      onClick={() =>
                        setReplyingToComment(
                          replyingToComment === comment.id ? null : comment.id
                        )
                      }
                    >
                      <i className="fas fa-reply"></i>
                      Phản hồi
                    </button>

                    {comment.repliesCount > 0 && (
                      <button
                        className="show-replies-btn"
                        onClick={() => toggleReplies(comment.id)}
                      >
                        <i
                          className={`fas fa-chevron-${
                            showReplies[comment.id] ? "up" : "down"
                          }`}
                        ></i>
                        {showReplies[comment.id] ? "Ẩn" : "Hiện"}{" "}
                        {comment.repliesCount} phản hồi
                      </button>
                    )}
                  </div>

                  {/* Reply form */}
                  {replyingToComment === comment.id && (
                    <div className="reply-form">
                      <textarea
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="Viết phản hồi..."
                        rows="3"
                        className="reply-textarea"
                      />
                      <div className="reply-actions">
                        <button
                          onClick={() => handleReplySubmit(comment.id)}
                          disabled={submittingReply}
                          className="submit-reply-btn"
                        >
                          {submittingReply ? "Đang gửi..." : "Gửi phản hồi"}
                        </button>
                        <button
                          onClick={() => {
                            setReplyingToComment(null);
                            setNewReply("");
                          }}
                          className="cancel-reply-btn"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Replies list */}
                  {showReplies[comment.id] && commentReplies[comment.id] && (
                    <div className="replies-list">
                      {commentReplies[comment.id].map((reply) => (
                        <div key={reply.id} className="reply-item">
                          <div className="reply-header">
                            <div className="reply-author">
                              {reply.author.role === "PARENT" ? (
                                <div className="reply-author-icon parent-icon">
                                  <i className="fas fa-user-friends"></i>
                                </div>
                              ) : reply.author.role === "NURSE" ? (
                                <div className="reply-author-icon nurse-icon">
                                  <i className="fas fa-user-nurse"></i>
                                </div>
                              ) : (
                                <div className="reply-author-icon default-icon">
                                  <i className="fas fa-user"></i>
                                </div>
                              )}
                              <div className="reply-author-info">
                                <span className="reply-author-name">
                                  {reply.author.name}
                                  {reply.author.role === "NURSE" && (
                                    <span className="author-badge nurse">
                                      <i className="fas fa-user-nurse"></i> Y tá
                                    </span>
                                  )}
                                </span>
                                <span className="reply-time">
                                  {formatDate(reply.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="reply-content">
                            <p>{reply.content}</p>
                          </div>

                          <div className="reply-actions">
                            <button
                              className={`reply-like-btn ${
                                reply.liked ? "liked" : ""
                              }`}
                              onClick={() =>
                                handleReplyLike(reply.id, comment.id)
                              }
                            >
                              <i
                                className={`${
                                  reply.liked ? "fas" : "far"
                                } fa-heart`}
                              ></i>
                              <span>{reply.likesCount || 0}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Phân trang cho bình luận */}
          {commentTotalPages > 1 && (
            <div className="comment-pagination">
              <button
                disabled={commentPage === 1}
                onClick={() => setCommentPage((prev) => prev - 1)}
                className="pagination-btn"
              >
                <i className="fas fa-chevron-left"></i> Trước
              </button>
              <span className="page-info">
                Trang {commentPage}/{commentTotalPages}
              </span>
              <button
                disabled={commentPage === commentTotalPages}
                onClick={() => setCommentPage((prev) => prev + 1)}
                className="pagination-btn"
              >
                Tiếp <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>

        {/* Bài viết liên quan */}
        {relatedPosts.length > 0 && (
          <div className="related-posts-section">
            <h3>Bài viết liên quan</h3>
            <div className="related-posts">
              {relatedPosts.map((relatedPost) => (
                <div key={relatedPost.id} className="related-post-card">
                  <div className="related-post-category">
                    <i
                      className={`fas ${getCategoryIcon(relatedPost.category)}`}
                    ></i>
                    {getCategoryName(relatedPost.category)}
                  </div>

                  <h4>
                    <Link to={`/parent/community/post/${relatedPost.id}`}>
                      {relatedPost.title}
                    </Link>
                  </h4>

                  <div className="related-post-meta">
                    <div className="related-post-author">
                      {relatedPost.author.role === "PARENT" ? (
                        <div className="related-author-icon parent-icon">
                          <i className="fas fa-user-friends"></i>
                        </div>
                      ) : relatedPost.author.role === "NURSE" ? (
                        <div className="related-author-icon nurse-icon">
                          <i className="fas fa-user-nurse"></i>
                        </div>
                      ) : (
                        <div className="related-author-icon default-icon">
                          <i className="fas fa-user"></i>
                        </div>
                      )}
                      <span>{relatedPost.author.name}</span>
                    </div>
                    <div className="related-post-stats">
                      <span>
                        <i className="fas fa-heart"></i> {relatedPost.likes}
                      </span>
                      <span>
                        <i className="fas fa-comment"></i>{" "}
                        {relatedPost.commentsCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPost;
