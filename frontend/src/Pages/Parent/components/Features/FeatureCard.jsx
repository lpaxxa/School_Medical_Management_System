import React from "react";

export default function FeatureCard({
  title,
  description,
  icon,
  color = "#3b82f6",
  index,
}) {
  return (
    <div className="feature-card">
      <div className="feature-card-inner">
        <div
          className="feature-icon-wrapper"
          style={{
            "--feature-color": color,
            "--feature-color-light": `${color}20`, // 20% opacity
          }}
        >
          {icon && <i className={icon}></i>}
          <div className="feature-icon-glow"></div>
        </div>

        <div className="feature-content">
          <h3 className="feature-title">{title}</h3>
          <p className="feature-description">{description}</p>
          <a href="#" className="feature-learn-more">
            Tìm hiểu thêm <i className="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </div>

      {/* Card decoration elements */}
      <div className="feature-card-decoration">
        <div
          className="feature-decoration-circle"
          style={{ "--delay": `${index * 2}s` }}
        ></div>
        <div
          className="feature-decoration-square"
          style={{ "--delay": `${index * 2 + 1}s` }}
        ></div>
      </div>
    </div>
  );
}
