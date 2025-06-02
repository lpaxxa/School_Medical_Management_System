import React, { useState, useEffect } from "react";
import "./Notifications.css";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);

  useEffect(() => {
    // Giả lập API call
    const fetchNotifications = async () => {
      try {
        // Trong thực tế, đây sẽ là API call
        // const response = await fetch('/api/notifications');
        // const data = await response.json();

        // Dữ liệu mẫu
        const mockData = [
          {
            id: 1,
            type: "health",
            title: "Kết quả khám sức khỏe định kỳ",
            content:
              "Kết quả khám sức khỏe định kỳ học kỳ 1 đã có. Vui lòng xem chi tiết.",
            date: "2023-05-28T08:30:00",
            isRead: false,
            link: "/health-records",
          },
          {
            id: 2,
            type: "medicine",
            title: "Thuốc đã được cấp phát",
            content:
              "Thuốc kháng sinh theo yêu cầu đã được cấp phát cho học sinh vào ngày 26/05/2023.",
            date: "2023-05-26T14:15:00",
            isRead: true,
            link: "/medicine-records",
          },
          {
            id: 3,
            type: "alert",
            title: "Cảnh báo dịch bệnh",
            content:
              "Phát hiện học sinh lớp 6A mắc bệnh thủy đậu. Phụ huynh vui lòng theo dõi sức khỏe học sinh.",
            date: "2023-05-25T09:00:00",
            isRead: false,
            link: "/disease-alerts",
          },
          {
            id: 4,
            type: "activity",
            title: "Lịch tiêm chủng sắp tới",
            content:
              "Nhà trường sẽ tổ chức tiêm vắc-xin phòng cúm vào ngày 10/06/2023. Vui lòng đăng ký cho học sinh.",
            date: "2023-05-20T11:30:00",
            isRead: true,
            link: "/vaccination-schedule",
          },
          {
            id: 5,
            type: "health",
            title: "Kết quả khám nha khoa",
            content:
              "Kết quả khám nha khoa định kỳ của học sinh đã có. Vui lòng xem chi tiết.",
            date: "2023-05-18T15:45:00",
            isRead: false,
            link: "/dental-records",
          },
        ];

        setTimeout(() => {
          setNotifications(mockData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    );
    if (selectedNotificationId === id) {
      setSelectedNotificationId(null);
      setCurrentNotification(null);
    }
  };

  const selectNotification = (notification) => {
    setSelectedNotificationId(notification.id);
    setCurrentNotification(notification);
    markAsRead(notification.id);
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.isRead;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  // Format date to telegram style (today/yesterday or date)
  const formatDate = (dateString) => {
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

  const getNotificationDetailContent = () => {
    if (!currentNotification) return null;

    let detailContent = null;

    if (currentNotification.type === "health") {
      detailContent = (
        <div className="notification-details">
          <h4>Chi tiết kết quả khám</h4>
          <div className="detail-item">
            <span className="detail-label">Ngày khám:</span>
            <span className="detail-value">
              {new Date(currentNotification.date).toLocaleDateString("vi-VN")}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Bác sĩ khám:</span>
            <span className="detail-value">BS. Nguyễn Minh Tuấn</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Kết quả:</span>
            <span className="detail-value">Sức khỏe bình thường</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Ghi chú:</span>
            <span className="detail-value">
              Học sinh cần chú ý chế độ ăn uống và nghỉ ngơi đầy đủ
            </span>
          </div>
        </div>
      );
    } else if (currentNotification.type === "medicine") {
      detailContent = (
        <div className="notification-details">
          <h4>Chi tiết thuốc</h4>
          <div className="detail-item">
            <span className="detail-label">Loại thuốc:</span>
            <span className="detail-value">Kháng sinh Amoxicillin</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Liều lượng:</span>
            <span className="detail-value">500mg, 3 lần/ngày</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Thời gian điều trị:</span>
            <span className="detail-value">5 ngày</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Lưu ý:</span>
            <span className="detail-value">Uống sau bữa ăn</span>
          </div>
        </div>
      );
    } else if (currentNotification.type === "alert") {
      detailContent = (
        <div className="notification-details alert-details">
          <h4>Thông tin cảnh báo</h4>
          <div className="detail-item">
            <span className="detail-label">Mức độ:</span>
            <span className="detail-value warning">Cần chú ý</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Triệu chứng cần theo dõi:</span>
            <ul className="symptoms-list">
              <li>Phát ban, nổi mụn nước</li>
              <li>Sốt cao</li>
              <li>Ngứa</li>
            </ul>
          </div>
          <div className="detail-item">
            <span className="detail-label">Hướng dẫn:</span>
            <span className="detail-value">
              Nếu học sinh có các triệu chứng trên, vui lòng không đến trường và
              liên hệ với nhà trường qua số điện thoại: 028.3456.7890
            </span>
          </div>
        </div>
      );
    } else if (currentNotification.type === "activity") {
      detailContent = (
        <div className="notification-details">
          <h4>Chi tiết hoạt động</h4>
          <div className="detail-item">
            <span className="detail-label">Thời gian:</span>
            <span className="detail-value">07:30 - 11:30, 10/06/2023</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Địa điểm:</span>
            <span className="detail-value">Phòng Y tế trường</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Chuẩn bị:</span>
            <span className="detail-value">Mang theo sổ tiêm chủng</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Đăng ký trước:</span>
            <span className="detail-value">Hạn cuối 05/06/2023</span>
          </div>
        </div>
      );
    }

    return detailContent;
  };

  // Render component
  return (
    <>
      <div className="telegram-header">
        <h1>Thông báo</h1>
      </div>

      <div className="telegram-notifications">
        <div className="telegram-sidebar">
          <div className="telegram-search">
            <div className="search-input-container">
              <i className="fas fa-search search-icon"></i>
              <input type="text" placeholder="Tìm kiếm thông báo..." />
            </div>
          </div>

          <div className="telegram-filters">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Tất cả
            </button>
            <button
              className={`filter-btn ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              Chưa đọc
              {unreadCount > 0 && (
                <span className="filter-badge">{unreadCount}</span>
              )}
            </button>
            <button
              className={`filter-btn ${filter === "health" ? "active" : ""}`}
              onClick={() => setFilter("health")}
            >
              Sức khỏe
            </button>
            <button
              className={`filter-btn ${filter === "medicine" ? "active" : ""}`}
              onClick={() => setFilter("medicine")}
            >
              Thuốc
            </button>
            <button
              className={`filter-btn ${filter === "alert" ? "active" : ""}`}
              onClick={() => setFilter("alert")}
            >
              Cảnh báo
            </button>
            <button
              className={`filter-btn ${filter === "activity" ? "active" : ""}`}
              onClick={() => setFilter("activity")}
            >
              Hoạt động
            </button>
          </div>

          <div className="telegram-chat-list">
            {loading ? (
              <LoadingSpinner text="Đang tải thông báo..." />
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`telegram-chat-item ${
                    !notification.isRead ? "unread" : ""
                  } ${
                    selectedNotificationId === notification.id ? "selected" : ""
                  }`}
                  onClick={() => selectNotification(notification)}
                >
                  <div className={`telegram-avatar ${notification.type}`}>
                    {notification.type === "health" && (
                      <i className="fas fa-heartbeat"></i>
                    )}
                    {notification.type === "medicine" && (
                      <i className="fas fa-pills"></i>
                    )}
                    {notification.type === "alert" && (
                      <i className="fas fa-exclamation-triangle"></i>
                    )}
                    {notification.type === "activity" && (
                      <i className="fas fa-calendar-check"></i>
                    )}
                  </div>
                  <div className="telegram-chat-content">
                    <div className="telegram-chat-header">
                      <h4 className="telegram-chat-name">
                        {notification.title}
                      </h4>
                      <span className="telegram-chat-time">
                        {formatDate(notification.date)}
                      </span>
                    </div>
                    <div className="telegram-chat-message">
                      <p className="telegram-message-preview">
                        {notification.content}
                      </p>
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
                  Không có thông báo nào{" "}
                  {filter !== "all" ? "phù hợp với bộ lọc" : ""}
                </p>
              </div>
            )}
          </div>

          <div className="telegram-actions">
            <button
              className="telegram-action-btn"
              onClick={markAllAsRead}
              title="Đánh dấu tất cả là đã đọc"
            >
              <i className="fas fa-check-double"></i>
            </button>
          </div>
        </div>

        <div className="telegram-content">
          {currentNotification ? (
            <div className="telegram-message-view">
              <div className="telegram-message-header">
                <div className="telegram-message-info">
                  <h3>{currentNotification.title}</h3>
                  <span className="telegram-message-date">
                    {new Date(currentNotification.date).toLocaleString(
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
                <div
                  className={`telegram-message-bubble ${currentNotification.type}`}
                >
                  <p>{currentNotification.content}</p>

                  {getNotificationDetailContent()}

                  <div className="telegram-message-footer">
                    {currentNotification.type === "activity" && (
                      <button className="telegram-button primary">
                        <i className="fas fa-calendar-check"></i> Đăng ký tham
                        gia
                      </button>
                    )}

                    {currentNotification.type === "health" && (
                      <button className="telegram-button primary">
                        <i className="fas fa-download"></i> Tải kết quả PDF
                      </button>
                    )}

                    {currentNotification.type === "medicine" && (
                      <button className="telegram-button primary">
                        <i className="fas fa-clipboard-check"></i> Xác nhận đã
                        nhận
                      </button>
                    )}

                    {currentNotification.type === "alert" && (
                      <button className="telegram-button primary">
                        <i className="fas fa-info-circle"></i> Xem hướng dẫn chi
                        tiết
                      </button>
                    )}
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
