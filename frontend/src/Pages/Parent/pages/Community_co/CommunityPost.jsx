import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./CommunityPost.css";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { useAuth } from "../../../../context/AuthContext";
import communityService from "../../../../services/communityService"; // Import communityService

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
  const [liked, setLiked] = useState(false);
  const [showAllComments, setShowAllComments] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [relatedPosts, setRelatedPosts] = useState([]);

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
          setLiked(result.data.likedByCurrentUser);

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
  }, [postId, navigate]);

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

    try {
      const result = await communityService.toggleLike(postId);

      if (result.status === "success") {
        const { liked: isLiked, likesCount } = result.data;

        // Cập nhật trạng thái like và số lượt like
        setLiked(isLiked);
        setPost((prevPost) => ({
          ...prevPost,
          likes: likesCount,
        }));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      alert("Không thể thực hiện thao tác. Vui lòng thử lại sau.");
    }
  };

  // Format date dưới dạng "DD thg MM, YYYY HH:MM"
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

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
          if (sortBy === "latest") {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return new Date(a.createdAt) - new Date(b.createdAt);
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
      <div className="error-container">
        <h2>Không tìm thấy bài viết</h2>
        <Link to="/parent/community" className="back-link">
          <i className="fas fa-arrow-left"></i> Quay lại trang cộng đồng
        </Link>
      </div>
    );
  }

  return (
    <div className="community-post-container">
      <div className="post-navigation">
        <Link to="/parent/community" className="back-link">
          <i className="fas fa-arrow-left"></i> Quay lại cộng đồng
        </Link>
      </div>

      <article className="post-content-container">
        <header className="post-header">
          <div className="post-meta">
            <div className="post-category">
              <i className={`fas ${getCategoryIcon(post.category)}`}></i>
              {getCategoryName(post.category)}
            </div>
            <div className="post-time">{formatDate(post.createdAt)}</div>
          </div>

          <h1 className="post-title">{post.title}</h1>

          <div className="post-author">
            {post.author.role === "PARENT" ? (
              // Icon cho phụ huynh
              <div className="author-icon parent-icon">
                <i className="fas fa-user-friends"></i>
              </div>
            ) : post.author.role === "NURSE" ? (
              // Icon cho y tá
              <div className="author-icon nurse-icon">
                <i className="fas fa-user-nurse"></i>
              </div>
            ) : (
              // Icon mặc định cho các vai trò khác
              <div className="author-icon default-icon">
                <i className="fas fa-user"></i>
              </div>
            )}
            <div className="author-info">
              <div className="author-name">
                {post.author.name}
                {post.author.role === "NURSE" && (
                  <span className="author-badge nurse">
                    <i className="fas fa-user-nurse"></i> Y tá
                  </span>
                )}
                {post.author.role === "PARENT" && (
                  <span className="author-badge parent">
                    <i className="fas fa-users"></i> Phụ huynh
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, index) => (
              <span key={index} className="post-tag">
                <i className="fas fa-tag"></i> {tag}
              </span>
            ))}
          </div>
        )}

        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        ></div>

        <div className="post-actions">
          <button
            className={`like-button ${liked ? "liked" : ""}`}
            onClick={handleLike}
          >
            <i className={`${liked ? "fas" : "far"} fa-heart`}></i>
            <span>{post.likes} thích</span>
          </button>

          <button className="share-button">
            <i className="fas fa-share-alt"></i>
            <span>Chia sẻ</span>
          </button>

          <button className="report-button">
            <i className="fas fa-flag"></i>
            <span>Báo cáo</span>
          </button>
        </div>
      </article>

      {/* Phần bình luận */}
      <div className="comments-section">
        <div className="comments-header">
          <h3>Bình luận ({post.commentsCount || 0})</h3>
          <div className="comments-filter">
            <label>Sắp xếp:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="latest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>

        {/* Form thêm bình luận mới */}
        <form className="comment-form" onSubmit={handleCommentSubmit}>
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
            className="comment-submit-btn"
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
          <div className="loading-comments">
            <LoadingSpinner text="Đang tải bình luận..." />
          </div>
        ) : comments.length === 0 ? (
          <div className="no-comments">
            <i className="fas fa-comment-slash"></i>
            <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
          </div>
        ) : (
          <div className="comments-list">
            {sortedComments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <div className="comment-author">
                    {comment.author.role === "PARENT" ? (
                      <div className="comment-author-icon parent-icon">
                        <i className="fas fa-user-friends"></i>
                      </div>
                    ) : comment.author.role === "NURSE" ? (
                      <div className="comment-author-icon nurse-icon">
                        <i className="fas fa-user-nurse"></i>
                      </div>
                    ) : (
                      <div className="comment-author-icon default-icon">
                        <i className="fas fa-user"></i>
                      </div>
                    )}
                    <div className="comment-author-info">
                      <span className="comment-author-name">
                        {comment.author.name}
                        {comment.author.role === "NURSE" && (
                          <span className="author-badge nurse">
                            <i className="fas fa-user-nurse"></i> Y tá
                          </span>
                        )}
                      </span>
                      <span className="comment-time">
                        {formatDate(comment.createdAt)}
                        {comment.updatedAt !== comment.createdAt && (
                          <span className="edited-indicator">
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
                        onChange={(e) => setEditCommentContent(e.target.value)}
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
  );
};

export default CommunityPost;
