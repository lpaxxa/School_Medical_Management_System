import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Community.css";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { useAuth } from "../../../../context/AuthContext";
import communityService from "../../../../services/communityService"; // Import communityService

const Community = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreatePostForm, setShowCreatePostForm] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    excerpt: "", // Thêm trường excerpt theo API
    category: "Hỏi đáp", // Cập nhật category mặc định
    tags: [], // Thêm trường tags
  });
  // Thêm state để theo dõi bài viết đã được like
  const [likedPosts, setLikedPosts] = useState([]);
  const [page, setPage] = useState(1); // Thêm state để quản lý phân trang
  const [totalPages, setTotalPages] = useState(1);

  // API URL
  const API_URL = "http://localhost:8080/api/v1";

  useEffect(() => {
    // Gọi API để lấy danh sách bài đăng
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const result = await communityService.getPosts(
          page,
          10,
          activeTab !== "all" ? activeTab : null,
          searchQuery || null
        );
        if (result.status === "success") {
          setPosts(result.data.posts);
          setTotalPages(result.data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        // Fallback to mock data
        setPosts(MOCK_POSTS);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, activeTab, searchQuery]); // Dependency array: khi page, activeTab hoặc searchQuery thay đổi, sẽ gọi lại API

  // Lọc bài viết theo tab và tìm kiếm
  const filteredPosts = posts.filter((post) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "nurse" && post.author.role === "NURSE") ||
      (activeTab === "parent" && post.author.role === "PARENT") ||
      activeTab === post.category;

    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Sắp xếp bài viết: ghim lên đầu, sau đó sắp xếp theo thời gian
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const handleNewPostChange = (e) => {
    const { name, value } = e.target;
    setNewPost((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    // Xử lý upload file (giả lập)
    const files = Array.from(e.target.files);
    console.log(
      "Files selected:",
      files.map((file) => file.name)
    );
    // Trong thực tế, sẽ có logic upload file lên server
  };

  // Sửa lại hàm handleCreatePost để sử dụng communityService
  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Vui lòng đăng nhập để tạo bài viết");
      return;
    }

    setLoading(true);

    try {
      // Chuẩn bị dữ liệu theo định dạng API mong muốn
      const postData = {
        title: newPost.title,
        excerpt: newPost.excerpt || newPost.content.substring(0, 100) + "...", // Sử dụng excerpt nếu có
        content: newPost.content,
        category: newPost.category,
        tags: newPost.tags || [],
      };

      console.log("Sending post data:", postData); // Log dữ liệu gửi đi

      // Sử dụng communityService thay vì axios trực tiếp
      const result = await communityService.createPost(postData);

      if (result && result.status === "success") {
        // Thêm bài viết mới vào danh sách hiện có
        setPosts((prev) => [result.data, ...prev]);

        // Reset form và đóng modal
        setShowCreatePostForm(false);
        setNewPost({
          title: "",
          content: "",
          excerpt: "",
          category: "Hỏi đáp",
          tags: [],
        });

        alert("Đăng bài thành công!");
      }
    } catch (error) {
      console.error("Error creating post:", error);

      // Hiển thị chi tiết lỗi để debug
      if (error.response) {
        console.error("API response error:", error.response.data);
        alert(
          `Lỗi: ${
            error.response?.data?.message ||
            error.response?.statusText ||
            "Không thể tạo bài viết"
          }`
        );
      } else {
        alert("Không thể tạo bài viết. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePostLike = async (postId, e) => {
    e.preventDefault(); // Ngăn chặn việc chuyển trang khi click vào nút like

    if (!currentUser) {
      alert("Vui lòng đăng nhập để thích bài viết");
      return;
    }

    try {
      const result = await communityService.toggleLike(postId);
      if (result.status === "success") {
        const { liked, likesCount } = result.data;

        // Cập nhật state cho likedPosts
        if (liked) {
          setLikedPosts((prev) => [...prev, postId.toString()]);
        } else {
          setLikedPosts((prev) =>
            prev.filter((id) => id !== postId.toString())
          );
        }

        // Cập nhật số lượt like trong danh sách bài viết
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, likes: likesCount } : post
          )
        );
      }
    } catch (error) {
      console.error("Error liking post:", error);
      alert("Không thể thực hiện thao tác. Vui lòng thử lại sau.");
    }
  };

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
    // Đã có tên category từ API, trả về trực tiếp
    return category || "Khác";
  };

  // Giữ lại MOCK_POSTS để sử dụng khi API lỗi
  const MOCK_POSTS = [
    {
      id: "post1",
      title: "Hướng dẫn chăm sóc trẻ bị sốt tại nhà",
      content:
        "Khi trẻ bị sốt, phụ huynh cần theo dõi nhiệt độ thường xuyên và giữ cho trẻ đủ nước. Nếu nhiệt độ vượt quá 38.5°C, có thể dùng paracetamol liều lượng phù hợp với độ tuổi và cân nặng của trẻ...",
      author: {
        id: "nurse1",
        name: "Y tá Nguyễn Thị Hương",
        avatar: "https://randomuser.me/api/portraits/women/45.jpg",
        role: "nurse",
      },
      category: "health-guide",
      createdAt: "2023-05-15T08:30:00",
      likes: 24,
      comments: 8,
      isPinned: true,
    },
    {
      id: "post2",
      title:
        "Con tôi hay bị đau bụng mỗi buổi sáng trước khi đến trường, làm thế nào?",
      content:
        "Con trai tôi, học lớp 3, thường xuyên than phiền về việc đau bụng vào buổi sáng trước khi đi học. Khi ở nhà vào cuối tuần, cháu không có triệu chứng này. Tôi lo lắng không biết có phải do lo âu hoặc căng thẳng liên quan đến trường học không?",
      author: {
        id: "parent1",
        name: "Trần Văn Nam",
        avatar: "https://randomuser.me/api/portraits/men/35.jpg",
        role: "parent",
      },
      category: "question",
      createdAt: "2023-05-14T10:15:00",
      likes: 5,
      comments: 12,
      isPinned: false,
    },
    {
      id: "post3",
      title: "Thông báo: Chiến dịch tiêm chủng sắp diễn ra tại trường",
      content:
        "Kính gửi quý phụ huynh, nhà trường sẽ tổ chức chiến dịch tiêm chủng vắc-xin phòng bệnh cúm vào ngày 25/5/2023. Đây là chương trình tự nguyện, phụ huynh vui lòng điền vào mẫu đơn đồng ý và gửi lại cho giáo viên chủ nhiệm trước ngày 20/5/2023...",
      author: {
        id: "nurse2",
        name: "Y tá Trưởng Phạm Minh Tuấn",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        role: "nurse",
      },
      category: "announcement",
      createdAt: "2023-05-10T14:00:00",
      likes: 32,
      comments: 15,
      isPinned: true,
    },
    {
      id: "post4",
      title: "Chia sẻ: Cách giúp trẻ tăng cường miễn dịch trong mùa dịch",
      content:
        "Sau đại dịch COVID-19, gia đình tôi đã áp dụng một số thói quen giúp tăng cường miễn dịch cho các con. Chúng tôi tập trung vào chế độ ăn giàu rau xanh và trái cây, bổ sung vitamin D, đảm bảo giấc ngủ đủ giờ và vận động đều đặn...",
      author: {
        id: "parent2",
        name: "Lê Thị Hà",
        avatar: "https://randomuser.me/api/portraits/women/22.jpg",
        role: "parent",
      },
      category: "sharing",
      createdAt: "2023-05-08T16:45:00",
      likes: 18,
      comments: 7,
      isPinned: false,
    },
    {
      id: "post5",
      title: "Nhận biết các dấu hiệu trẻ bị rối loạn lo âu",
      content:
        "Trong vai trò y tá học đường, tôi nhận thấy ngày càng nhiều học sinh có dấu hiệu của rối loạn lo âu. Phụ huynh nên chú ý nếu con có các biểu hiện như: khó ngủ, ác mộng thường xuyên, đau đầu hoặc đau bụng không rõ nguyên nhân...",
      author: {
        id: "nurse1",
        name: "Y tá Nguyễn Thị Hương",
        avatar: "https://randomuser.me/api/portraits/women/45.jpg",
        role: "nurse",
      },
      category: "mental-health",
      createdAt: "2023-05-05T09:20:00",
      likes: 27,
      comments: 14,
      isPinned: false,
    },
  ];

  const handleTopicFilter = (topicCategory) => {
    // Cập nhật activeTab để lọc theo category đã chọn
    setActiveTab(topicCategory);

    // Cuộn lên đầu trang để hiển thị kết quả lọc
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return <LoadingSpinner text="Đang tải nội dung cộng đồng..." />;
  }

  return (
    <div className="community-container">
      <div className="community-header">
        <div className="community-title">
          <h1>Cộng đồng sức khỏe học đường</h1>
          <p>Chia sẻ, trao đổi và học hỏi cùng phụ huynh và đội ngũ y tế</p>
        </div>

        <div className="community-actions">
          <button
            className="create-post-btn"
            onClick={() => setShowCreatePostForm(true)}
          >
            <i className="fas fa-plus-circle"></i> Tạo bài viết mới
          </button>
        </div>
      </div>

      <div className="community-filter-bar">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            <i className="fas fa-th-large"></i> Tất cả
          </button>
          <button
            className={`filter-tab ${activeTab === "nurse" ? "active" : ""}`}
            onClick={() => setActiveTab("nurse")}
          >
            <i className="fas fa-user-nurse"></i> Từ y tá
          </button>
          <button
            className={`filter-tab ${activeTab === "parent" ? "active" : ""}`}
            onClick={() => setActiveTab("parent")}
          >
            <i className="fas fa-user-friends"></i> Từ phụ huynh
          </button>
          <button
            className={`filter-tab ${activeTab === "question" ? "active" : ""}`}
            onClick={() => setActiveTab("question")}
          >
            <i className="fas fa-question-circle"></i> Câu hỏi
          </button>
          <button
            className={`filter-tab ${
              activeTab === "announcement" ? "active" : ""
            }`}
            onClick={() => setActiveTab("announcement")}
          >
            <i className="fas fa-bullhorn"></i> Thông báo
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-btn">
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>

      {showCreatePostForm && (
        <div className="create-post-modal">
          <div className="create-post-container">
            <div className="modal-header">
              <h2>Tạo bài viết mới</h2>
              <button
                className="close-modal-btn"
                onClick={() => setShowCreatePostForm(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form className="create-post-form" onSubmit={handleCreatePost}>
              <div className="form-group">
                <label htmlFor="post-title">Tiêu đề</label>
                <input
                  type="text"
                  id="post-title"
                  name="title"
                  value={newPost.title}
                  onChange={handleNewPostChange}
                  placeholder="Nhập tiêu đề bài viết"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="post-category">Danh mục</label>
                <select
                  id="post-category"
                  name="category"
                  value={newPost.category}
                  onChange={handleNewPostChange}
                  required
                >
                  <option value="Hỏi đáp">Câu hỏi</option>
                  <option value="Chia sẻ">Chia sẻ kinh nghiệm</option>
                  <option value="COVID-19 và trẻ em">COVID-19 và trẻ em</option>
                  <option value="Dinh dưỡng học đường">
                    Dinh dưỡng học đường
                  </option>
                  <option value="Sức khỏe tâm thần">Sức khỏe tâm thần</option>
                  <option value="Tuổi dậy thì">Tuổi dậy thì</option>
                  <option value="Vắc-xin cho học sinh">
                    Vắc-xin cho học sinh
                  </option>
                  {currentUser?.role === "NURSE" && (
                    <>
                      <option value="Thông báo">Thông báo</option>
                      <option value="Hướng dẫn sức khỏe">
                        Hướng dẫn sức khỏe
                      </option>
                    </>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="post-content">Nội dung</label>
                <textarea
                  id="post-content"
                  name="content"
                  value={newPost.content}
                  onChange={handleNewPostChange}
                  placeholder="Nhập nội dung bài viết..."
                  rows="10"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="post-attachments">
                  Đính kèm file (tùy chọn)
                </label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="post-attachments"
                    onChange={handleFileUpload}
                    multiple
                  />
                  <label htmlFor="post-attachments" className="file-upload-btn">
                    <i className="fas fa-paperclip"></i> Chọn file
                  </label>
                </div>
                <span className="help-text">
                  Cho phép file: jpg, png, pdf, doc, docx. Tối đa 5MB/file
                </span>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowCreatePostForm(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="submit-btn">
                  <i className="fas fa-paper-plane"></i> Đăng bài
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="posts-section">
        {sortedPosts.length === 0 ? (
          <div className="empty-posts">
            <i className="fas fa-search"></i>
            <p>Không tìm thấy bài viết nào phù hợp</p>
            <button
              onClick={() => {
                setActiveTab("all");
                setSearchQuery("");
              }}
              className="reset-filters-btn"
            >
              <i className="fas fa-sync"></i> Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="posts-list">
            {sortedPosts.map((post) => (
              <div
                key={post.id}
                className={`post-card ${post.pinned ? "pinned" : ""}`}
              >
                {post.pinned && (
                  <div className="pin-indicator">
                    <i className="fas fa-thumbtack"></i> Ghim
                  </div>
                )}

                <div className="post-header">
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
                      <div className="post-time">
                        {formatDate(post.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="post-category">
                    <i className={`fas ${getCategoryIcon(post.category)}`}></i>
                    {getCategoryName(post.category)}
                  </div>
                </div>

                <div className="post-content">
                  <h3 className="post-title">
                    <Link to={`/parent/community/post/${post.id}`}>
                      {post.title}
                    </Link>
                  </h3>
                  <p className="post-excerpt">
                    {post.excerpt || post.content.substring(0, 250) + "..."}
                  </p>
                </div>

                <div className="post-footer">
                  <div className="post-stats">
                    <button
                      className={`like-btn ${
                        likedPosts.includes(post.id.toString()) ? "liked" : ""
                      }`}
                      onClick={(e) => handlePostLike(post.id, e)}
                    >
                      <i
                        className={`${
                          likedPosts.includes(post.id.toString())
                            ? "fas"
                            : "far"
                        } fa-heart`}
                      ></i>{" "}
                      {post.likes}
                    </button>
                    <Link
                      to={`/parent/community/post/${post.id}`}
                      className="comments-btn"
                    >
                      <i className="fas fa-comment"></i> {post.commentsCount}
                    </Link>
                  </div>

                  <Link
                    to={`/parent/community/post/${post.id}`}
                    className="read-more-btn"
                  >
                    Đọc tiếp <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Thêm phân trang */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="pagination-btn"
          >
            <i className="fas fa-chevron-left"></i> Trang trước
          </button>
          <span className="page-info">
            Trang {page}/{totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="pagination-btn"
          >
            Trang tiếp <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      <div className="community-sidebar">
        <div className="sidebar-section popular-topics">
          <h3>Chủ đề phổ biến</h3>
          <ul className="topic-list">
            <li>
              <button
                className={`topic-link ${
                  activeTab === "COVID-19 và trẻ em" ? "active" : ""
                }`}
                onClick={() => handleTopicFilter("COVID-19 và trẻ em")}
              >
                <i className="fas fa-virus"></i> COVID-19 và trẻ em
              </button>
            </li>
            <li>
              <button
                className={`topic-link ${
                  activeTab === "Dinh dưỡng học đường" ? "active" : ""
                }`}
                onClick={() => handleTopicFilter("Dinh dưỡng học đường")}
              >
                <i className="fas fa-apple-alt"></i> Dinh dưỡng học đường
              </button>
            </li>
            <li>
              <button
                className={`topic-link ${
                  activeTab === "Sức khỏe tâm thần" ? "active" : ""
                }`}
                onClick={() => handleTopicFilter("Sức khỏe tâm thần")}
              >
                <i className="fas fa-brain"></i> Sức khỏe tâm thần
              </button>
            </li>
            <li>
              <button
                className={`topic-link ${
                  activeTab === "Tuổi dậy thì" ? "active" : ""
                }`}
                onClick={() => handleTopicFilter("Tuổi dậy thì")}
              >
                <i className="fas fa-child"></i> Tuổi dậy thì
              </button>
            </li>
            <li>
              <button
                className={`topic-link ${
                  activeTab === "Vắc-xin cho học sinh" ? "active" : ""
                }`}
                onClick={() => handleTopicFilter("Vắc-xin cho học sinh")}
              >
                <i className="fas fa-syringe"></i> Vắc-xin cho học sinh
              </button>
            </li>
          </ul>
        </div>

        <div className="sidebar-section community-rules">
          <h3>Quy định cộng đồng</h3>
          <ul className="rules-list">
            <li>Tôn trọng mọi thành viên trong cộng đồng</li>
            <li>Không chia sẻ thông tin cá nhân của học sinh</li>
            <li>Không đăng nội dung quảng cáo, spam</li>
            <li>Kiểm tra thông tin trước khi chia sẻ</li>
            <li>Báo cáo những nội dung không phù hợp</li>
          </ul>
        </div>

        <div className="sidebar-section contact-nurse">
          <h3>Liên hệ y tá trường học</h3>
          <div className="nurse-contact">
            <div className="nurse-info">
              <img
                src="https://randomuser.me/api/portraits/women/45.jpg"
                alt="Y tá Nguyễn Thị Hương"
                className="nurse-avatar"
              />
              <div className="nurse-details">
                <div className="nurse-name">Y tá Nguyễn Thị Hương</div>
                <div className="nurse-title">Y tá trưởng</div>
              </div>
            </div>
            <a href="tel:+84912345678" className="contact-btn">
              <i className="fas fa-phone"></i> Gọi điện
            </a>
            <Link to="/parent/contact" className="contact-btn message">
              <i className="fas fa-envelope"></i> Nhắn tin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
