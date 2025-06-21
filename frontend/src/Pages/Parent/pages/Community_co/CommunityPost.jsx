import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./CommunityPost.css";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { useAuth } from "../../../../context/AuthContext";
import communityService from "../../../../services/communityService"; // Import communityService

const CommunityPost = () => {
  const { postId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

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

  // Lấy chi tiết bài đăng từ API
  useEffect(() => {
    const fetchPostDetail = async () => {
      setLoading(true);
      try {
        // Gọi API lấy chi tiết bài đăng
        const result = await communityService.getPostDetail(postId);

        if (result.status === "success") {
          setPost(result.data);
          setLiked(result.data.likedByCurrentUser);

          // Nếu có bài viết liên quan thì lưu vào state
          if (result.data.relatedPosts && result.data.relatedPosts.length > 0) {
            setRelatedPosts(result.data.relatedPosts);
          }
        } else {
          // Nếu không tìm thấy bài viết, chuyển hướng về trang danh sách
          navigate("/parent/community");
        }
      } catch (error) {
        console.error("Error fetching post detail:", error);
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
      if (!postId) return;

      setLoadingComments(true);
      try {
        const result = await communityService.getComments(
          postId,
          commentPage,
          10
        );

        if (result.status === "success") {
          setComments(result.data.posts); // API trả về bình luận trong trường "posts"
          setCommentTotalPages(result.data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
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
            <img
              src={
                post.author.avatar ||
                "https://randomuser.me/api/portraits/lego/1.jpg"
              }
              alt={post.author.name}
              className="author-avatar"
            />
            <div className="author-info">
              <div className="author-name">
                {post.author.name}
                {post.author.role === "NURSE" && (
                  <span className="author-badge nurse">
                    <i className="fas fa-user-nurse"></i> Y tá
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
            <i className="fas fa-spinner fa-spin"></i> Đang tải bình luận...
          </div>
        ) : sortedComments.length > 0 ? (
          <div className="comments-list">
            {sortedComments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <div className="comment-author">
                    <img
                      src={
                        comment.author.avatar ||
                        "https://randomuser.me/api/portraits/lego/1.jpg"
                      }
                      alt={comment.author.name}
                      className="comment-author-avatar"
                    />
                    <div className="comment-author-info">
                      <div className="comment-author-name">
                        {comment.author.name}
                        {comment.author.role === "NURSE" && (
                          <span className="comment-author-badge">
                            <i className="fas fa-user-nurse"></i> Y tá
                          </span>
                        )}
                      </div>
                      <div className="comment-time">
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="comment-content">{comment.content}</div>

                <div className="comment-actions">
                  <button className="comment-like-btn">
                    <i className="far fa-heart"></i> Thích
                  </button>
                  <button className="comment-reply-btn">
                    <i className="fas fa-reply"></i> Trả lời
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-comments">
            <i className="fas fa-comments"></i>
            <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
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
                    <img
                      src={
                        relatedPost.author.avatar ||
                        "https://randomuser.me/api/portraits/lego/1.jpg"
                      }
                      alt={relatedPost.author.name}
                      className="related-author-avatar"
                    />
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
