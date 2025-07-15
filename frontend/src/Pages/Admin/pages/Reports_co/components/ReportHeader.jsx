import React from "react";
import "./ReportHeader.css";
import BackButton from "./BackButton";

const ReportHeader = ({ 
  title, 
  subtitle, 
  icon, 
  onBack, 
  colorTheme = "blue",
  children 
}) => {
  return (
    <div className={`report-header report-header-${colorTheme}`}>
      <div className="report-header-actions">
        <BackButton onClick={onBack} text="Quay lại" />
        <h2 className="report-header-title">
          {icon && <i className={icon}></i>}
          {title}
        </h2>
      </div>
      <p className="report-header-subtitle">{subtitle}</p>
      {children}
    </div>
  );
};

export default ReportHeader;
