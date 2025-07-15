import React, { useState } from "react";
import "../styles/modern-theme.css";
import "./ModernUIShowcase.css";
import SchoolMedicalShowcase from "./SchoolMedicalShowcase/SchoolMedicalShowcase";

const ModernUIShowcase = () => {
  const [showSchoolMedical, setShowSchoolMedical] = useState(false);

  if (showSchoolMedical) {
    return <SchoolMedicalShowcase />;
  }

  return (
    <div className="modern-showcase">
      <div className="showcase-header">
        <h1>Modern Admin UI Showcase</h1>
        <p>Thiết kế hiện đại, đơn giản và thân thiện với người dùng</p>
        <div className="showcase-actions">
          <button
            className="admin_ui_btn_modern admin_ui_btn_primary"
            onClick={() => setShowSchoolMedical(true)}
          >
            🏫 Xem School Medical System Demo
          </button>
        </div>
      </div>

      {/* Color Palette */}
      <section className="showcase-section">
        <h2>Color Palette</h2>
        <div className="color-grid">
          <div className="color-group">
            <h3>Primary Colors</h3>
            <div className="color-row">
              <div
                className="color-swatch"
                style={{ background: "var(--indigo-500)" }}
              ></div>
              <div
                className="color-swatch"
                style={{ background: "var(--indigo-600)" }}
              ></div>
              <div
                className="color-swatch"
                style={{ background: "var(--indigo-700)" }}
              ></div>
            </div>
          </div>

          <div className="color-group">
            <h3>Success Colors</h3>
            <div className="color-row">
              <div
                className="color-swatch"
                style={{ background: "var(--success-500)" }}
              ></div>
              <div
                className="color-swatch"
                style={{ background: "var(--success-600)" }}
              ></div>
              <div
                className="color-swatch"
                style={{ background: "var(--success-700)" }}
              ></div>
            </div>
          </div>

          <div className="color-group">
            <h3>Warning Colors</h3>
            <div className="color-row">
              <div
                className="color-swatch"
                style={{ background: "var(--warning-500)" }}
              ></div>
              <div
                className="color-swatch"
                style={{ background: "var(--warning-600)" }}
              ></div>
              <div
                className="color-swatch"
                style={{ background: "var(--warning-700)" }}
              ></div>
            </div>
          </div>

          <div className="color-group">
            <h3>Error Colors</h3>
            <div className="color-row">
              <div
                className="color-swatch"
                style={{ background: "var(--error-500)" }}
              ></div>
              <div
                className="color-swatch"
                style={{ background: "var(--error-600)" }}
              ></div>
              <div
                className="color-swatch"
                style={{ background: "var(--error-700)" }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="showcase-section">
        <h2>Modern Buttons</h2>
        <div className="button-grid">
          <button className="admin_ui_btn_modern admin_ui_btn_primary">
            <i className="fas fa-plus"></i>
            Primary Button
          </button>
          <button className="admin_ui_btn_modern admin_ui_btn_secondary">
            <i className="fas fa-edit"></i>
            Secondary Button
          </button>
          <button className="admin_ui_btn_modern admin_ui_btn_success">
            <i className="fas fa-check"></i>
            Success Button
          </button>
          <button className="admin_ui_btn_modern admin_ui_btn_warning">
            <i className="fas fa-exclamation-triangle"></i>
            Warning Button
          </button>
          <button className="admin_ui_btn_modern admin_ui_btn_error">
            <i className="fas fa-trash"></i>
            Error Button
          </button>
        </div>
      </section>

      {/* Cards */}
      <section className="showcase-section">
        <h2>Modern Cards</h2>
        <div className="card-grid">
          <div className="admin_ui_card_modern">
            <div className="admin_ui_card_header">
              <h3>Card Title</h3>
            </div>
            <div className="admin_ui_card_body">
              <p>
                This is a modern card design with clean borders and subtle
                shadows.
              </p>
            </div>
            <div className="admin_ui_card_footer">
              <button className="admin_ui_btn_modern admin_ui_btn_primary">
                Action
              </button>
            </div>
          </div>

          <div className="admin_ui_card_modern">
            <div className="admin_ui_card_body">
              <div className="stat-card">
                <div
                  className="stat-icon"
                  style={{
                    background: "var(--indigo-100)",
                    color: "var(--indigo-600)",
                  }}
                >
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-content">
                  <h3>1,234</h3>
                  <p>Total Users</p>
                </div>
              </div>
            </div>
          </div>

          <div className="admin_ui_card_modern">
            <div className="admin_ui_card_body">
              <div className="stat-card">
                <div
                  className="stat-icon"
                  style={{
                    background: "var(--success-100)",
                    color: "var(--success-600)",
                  }}
                >
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="stat-content">
                  <h3>98.5%</h3>
                  <p>Success Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="showcase-section">
        <h2>Modern Badges</h2>
        <div className="badge-grid">
          <span className="admin_ui_badge_modern admin_ui_badge_primary">
            Primary
          </span>
          <span className="admin_ui_badge_modern admin_ui_badge_success">
            Success
          </span>
          <span className="admin_ui_badge_modern admin_ui_badge_warning">
            Warning
          </span>
          <span className="admin_ui_badge_modern admin_ui_badge_error">
            Error
          </span>
        </div>
      </section>

      {/* Form Elements */}
      <section className="showcase-section">
        <h2>Modern Form Elements</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Input Field</label>
            <input
              type="text"
              className="admin_ui_input_modern"
              placeholder="Enter text here..."
            />
          </div>
          <div className="form-group">
            <label>Select Field</label>
            <select className="admin_ui_input_modern">
              <option>Choose an option</option>
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="showcase-section">
        <h2>Typography</h2>
        <div className="typography-showcase">
          <h1>Heading 1 - 2.25rem</h1>
          <h2>Heading 2 - 1.875rem</h2>
          <h3>Heading 3 - 1.5rem</h3>
          <h4>Heading 4 - 1.25rem</h4>
          <p>
            Body text - 1rem. Lorem ipsum dolor sit amet, consectetur adipiscing
            elit. Sed do eiusmod tempor incididunt ut labore et dolore magna
            aliqua.
          </p>
          <small>Small text - 0.875rem</small>
        </div>
      </section>
    </div>
  );
};

export default ModernUIShowcase;
