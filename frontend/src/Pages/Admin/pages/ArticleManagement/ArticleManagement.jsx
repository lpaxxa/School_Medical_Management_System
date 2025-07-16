import React, { useState, useEffect } from "react";
import {
  FaNewspaper,
  FaBook,
  FaEye,
  FaTrash,
  FaPlus,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import HealthArticleTab from "./components/HealthArticleTab";
import BlogTab from "./components/BlogTab";
import ArticleModal from "./components/ArticleModal";
import "./ArticleManagement.css";

const ArticleManagement = () => {
  const [activeTab, setActiveTab] = useState("health-articles");
  const [showModal, setShowModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [modalMode, setModalMode] = useState("view"); // 'view', 'add', 'edit'

  const handleViewArticle = (article) => {
    setSelectedArticle(article);
    setModalMode("view");
    setShowModal(true);
  };

  const handleAddArticle = () => {
    setSelectedArticle(null);
    setModalMode("add");
    setShowModal(true);
  };

  const handleEditArticle = (article) => {
    setSelectedArticle(article);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedArticle(null);
    setModalMode("view");
  };

  return (
    <div className="admin-article-management-container">
      {/* Header */}
      <div className="admin-article-management-header">
        <div>
          <h1>Quản lý bài viết</h1>
          <p>Quản lý cẩm nang sức khỏe và bài viết blog của hệ thống</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-article-tabs">
        <button
          className={`admin-tab-btn ${
            activeTab === "health-articles" ? "active" : ""
          }`}
          onClick={() => setActiveTab("health-articles")}
        >
          <FaBook />
          <span>Cẩm nang sức khỏe</span>
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "blog" ? "active" : ""}`}
          onClick={() => setActiveTab("blog")}
        >
          <FaNewspaper />
          <span>Blog cộng đồng</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-article-content">
        {activeTab === "health-articles" && (
          <HealthArticleTab
            onView={handleViewArticle}
            onEdit={handleEditArticle}
            onAdd={handleAddArticle}
          />
        )}
        {activeTab === "blog" && (
          <BlogTab
            onView={handleViewArticle}
            onEdit={handleEditArticle}
            onAdd={handleAddArticle}
          />
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ArticleModal
          article={selectedArticle}
          mode={modalMode}
          type={activeTab}
          onClose={handleCloseModal}
          onSave={() => {
            // Refresh data after save
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
};

export default ArticleManagement;
