import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "../shared/header-fix.css"; // Import header-fix TRƯỚC Community.css
import "./Community.css";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import SearchBox from "../../../../components/SearchBox/SearchBox"; // Import SearchBox component
import { useAuth } from "../../../../context/AuthContext";
import communityService from "../../../../services/communityService"; // Import communityService

const Community = () => {
  const { currentUser } = useAuth();
  const [allPosts, setAllPosts] = useState([]); // Store all posts từ API
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
  // Thêm state để quản lý bài viết đã được ghim
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại cho pagination client-side
  const postsPerPage = 10; // Số bài viết mỗi trang
  const [totalPages, setTotalPages] = useState(1);

  // API URL
  const API_URL = "http://localhost:8080/api/v1";

  // Function to check authentication
  const checkAuthentication = () => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    console.log("🔐 Authentication check:", {
      token: token ? `${token.substring(0, 20)}...` : null,
      userData: userData ? JSON.parse(userData) : null,
      currentUser,
    });

    if (!token || !currentUser) {
      console.warn("⚠️ No authentication found");
      return false;
    }

    return true;
  };

  // Helper function to normalize role matching
  const matchRole = (postAuthorRole, targetRole) => {
    if (!postAuthorRole) return false;

    const normalizedPostRole = postAuthorRole.toString().toLowerCase();
    const normalizedTargetRole = targetRole.toLowerCase();

    return (
      normalizedPostRole === normalizedTargetRole ||
      normalizedPostRole === normalizedTargetRole + "s" || // Handle plurals
      normalizedTargetRole === normalizedPostRole + "s"
    );
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

  // Load tất cả posts một lần duy nhất khi component mount
  useEffect(() => {
    const fetchAllPosts = async () => {
      setLoading(true);
      console.log("🔄 Fetching all posts once...");

      // Check authentication first
      if (!checkAuthentication()) {
        console.log("🔄 Using mock data due to authentication issues");
        setAllPosts(MOCK_POSTS);
        setLoading(false);
        return;
      }

      try {
        // Fetch all posts without pagination (or with a large page size)
        const result = await communityService.getPosts(1, 1000, null, null);
        console.log("📝 API response:", result);

        if (
          result &&
          result.status === "success" &&
          result.data &&
          Array.isArray(result.data.content)
        ) {
          console.log(
            "✅ Posts data valid:",
            result.data.content.length,
            "posts"
          );

          // Cập nhật liked và bookmarked posts từ API response
          const likedPostIds = [];
          const bookmarkedPostIds = [];

          result.data.content.forEach((post) => {
            if (post.liked) {
              likedPostIds.push(parseInt(post.id));
            }
            if (post.bookmarked) {
              bookmarkedPostIds.push(parseInt(post.id));
            }
          });

          setLikedPosts(likedPostIds);
          setBookmarkedPosts(bookmarkedPostIds);
          setAllPosts(result.data.content);
        } else {
          console.warn("⚠️ API response invalid, using mock data:", result);
          setAllPosts(MOCK_POSTS);
        }
      } catch (error) {
        console.error("❌ Error fetching posts:", error);
        console.log("🔄 Falling back to mock data");
        setAllPosts(MOCK_POSTS);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPosts();
  }, []); // Chỉ chạy một lần khi component mount

  // Function để refresh lại dữ liệu
  const refreshPosts = () => {
    fetchAllPosts();
  };

  // Lọc và tìm kiếm bài viết trên client-side
  const filteredPosts = Array.isArray(allPosts)
    ? allPosts.filter((post) => {
        // Đảm bảo post và các thuộc tính cần thiết tồn tại
        if (!post || !post.author) return false;

        // Lọc theo tab
        const matchesTab =
          activeTab === "all" ||
          (activeTab === "nurse" && matchRole(post.author.role, "nurse")) ||
          (activeTab === "parent" && matchRole(post.author.role, "parent")) ||
          (activeTab === "bookmarked" &&
            bookmarkedPosts.includes(parseInt(post.id))) ||
          activeTab === post.category;

        // Cải thiện tìm kiếm: tìm trong tiêu đề, nội dung, excerpt và tên tác giả
        const matchesSearch =
          searchQuery === "" ||
          (post.title &&
            post.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (post.content &&
            post.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (post.excerpt &&
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (post.author?.name &&
            post.author.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (post.category &&
            post.category.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesTab && matchesSearch;
      })
    : [];

  // Sắp xếp bài viết: ghim lên đầu, sau đó sắp xếp theo thời gian
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Pagination trên client-side
  const totalFilteredPages = Math.ceil(sortedPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = sortedPosts.slice(startIndex, endIndex);

  // Reset về trang đầu khi thay đổi filter hoặc search
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

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

    if (!checkAuthentication()) {
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
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

      console.log("📝 Sending post data:", postData); // Log dữ liệu gửi đi

      // Sử dụng communityService thay vì axios trực tiếp
      const result = await communityService.createPost(postData);
      console.log("📝 Create post result:", result);

      if (result && result.status === "success") {
        // Thêm bài viết mới vào đầu danh sách allPosts
        setAllPosts((prev) => [result.data, ...prev]);

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
      console.error("❌ Error creating post:", error);

      // Hiển thị chi tiết lỗi để debug
      if (error.response) {
        console.error("❌ API response error:", error.response.data);
        if (error.response.status === 401) {
          alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
        } else {
          alert(
            `Lỗi: ${
              error.response?.data?.message ||
              error.response?.statusText ||
              "Không thể tạo bài viết"
            }`
          );
        }
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

    if (!checkAuthentication()) {
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
      return;
    }

    // Đảm bảo postId là number
    const numericPostId = parseInt(postId);

    if (isNaN(numericPostId)) {
      console.error("❌ Invalid postId for like:", postId);
      alert("Lỗi: ID bài viết không hợp lệ");
      return;
    }

    try {
      console.log("👍 Attempting to like post:", numericPostId);
      const result = await communityService.toggleLike(numericPostId);
      console.log("👍 Like result:", result);

      if (result.status === "success") {
        const { liked, likesCount } = result.data;

        // Cập nhật state cho likedPosts
        if (liked) {
          setLikedPosts((prev) => [...prev, numericPostId]);
        } else {
          setLikedPosts((prev) => prev.filter((id) => id !== numericPostId));
        }

        // Cập nhật số lượt like trong danh sách bài viết
        setAllPosts((prev) =>
          prev.map((post) =>
            parseInt(post.id) === numericPostId
              ? { ...post, likes: likesCount }
              : post
          )
        );
      }
    } catch (error) {
      console.error("❌ Error liking post:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (error.response?.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
      } else if (error.response?.status === 400) {
        alert("Lỗi yêu cầu không hợp lệ. Vui lòng thử lại");
      } else {
        alert("Không thể thực hiện thao tác. Vui lòng thử lại sau.");
      }
    }
  };

  // Xử lý việc ghim bài viết
  const handleBookmark = async (postId, e) => {
    e.preventDefault(); // Ngăn chuyển trang khi click

    if (!currentUser) {
      alert("Vui lòng đăng nhập để ghim bài viết");
      return;
    }

    // Đảm bảo postId là number
    const numericPostId = parseInt(postId);

    if (isNaN(numericPostId)) {
      console.error("❌ Invalid postId for bookmark:", postId);
      alert("Lỗi: ID bài viết không hợp lệ");
      return;
    }

    try {
      console.log("📌 Attempting to bookmark post:", numericPostId);

      // Sử dụng communityService thay vì fetch trực tiếp
      const result = await communityService.toggleBookmark(numericPostId);
      console.log("📌 Bookmark result:", result);

      if (result.status === "success") {
        const { bookmarked } = result.data;

        // Cập nhật state cho bookmarkedPosts
        if (bookmarked) {
          setBookmarkedPosts((prev) => [...prev, numericPostId]);
        } else {
          setBookmarkedPosts((prev) =>
            prev.filter((id) => id !== numericPostId)
          );
        }

        // Cập nhật trong posts list
        setAllPosts((prev) =>
          prev.map((post) =>
            parseInt(post.id) === numericPostId ? { ...post, bookmarked } : post
          )
        );
      }
    } catch (error) {
      console.error("❌ Lỗi khi ghim bài viết:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (error.response?.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
      } else if (error.response?.status === 400) {
        alert("Lỗi yêu cầu không hợp lệ. Vui lòng thử lại");
      } else {
        alert("Không thể ghim bài viết. Vui lòng thử lại sau.");
      }
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

  const handleTopicFilter = (topicCategory) => {
    // Sử dụng handleTabChange để đảm bảo consistency
    handleTabChange(topicCategory);

    // Cuộn lên đầu trang để hiển thị kết quả lọc
    // Remove scroll to prevent conflicts with layout
  };

  // Helper function để xử lý chuyển tab
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    // Reset về trang đầu khi chuyển tab
    setCurrentPage(1);
  };

  if (loading) {
    return <LoadingSpinner text="Đang tải nội dung cộng đồng..." />;
  }

  return (
    <div className="parent-content-wrapper">
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
            <button
              className="refresh-posts-btn"
              onClick={refreshPosts}
              disabled={loading}
              title="Tải lại bài viết"
            >
              <i className={`fas fa-sync-alt ${loading ? "fa-spin" : ""}`}></i>
              Làm mới
            </button>
          </div>
        </div>

        <div className="community-filter-bar">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => handleTabChange("all")}
            >
              <i className="fas fa-th-large"></i> Tất cả
            </button>

            {/* Thêm tab bài viết đã ghim */}
            <button
              className={`filter-tab ${
                activeTab === "bookmarked" ? "active" : ""
              }`}
              onClick={() => handleTabChange("bookmarked")}
            >
              <i className="fas fa-bookmark"></i> Đã ghim
            </button>

            {/* Các tab khác */}
            <button
              className={`filter-tab ${activeTab === "nurse" ? "active" : ""}`}
              onClick={() => handleTabChange("nurse")}
            >
              <i className="fas fa-user-nurse"></i> Từ y tá
            </button>
            <button
              className={`filter-tab ${activeTab === "parent" ? "active" : ""}`}
              onClick={() => handleTabChange("parent")}
            >
              <i className="fas fa-user-friends"></i> Từ phụ huynh
            </button>
            <button
              className={`filter-tab ${
                activeTab === "question" ? "active" : ""
              }`}
              onClick={() => handleTabChange("question")}
            >
              <i className="fas fa-question-circle"></i> Câu hỏi
            </button>
            <button
              className={`filter-tab ${
                activeTab === "announcement" ? "active" : ""
              }`}
              onClick={() => handleTabChange("announcement")}
            >
              <i className="fas fa-bullhorn"></i> Thông báo
            </button>
          </div>

          <div className="search-bar">
            <SearchBox
              placeholder="Tìm kiếm bài viết (tiêu đề, nội dung, tác giả...)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={() => {}} // Search tự động xử lý qua onChange
              className="community-search"
            />
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
                    <option value="COVID-19 và trẻ em">
                      COVID-19 và trẻ em
                    </option>
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
                    <label
                      htmlFor="post-attachments"
                      className="file-upload-btn"
                    >
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
          {currentPosts.length === 0 ? (
            <div className="empty-posts">
              <i className="fas fa-search"></i>
              <p>
                {searchQuery
                  ? `Không tìm thấy bài viết nào chứa "${searchQuery}"`
                  : "Không tìm thấy bài viết nào phù hợp"}
              </p>
              <button
                onClick={() => {
                  handleTabChange("all");
                  setSearchQuery("");
                }}
                className="reset-filters-btn"
              >
                <i className="fas fa-sync"></i> Xóa bộ lọc
              </button>
            </div>
          ) : (
            <>
              {/* Hiển thị thông tin tìm kiếm */}
              {(searchQuery || activeTab !== "all") && (
                <div className="search-results-info">
                  <p>
                    Tìm thấy <strong>{sortedPosts.length}</strong> bài viết
                    {searchQuery && (
                      <span>
                        {" "}
                        cho từ khóa "<strong>{searchQuery}</strong>"
                      </span>
                    )}
                    {activeTab !== "all" && (
                      <span>
                        {" "}
                        trong danh mục "<strong>{activeTab}</strong>"
                      </span>
                    )}
                  </p>
                </div>
              )}

              <div className="posts-list">
                {currentPosts.map((post) => (
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
                          <div className="post-time">
                            {formatDate(post.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="post-category">
                        <i
                          className={`fas ${getCategoryIcon(post.category)}`}
                        ></i>
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
                            likedPosts.includes(parseInt(post.id))
                              ? "liked"
                              : ""
                          }`}
                          onClick={(e) => handlePostLike(post.id, e)}
                        >
                          <i
                            className={`${
                              likedPosts.includes(parseInt(post.id))
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
                          <i className="fas fa-comment"></i>{" "}
                          {post.commentsCount}
                        </Link>

                        {/* Thêm nút bookmark */}
                        <button
                          className={`bookmark-btn ${
                            bookmarkedPosts.includes(parseInt(post.id))
                              ? "bookmarked"
                              : ""
                          }`}
                          onClick={(e) => handleBookmark(post.id, e)}
                          title={
                            bookmarkedPosts.includes(parseInt(post.id))
                              ? "Bỏ ghim"
                              : "Ghim bài viết"
                          }
                        >
                          <i
                            className={`${
                              bookmarkedPosts.includes(parseInt(post.id))
                                ? "fas"
                                : "far"
                            } fa-bookmark`}
                          ></i>
                        </button>
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
            </>
          )}
        </div>

        {/* Pagination Controls */}
        {totalFilteredPages > 1 && (
          <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="pagination-btn prev-btn"
            >
              <i className="fas fa-chevron-left"></i> Trang trước
            </button>

            <span className="pagination-info">
              Trang {currentPage} / {totalFilteredPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalFilteredPages, prev + 1))
              }
              disabled={currentPage >= totalFilteredPages}
              className="pagination-btn next-btn"
            >
              Trang sau <i className="fas fa-chevron-right"></i>
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
                <div className="nurse-avatar-container">
                  <i className="fas fa-user-nurse"></i>
                </div>
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
    </div>
  );
};

export default Community;
