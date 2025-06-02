import React, { useState, useEffect } from "react";

const RecentActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch activities
    setTimeout(() => {
      setActivities([
        {
          id: 1,
          time: "09:45",
          user: "Nguyễn Văn A",
          action: "đã cập nhật hồ sơ học sinh",
        },
        {
          id: 2,
          time: "08:30",
          user: "Trần Thị B",
          action: "đã tạo tài khoản mới",
        },
        {
          id: 3,
          time: "Hôm qua",
          user: "Lê Văn C",
          action: "đã cập nhật thông tin liên hệ",
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="admin-card recent-activities">
      <h3>Hoạt động gần đây</h3>
      {loading ? (
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
        </div>
      ) : (
        <ul className="activity-list">
          {activities.map((activity) => (
            <li key={activity.id}>
              <span className="activity-time">{activity.time}</span>
              <div className="activity-details">
                <span className="activity-user">{activity.user}</span>
                <span className="activity-action">{activity.action}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivities;
