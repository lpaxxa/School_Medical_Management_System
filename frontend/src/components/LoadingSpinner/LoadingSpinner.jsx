import React from "react";
import "./LoadingSpinner.css";

const LoadingSpinner = ({ text = "Đang tải dữ liệu..." }) => {
  return (
    <div className="loading-container">
      <div className="spinner-container">
        <div className="spinner-border"></div>
      </div>
      <p>{text}</p>
    </div>
  );
};

export default LoadingSpinner;
