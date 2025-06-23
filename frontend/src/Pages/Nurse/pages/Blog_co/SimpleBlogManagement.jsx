import React from 'react';
import './SimpleBlogManagement.css';

// This is a minimal version of the BlogManagement component
// to test if there's an issue with the component itself
const SimpleBlogManagement = () => {
  console.log('Rendering SimpleBlogManagement component');
  
  // Using useEffect to log when component mounts
  React.useEffect(() => {
    console.log('SimpleBlogManagement component mounted');
    // Alert for immediate feedback
    // alert('Blog Management Test Component Loaded');
    
    return () => {
      console.log('SimpleBlogManagement component unmounted');
    };
  }, []);
  
  return (
    <div className="blog-management-simple">
      <h2>Blog Management</h2>
      <p>This is a simplified version of the blog management component.</p>
      
      <div className="blog-card-simple">
        <h3 className="blog-title-simple">Sample Blog Post</h3>
        <p className="blog-content-simple">This is a sample blog post content to test if the component renders correctly.</p>
      </div>
    </div>
  );
};

export default SimpleBlogManagement;
