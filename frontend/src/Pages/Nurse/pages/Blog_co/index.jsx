import BlogManagement from './BlogManagement';
import { BlogProvider } from '../../../../context/NurseContext/BlogContext';
import React from 'react';

// Đảm bảo BlogManagement được bọc trong BlogProvider
const BlogPage = () => {
  return (
    <BlogProvider>
      <BlogManagement />
    </BlogProvider>
  );
};

// Export các component để có thể sử dụng riêng lẻ
export { 
  BlogManagement  // Component không bọc Provider (để sử dụng tùy chỉnh)
};

export default BlogPage;  // Export default là component đã được bọc trong Provider
