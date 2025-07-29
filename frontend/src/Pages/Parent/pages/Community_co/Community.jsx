import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "../shared/header-fix.css"; // Import header-fix TRƯỚC Community.css
import "./Community.css";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import SearchBox from "../../../../components/SearchBox/SearchBox"; // Import SearchBox component
import { useAuth } from "../../../../context/AuthContext";
import { useNotification } from "../../../../context/NotificationContext";
import communityService from "../../../../services/APIParent/communityService"; // Import communityService
import sessionService from "../../../../services/sessionService";
import {
  formatDate,
  safeParseDate,
  sortByDate,
  areDatesDifferent,
} from "./utils/dateUtils"; // Import date utilities

const Community = () => {
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
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

  // Thêm state để theo dõi bài viết đã được like - load từ localStorage theo token
  const [likedPosts, setLikedPosts] = useState(() => {
    const saved = localStorage.getItem(getUserStorageKey("likedPosts"));
    return saved ? JSON.parse(saved) : [];
  });

  // Thêm state để quản lý bài viết đã được ghim - load từ localStorage theo token
  const [bookmarkedPosts, setBookmarkedPosts] = useState(() => {
    const saved = localStorage.getItem(getUserStorageKey("bookmarkedPosts"));
    return saved ? JSON.parse(saved) : [];
  });
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại cho pagination client-side
  const postsPerPage = 10; // Số bài viết mỗi trang
  const [totalPages, setTotalPages] = useState(1);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // ✅ NEW: State để prevent multiple clicks
  const [likingPosts, setLikingPosts] = useState(new Set()); // Track posts đang được like/unlike
  const [bookmarkingPosts, setBookmarkingPosts] = useState(new Set()); // Track posts đang được bookmark

  // API URL
  const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1`;

  // Function to check authentication using sessionService
  const checkAuthentication = () => {
    const token = sessionService.getToken();
    const userData = sessionService.getUserData();

    console.log("🔐 Authentication check:", {
      token: token ? `${token.substring(0, 20)}...` : null,
      userData: userData,
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

  // Effect để lưu trạng thái liked posts vào localStorage theo user info
  useEffect(() => {
    if (currentUser?.id || sessionService.getToken()) {
      localStorage.setItem(
        getUserStorageKey("likedPosts"),
        JSON.stringify(likedPosts)
      );
    }
  }, [likedPosts, currentUser?.id]);

  // Effect để lưu trạng thái bookmarked posts vào localStorage theo user info
  useEffect(() => {
    if (currentUser?.id || sessionService.getToken()) {
      localStorage.setItem(
        getUserStorageKey("bookmarkedPosts"),
        JSON.stringify(bookmarkedPosts)
      );
    }
  }, [bookmarkedPosts, currentUser?.id]);

  // ✅ SYNC FIX: Listen for like changes from CommunityPost
  useEffect(() => {
    const handlePostLikeChanged = (event) => {
      const { postId, liked, likesCount, source } = event.detail;

      console.log("🔄 Received postLikeChanged event:", {
        postId,
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

      // Update post in allPosts array
      setAllPosts((prev) =>
        prev.map((post) =>
          parseInt(post.id) === postId
            ? {
                ...post,
                likes: likesCount,
                likesCount: likesCount,
                liked: liked,
              }
            : post
        )
      );
    };

    window.addEventListener("postLikeChanged", handlePostLikeChanged);

    return () => {
      window.removeEventListener("postLikeChanged", handlePostLikeChanged);
    };
  }, [likedPosts]);

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

          // ✅ ENHANCED FIX: Merge localStorage với API data và đảm bảo like count chính xác
          const savedLikedPosts = JSON.parse(
            localStorage.getItem(getUserStorageKey("likedPosts")) || "[]"
          );
          const savedBookmarkedPosts = JSON.parse(
            localStorage.getItem(getUserStorageKey("bookmarkedPosts")) || "[]"
          );

          // Merge thay vì reset - bắt đầu từ localStorage data
          const mergedLikedPosts = [...savedLikedPosts];
          const mergedBookmarkedPosts = [...savedBookmarkedPosts];

          // ✅ ENHANCED: Process posts và ensure correct like counts
          const processedPosts = result.data.content.map((post) => {
            const postId = parseInt(post.id);

            // ✅ DEBUG: Log post data to identify date format issues
            console.log(`📊 Processing post ${postId}:`, {
              title: post.title?.substring(0, 30) + "...",
              createdAt: post.createdAt,
              createdAtType: typeof post.createdAt,
              updatedAt: post.updatedAt,
              isArray: Array.isArray(post.createdAt),
              rawPost: post,
            });

            // Check localStorage state
            const isLikedInStorage = savedLikedPosts.includes(postId);
            const isBookmarkedInStorage = savedBookmarkedPosts.includes(postId);

            // Merge API liked state with localStorage
            if (post.liked && !mergedLikedPosts.includes(postId)) {
              mergedLikedPosts.push(postId);
            }
            if (post.bookmarked && !mergedBookmarkedPosts.includes(postId)) {
              mergedBookmarkedPosts.push(postId);
            }

            // ✅ CRITICAL FIX: Ensure like count is correct
            // If user liked in localStorage but API doesn't reflect it, we trust localStorage for UI consistency
            const actualLikeCount = post.likes || post.likesCount || 0;
            const userLikedFromStorage = isLikedInStorage;
            const userLikedFromAPI = post.liked;

            console.log(`📊 Post ${postId} like analysis:`, {
              title: post.title?.substring(0, 30) + "...",
              apiLikeCount: actualLikeCount,
              apiLiked: userLikedFromAPI,
              storageLiked: userLikedFromStorage,
              finalLiked: userLikedFromStorage || userLikedFromAPI,
            });

            return {
              ...post,
              likes: actualLikeCount,
              likesCount: actualLikeCount,
              liked: userLikedFromStorage || userLikedFromAPI, // Merge both states
              bookmarked: isBookmarkedInStorage || post.bookmarked,
            };
          });

          console.log("📊 Enhanced Merge state:", {
            savedLikedPosts,
            apiLikedCount: result.data.content.filter((p) => p.liked).length,
            finalLikedPosts: mergedLikedPosts,
            savedBookmarkedPosts,
            apiBookmarkedCount: result.data.content.filter((p) => p.bookmarked)
              .length,
            finalBookmarkedPosts: mergedBookmarkedPosts,
            processedPostsCount: processedPosts.length,
          });

          // ✅ Cập nhật state với merged data
          setLikedPosts(mergedLikedPosts);
          setBookmarkedPosts(mergedBookmarkedPosts);
          setAllPosts(processedPosts); // Use processed posts with correct counts
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
  const refreshPosts = async () => {
    setLoading(true);
    console.log("🔄 Refreshing posts...");

    if (!checkAuthentication()) {
      console.log("🔄 Using mock data due to authentication issues");
      setAllPosts(MOCK_POSTS);
      setLoading(false);
      return;
    }

    try {
      const result = await communityService.getPosts(1, 1000, null, null);
      console.log("📝 Refresh API response:", result);

      if (
        result &&
        result.status === "success" &&
        result.data &&
        Array.isArray(result.data.content)
      ) {
        // ✅ ENHANCED REFRESH FIX: Merge với localStorage data và ensure correct like counts
        const savedLikedPosts = JSON.parse(
          localStorage.getItem(getUserStorageKey("likedPosts")) || "[]"
        );
        const savedBookmarkedPosts = JSON.parse(
          localStorage.getItem(getUserStorageKey("bookmarkedPosts")) || "[]"
        );

        // Merge thay vì chỉ map với state hiện tại
        const mergedLikedPosts = [...savedLikedPosts];
        const mergedBookmarkedPosts = [...savedBookmarkedPosts];

        // ✅ ENHANCED: Process posts với correct like counts
        const processedPosts = result.data.content.map((post) => {
          const postId = parseInt(post.id);

          // ✅ DEBUG: Log post data for refresh to identify date issues
          console.log(`🔄 Refresh processing post ${postId}:`, {
            title: post.title?.substring(0, 30) + "...",
            createdAt: post.createdAt,
            createdAtType: typeof post.createdAt,
            isArray: Array.isArray(post.createdAt),
          });

          // Check localStorage state
          const isLikedInStorage = savedLikedPosts.includes(postId);
          const isBookmarkedInStorage = savedBookmarkedPosts.includes(postId);

          // Merge API liked state with localStorage
          if (post.liked && !mergedLikedPosts.includes(postId)) {
            mergedLikedPosts.push(postId);
          }
          if (post.bookmarked && !mergedBookmarkedPosts.includes(postId)) {
            mergedBookmarkedPosts.push(postId);
          }

          // ✅ CRITICAL FIX: Ensure like count is correct for refresh
          const actualLikeCount = post.likes || post.likesCount || 0;
          const userLikedFromStorage = isLikedInStorage;
          const userLikedFromAPI = post.liked;

          console.log(`🔄 Refresh Post ${postId} analysis:`, {
            title: post.title?.substring(0, 30) + "...",
            apiLikeCount: actualLikeCount,
            apiLiked: userLikedFromAPI,
            storageLiked: userLikedFromStorage,
            finalLiked: userLikedFromStorage || userLikedFromAPI,
          });

          return {
            ...post,
            likes: actualLikeCount,
            likesCount: actualLikeCount,
            liked: userLikedFromStorage || userLikedFromAPI,
            bookmarked: isBookmarkedInStorage || post.bookmarked,
          };
        });

        console.log("🔄 Enhanced Refresh merge state:", {
          savedLikedPosts,
          apiLikedCount: result.data.content.filter((p) => p.liked).length,
          finalLikedPosts: mergedLikedPosts,
          savedBookmarkedPosts,
          finalBookmarkedPosts: mergedBookmarkedPosts,
          processedPostsCount: processedPosts.length,
        });

        // Cập nhật state với merged data
        setLikedPosts(mergedLikedPosts);
        setBookmarkedPosts(mergedBookmarkedPosts);
        setAllPosts(processedPosts); // Use processed posts
        console.log("✅ Posts refreshed successfully with enhanced merge");
      } else {
        console.warn(
          "⚠️ API response invalid during refresh, keeping current data"
        );
      }
    } catch (error) {
      console.error("❌ Error refreshing posts:", error);
      console.log("🔄 Keeping current data");
    } finally {
      setLoading(false);
    }
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

  // Sắp xếp bài viết: ghim cá nhân lên đầu, sau đó sắp xếp theo thời gian
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    // Ưu tiên bài viết đã được ghim bởi user
    const aBookmarked = bookmarkedPosts.includes(parseInt(a.id));
    const bBookmarked = bookmarkedPosts.includes(parseInt(b.id));

    if (aBookmarked && !bBookmarked) return -1;
    if (!aBookmarked && bBookmarked) return 1;

    // Sử dụng safeParseDate để tránh invalid date
    const dateA = safeParseDate(a.createdAt);
    const dateB = safeParseDate(b.createdAt);

    return dateB.getTime() - dateA.getTime();
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

  // Effect để ẩn/hiện header khi modal mở/đóng và control body scroll
  useEffect(() => {
    const headerElement = document.querySelector(".parent-header");
    const bodyElement = document.body;

    if (showCreatePostForm) {
      // Ẩn header và ngăn body scroll khi modal mở
      if (headerElement) {
        headerElement.style.display = "none";
      }
      bodyElement.style.overflow = "hidden";
    } else {
      // Hiện header và cho phép body scroll khi modal đóng
      if (headerElement) {
        headerElement.style.display = "block";
      }
      bodyElement.style.overflow = "auto";
    }

    // Cleanup function để đảm bảo header được hiển thị lại khi component unmount
    return () => {
      if (headerElement) {
        headerElement.style.display = "block";
      }
      bodyElement.style.overflow = "auto";
    };
  }, [showCreatePostForm]);

  // Effect để tự động đóng success modal sau 3 giây
  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000); // 3 giây

      // Cleanup timer khi component unmount hoặc showSuccessToast thay đổi
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

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

        // Hiển thị thông báo thành công đẹp
        setShowSuccessToast(true);

        // Fallback cho trường hợp notification context không có
        if (showNotification) {
          showNotification("Đăng bài viết thành công! 🎉", "success");
        }
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

    // ✅ PROTECTION: Prevent multiple clicks on same post
    if (likingPosts.has(numericPostId)) {
      console.log(
        "⏳ Like action already in progress for post:",
        numericPostId
      );
      return;
    }

    // Tìm post hiện tại để debug
    const currentPost = allPosts.find((p) => parseInt(p.id) === numericPostId);
    const currentLikeCount = currentPost?.likes || currentPost?.likesCount || 0;
    const wasLiked = likedPosts.includes(numericPostId);

    console.log("👍 BEFORE Like action:", {
      postId: numericPostId,
      currentLikeCount,
      wasLiked,
      postTitle: currentPost?.title?.substring(0, 50) + "...",
      postCategory: currentPost?.category,
      likedPostsState: likedPosts.includes(numericPostId),
      isInProgress: likingPosts.has(numericPostId),
    });

    // ✅ PROTECTION: Add to in-progress set
    setLikingPosts((prev) => new Set(prev).add(numericPostId));

    try {
      console.log("👍 Attempting to like post:", numericPostId);
      const result = await communityService.toggleLike(numericPostId);
      console.log("👍 Like result:", result);

      if (result.status === "success") {
        const { liked, likesCount, likes } = result.data;

        // ✅ ENHANCED: Validate API response structure
        if (typeof liked !== "boolean") {
          console.error(
            "❌ Invalid API response: 'liked' field missing or not boolean",
            result.data
          );
          alert("Lỗi: Phản hồi từ server không hợp lệ");
          return;
        }

        // API có thể trả về likesCount hoặc likes, ưu tiên likesCount
        const actualLikesCount = likesCount !== undefined ? likesCount : likes;

        // ✅ ENHANCED: Validate like count is a valid number
        if (
          actualLikesCount === undefined ||
          isNaN(actualLikesCount) ||
          actualLikesCount < 0
        ) {
          console.error("❌ Invalid like count from API:", {
            likesCount,
            likes,
            actualLikesCount,
          });
          alert("Lỗi: Số lượt thích không hợp lệ");
          return;
        }

        console.log("👍 AFTER API call:", {
          liked,
          likesCount,
          likes,
          actualLikesCount,
          expectedChange: wasLiked
            ? currentLikeCount - 1
            : currentLikeCount + 1,
        });

        // ✅ CRITICAL FIX: Sanity check for like count logic
        const expectedLikeCount = wasLiked
          ? currentLikeCount - 1
          : currentLikeCount + 1;
        const countDifference = Math.abs(actualLikesCount - expectedLikeCount);

        if (countDifference > 5) {
          console.warn("🚨 SUSPICIOUS LIKE COUNT CHANGE:", {
            currentCount: currentLikeCount,
            newCount: actualLikesCount,
            expected: expectedLikeCount,
            difference: countDifference,
            action: wasLiked ? "UNLIKE" : "LIKE",
          });

          // Option 1: Use expected count for UI consistency
          const correctedCount = Math.max(0, expectedLikeCount);
          console.log("🔧 Using corrected count for UI:", correctedCount);

          // Override with corrected count
          var finalLikeCount = correctedCount;
        } else {
          var finalLikeCount = actualLikesCount;
        }

        // ✅ ENHANCED: Safe state update with try-catch
        try {
          // Cập nhật likedPosts state với validation
          const newLikedPosts = liked
            ? [
                ...likedPosts.filter((id) => id !== numericPostId),
                numericPostId,
              ]
            : likedPosts.filter((id) => id !== numericPostId);

          console.log("👍 Updating likedPosts:", {
            before: likedPosts,
            after: newLikedPosts,
            action: liked ? "ADDED" : "REMOVED",
            postId: numericPostId,
          });

          setLikedPosts(newLikedPosts);

          // Cập nhật số lượt like trong danh sách bài viết với số chính xác từ API
          setAllPosts((prev) =>
            prev.map((post) =>
              parseInt(post.id) === numericPostId
                ? {
                    ...post,
                    likes: finalLikeCount, // Use corrected count
                    likesCount: finalLikeCount, // Use corrected count
                    liked,
                  }
                : post
            )
          );

          // ✅ SYNC FIX: Dispatch custom event để thông báo cho CommunityPost.jsx
          window.dispatchEvent(
            new CustomEvent("postLikeChanged", {
              detail: {
                postId: numericPostId,
                liked: liked,
                likesCount: finalLikeCount,
                source: "Community",
              },
            })
          );

          // Hiển thị thông báo thành công
          console.log(
            `✅ ${
              liked ? "Đã thích" : "Đã bỏ thích"
            } bài viết thành công! Số like: ${finalLikeCount} (API: ${actualLikesCount})`
          );
        } catch (stateUpdateError) {
          console.error("❌ Error updating state:", stateUpdateError);
          alert("Lỗi: Không thể cập nhật trạng thái. Vui lòng refresh trang.");
        }
      } else {
        // ✅ ENHANCED: Handle non-success API responses
        console.error("❌ API returned non-success status:", result);
        const errorMessage = result.message || result.error || "Không xác định";
        alert(`Lỗi từ server: ${errorMessage}`);
      }
    } catch (error) {
      console.error("❌ Error liking/unliking post:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        postId: numericPostId,
        wasLiked: wasLiked,
        action: wasLiked ? "UNLIKE" : "LIKE",
      });

      // ✅ ENHANCED: More specific error handling
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 401:
            console.error("🔐 Authentication error:", data);
            alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
            break;
          case 400:
            console.error("📝 Bad request error:", data);
            alert("Lỗi yêu cầu không hợp lệ. Vui lòng thử lại");
            break;
          case 403:
            console.error("🚫 Permission error:", data);
            alert("Bạn không có quyền thực hiện thao tác này");
            break;
          case 404:
            console.error("🔍 Post not found:", data);
            alert("Bài viết không tồn tại hoặc đã bị xóa");
            break;
          case 500:
            console.error("🔥 Server error:", data);
            alert("Lỗi server. Vui lòng thử lại sau");
            break;
          default:
            console.error(`❓ Unknown server error (${status}):`, data);
            alert(`Lỗi server (${status}). Vui lòng thử lại sau`);
        }
      } else if (error.request) {
        // Network error - no response received
        console.error("🌐 Network error:", error.request);
        alert("Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại");
      } else {
        // Something else went wrong
        console.error("❓ Unknown error:", error.message);
        alert("Có lỗi xảy ra. Vui lòng thử lại sau");
      }

      // ✅ ENHANCED: Optional - revert UI state if needed
      console.log("🔄 Error occurred, UI state preserved (no changes made)");
    } finally {
      // ✅ PROTECTION: Always remove from in-progress set
      setLikingPosts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(numericPostId);
        return newSet;
      });
      console.log("🔄 Removed post from liking progress:", numericPostId);
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

        // Hiển thị thông báo thành công
        console.log(
          `✅ ${bookmarked ? "Đã ghim" : "Đã bỏ ghim"} bài viết thành công!`
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

  // Helper function để format tên author đẹp hơn
  const formatAuthorName = (authorName, role) => {
    if (!authorName) return "Người dùng";

    // Kiểm tra nếu tên bắt đầu bằng các prefix cần format
    const lowerName = authorName.toLowerCase();

    if (lowerName.startsWith("nurse")) {
      return "Y tá trường";
    } else if (lowerName.startsWith("admin")) {
      return "Quản trị viên";
    } else if (lowerName.startsWith("parent")) {
      return "Phụ huynh";
    }

    // Trả về tên gốc nếu không match pattern nào
    return authorName;
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
        {/* Success Modal Notification */}
        {showSuccessToast && (
          <div
            className="success-modal"
            onClick={() => setShowSuccessToast(false)} // Click backdrop để đóng
          >
            <div
              className="success-modal-content"
              onClick={(e) => e.stopPropagation()} // Ngăn đóng khi click vào content
            >
              <div className="success-modal-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h3 className="success-modal-title">Thành công!</h3>
              <p className="success-modal-message">
                Bài viết của bạn đã được đăng thành công! 🎉
              </p>
              <button
                className="success-modal-close-btn"
                onClick={() => setShowSuccessToast(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        )}

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

                {/* Ẩn phần đính kèm file theo yêu cầu */}
                {/* 
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
                */}

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
                    className={`post-card ${
                      bookmarkedPosts.includes(parseInt(post.id))
                        ? "pinned bookmarked-post"
                        : ""
                    }`}
                  >
                    {/* Chỉ hiển thị indicator ghim cá nhân */}
                    {bookmarkedPosts.includes(parseInt(post.id)) && (
                      <div className="pin-indicator personal">
                        <i className="fas fa-bookmark"></i> Bài viết đã ghim
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
                            {formatAuthorName(
                              post.author.name,
                              post.author.role
                            )}
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
                            {post.author.role === "ADMIN" && (
                              <span className="author-badge admin">
                                <i className="fas fa-user-shield"></i> Quản trị
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
                          } ${
                            likingPosts.has(parseInt(post.id)) ? "loading" : ""
                          }`}
                          onClick={(e) => handlePostLike(post.id, e)}
                          disabled={likingPosts.has(parseInt(post.id))}
                        >
                          {likingPosts.has(parseInt(post.id)) ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i
                              className={`${
                                likedPosts.includes(parseInt(post.id))
                                  ? "fas"
                                  : "far"
                              } fa-heart`}
                            ></i>
                          )}{" "}
                          {post.likes || post.likesCount || 0}
                        </button>
                        <Link
                          to={`/parent/community/post/${post.id}`}
                          className="comments-btn"
                        >
                          <i className="fas fa-comment"></i>{" "}
                          {post.commentsCount || post.comments || 0}
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
          <div className="parent-pagination-controls">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="parent-pagination-btn parent-prev-btn"
            >
              <i className="fas fa-chevron-left"></i> Trang trước
            </button>

            <span className="parent-pagination-info">
              Trang {currentPage} / {totalFilteredPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalFilteredPages, prev + 1))
              }
              disabled={currentPage >= totalFilteredPages}
              className="parent-pagination-btn parent-next-btn"
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
