import React, { useState, useEffect } from "react";

const SystemNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch notifications
    setTimeout(() => {
      setNotifications([
        {
          id: 1,
          type: "urgent",
          icon: "fas fa-exclamation-circle",
          message: "Cần cập nhật hồ sơ y tế các học sinh lớp 10A1",
          time: "2 giờ trước",
        },
        {
          id: 2,
          type: "info",
          icon: "fas fa-info-circle",
          message: "Đợt khám sức khỏe định kỳ sẽ bắt đầu vào tuần sau",
          time: "1 ngày trước",
        },
        {
          id: 3,
          type: "success",
          icon: "fas fa-check-circle",
          message: "Hoàn thành cập nhật dữ liệu năm học mới",
          time: "3 ngày trước",
        },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  return (
    <div className="admin-card system-notifications">
      <h3>Thông báo hệ thống</h3>
      {loading ? (
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
        </div>
      ) : (
        <ul className="notification-list">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`notification-item ${notification.type}`}
            >
              <i className={notification.icon}></i>
              <div className="notification-content">
                <p>{notification.message}</p>
                <span>{notification.time}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SystemNotifications;
