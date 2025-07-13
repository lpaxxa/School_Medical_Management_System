import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import CreateVaccinationPlan from "./CreateVaccinationPlan";
import VaccinationPlanHistory from "./VaccinationPlanHistory";
import CreateHealthCampaign from "./CreateHealthCampaign";
import HealthCampaignHistory from "./HealthCampaignHistory";
import "./PlanManager.css";

const PlanManager = () => {
  const [selectedSection, setSelectedSection] = useState(null); // 'vaccination' | 'health'
  const [selectedAction, setSelectedAction] = useState(null); // 'history' | 'create'

  // Định nghĩa các section chính
  const sections = [
    {
      id: "vaccination",
      title: "Kế Hoạch Tiêm Chủng",  
      description: "Quản lý và theo dõi các kế hoạch tiêm vaccine định kỳ",
      color: "#6366f1",
    },
    {
      id: "health",
      title: "Kiểm Tra Sức Khỏe",     
      description: "Tổ chức và quản lý các chương trình kiểm tra sức khỏe",
      color: "#06b6d4",
    },
  ];

  // Định nghĩa các action cho từng section
  const getActionsForSection = (sectionId) => {
    const actions = [
      {
        id: "history",
        title: "Xem Lịch Sử",
        subtitle: "View History",
        description: `Theo dõi và phân tích dữ liệu lịch sử ${
          sectionId === "vaccination" ? "tiêm chủng" : "kiểm tra sức khỏe"
        }`,
        tag: "PHÂN TÍCH",
      },
      {
        id: "create",
        title: "Tạo Mới",
        subtitle: "Create New",
        description: `Thiết lập ${
          sectionId === "vaccination"
            ? "kế hoạch tiêm chủng"
            : "chương trình kiểm tra"
        } mới`,
        tag: "HÀNH ĐỘNG",
      },
    ];
    return actions;
  };

  const renderContent = () => {
    if (!selectedSection || !selectedAction) return null;

    const key = `${selectedSection}-${selectedAction}`;
    switch (key) {
      case "vaccination-create":
        return <CreateVaccinationPlan />;
      case "vaccination-history":
        return <VaccinationPlanHistory />;
      case "health-create":
        return <CreateHealthCampaign />;
      case "health-history":
        return <HealthCampaignHistory />;
      default:
        return null;
    }
  };

  const handleBackToSections = () => {
    setSelectedSection(null);
    setSelectedAction(null);
  };

  const handleBackToActions = () => {
    setSelectedAction(null);
  };

  return (
    <div className="plan-manager">
      {/* Main Header */}
      <div className="manager-header">
        <div className="header-content-admin">
          <div className="header-text">
            <h1>Quản Lý Kế Hoạch Y Tế</h1>
            <h2>Hệ thống quản lý sức khỏe toàn diện</h2>
            <p>
              Hệ thống quản lý và theo dõi các hoạt động y tế trong cơ sở giáo
              dục
            </p>
          </div>
          {/* <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">2</span>
              <span className="stat-label">Mô-đun</span>
            </div>
          </div> */}
        </div>
      </div>

      {/* Content based on state */}
      {!selectedSection && !selectedAction && (
        <div className="section-selector">
          <div className="selector-header">
            <h2 className="selector-title">Kế Hoạch Y Tế</h2>
            
          </div>

          <div className="sections-grid">
            {sections.map((section) => (
              <div
                key={section.id}
                className="section-card"
                onClick={() => setSelectedSection(section.id)}
                style={{ "--section-color": section.color }}
              >
                <div className="section-badge">
                  {section.id === "vaccination" ? "TC" : "KT"}
                </div>
                <div className="section-info">
                  <h3 className="section-title">{section.title}</h3>
                  <h4 className="section-subtitle">{section.subtitle}</h4>
                  <p className="section-description">{section.description}</p>
                </div>
                <div className="section-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSection && !selectedAction && (
        <div className="action-selector">
          <div className="selector-header">
            <button className="back-button" onClick={handleBackToSections}>
              <FaArrowLeft /> Quay lại
            </button>
            <div className="current-section">
              <span className="section-badge">
                {selectedSection === "vaccination" ? "TC" : "KT"}
              </span>
              <div className="section-text">
                <span className="section-name">
                  {sections.find((s) => s.id === selectedSection)?.title}
                </span>
                <span className="section-subtitle-small">
                  {sections.find((s) => s.id === selectedSection)?.subtitle}
                </span>
              </div>
            </div>
          </div>

          <div className="selector-content">
           

            <div className="actions-grid">
              {getActionsForSection(selectedSection).map((action) => (
                <div
                  key={action.id}
                  className="action-card"
                  onClick={() => setSelectedAction(action.id)}
                  style={{
                    "--section-color": sections.find(
                      (s) => s.id === selectedSection
                    )?.color,
                  }}
                >
                  <div className="action-header">
                    <span className="action-tag">{action.tag}</span>
                  </div>
                  <div className="action-info">
                    <h3 className="action-title">{action.title}</h3>
                    <h4 className="action-subtitle">{action.subtitle}</h4>
                    <p className="action-description">{action.description}</p>
                  </div>
                  <div className="action-arrow">→</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedSection && selectedAction && (
        <div className="content-area">
          <div className="content-header">
            <button className="back-button" onClick={handleBackToActions}>
              <FaArrowLeft /> Quay lại
            </button>
            <div className="breadcrumb">
              <span className="breadcrumb-item" onClick={handleBackToSections}>
                {sections.find((s) => s.id === selectedSection)?.title}
              </span>
              <span className="breadcrumb-separator"> / </span>
              <span className="breadcrumb-current">
                {
                  getActionsForSection(selectedSection).find(
                    (a) => a.id === selectedAction
                  )?.title
                }
              </span>
            </div>
          </div>

          <div className="content-body">{renderContent()}</div>
        </div>
      )}
    </div>
  );
};

export default PlanManager;
