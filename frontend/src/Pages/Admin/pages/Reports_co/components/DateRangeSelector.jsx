import React from "react";
import "./DateRangeSelector.css";

const DateRangeSelector = ({
  dateRange,
  setDateRange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  const dateRanges = [
    { id: "today", label: "Tuần này", icon: "fas fa-calendar-day" },
    { id: "week", label: "Tháng này", icon: "fas fa-calendar-week" },
    { id: "month", label: "Quý này", icon: "fas fa-calendar-alt" },
    { id: "year", label: "Năm học", icon: "fas fa-calendar" },
    { id: "custom", label: "Tùy chọn", icon: "fas fa-cog" },
  ];

  return (
    <div className="reports-date-range-selector">
      <div className="reports-date-range-label">
        <i className="fas fa-calendar"></i>
        Chọn khoảng thời gian
      </div>

      <div className="reports-quick-dates">
        {dateRanges.map((range) => (
          <button
            key={range.id}
            className={`reports-quick-date-btn ${
              dateRange === range.id ? "active" : ""
            }`}
            onClick={() => setDateRange(range.id)}
          >
            <i className={range.icon}></i>
            {range.label}
          </button>
        ))}
      </div>

      {dateRange === "custom" && (
        <div className="reports-date-inputs">
          <div className="reports-date-input-group">
            <label>Từ ngày</label>
            <input
              type="date"
              className="reports-date-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="reports-date-separator">đến</div>
          <div className="reports-date-input-group">
            <label>Đến ngày</label>
            <input
              type="date"
              className="reports-date-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
