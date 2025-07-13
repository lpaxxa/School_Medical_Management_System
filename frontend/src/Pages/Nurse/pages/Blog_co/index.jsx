import BlogManagement from './BlogManagement';
import React from 'react';

// Export BlogManagement trực tiếp không cần wrap lại BlogProvider
// vì đã được wrap trong NurseLayout
const BlogPage = () => {
  return <BlogManagement />;
};

// Export các component để có thể sử dụng riêng lẻ
export { 
  BlogManagement  // Component không bọc Provider (để sử dụng tùy chỉnh)
};

export default BlogPage;  // Export default là component không wrap Provider
