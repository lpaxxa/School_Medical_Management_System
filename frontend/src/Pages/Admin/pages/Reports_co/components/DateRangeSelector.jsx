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
    <div className="date-range-section">
      <div className="date-ranges">
        {dateRanges.map((range) => (
          <div
            key={range.id}
            className={`date-range-item ${
              dateRange === range.id ? "selected" : ""
            }`}
            onClick={() => setDateRange(range.id)}
          >
            <i className={range.icon}></i>
            <span>{range.label}</span>
          </div>
        ))}
      </div>

      {dateRange === "custom" && (
        <div className="custom-date-range">
          <input
            type="date"
            className="date-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Từ ngày"
          />
          <span>đến</span>
          <input
            type="date"
            className="date-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Đến ngày"
          />
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
