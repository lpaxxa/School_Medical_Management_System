import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Spinner, Alert, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlog } from '../../../../../context/NurseContext/BlogContext';
import { useAuth } from '../../../../../context/AuthContext';
import * as blogService from '../../../../../services/APINurse/blogService';
import './Posts.css';

// Avatar mặc định cho người dùng
const DEFAULT_AVATAR = 'https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { likePost, unlikePost } = useBlog();
  const { currentUser } = useAuth();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [totalCommentsPages, setTotalCommentsPages] = useState(1);
  const [newComment, setNewComment] = useState('');
  const [displayedCommentsCount, setDisplayedCommentsCount] = useState(10); // Số bình luận hiển thị
  
  // Delete comment modal state
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Edit comment modal state
  const [showEditCommentModal, setShowEditCommentModal] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showUpdateSuccessMessage, setShowUpdateSuccessMessage] = useState(false);

  // Replies state
  const [replies, setReplies] = useState({}); // Object to store replies for each comment
  const [showReplies, setShowReplies] = useState({}); // Object to track which comments have replies shown
  const [repliesLoading, setRepliesLoading] = useState({});
  const [repliesPage, setRepliesPage] = useState({});
  const [totalRepliesPages, setTotalRepliesPages] = useState({});
  const [displayedRepliesCount, setDisplayedRepliesCount] = useState({}); // Track displayed replies count for each comment
  const [newReply, setNewReply] = useState({}); // Object to store new reply content for each comment
  
  // Reply modals state
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyingToComment, setReplyingToComment] = useState(null);
  const [showDeleteReplyModal, setShowDeleteReplyModal] = useState(false);
  const [selectedReply, setSelectedReply] = useState(null);
  const [deleteReplyLoading, setDeleteReplyLoading] = useState(false);
  const [showEditReplyModal, setShowEditReplyModal] = useState(false);
  const [editingReply, setEditingReply] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState('');
  const [updateReplyLoading, setUpdateReplyLoading] = useState(false);
  const [showReplySuccessMessage, setShowReplySuccessMessage] = useState(false);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Load post details
  const loadPost = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading post with ID:', id);
      
      // Use blogService directly instead of context
      const response = await blogService.getPostById(id);
      console.log('API Response:', response);
      
      // Check if response has data property
      const postData = response?.data || response;
      console.log('Post data:', postData);
      
      if (postData) {
        setPost(postData);
        
        // Load post like status
        try {
          const likeStatusResponse = await blogService.getPostLikeStatus(id);
          console.log('Post like status:', likeStatusResponse);
          
          if (likeStatusResponse && likeStatusResponse.data) {
            setPost(prev => ({
              ...prev,
              liked: likeStatusResponse.data.liked,
              likesCount: likeStatusResponse.data.likesCount
            }));
          }
        } catch (likeError) {
          console.error('Failed to load post like status:', likeError);
          // Continue even if like status fails
        }
        
        // Load post bookmark status
        try {
          const bookmarkStatusResponse = await blogService.getPostBookmarkStatus(id);
          console.log('Post bookmark status:', bookmarkStatusResponse);
          
          if (bookmarkStatusResponse && bookmarkStatusResponse.data) {
            setPost(prev => ({
              ...prev,
              bookmarked: bookmarkStatusResponse.data.bookmarked
            }));
          }
        } catch (bookmarkError) {
          console.error('Failed to load post bookmark status:', bookmarkError);
          // Continue even if bookmark status fails
        }
        
        // Load comments
        try {
          await loadComments(id, 1, true);
        } catch (commentError) {
          console.error('Failed to load comments:', commentError);
          // Continue even if comments fail
        }
      } else {
        setError('Không tìm thấy bài viết');
      }
    } catch (err) {
      console.error('Error loading post:', err);
      setError('Không thể tải thông tin bài viết. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadPost();
    }
  }, [id, loadPost]);

  // Load comments for a post
  const loadComments = useCallback(async (postId, page = 1, reset = false) => {
    try {
      setCommentsLoading(true);
      console.log('Loading comments for post:', postId, 'page:', page);
      
      const response = await blogService.getPostComments(postId, page, 10);
      console.log('Comments response:', response);
      
      if (response && response.data) {
        const newComments = response.data.content || [];
        console.log('New comments:', newComments);
        
        // Load like status for each comment
        const commentsWithLikeStatus = await Promise.all(
          newComments.map(async (comment) => {
            try {
              const likeStatus = await blogService.getCommentLikeStatus(comment.id);
              return {
                ...comment,
                liked: likeStatus?.data?.liked || false,
                likesCount: likeStatus?.data?.likesCount || comment.likesCount || 0
              };
            } catch (error) {
              console.error(`Error loading like status for comment ${comment.id}:`, error);
              return {
                ...comment,
                liked: false,
                likesCount: comment.likesCount || 0
              };
            }
          })
        );
        
        if (reset) {
          setComments(commentsWithLikeStatus);
          setDisplayedCommentsCount(10); // Reset về 10 comments khi load lại
        } else {
          setComments(prev => [...prev, ...commentsWithLikeStatus]);
        }
        
        setCommentsPage(response.data.page || 1);
        setTotalCommentsPages(response.data.totalPages || 1);
      } else {
        console.log('No comments data in response');
        if (reset) {
          setComments([]);
        }
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      console.error('Error response:', error.response?.data);
      
      // Set empty comments on error
      if (reset) {
        setComments([]);
      }
      
      // Don't show alert for comments loading error, just log it
      console.log('Comments loading failed, continuing without comments');
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  // Load more comments
  const loadMoreComments = async () => {
    if (post && commentsPage < totalCommentsPages) {
      await loadComments(post.id, commentsPage + 1, false);
      // Tăng số lượng bình luận hiển thị khi tải thêm
      setDisplayedCommentsCount(prev => prev + 10);
    }
  };

  // Handle add comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !post) return;

    try {
      // Gửi chỉ content như API yêu cầu
      const commentData = {
        content: newComment.trim()
      };

      console.log('Submitting comment for post:', post.id, commentData);
      
      await blogService.addPostComment(post.id, commentData);
      setNewComment('');
      
      // Reload comments
      await loadComments(post.id, 1, true);
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Có lỗi xảy ra khi thêm bình luận. Vui lòng thử lại sau.');
    }
  };

  // Handle like/unlike comment
  const handleToggleLikeComment = async (comment) => {
    try {
      const response = await blogService.toggleCommentLike(comment.id);
      
      if (response && response.data) {
        // Update comment in local state
        setComments(prev => prev.map(c => 
          c.id === comment.id 
            ? { 
                ...c, 
                liked: response.data.liked, 
                likesCount: response.data.likesCount 
              }
            : c
        ));
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  // Handle like/unlike reply
  const handleToggleLikeReply = async (reply) => {
    try {
      const response = await blogService.toggleLikeReply(reply.id);
      
      if (response && response.data) {
        // Update reply in local state
        setReplies(prev => {
          const commentId = reply.commentId;
          const updatedReplies = { ...prev };
          
          if (updatedReplies[commentId]) {
            updatedReplies[commentId] = updatedReplies[commentId].map(r =>
              r.id === reply.id
                ? {
                    ...r,
                    liked: response.data.liked,
                    likesCount: response.data.likesCount
                  }
                : r
            );
          }
          
          return updatedReplies;
        });
      }
    } catch (error) {
      console.error('Error toggling reply like:', error);
    }
  };

  // Handle hide comments (ẩn bớt bình luận)
  const handleHideComments = () => {
    setDisplayedCommentsCount(prev => Math.max(10, prev - 10));
  };

  // Handle delete comment
  const handleDeleteComment = (comment) => {
    setSelectedComment(comment);
    setShowDeleteCommentModal(true);
  };

  // Confirm delete comment
  const confirmDeleteComment = async () => {
    if (!selectedComment) return;
    
    try {
      setDeleteLoading(true);
      await blogService.deleteComment(selectedComment.id);
      
      // Remove comment from local state
      setComments(prev => {
        const newComments = prev.filter(c => c.id !== selectedComment.id);
        // Điều chỉnh displayedCommentsCount nếu cần
        if (displayedCommentsCount > newComments.length) {
          setDisplayedCommentsCount(Math.max(10, newComments.length));
        }
        return newComments;
      });
      
      // Close modal
      setShowDeleteCommentModal(false);
      setSelectedComment(null);
      
      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Có lỗi xảy ra khi xóa bình luận. Vui lòng thử lại sau.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Check if comment belongs to current user
  const isMyComment = (comment) => {
    return comment.author?.id === currentUser?.id || 
           comment.author?.email === currentUser?.email;
  };

  // Handle edit comment
  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setEditCommentContent(comment.content);
    setShowEditCommentModal(true);
  };

  // Confirm update comment
  const confirmUpdateComment = async () => {
    if (!editingComment || !editCommentContent.trim()) return;
    
    try {
      setUpdateLoading(true);
      const updatedComment = await blogService.updateComment(editingComment.id, {
        content: editCommentContent.trim()
      });
      
      // Update comment in local state
      setComments(prev => prev.map(c => 
        c.id === editingComment.id 
          ? { ...c, content: editCommentContent.trim(), updatedAt: new Date().toISOString() }
          : c
      ));
      
      // Close modal
      setShowEditCommentModal(false);
      setEditingComment(null);
      setEditCommentContent('');
      
      // Show success message
      setShowUpdateSuccessMessage(true);
      setTimeout(() => setShowUpdateSuccessMessage(false), 3000);
      
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Có lỗi xảy ra khi cập nhật bình luận. Vui lòng thử lại sau.');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle like/unlike post
  const handleToggleLike = async () => {
    try {
      const response = await blogService.togglePostLike(post.id);
      console.log('Toggle like response:', response);
      
      if (response && response.data) {
        setPost(prev => ({ 
          ...prev, 
          liked: response.data.liked, 
          likesCount: response.data.likesCount 
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Có lỗi xảy ra khi thích/hủy thích bài viết. Vui lòng thử lại sau.');
    }
  };

  // Handle bookmark/unbookmark post
  const handleToggleBookmark = async () => {
    try {
      const response = await blogService.togglePostBookmark(post.id);
      console.log('Toggle bookmark response:', response);
      
      if (response && response.data) {
        setPost(prev => ({ 
          ...prev, 
          bookmarked: response.data.bookmarked
        }));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('Có lỗi xảy ra khi ghim/bỏ ghim bài viết. Vui lòng thử lại sau.');
    }
  };

  // =================== REPLIES FUNCTIONS ===================

  // Load replies for a comment
  const loadReplies = useCallback(async (commentId, page = 1, reset = false) => {
    try {
      setRepliesLoading(prev => ({ ...prev, [commentId]: true }));
      
      const response = await blogService.getCommentReplies(commentId, page, 10);
      console.log('Replies response:', response);
      
      if (response && response.data) {
        const newReplies = response.data.content || [];
        console.log('New replies for comment', commentId, ':', newReplies);
        
        // Load like status for each reply
        const repliesWithLikeStatus = await Promise.all(
          newReplies.map(async (reply) => {
            try {
              const likeStatus = await blogService.checkReplyLikeStatus(reply.id);
              return {
                ...reply,
                commentId: commentId, // Add commentId for easier reference
                liked: likeStatus?.data?.liked || false,
                likesCount: likeStatus?.data?.likesCount || reply.likesCount || 0
              };
            } catch (error) {
              console.error(`Error loading like status for reply ${reply.id}:`, error);
              return {
                ...reply,
                commentId: commentId, // Add commentId for easier reference
                liked: false,
                likesCount: reply.likesCount || 0
              };
            }
          })
        );
        
        setReplies(prev => {
          const updated = {
            ...prev,
            [commentId]: reset ? repliesWithLikeStatus : [...(prev[commentId] || []), ...repliesWithLikeStatus]
          };
          console.log('Updated replies state:', updated);
          return updated;
        });
        
        setRepliesPage(prev => ({ ...prev, [commentId]: response.data.page || 1 }));
        setTotalRepliesPages(prev => ({ ...prev, [commentId]: response.data.totalPages || 1 }));
        
        if (reset) {
          const displayCount = Math.min(3, repliesWithLikeStatus.length);
          console.log('Setting displayed replies count for comment', commentId, ':', displayCount);
          setDisplayedRepliesCount(prev => ({ ...prev, [commentId]: displayCount }));
        }
      }
    } catch (error) {
      console.error('Error loading replies:', error);
      if (reset) {
        setReplies(prev => ({ ...prev, [commentId]: [] }));
      }
    } finally {
      setRepliesLoading(prev => ({ ...prev, [commentId]: false }));
    }
  }, []);

  // Toggle show replies for a comment
  const toggleShowReplies = async (commentId) => {
    if (!showReplies[commentId]) {
      // Load replies if not shown yet
      await loadReplies(commentId, 1, true);
      setShowReplies(prev => ({ ...prev, [commentId]: true }));
    } else {
      // Hide replies
      setShowReplies(prev => ({ ...prev, [commentId]: false }));
    }
  };

  // Load more replies for a comment
  const loadMoreReplies = async (commentId) => {
    const currentPage = repliesPage[commentId] || 1;
    const totalPages = totalRepliesPages[commentId] || 1;
    
    if (currentPage < totalPages) {
      await loadReplies(commentId, currentPage + 1, false);
      setDisplayedRepliesCount(prev => ({ 
        ...prev, 
        [commentId]: (prev[commentId] || 0) + 10 
      }));
    }
  };

  // Hide replies for a comment
  const handleHideReplies = (commentId) => {
    setDisplayedRepliesCount(prev => ({ 
      ...prev, 
      [commentId]: Math.max(3, (prev[commentId] || 0) - 10) 
    }));
  };

  // Handle add reply
  const handleAddReply = async (commentId) => {
    const replyContent = newReply[commentId];
    if (!replyContent || !replyContent.trim()) return;

    try {
      const replyData = {
        content: replyContent.trim()
      };

      await blogService.addCommentReply(commentId, replyData);
      setNewReply(prev => ({ ...prev, [commentId]: '' }));
      
      // Reload replies and reset display count
      await loadReplies(commentId, 1, true);
      
      // Update comment replies count in comments list
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, repliesCount: (c.repliesCount || 0) + 1 }
          : c
      ));
      
      setShowReplySuccessMessage(true);
      setTimeout(() => setShowReplySuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Có lỗi xảy ra khi thêm phản hồi. Vui lòng thử lại sau.');
    }
  };

  // Check if reply belongs to current user
  const isMyReply = (reply) => {
    return reply.author?.id === currentUser?.id || 
           reply.author?.email === currentUser?.email;
  };

  // Handle delete reply
  const handleDeleteReply = (reply) => {
    setSelectedReply(reply);
    setShowDeleteReplyModal(true);
  };

  // Confirm delete reply
  const confirmDeleteReply = async () => {
    if (!selectedReply) return;
    
    try {
      setDeleteReplyLoading(true);
      await blogService.deleteCommentReply(selectedReply.id);
      
      // Remove reply from local state
      setReplies(prev => {
        const commentId = selectedReply.commentId;
        const updatedReplies = { ...prev };
        if (updatedReplies[commentId]) {
          updatedReplies[commentId] = updatedReplies[commentId].filter(r => r.id !== selectedReply.id);
          
          // Adjust displayed count
          const currentCount = displayedRepliesCount[commentId] || 0;
          if (currentCount > updatedReplies[commentId].length) {
            setDisplayedRepliesCount(prevCount => ({ 
              ...prevCount, 
              [commentId]: Math.max(3, updatedReplies[commentId].length) 
            }));
          }
        }
        return updatedReplies;
      });
      
      // Update comment replies count in comments list
      setComments(prev => prev.map(c => 
        c.id === selectedReply.commentId 
          ? { ...c, repliesCount: Math.max(0, (c.repliesCount || 0) - 1) }
          : c
      ));
      
      setShowDeleteReplyModal(false);
      setSelectedReply(null);
      
      setShowReplySuccessMessage(true);
      setTimeout(() => setShowReplySuccessMessage(false), 3000);
      
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('Có lỗi xảy ra khi xóa phản hồi. Vui lòng thử lại sau.');
    } finally {
      setDeleteReplyLoading(false);
    }
  };

  // Handle edit reply
  const handleEditReply = (reply) => {
    setEditingReply(reply);
    setEditReplyContent(reply.content);
    setShowEditReplyModal(true);
  };

  // Confirm update reply
  const confirmUpdateReply = async () => {
    if (!editingReply || !editReplyContent.trim()) return;
    
    try {
      setUpdateReplyLoading(true);
      await blogService.updateCommentReply(editingReply.id, {
        content: editReplyContent.trim()
      });
      
      // Update reply in local state
      setReplies(prev => {
        const commentId = editingReply.commentId;
        const updatedReplies = { ...prev };
        if (updatedReplies[commentId]) {
          updatedReplies[commentId] = updatedReplies[commentId].map(r => 
            r.id === editingReply.id 
              ? { ...r, content: editReplyContent.trim(), updatedAt: new Date().toISOString() }
              : r
          );
        }
        return updatedReplies;
      });
      
      setShowEditReplyModal(false);
      setEditingReply(null);
      setEditReplyContent('');
      
      setShowReplySuccessMessage(true);
      setTimeout(() => setShowReplySuccessMessage(false), 3000);
      
    } catch (error) {
      console.error('Error updating reply:', error);
      alert('Có lỗi xảy ra khi cập nhật phản hồi. Vui lòng thử lại sau.');
    } finally {
      setUpdateReplyLoading(false);
    }
  };

  // Handle back to posts
  const handleBackToPosts = () => {
    navigate('/nurse/blog-management/posts');
  };

  // Handle edit post
  const handleEditPost = () => {
    navigate(`/nurse/blog-management/posts/edit/${post.id}`);
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary" size="lg">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
          <p className="mt-3 text-muted">Đang tải chi tiết bài viết...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger" className="text-center">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <div className="mt-3">
            <Button variant="outline-danger" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
            <Button variant="outline-secondary" className="ms-2" onClick={handleBackToPosts}>
              Quay lại danh sách
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container fluid className="py-4">
        <Alert variant="warning" className="text-center">
          <i className="fas fa-search me-2"></i>
          Không tìm thấy bài viết
          <div className="mt-3">
            <Button variant="outline-secondary" onClick={handleBackToPosts}>
              Quay lại danh sách
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={handleBackToPosts}
                className="mb-2"
              >
                <i className="fas fa-arrow-left me-2"></i>
                Quay lại danh sách
              </Button>
              <h4 className="text-primary fw-bold mb-0">Chi tiết bài viết</h4>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-warning" size="sm" onClick={handleEditPost}>
                <i className="fas fa-edit me-1"></i>
                Chỉnh sửa
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          {/* Post Content */}
          <Card className="shadow-sm mb-4 h-100">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h2 className="mb-0">{post?.title || 'Không có tiêu đề'}</h2>
                <Badge bg="light" text="dark" className="ms-2">
                  ID: {post?.id || 'N/A'}
                </Badge>
              </div>
              
              <div className="d-flex justify-content-between text-muted small mb-3">
                <span>
                  <i className="fas fa-user me-1"></i>
                  {post?.author?.name || 'Không có tác giả'}
                </span>
                <span>
                  <i className="fas fa-calendar me-1"></i>
                  {formatDate(post?.createdAt)}
                </span>
              </div>
              
              <div className="mb-3">
                <Badge bg="info" className="me-2">
                  {post?.category || 'Chưa phân loại'}
                </Badge>
                {post?.pinned && (
                  <Badge bg="warning">
                    <i className="fas fa-thumbtack me-1"></i> Ghim
                  </Badge>
                )}
              </div>
              
              {post?.imageUrl && (
                <div className="text-center mb-4">
                  <img 
                    src={post.imageUrl} 
                    alt={post.title || 'Hình ảnh bài viết'}
                    className="img-fluid rounded shadow-sm"
                    style={{ maxHeight: '400px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {post?.excerpt && (
                <div className="summary mb-4 p-3 bg-light rounded">
                  <h6 className="mb-2">
                    <i className="fas fa-quote-left me-2"></i>
                    Tóm tắt
                  </h6>
                  <p className="mb-0">{post.excerpt}</p>
                </div>
              )}
              
              <div className="content mb-4">
                <h6 className="mb-3">
                  <i className="fas fa-align-left me-2"></i>
                  Nội dung
                </h6>
                <div className="post-content" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {post?.content || 'Không có nội dung'}
                </div>
              </div>
              
              {post?.tags && post.tags.length > 0 && (
                <div className="tags mb-4">
                  <h6 className="mb-2">
                    <i className="fas fa-tags me-2"></i>
                    Thẻ
                  </h6>
                  <div>
                    {post.tags.map((tag, index) => (
                      <Badge key={index} bg="secondary" className="me-1 mb-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="stats d-flex justify-content-between py-3 border-top mt-auto">
                <span>
                  <i className="fas fa-eye me-1"></i>
                  {post?.viewCount || 0} lượt xem
                </span>
                <span 
                  className={`${post?.liked ? 'text-danger' : 'text-muted'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={handleToggleLike}
                  title={post?.liked ? 'Bỏ thích bài viết' : 'Thích bài viết'}
                >
                  <i className={`${post?.liked ? 'fas' : 'far'} fa-heart me-1`}></i>
                  {post?.likesCount || 0} lượt thích
                </span>
                <span 
                  className={`${post?.bookmarked ? 'text-warning' : 'text-muted'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={handleToggleBookmark}
                  title={post?.bookmarked ? 'Bỏ ghim bài viết' : 'Ghim bài viết'}
                >
                  <i className={`${post?.bookmarked ? 'fas' : 'far'} fa-bookmark me-1`}></i>
                  {post?.bookmarked ? 'Đã ghim' : 'Ghim'}
                </span>
                <span>
                  <i className="fas fa-comment me-1"></i>
                  {post?.commentsCount || 0} bình luận
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          <Card className="shadow-sm mb-4 h-100">
            <Card.Header>
              <h6 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Thông tin bài viết
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="info-item mb-3">
                <strong>ID bài viết:</strong> {post?.id || 'N/A'}
              </div>
              <div className="info-item mb-3">
                <strong>Tác giả:</strong> {post?.author?.name || 'Không có tác giả'}
              </div>
              <div className="info-item mb-3">
                <strong>Vai trò:</strong> {post?.author?.role || 'N/A'}
              </div>
              <div className="info-item mb-3">
                <strong>Ngày tạo:</strong> {formatDate(post?.createdAt)}
              </div>
              <div className="info-item mb-3">
                <strong>Cập nhật lần cuối:</strong> {formatDate(post?.updatedAt)}
              </div>
              <div className="info-item mb-3">
                <strong>Trạng thái:</strong> 
                <Badge bg={post?.published ? "success" : "warning"} className="ms-2">
                  {post?.published ? "Đã xuất bản" : "Nháp"}
                </Badge>
              </div>
              
              {/* Related Posts - moved here */}
              {post?.relatedPosts && post.relatedPosts.length > 0 && (
                <div className="related-posts-section mt-4 pt-3 border-top">
                  <h6 className="mb-3">
                    <i className="fas fa-link me-2"></i>
                    Bài viết liên quan
                  </h6>
                  <div className="related-posts">
                    {post.relatedPosts.map(relatedPost => (
                      <div key={relatedPost.id} className="related-post mb-3">
                        <Button
                          variant="link"
                          className="p-0 text-start"
                          onClick={() => navigate(`/nurse/blog-management/posts/${relatedPost.id}`)}
                        >
                          <div className="fw-bold">{relatedPost.title}</div>
                          <div className="text-muted small">
                            {relatedPost.category} • {formatDate(relatedPost.createdAt)}
                          </div>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Comments Section - Full Width */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-comments me-2"></i>
                Bình luận ({comments.length})
                {comments.length > 10 && displayedCommentsCount < comments.length && (
                  <span className="text-muted small ms-2">
                    (Hiển thị {Math.min(displayedCommentsCount, comments.length)} / {comments.length})
                  </span>
                )}
              </h5>
            </Card.Header>
            <Card.Body>
              {/* Add Comment Form */}
              <Form onSubmit={handleAddComment} className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Label>Thêm bình luận</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Viết bình luận của bạn..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                </Form.Group>
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="sm"
                  disabled={!newComment.trim()}
                >
                  <i className="fas fa-paper-plane me-1"></i>
                  Gửi bình luận
                </Button>
              </Form>
              
              {/* Comments List */}
              {commentsLoading && comments.length === 0 ? (
                <div className="text-center py-4">
                  <Spinner animation="border" size="sm" />
                  <p className="small text-muted mt-2 mb-0">Đang tải bình luận...</p>
                </div>
              ) : (
                <div className="comments-list">
                  {comments.slice(0, displayedCommentsCount).map(comment => (
                    <div key={comment.id} className="comment-item mb-3 p-3 bg-light rounded">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center">
                          <div className="comment-avatar me-3">
                            <img 
                              src={comment.author?.avatar || DEFAULT_AVATAR} 
                              alt={comment.author?.name}
                              className="rounded-circle"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = DEFAULT_AVATAR;
                              }}
                            />
                          </div>
                          <div>
                            <div className="fw-bold">{comment.author?.name || 'Người dùng'}</div>
                            <div className="text-muted small">
                              <Badge bg="secondary" className="me-2">{comment.author?.role || 'USER'}</Badge>
                              {formatDate(comment.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="comment-content mb-3">
                        <p className="mb-0">{comment.content}</p>
                      </div>
                      
                      <div className="comment-actions d-flex align-items-center gap-3">
                        <span 
                          className={`small ${comment.liked ? 'text-danger' : 'text-muted'}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleToggleLikeComment(comment)}
                        >
                          <i className={`${comment.liked ? 'fas' : 'far'} fa-heart me-1`}></i>
                          {comment.likesCount || 0} thích
                        </span>
                        
                        {comment.repliesCount > 0 && (
                          <span 
                            className="small text-muted"
                            style={{ cursor: 'pointer' }}
                            onClick={() => toggleShowReplies(comment.id)}
                          >
                            <i className="fas fa-reply me-1"></i>
                            {showReplies[comment.id] ? 'Ẩn' : 'Hiện'} {comment.repliesCount} phản hồi
                          </span>
                        )}
                        
                        <span 
                          className="small text-info"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setReplyingToComment(comment);
                            setShowReplyModal(true);
                          }}
                        >
                          <i className="fas fa-reply me-1"></i>
                          Phản hồi
                        </span>
                        
                        {/* Edit and Delete buttons - only show if it's user's own comment */}
                        {isMyComment(comment) && (
                          <>
                            <span 
                              className="small text-primary"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleEditComment(comment)}
                            >
                              <i className="fas fa-edit me-1"></i>
                              Sửa
                            </span>
                            <span 
                              className="small text-danger"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleDeleteComment(comment)}
                            >
                              <i className="fas fa-trash me-1"></i>
                              Xóa
                            </span>
                          </>
                        )}
                      </div>

                      {/* Replies Section - Nested */}
                      <div className="replies-section mt-3">
                        {/* Show Replies Button */}
                        {comment.repliesCount > 0 && (
                          <div className="text-muted small mb-2">
                            <Button 
                              variant="link" 
                              className="p-0"
                              onClick={() => toggleShowReplies(comment.id)}
                            >
                              {showReplies[comment.id] ? (
                                <>Ẩn bớt trả lời <i className="fas fa-chevron-up ms-1"></i></>
                              ) : (
                                <>Xem tất cả trả lời ({comment.repliesCount}) <i className="fas fa-chevron-down ms-1"></i></>
                              )}
                            </Button>
                          </div>
                        )}
                        
                        {/* Replies List - chỉ hiển thị khi có replies và showReplies là true */}
                        {showReplies[comment.id] && replies[comment.id] && replies[comment.id].length > 0 && (
                          <div className="replies-list ms-4">
                            {replies[comment.id].slice(0, displayedRepliesCount[comment.id] || 0).map(reply => (
                              <div key={reply.id} className="reply-item mb-3 p-3 bg-light rounded">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div className="d-flex align-items-center">
                                    <div className="reply-avatar me-3">
                                      <img 
                                        src={reply.author?.avatar || DEFAULT_AVATAR} 
                                        alt={reply.author?.name}
                                        className="rounded-circle"
                                        style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                                        onError={(e) => {
                                          e.target.src = DEFAULT_AVATAR;
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <div className="fw-bold">{reply.author?.name || 'Người dùng'}</div>
                                      <div className="text-muted small">
                                        <Badge bg="secondary" className="me-2">{reply.author?.role || 'USER'}</Badge>
                                        {formatDate(reply.createdAt)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="reply-content mb-3">
                                  <p className="mb-0">{reply.content}</p>
                                </div>
                                
                                <div className="reply-actions d-flex align-items-center gap-3">
                                  <span 
                                    className={`small ${reply.liked ? 'text-danger' : 'text-muted'}`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleToggleLikeReply(reply)}
                                  >
                                    <i className={`${reply.liked ? 'fas' : 'far'} fa-heart me-1`}></i>
                                    {reply.likesCount || 0} thích
                                  </span>
                                  
                                  {/* Edit and Delete buttons - only show if it's user's own reply */}
                                  {isMyReply(reply) && (
                                    <>
                                      <span 
                                        className="small text-primary"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleEditReply(reply)}
                                      >
                                        <i className="fas fa-edit me-1"></i>
                                        Sửa
                                      </span>
                                      <span 
                                        className="small text-danger"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleDeleteReply(reply)}
                                      >
                                        <i className="fas fa-trash me-1"></i>
                                        Xóa
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                            
                            {/* Load More Replies Button */}
                            {repliesPage[comment.id] < totalRepliesPages[comment.id] && (
                              <div className="text-center mb-2">
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => loadMoreReplies(comment.id)}
                                  disabled={repliesLoading[comment.id]}
                                >
                                  {repliesLoading[comment.id] ? (
                                    <>
                                      <Spinner animation="border" size="sm" className="me-2" />
                                      Đang tải...
                                    </>
                                  ) : (
                                    <>
                                      <i className="fas fa-chevron-down me-1"></i>
                                      Tải thêm phản hồi
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                            
                            {/* Hide Replies Button - only show when more than 3 replies displayed */}
                            {replies[comment.id].length > 3 && displayedRepliesCount[comment.id] > 3 && (
                              <div className="text-center mb-2">
                                <Button 
                                  variant="outline-secondary" 
                                  size="sm"
                                  onClick={() => handleHideReplies(comment.id)}
                                >
                                  <i className="fas fa-chevron-up me-1"></i>
                                  Ẩn bớt phản hồi ({displayedRepliesCount[comment.id] - 3} phản hồi)
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* No Replies Message */}
                        {comment.repliesCount === 0 && !repliesLoading[comment.id] && (
                          <div className="text-center py-4">
                            <i className="fas fa-comments fa-3x text-muted mb-3"></i>
                            <h6 className="text-muted">Chưa có phản hồi nào</h6>
                            <p className="text-muted mb-0">Hãy là người đầu tiên phản hồi!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Load More Comments Button */}
                  {commentsPage < totalCommentsPages && (
                    <div className="text-center mb-2">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={loadMoreComments}
                        disabled={commentsLoading}
                      >
                        {commentsLoading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Đang tải...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-chevron-down me-1"></i>
                            Tải thêm bình luận
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {/* Hide Comments Button - only show when more than 10 comments displayed */}
                  {comments.length > 10 && displayedCommentsCount > 10 && (
                    <div className="text-center mb-2">
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={handleHideComments}
                      >
                        <i className="fas fa-chevron-up me-1"></i>
                        Ẩn bớt bình luận ({displayedCommentsCount - 10} bình luận)
                      </Button>
                    </div>
                  )}
                  
                  {comments.length === 0 && !commentsLoading && (
                    <div className="text-center py-4">
                      <i className="fas fa-comments fa-3x text-muted mb-3"></i>
                      <h6 className="text-muted">Chưa có bình luận nào</h6>
                      <p className="text-muted mb-0">Hãy là người đầu tiên bình luận!</p>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Success Messages */}
      {showSuccessMessage && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 1050 }}>
          <Alert variant="success" className="alert-dismissible fade show">
            <i className="fas fa-check-circle me-2"></i>
            Đã xóa bình luận thành công!
          </Alert>
        </div>
      )}

      {showUpdateSuccessMessage && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 1050 }}>
          <Alert variant="success" className="alert-dismissible fade show">
            <i className="fas fa-check-circle me-2"></i>
            Đã cập nhật bình luận thành công!
          </Alert>
        </div>
      )}

      {showReplySuccessMessage && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 1050 }}>
          <Alert variant="success" className="alert-dismissible fade show">
            <i className="fas fa-check-circle me-2"></i>
            Thao tác phản hồi thành công!
          </Alert>
        </div>
      )}

      {/* Delete Comment Confirmation Modal */}
      <Modal show={showDeleteCommentModal} onHide={() => setShowDeleteCommentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa bình luận</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa bình luận này không?</p>
          <div className="p-3 bg-light rounded">
            <p className="mb-0 text-muted">"{selectedComment?.content}"</p>
          </div>
          <p className="text-danger mt-2 mb-0">
            <i className="fas fa-exclamation-triangle me-1"></i>
            Lưu ý: Hành động này không thể hoàn tác.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteCommentModal(false)}
            disabled={deleteLoading}
          >
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDeleteComment}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Đang xóa...
              </>
            ) : (
              <>
                <i className="fas fa-trash me-1"></i>
                Xóa bình luận
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Comment Modal */}
      <Modal show={showEditCommentModal} onHide={() => setShowEditCommentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa bình luận</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nội dung bình luận</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editCommentContent}
                onChange={(e) => setEditCommentContent(e.target.value)}
                placeholder="Nhập nội dung bình luận..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowEditCommentModal(false)}
            disabled={updateLoading}
          >
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={confirmUpdateComment}
            disabled={updateLoading || !editCommentContent.trim()}
          >
            {updateLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Đang cập nhật...
              </>
            ) : (
              <>
                <i className="fas fa-save me-1"></i>
                Lưu thay đổi
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Reply Modal */}
      <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Phản hồi bình luận</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {replyingToComment && (
            <div className="mb-3 p-2 bg-light rounded">
              <strong>Phản hồi cho:</strong>
              <p className="mb-0 text-muted">"{replyingToComment.content}"</p>
            </div>
          )}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nội dung phản hồi</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newReply[replyingToComment?.id] || ''}
                onChange={(e) => setNewReply(prev => ({ 
                  ...prev, 
                  [replyingToComment?.id]: e.target.value 
                }))}
                placeholder="Viết phản hồi của bạn..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowReplyModal(false);
              setReplyingToComment(null);
            }}
          >
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              handleAddReply(replyingToComment?.id);
              setShowReplyModal(false);
              setReplyingToComment(null);
            }}
            disabled={!newReply[replyingToComment?.id]?.trim()}
          >
            <i className="fas fa-paper-plane me-1"></i>
            Gửi phản hồi
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Reply Confirmation Modal */}
      <Modal show={showDeleteReplyModal} onHide={() => setShowDeleteReplyModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa phản hồi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa phản hồi này không?</p>
          <div className="p-3 bg-light rounded">
            <p className="mb-0 text-muted">"{selectedReply?.content}"</p>
          </div>
          <p className="text-danger mt-2 mb-0">
            <i className="fas fa-exclamation-triangle me-1"></i>
            Lưu ý: Hành động này không thể hoàn tác.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteReplyModal(false)}
            disabled={deleteReplyLoading}
          >
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDeleteReply}
            disabled={deleteReplyLoading}
          >
            {deleteReplyLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Đang xóa...
              </>
            ) : (
              <>
                <i className="fas fa-trash me-1"></i>
                Xóa phản hồi
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Reply Modal */}
      <Modal show={showEditReplyModal} onHide={() => setShowEditReplyModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa phản hồi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nội dung phản hồi</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editReplyContent}
                onChange={(e) => setEditReplyContent(e.target.value)}
                placeholder="Nhập nội dung phản hồi..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowEditReplyModal(false)}
            disabled={updateReplyLoading}
          >
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={confirmUpdateReply}
            disabled={updateReplyLoading || !editReplyContent.trim()}
          >
            {updateReplyLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Đang cập nhật...
              </>
            ) : (
              <>
                <i className="fas fa-save me-1"></i>
                Lưu thay đổi
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PostDetail;
