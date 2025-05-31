import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./CommunityPost.css";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

const CommunityPost = () => {
  const { postId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showAllComments, setShowAllComments] = useState(true);
  const [sortBy, setSortBy] = useState("latest");

  // Mock bài đăng
  const MOCK_POSTS = [
    {
      id: "post1",
      title: "Hướng dẫn chăm sóc trẻ bị sốt tại nhà",
      content: `<p>Khi con bạn bị sốt, đây có thể là dấu hiệu cơ thể đang chống lại nhiễm trùng. Sốt là một phần tự nhiên của phản ứng phòng vệ, nhưng có thể làm cho con bạn cảm thấy khó chịu. Dưới đây là một số hướng dẫn giúp chăm sóc trẻ khi bị sốt:</p>
      
      <h3>Theo dõi nhiệt độ của trẻ</h3>
      <p>Đo nhiệt độ của trẻ thường xuyên, đặc biệt là khi bạn cảm thấy trẻ nóng. Trẻ em được coi là bị sốt khi nhiệt độ cơ thể cao hơn 37.5°C. Nếu nhiệt độ vượt quá 38.5°C, hãy xem xét việc sử dụng thuốc hạ sốt.</p>
      
      <h3>Giữ đủ nước cho trẻ</h3>
      <p>Khi bị sốt, cơ thể trẻ mất nhiều nước hơn thông qua mồ hôi. Đảm bảo con bạn uống đủ nước để tránh mất nước. Nước lọc là tốt nhất, nhưng nước trái cây pha loãng cũng có thể giúp ích.</p>
      
      <h3>Quản lý sốt với thuốc phù hợp</h3>
      <p>Sử dụng thuốc hạ sốt như paracetamol (Tylenol) hoặc ibuprofen (Motrin, Advil) theo hướng dẫn liều lượng dựa trên cân nặng và tuổi của trẻ. Không bao giờ cho trẻ aspirin vì có thể dẫn đến hội chứng Reye, một biến chứng hiếm gặp nhưng nghiêm trọng.</p>
      
      <h3>Mặc quần áo nhẹ</h3>
      <p>Mặc quần áo nhẹ, thoáng cho trẻ. Quá nhiều lớp quần áo có thể giữ nhiệt và làm tăng nhiệt độ cơ thể. Nếu trẻ bị ớn lạnh, hãy đắp chăn mỏng.</p>
      
      <h3>Đảm bảo nghỉ ngơi đầy đủ</h3>
      <p>Trẻ cần nhiều thời gian nghỉ ngơi khi bị sốt. Đảm bảo môi trường yên tĩnh, thoải mái để trẻ có thể nghỉ ngơi và hồi phục.</p>
      
      <h3>Khi nào nên đưa trẻ đến bác sĩ:</h3>
      <ul>
        <li>Trẻ dưới 3 tháng tuổi có nhiệt độ trên 38°C</li>
        <li>Trẻ từ 3-6 tháng tuổi có nhiệt độ trên 38.9°C</li>
        <li>Sốt kéo dài hơn 3 ngày</li>
        <li>Trẻ có dấu hiệu mất nước: miệng khô, ít đi tiểu, không có nước mắt khi khóc</li>
        <li>Trẻ có phát ban, đau đầu dữ dội, cứng cổ, khó thở hoặc đau bụng</li>
        <li>Trẻ có biểu hiện co giật</li>
        <li>Trẻ lờ đờ, khó đánh thức hoặc cực kỳ kích động</li>
      </ul>
      
      <p>Nếu bạn không chắc chắn, hãy luôn tham khảo ý kiến của nhân viên y tế. Sức khỏe của con bạn là ưu tiên hàng đầu.</p>`,
      author: {
        id: "nurse1",
        name: "Y tá Nguyễn Thị Hương",
        avatar: "https://randomuser.me/api/portraits/women/45.jpg",
        role: "nurse",
        bio: "Y tá trưởng với 15 năm kinh nghiệm chăm sóc sức khỏe học đường",
      },
      category: "health-guide",
      createdAt: "2023-05-15T08:30:00",
      updatedAt: "2023-05-15T10:15:00",
      likes: 24,
      comments: 8,
      isPinned: true,
      tags: ["sốt", "chăm sóc tại nhà", "trẻ em", "sức khỏe"],
    },
    {
      id: "post2",
      title:
        "Con tôi hay bị đau bụng mỗi buổi sáng trước khi đến trường, làm thế nào?",
      content: `<p>Con trai tôi, học lớp 3, thường xuyên than phiền về việc đau bụng vào buổi sáng trước khi đi học. Khi ở nhà vào cuối tuần, cháu không có triệu chứng này. Tôi lo lắng không biết có phải do lo âu hoặc căng thẳng liên quan đến trường học không?</p>
      
      <p>Cháu thường đau ở vùng bụng trên, gần dạ dày và nói rằng cảm giác như có cái gì đó "thắt lại". Có những ngày cháu quá khó chịu đến mức không muốn ăn sáng.</p>
      
      <p>Tôi đã đưa cháu đi khám tổng quát và bác sĩ nói rằng không phát hiện vấn đề thể chất nào. Tuy nhiên, vấn đề vẫn tiếp diễn.</p>
      
      <p>Cháu nói rằng thích trường học và có bạn bè, nhưng tôi không biết liệu có điều gì đang gây căng thẳng cho cháu mà cháu không nói ra không.</p>
      
      <p>Phụ huynh nào đã từng trải qua tình huống tương tự có thể chia sẻ kinh nghiệm được không? Hoặc nếu có y tá, bác sĩ nào có lời khuyên thì tôi rất cảm kích.</p>`,
      author: {
        id: "parent1",
        name: "Trần Văn Nam",
        avatar: "https://randomuser.me/api/portraits/men/35.jpg",
        role: "parent",
        bio: "Phụ huynh của hai bé trai lớp 3 và lớp 6",
      },
      category: "question",
      createdAt: "2023-05-14T10:15:00",
      updatedAt: null,
      likes: 5,
      comments: 12,
      isPinned: false,
      tags: ["đau bụng", "lo âu", "trẻ em", "trường học"],
    },
    {
      id: "post3",
      title: "Thông báo: Chiến dịch tiêm chủng sắp diễn ra tại trường",
      content: `<p>Kính gửi quý phụ huynh,</p>
      
      <p>Nhà trường sẽ tổ chức chiến dịch tiêm chủng vắc-xin phòng bệnh cúm vào <strong>ngày 25/5/2023</strong>. Đây là chương trình tự nguyện, phụ huynh vui lòng điền vào mẫu đơn đồng ý và gửi lại cho giáo viên chủ nhiệm trước ngày 20/5/2023.</p>
      
      <h3>Thông tin chi tiết:</h3>
      <ul>
        <li>Loại vắc-xin: Vắc-xin phòng cúm mùa</li>
        <li>Đối tượng: Học sinh từ lớp 1 đến lớp 12</li>
        <li>Thời gian: 8:00 - 16:00 ngày 25/5/2023</li>
        <li>Địa điểm: Phòng y tế trường học</li>
        <li>Chi phí: Miễn phí (được tài trợ bởi Sở Y tế)</li>
      </ul>
      
      <p>Lợi ích của việc tiêm vắc-xin phòng cúm:</p>
      <ul>
        <li>Giảm nguy cơ mắc bệnh cúm và các biến chứng</li>
        <li>Giảm nguy cơ nhập viện do biến chứng cúm</li>
        <li>Bảo vệ những người xung quanh có nguy cơ cao</li>
        <li>Giảm số ngày nghỉ học do bệnh</li>
      </ul>
      
      <p>Điều kiện tiêm chủng:</p>
      <ul>
        <li>Học sinh khỏe mạnh, không có triệu chứng bệnh</li>
        <li>Không đang dùng thuốc kháng sinh</li>
        <li>Không có tiền sử dị ứng với vắc-xin</li>
      </ul>
      
      <p>Quý phụ huynh vui lòng tải mẫu đơn đồng ý <a href="#">tại đây</a> và gửi lại cho giáo viên chủ nhiệm.</p>
      
      <p>Nếu có câu hỏi, vui lòng liên hệ phòng y tế trường học theo số điện thoại: 028.1234.5678</p>
      
      <p>Trân trọng,<br/>Ban Giám hiệu & Đội ngũ Y tế Trường</p>`,
      author: {
        id: "nurse2",
        name: "Y tá Trưởng Phạm Minh Tuấn",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        role: "nurse",
        bio: "Y tá trưởng của trường với 20 năm kinh nghiệm y tế",
      },
      category: "announcement",
      createdAt: "2023-05-10T14:00:00",
      updatedAt: "2023-05-11T09:15:00",
      likes: 32,
      comments: 15,
      isPinned: true,
      tags: ["tiêm chủng", "vắc-xin", "cúm", "thông báo"],
    },
  ];

  // Mock dữ liệu bình luận
  const MOCK_COMMENTS = {
    post1: [
      {
        id: "comment1",
        postId: "post1",
        author: {
          id: "parent1",
          name: "Trần Văn Nam",
          avatar: "https://randomuser.me/api/portraits/men/35.jpg",
          role: "parent",
        },
        content:
          "Bài viết rất hữu ích. Con tôi tuần trước bị sốt, tôi đã áp dụng theo hướng dẫn và thấy hiệu quả. Đặc biệt là việc theo dõi nhiệt độ thường xuyên giúp tôi biết khi nào cần cho con uống thuốc.",
        createdAt: "2023-05-15T09:30:00",
        likes: 5,
      },
      {
        id: "comment2",
        postId: "post1",
        author: {
          id: "parent3",
          name: "Lê Thị Hồng",
          avatar: "https://randomuser.me/api/portraits/women/28.jpg",
          role: "parent",
        },
        content:
          "Tôi muốn hỏi thêm, với trẻ 2 tuổi thì có nên chườm ấm khi bị sốt không? Và nếu trẻ vừa sốt vừa ho thì có nên cho uống thuốc ho cùng với thuốc hạ sốt không?",
        createdAt: "2023-05-15T10:15:00",
        likes: 2,
      },
      {
        id: "comment3",
        postId: "post1",
        author: {
          id: "nurse1",
          name: "Y tá Nguyễn Thị Hương",
          avatar: "https://randomuser.me/api/portraits/women/45.jpg",
          role: "nurse",
        },
        content:
          "Cảm ơn bạn Hồng đã đặt câu hỏi. Với trẻ 2 tuổi, nên chườm mát chứ không phải chườm ấm khi bị sốt. Về thuốc ho và thuốc hạ sốt, có thể dùng đồng thời nếu tuân theo liều lượng, nhưng tốt nhất nên tham khảo ý kiến bác sĩ nhi khoa trước.",
        createdAt: "2023-05-15T10:45:00",
        likes: 8,
        isPinned: true,
      },
      {
        id: "comment4",
        postId: "post1",
        author: {
          id: "parent4",
          name: "Nguyễn Thành Long",
          avatar: "https://randomuser.me/api/portraits/men/42.jpg",
          role: "parent",
        },
        content:
          "Tôi thấy một số người nói rằng nên để trẻ 'đổ mồ hôi' để hạ sốt tự nhiên, không nên dùng thuốc ngay. Điều này có đúng không?",
        createdAt: "2023-05-15T12:20:00",
        likes: 1,
      },
      {
        id: "comment5",
        postId: "post1",
        author: {
          id: "nurse1",
          name: "Y tá Nguyễn Thị Hương",
          avatar: "https://randomuser.me/api/portraits/women/45.jpg",
          role: "nurse",
        },
        content:
          "Anh Long, đó là quan niệm cũ và không có cơ sở khoa học. Không nên để trẻ chịu đựng cơn sốt cao kéo dài với hy vọng 'đổ mồ hôi' sẽ hạ sốt. Nếu nhiệt độ trên 38.5°C, nên dùng thuốc hạ sốt phù hợp để trẻ không bị khó chịu và tránh các biến chứng như co giật do sốt.",
        createdAt: "2023-05-15T13:05:00",
        likes: 10,
      },
    ],
    post2: [
      {
        id: "comment6",
        postId: "post2",
        author: {
          id: "parent5",
          name: "Phạm Thị Mai",
          avatar: "https://randomuser.me/api/portraits/women/62.jpg",
          role: "parent",
        },
        content:
          "Con gái tôi cũng từng có triệu chứng tương tự. Sau một thời gian quan sát, tôi phát hiện ra là do cháu lo lắng về một bài kiểm tra toán hàng tuần. Có thể bạn nên trao đổi nhẹ nhàng với con về những áp lực học tập.",
        createdAt: "2023-05-14T11:20:00",
        likes: 4,
      },
      {
        id: "comment7",
        postId: "post2",
        author: {
          id: "nurse1",
          name: "Y tá Nguyễn Thị Hương",
          avatar: "https://randomuser.me/api/portraits/women/45.jpg",
          role: "nurse",
        },
        content:
          "Đau bụng buổi sáng trước khi đi học là triệu chứng khá phổ biến của lo âu liên quan đến trường học. Tuy nhiên, không nên loại trừ các nguyên nhân thể chất. Tôi gợi ý bạn theo dõi thêm: 1) Có mối liên hệ nào với thời gian biểu học tập không? 2) Con có thể đang gặp khó khăn với một môn học, giáo viên hoặc bạn bè? 3) Thử thay đổi bữa sáng xem có cải thiện không? Nếu tình trạng kéo dài, bạn có thể đưa con đến gặp chuyên gia tâm lý trẻ em.",
        createdAt: "2023-05-14T12:05:00",
        likes: 7,
        isPinned: true,
      },
    ],
    post3: [
      {
        id: "comment8",
        postId: "post3",
        author: {
          id: "parent1",
          name: "Trần Văn Nam",
          avatar: "https://randomuser.me/api/portraits/men/35.jpg",
          role: "parent",
        },
        content:
          "Tôi muốn hỏi liệu vắc-xin này có phù hợp cho trẻ bị hen suyễn không? Con trai tôi có tiền sử hen và tôi hơi lo lắng về phản ứng phụ.",
        createdAt: "2023-05-10T15:20:00",
        likes: 2,
      },
      {
        id: "comment9",
        postId: "post3",
        author: {
          id: "nurse2",
          name: "Y tá Trưởng Phạm Minh Tuấn",
          avatar: "https://randomuser.me/api/portraits/men/32.jpg",
          role: "nurse",
        },
        content:
          "Thực tế, trẻ em bị hen suyễn là một trong những nhóm được khuyến khích tiêm vắc-xin cúm vì họ có nguy cơ cao gặp biến chứng nghiêm trọng nếu mắc cúm. Tuy nhiên, tôi khuyên bạn nên tham khảo ý kiến bác sĩ chuyên về hen suyễn của con trước khi đưa ra quyết định. Nếu bạn quyết định cho con tiêm, chúng tôi sẽ theo dõi chặt chẽ sau tiêm để đảm bảo an toàn.",
        createdAt: "2023-05-10T15:45:00",
        likes: 5,
        isPinned: true,
      },
    ],
  };

  // Mock user's likes
  const MOCK_USER_LIKES = {
    posts: ["post1", "post3"],
    comments: ["comment3", "comment7", "comment9"],
  };

  useEffect(() => {
    // Giả lập tải dữ liệu từ server
    setTimeout(() => {
      const foundPost = MOCK_POSTS.find((p) => p.id === postId);
      if (foundPost) {
        setPost(foundPost);
        setComments(MOCK_COMMENTS[postId] || []);
        // Check if user has liked this post
        setLiked(MOCK_USER_LIKES.posts.includes(postId));
      } else {
        // Handle post not found
        navigate("/parent/community");
      }
      setLoading(false);
    }, 1000);
  }, [postId, navigate]);

  const handleLike = () => {
    if (!currentUser) {
      // Có thể hiển thị modal đăng nhập hoặc thông báo
      alert("Vui lòng đăng nhập để thích bài viết");
      return;
    }

    // Giả lập API call
    setLiked((prevLiked) => !prevLiked);

    // Cập nhật số lượng like
    setPost((prevPost) => ({
      ...prevPost,
      likes: prevLiked ? prevPost.likes - 1 : prevPost.likes + 1,
    }));
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    if (!currentUser) {
      alert("Vui lòng đăng nhập để bình luận");
      return;
    }

    setSubmittingComment(true);

    // Giả lập API call để đăng bình luận
    setTimeout(() => {
      const newCommentObj = {
        id: `comment${Date.now()}`,
        postId: postId,
        author: {
          id: currentUser?.id || "guest",
          name: currentUser?.name || "Người dùng khách",
          avatar:
            currentUser?.avatar ||
            "https://randomuser.me/api/portraits/lego/1.jpg",
          role: currentUser?.role || "parent",
        },
        content: newComment,
        createdAt: new Date().toISOString(),
        likes: 0,
      };

      setComments((prev) => [newCommentObj, ...prev]);
      setNewComment("");

      // Cập nhật số lượng comments trong post
      setPost((prevPost) => ({
        ...prevPost,
        comments: prevPost.comments + 1,
      }));

      setSubmittingComment(false);
    }, 1000);
  };

  const handleCommentLike = (commentId) => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để thích bình luận");
      return;
    }

    // Giả lập API call
    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment.id === commentId) {
          const isLiked = MOCK_USER_LIKES.comments.includes(commentId);
          return {
            ...comment,
            likes: isLiked ? comment.likes - 1 : comment.likes + 1,
          };
        }
        return comment;
      })
    );

    // Toggle like status in mock data
    if (MOCK_USER_LIKES.comments.includes(commentId)) {
      MOCK_USER_LIKES.comments = MOCK_USER_LIKES.comments.filter(
        (id) => id !== commentId
      );
    } else {
      MOCK_USER_LIKES.comments.push(commentId);
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

  const formatCommentDate = (dateString) => {
    const commentDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - commentDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) return "Vừa xong";
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return formatDate(dateString);
  };

  const getCategoryName = (category) => {
    switch (category) {
      case "question":
        return "Câu hỏi";
      case "announcement":
        return "Thông báo";
      case "health-guide":
        return "Hướng dẫn sức khỏe";
      case "sharing":
        return "Chia sẻ";
      case "mental-health":
        return "Sức khỏe tâm thần";
      default:
        return "Khác";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "question":
        return "fa-question-circle";
      case "announcement":
        return "fa-bullhorn";
      case "health-guide":
        return "fa-book-medical";
      case "sharing":
        return "fa-share-alt";
      case "mental-health":
        return "fa-brain";
      default:
        return "fa-clipboard";
    }
  };

  // Sắp xếp bình luận
  const sortedComments = [...comments].sort((a, b) => {
    // Luôn hiển thị bình luận được ghim lên đầu
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    // Sắp xếp theo các tiêu chí khác
    if (sortBy === "latest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else {
      // Sắp xếp theo lượt thích
      return b.likes - a.likes;
    }
  });

  if (loading) {
    return <LoadingSpinner text="Đang tải bài viết..." />;
  }

  return (
    <div className="community-post-container">
      <div className="post-navigation">
        <Link to="/parent/community" className="back-link">
          <i className="fas fa-arrow-left"></i> Quay lại cộng đồng
        </Link>
      </div>

      <article className="post-content-container">
        <div className="post-header">
          <div className="post-title-section">
            <h1>{post.title}</h1>

            <div className="post-meta">
              <div className="post-category">
                <i className={`fas ${getCategoryIcon(post.category)}`}></i>
                {getCategoryName(post.category)}
              </div>
              <div className="post-date">
                <i className="far fa-calendar-alt"></i>{" "}
                {formatDate(post.createdAt)}
                {post.updatedAt && (
                  <span className="updated-info">
                    (Cập nhật: {formatDate(post.updatedAt)})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="post-author-section">
            <div className="author-info">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="author-avatar"
              />
              <div>
                <div className="author-name">
                  {post.author.name}
                  {post.author.role === "nurse" && (
                    <span className="author-badge nurse">
                      <i className="fas fa-user-nurse"></i> Y tá
                    </span>
                  )}
                </div>
                {post.author.bio && (
                  <div className="author-bio">{post.author.bio}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        ></div>

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, index) => (
              <span key={index} className="post-tag">
                <i className="fas fa-tag"></i> {tag}
              </span>
            ))}
          </div>
        )}

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

      <section className="comments-section">
        <h2>Bình luận ({post.comments})</h2>

        <div className="comment-form-container">
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <div className="comment-input-container">
              <img
                src={
                  currentUser?.avatar ||
                  "https://randomuser.me/api/portraits/lego/1.jpg"
                }
                alt="Avatar"
                className="user-avatar"
              />
              <textarea
                placeholder="Viết bình luận của bạn..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submittingComment}
                required
              ></textarea>
            </div>

            <div className="comment-form-actions">
              <button
                type="submit"
                className="submit-comment-btn"
                disabled={submittingComment || !newComment.trim()}
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
            </div>
          </form>
        </div>

        <div className="comments-filter">
          <div className="comments-count">{comments.length} bình luận</div>

          <div className="comments-sort">
            <span>Sắp xếp theo:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="latest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="likes">Nhiều lượt thích</option>
            </select>
          </div>
        </div>

        {sortedComments.length > 0 ? (
          <div className="comments-list">
            {sortedComments.map((comment) => (
              <div
                key={comment.id}
                className={`comment-item ${comment.isPinned ? "pinned" : ""}`}
                id={`comment-${comment.id}`}
              >
                {comment.isPinned && (
                  <div className="comment-pin-indicator">
                    <i className="fas fa-thumbtack"></i> Ghim bởi tác giả
                  </div>
                )}

                <div className="comment-header">
                  <div className="comment-author">
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      className="comment-avatar"
                    />
                    <div className="comment-author-info">
                      <div className="comment-author-name">
                        {comment.author.name}
                        {comment.author.role === "nurse" && (
                          <span className="author-badge nurse">
                            <i className="fas fa-user-nurse"></i> Y tá
                          </span>
                        )}
                        {comment.author.id === post.author.id && (
                          <span className="author-badge post-author">
                            <i className="fas fa-pen-nib"></i> Tác giả
                          </span>
                        )}
                      </div>
                      <div className="comment-time">
                        {formatCommentDate(comment.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="comment-actions-dropdown">
                    <button className="comment-menu-btn">
                      <i className="fas fa-ellipsis-v"></i>
                    </button>
                  </div>
                </div>

                <div className="comment-content">
                  <p>{comment.content}</p>
                </div>

                <div className="comment-footer">
                  <button
                    className={`comment-like-btn ${
                      MOCK_USER_LIKES.comments.includes(comment.id)
                        ? "liked"
                        : ""
                    }`}
                    onClick={() => handleCommentLike(comment.id)}
                  >
                    <i
                      className={`${
                        MOCK_USER_LIKES.comments.includes(comment.id)
                          ? "fas"
                          : "far"
                      } fa-heart`}
                    ></i>
                    <span>{comment.likes} thích</span>
                  </button>

                  <button className="comment-reply-btn">
                    <i className="fas fa-reply"></i>
                    <span>Trả lời</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-comments">
            <i className="far fa-comment-alt"></i>
            <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
          </div>
        )}
      </section>

      <div className="related-posts-section">
        <h3>Bài viết liên quan</h3>
        <div className="related-posts">
          {MOCK_POSTS.filter((p) => p.id !== postId)
            .slice(0, 2)
            .map((relatedPost) => (
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
                      src={relatedPost.author.avatar}
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
                      <i className="fas fa-comment"></i> {relatedPost.comments}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityPost;
