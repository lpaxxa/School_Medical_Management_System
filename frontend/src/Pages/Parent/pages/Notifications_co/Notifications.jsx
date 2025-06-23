import React, { useState, useEffect, useRef } from "react";
import "./Notifications.css";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { useAuth } from "../../../../context/AuthContext";
import { useStudentData } from "../../../../context/StudentDataContext";
import notificationService from "../../../../services/notificationService";
import ReactMarkdown from "react-markdown";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [currentNotification, setCurrentNotification] = useState(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [parentId, setParentId] = useState(null);

  const notificationContentRef = useRef(null);
  const location = useLocation();

  const { currentUser } = useAuth();
  const { students, parentInfo } = useStudentData();

  // Tách getParentId ra khỏi fetchNotifications để theo dõi thay đổi
  const getParentId = () => {
    if (parentInfo?.id) {
      return parentInfo.id;
    }

    if (students && students.length > 0 && students[0].parentId) {
      return students[0].parentId;
    }

    return null; // Thay đổi từ 1 -> null
  };

  // Cập nhật parentId khi students hoặc parentInfo thay đổi
  useEffect(() => {
    const id = getParentId();
    if (id) {
      setParentId(id);
    }
  }, [students, parentInfo]);

  // Cuộn lên đầu khi chọn thông báo mới
  useEffect(() => {
    if (notificationContentRef.current) {
      notificationContentRef.current.scrollTop = 0;
    }
  }, [currentNotification]);

  // Fetch notifications khi có parentId
  useEffect(() => {
    // Chỉ fetch khi có parentId
    if (parentId) {
      console.log("Fetching notifications for parent ID:", parentId);
      fetchNotifications();

      // Set interval để tự động làm mới mỗi 2 phút
      const refreshInterval = setInterval(() => {
        fetchNotifications();
      }, 120000); // 120000ms = 2 phút

      // Clear interval khi unmount hoặc parentId thay đổi
      return () => clearInterval(refreshInterval);
    }
  }, [parentId, location.pathname]);

  // 1. Thêm hiển thị debug để xác định điểm lỗi
  useEffect(() => {
    console.log("Current notifications state:", notifications);
    console.log("Selected notification ID:", selectedNotificationId);
  }, [notifications, selectedNotificationId]);

  // 2. Đảm bảo luôn chọn thông báo đầu tiên nếu có thông báo và không có thông báo nào được chọn
  useEffect(() => {
    if (notifications.length > 0 && !currentNotification) {
      console.log("Auto-selecting first notification");
      setSelectedNotificationId(notifications[0].id);
      fetchNotificationDetail(notifications[0].id, parentId);
    }
  }, [notifications, currentNotification, parentId]);

  // Fetch notifications từ API - cập nhật để sử dụng notificationService
  const fetchNotifications = async () => {
    if (!parentId) {
      console.log("No parent ID available, skipping fetch");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching notifications for parent ID:", parentId);

      const response = await notificationService.getNotifications(parentId);
      console.log("API response:", response.data);

      if (Array.isArray(response.data)) {
        // Thêm trường isRead và category vào mỗi thông báo
        const notificationsWithReadStatus = response.data.map(
          (notification) => {
            // Xác định category dựa vào tiêu đề hoặc nội dung
            let category = "general";

            if (
              notification.title?.toLowerCase().includes("sức khỏe") ||
              notification.title?.toLowerCase().includes("khám")
            ) {
              category = "health";
            } else if (notification.title?.toLowerCase().includes("thuốc")) {
              category = "medicine";
            } else if (
              notification.title?.toLowerCase().includes("tiêm") ||
              notification.title?.toLowerCase().includes("vắc-xin")
            ) {
              category = "vaccine";
            } else if (
              notification.title?.toLowerCase().includes("cảnh báo") ||
              notification.title?.toLowerCase().includes("dịch bệnh")
            ) {
              category = "warning";
            }

            return {
              ...notification,
              isRead: false,
              category,
            };
          }
        );

        console.log("Processed notifications:", notificationsWithReadStatus);
        setNotifications(notificationsWithReadStatus);

        // Nếu có thông báo và chưa chọn thông báo nào, chọn thông báo đầu tiên
        if (response.data.length > 0 && !selectedNotificationId) {
          setSelectedNotificationId(response.data[0].id);
          fetchNotificationDetail(response.data[0].id, parentId);
        }
      } else {
        console.error("API không trả về mảng:", response.data);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Không thể tải danh sách thông báo. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch chi tiết thông báo - cập nhật để sử dụng notificationService
  const fetchNotificationDetail = async (
    notificationId,
    parentId = getParentId()
  ) => {
    if (!notificationId) return;

    setDetailLoading(true);

    try {
      const response = await notificationService.getNotificationDetail(
        notificationId,
        parentId
      );

      setCurrentNotification(response.data);
      markAsRead(notificationId);
    } catch (error) {
      console.error("Error fetching notification detail:", error);
      setCurrentNotification(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // Đánh dấu thông báo đã đọc
  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // Chọn thông báo để xem chi tiết
  const selectNotification = (notification) => {
    setSelectedNotificationId(notification.id);
    fetchNotificationDetail(notification.id);
  };

  // Đánh dấu tất cả là đã đọc
  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, isRead: true }))
    );
    toast.success("Đã đánh dấu tất cả thông báo là đã đọc");
  };

  // Xóa thông báo
  const deleteNotification = (id) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    );
    if (selectedNotificationId === id) {
      setSelectedNotificationId(null);
      setCurrentNotification(null);
    }
    toast.success("Đã xóa thông báo thành công");
  };

  // Lọc thông báo theo filter và search
  const filteredNotifications = notifications.filter((notification) => {
    // Lọc theo unread/all
    if (filter === "unread" && notification.isRead) {
      return false;
    }

    // Lọc theo category
    if (activeCategory !== "all" && notification.category !== activeCategory) {
      return false;
    }

    // Lọc theo search query
    if (searchQuery && searchQuery.trim() !== "") {
      return notification.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    }

    return true;
  });

  // Đếm số thông báo chưa đọc
  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  // Format date theo kiểu telegram
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday =
      new Date(now.setDate(now.getDate() - 1)).toDateString() ===
      date.toDateString();

    const time = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    if (isToday) {
      return time;
    }

    if (isYesterday) {
      return `Hôm qua, ${time}`;
    }

    return `${date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    })}, ${time}`;
  };

  // Hiển thị nút phản hồi cho thông báo yêu cầu
  const renderResponseButtons = () => {
    if (!currentNotification) return null;

    if (
      currentNotification.isRequest &&
      currentNotification.response === "PENDING"
    ) {
      return (
        <div className="notification-response-buttons">
          <button
            className="telegram-button primary"
            onClick={() => handleResponse("ACCEPT")}
          >
            <i className="fas fa-check"></i> Xác nhận
          </button>
          <button
            className="telegram-button secondary"
            onClick={() => handleResponse("REJECT")}
          >
            <i className="fas fa-times"></i> Từ chối
          </button>
        </div>
      );
    }

    return null;
  };

  // Xử lý phản hồi thông báo
  const handleResponse = async (response) => {
    if (!currentNotification) return;

    const parentId = getParentId();
    if (!parentId) {
      console.error("Parent ID is undefined");
      toast.error("Không thể xác định ID phụ huynh");
      return;
    }

    try {
      // Đảm bảo apiResponse là đúng giá trị
      const apiResponse = response === "ACCEPT" ? "ACCEPTED" : "REJECTED";

      console.log(
        `Sending response ${apiResponse} for notification ${currentNotification.id}`
      );
      console.log("Parent ID:", parentId);
      console.log("Notification ID:", currentNotification.id);

      // Gọi API phản hồi thông báo
      const result = await notificationService.respondToNotification(
        currentNotification.id,
        parentId,
        apiResponse
      );

      console.log("API returned successfully:", result);

      // Cập nhật UI ngay lập tức với thông tin từ server
      if (result && result.data) {
        // Sử dụng dữ liệu trả về từ API nếu có
        setCurrentNotification(result.data);
      } else {
        // Fallback nếu API không trả về dữ liệu đầy đủ
        setCurrentNotification({
          ...currentNotification,
          response: apiResponse,
          responseAt: new Date().toISOString(),
        });
      }

      // Thông báo thành công
      toast.success(
        response === "ACCEPT"
          ? "Đã xác nhận thành công"
          : "Đã từ chối thành công"
      );

      // Cập nhật lại danh sách thông báo
      fetchNotifications();
    } catch (error) {
      console.error("Error responding to notification:", error);
      toast.error(
        `Không thể xử lý phản hồi: ${error.message || "Lỗi không xác định"}`
      );
    }
  };

  // Hiển thị icon cho danh mục thông báo
  const getCategoryIcon = (category) => {
    switch (category) {
      case "health":
        return <i className="fas fa-heartbeat category-icon health"></i>;
      case "medicine":
        return <i className="fas fa-pills category-icon medicine"></i>;
      case "vaccine":
        return <i className="fas fa-syringe category-icon vaccine"></i>;
      case "warning":
        return (
          <i className="fas fa-exclamation-triangle category-icon warning"></i>
        );
      default:
        return <i className="fas fa-bell category-icon general"></i>;
    }
  };

  return (
    <>
      <div className="telegram-header">
        <h1>
          <i className="fas fa-bell-slash"></i> Thông báo
        </h1>
        {unreadCount > 0 && (
          <div className="unread-badge-header">{unreadCount}</div>
        )}
      </div>

      <div className="telegram-notifications">
        <div className="telegram-sidebar">
          <div className="telegram-search">
            <div className="search-input-container">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Tìm kiếm thông báo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="clear-search"
                  onClick={() => setSearchQuery("")}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>

          <div className="telegram-filters">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              <i className="fas fa-list-ul"></i> Tất cả
            </button>
            <button
              className={`filter-btn ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              <i className="fas fa-envelope"></i> Chưa đọc
              {unreadCount > 0 && (
                <span className="filter-badge">{unreadCount}</span>
              )}
            </button>
          </div>

          <div className="category-filters">
            <button
              className={`category-btn ${
                activeCategory === "all" ? "active" : ""
              }`}
              onClick={() => setActiveCategory("all")}
            >
              <i className="fas fa-th-large"></i> Tất cả
            </button>
            <button
              className={`category-btn ${
                activeCategory === "health" ? "active" : ""
              }`}
              onClick={() => setActiveCategory("health")}
            >
              <i className="fas fa-heartbeat"></i> Sức khỏe
            </button>
            <button
              className={`category-btn ${
                activeCategory === "medicine" ? "active" : ""
              }`}
              onClick={() => setActiveCategory("medicine")}
            >
              <i className="fas fa-pills"></i> Thuốc
            </button>
            <button
              className={`category-btn ${
                activeCategory === "vaccine" ? "active" : ""
              }`}
              onClick={() => setActiveCategory("vaccine")}
            >
              <i className="fas fa-syringe"></i> Vắc-xin
            </button>
            <button
              className={`category-btn ${
                activeCategory === "warning" ? "active" : ""
              }`}
              onClick={() => setActiveCategory("warning")}
            >
              <i className="fas fa-exclamation-triangle"></i> Cảnh báo
            </button>
          </div>

          <div className="telegram-chat-list">
            {loading ? (
              <LoadingSpinner text="Đang tải thông báo..." />
            ) : error ? (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                <p>{error}</p>
                <button onClick={fetchNotifications} className="retry-button">
                  <i className="fas fa-redo"></i> Thử lại
                </button>
              </div>
            ) : filteredNotifications.length > 0 ? (
              // Hiển thị danh sách thông báo
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`telegram-chat-item ${
                    !notification.isRead ? "unread" : ""
                  } ${
                    selectedNotificationId === notification.id ? "selected" : ""
                  } category-${notification.category}`}
                  onClick={() => selectNotification(notification)}
                >
                  <div className="telegram-avatar">
                    {getCategoryIcon(notification.category)}
                  </div>
                  <div className="telegram-chat-content">
                    <div className="telegram-chat-header">
                      <h4 className="telegram-chat-name">
                        {notification.title}
                      </h4>
                      <span className="telegram-chat-time">
                        {formatDate(notification.receivedDate)}
                      </span>
                    </div>
                    <div className="telegram-chat-message">
                      {!notification.isRead && (
                        <span className="telegram-unread-badge"></span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <i className="fas fa-bell-slash"></i>
                <p>
                  {notifications.length === 0
                    ? "Không có thông báo nào"
                    : "Không có thông báo nào phù hợp với bộ lọc"}
                </p>
                {(searchQuery ||
                  filter !== "all" ||
                  activeCategory !== "all") && (
                  <button
                    className="clear-filters-btn"
                    onClick={() => {
                      setFilter("all");
                      setSearchQuery("");
                      setActiveCategory("all");
                    }}
                  >
                    <i className="fas fa-times-circle"></i> Xóa bộ lọc
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="telegram-actions">
            <button
              className="telegram-action-btn"
              onClick={markAllAsRead}
              title="Đánh dấu tất cả là đã đọc"
              disabled={notifications.every((n) => n.isRead)}
            >
              <i className="fas fa-check-double"></i>
            </button>
            <button
              className="telegram-action-btn"
              onClick={fetchNotifications}
              title="Làm mới thông báo"
            >
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>

        <div className="telegram-content" ref={notificationContentRef}>
          {detailLoading ? (
            <div className="loading-container">
              <LoadingSpinner text="Đang tải chi tiết..." />
            </div>
          ) : currentNotification ? (
            <div className="telegram-message-view">
              <div className="telegram-message-header">
                <div className="telegram-message-info">
                  <h3>{currentNotification.title}</h3>
                  <span className="telegram-message-date">
                    {new Date(currentNotification.createdAt).toLocaleString(
                      "vi-VN",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>
                <div className="telegram-message-actions">
                  <button
                    className="telegram-icon-btn"
                    onClick={() => deleteNotification(currentNotification.id)}
                    title="Xóa thông báo"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>

              <div className="telegram-message-body">
                <div className="telegram-message-bubble">
                  <div className="sender-info">
                    <i className="fas fa-user-md"></i>
                    <strong>Từ: {currentNotification.senderName}</strong>
                  </div>

                  <div className="message-content">
                    <ReactMarkdown>{currentNotification.message}</ReactMarkdown>
                  </div>

                  {currentNotification.isRequest && (
                    <div className="request-status">
                      <strong>Trạng thái: </strong>
                      <span
                        className={`status-badge ${currentNotification.response?.toLowerCase()}`}
                      >
                        {currentNotification.response === "PENDING"
                          ? "Chưa phản hồi"
                          : currentNotification.response === "ACCEPTED"
                          ? "Đã xác nhận"
                          : "Đã từ chối"}
                      </span>

                      {currentNotification.responseAt && (
                        <span className="response-time">
                          (Phản hồi lúc:{" "}
                          {new Date(
                            currentNotification.responseAt
                          ).toLocaleString("vi-VN")}
                          )
                        </span>
                      )}
                    </div>
                  )}

                  <div className="telegram-message-footer">
                    {renderResponseButtons()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="telegram-empty-content">
              <div className="telegram-empty-content-icon">
                <i className="far fa-comment-dots"></i>
              </div>
              <h3>Chọn một thông báo để xem chi tiết</h3>
              <p>Hoặc kiểm tra các thông báo mới trong danh sách bên trái</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Notifications;
