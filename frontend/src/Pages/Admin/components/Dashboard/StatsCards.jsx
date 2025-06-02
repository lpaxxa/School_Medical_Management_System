import React, { useState, useEffect } from "react";

const StatsCards = () => {
  const [stats, setStats] = useState({
    students: 0,
    parents: 0,
    nurses: 0,
    checkups: 0,
  });

  // Simulate fetching stats data
  useEffect(() => {
    // In a real app, replace with API call
    const fetchStats = async () => {
      // Simulating API response delay
      setTimeout(() => {
        setStats({
          students: 1245,
          parents: 950,
          nurses: 15,
          checkups: 352,
        });
      }, 500);
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-stats">
      <div className="admin-stat-card">
        <div className="stat-icon">
          <i className="fas fa-user-graduate"></i>
        </div>
        <div className="stat-details">
          <h3>{stats.students}</h3>
          <p>Học sinh</p>
        </div>
      </div>

      <div className="admin-stat-card">
        <div className="stat-icon">
          <i className="fas fa-users"></i>
        </div>
        <div className="stat-details">
          <h3>{stats.parents}</h3>
          <p>Phụ huynh</p>
        </div>
      </div>

      <div className="admin-stat-card">
        <div className="stat-icon">
          <i className="fas fa-user-md"></i>
        </div>
        <div className="stat-details">
          <h3>{stats.nurses}</h3>
          <p>Y tá</p>
        </div>
      </div>

      <div className="admin-stat-card">
        <div className="stat-icon">
          <i className="fas fa-notes-medical"></i>
        </div>
        <div className="stat-details">
          <h3>{stats.checkups}</h3>
          <p>Khám sức khỏe</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
