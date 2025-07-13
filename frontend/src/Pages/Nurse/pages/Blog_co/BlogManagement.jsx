import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Posts from './posts/Posts';
import PostDetail from './posts/PostDetail';
import AddPost from './posts/AddPost';
import EditPost from './posts/EditPost';
import HealthArticles from './health_articles/HealthArticles';
import AddHealthArticle from './health_articles/AddHealthArticle';
import EditHealthArticle from './health_articles/EditHealthArticle';
import './BlogManagement.css';

const BlogManagement = () => {
  return (
    <div className="blog-management">
      <Routes>
        <Route index element={<Navigate to="posts" replace />} />
        <Route path="posts" element={<Posts />} />
        <Route path="posts/add" element={<AddPost />} />
        <Route path="posts/edit/:id" element={<EditPost />} />
        <Route path="posts/:id" element={<PostDetail />} />
        <Route path="health-articles" element={<HealthArticles />} />
        <Route path="health-articles/add" element={<AddHealthArticle />} />
        <Route path="health-articles/edit/:id" element={<EditHealthArticle />} />
      </Routes>
    </div>
  );
};

export default BlogManagement;
