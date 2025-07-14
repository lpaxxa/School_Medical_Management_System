import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Container, Nav, Tab, Card, Row, Col } from 'react-bootstrap';
import Posts from './posts/Posts';
import PostDetail from './posts/PostDetail';
import AddPost from './posts/AddPost';
import EditPost from './posts/EditPost';
import HealthArticles from './health_articles/HealthArticles';
import AddHealthArticle from './health_articles/AddHealthArticle';
import EditHealthArticle from './health_articles/EditHealthArticle';
import './BlogManagement.css';

const BlogManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active tab based on current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/health-articles')) {
      return 'health-articles';
    } else {
      return 'posts';
    }
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Sync tab state when URL changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const handleTabSelect = (selectedTab) => {
    setActiveTab(selectedTab);
    // Navigate to absolute path to avoid URL accumulation
    const basePath = '/nurse/blog-management';
    navigate(`${basePath}/${selectedTab}`, { replace: true });
  };

  return (
    <>
      <style>
        {`
          .lukhang-blogmgmt-main-wrapper {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            min-height: 100vh !important;
            padding: 2rem !important;
          }
          
          .lukhang-blogmgmt-header-card {
            background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%) !important;
            border: none !important;
            border-radius: 1rem !important;
            box-shadow: 0 10px 30px rgba(13, 110, 253, 0.2) !important;
            margin-bottom: 2rem !important;
          }
          
          .lukhang-blogmgmt-title-custom {
            color: white !important;
            font-weight: 700 !important;
            font-size: 2rem !important;
            margin: 0 !important;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
          }
          
          .lukhang-blogmgmt-tabs-container {
            background: white !important;
            border: none !important;
            border-radius: 1rem !important;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08) !important;
            overflow: hidden !important;
          }
          
          .lukhang-blogmgmt-tabs-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%) !important;
            border-bottom: 3px solid #e9ecef !important;
            padding: 1.5rem 2rem 0 2rem !important;
            border-radius: 1rem 1rem 0 0 !important;
          }
          
          .lukhang-blogmgmt-nav-tabs {
            border: none !important;
            gap: 0.5rem !important;
          }
          
          .lukhang-blogmgmt-nav-item {
            margin-bottom: 0 !important;
          }
          
          .lukhang-blogmgmt-nav-link {
            background: white !important;
            border: 2px solid #e9ecef !important;
            border-radius: 15px 15px 0 0 !important;
            color: #6c757d !important;
            font-weight: 600 !important;
            font-size: 1.1rem !important;
            padding: 1rem 2rem !important;
            transition: all 0.3s ease !important;
            position: relative !important;
            overflow: hidden !important;
            border-bottom: none !important;
            min-width: 200px !important;
            text-align: center !important;
            box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05) !important;
          }
          
          .lukhang-blogmgmt-nav-link:hover {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            border-color: #ced4da !important;
            color: #495057 !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
          }
          
          .lukhang-blogmgmt-nav-link.active {
            background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%) !important;
            border-color: #0d6efd !important;
            color: white !important;
            transform: translateY(-3px) !important;
            box-shadow: 0 6px 20px rgba(13, 110, 253, 0.3) !important;
            z-index: 10 !important;
          }
          
          .lukhang-blogmgmt-nav-link.active::before {
            content: '' !important;
            position: absolute !important;
            bottom: -2px !important;
            left: 0 !important;
            right: 0 !important;
            height: 4px !important;
            background: white !important;
            border-radius: 2px !important;
          }
          
          .lukhang-blogmgmt-nav-link i {
            margin-right: 0.75rem !important;
            font-size: 1.2rem !important;
            vertical-align: middle !important;
            color: #6c757d !important;
          }
          
          .lukhang-blogmgmt-nav-link.active i {
            color: white !important;
          }
          
          .lukhang-blogmgmt-tab-content-wrapper {
            padding: 2.5rem !important;
            background: white !important;
            min-height: 600px !important;
          }
          
          .lukhang-blogmgmt-content-card {
            border: none !important;
            background: transparent !important;
          }
          
          .lukhang-blogmgmt-content-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            border: none !important;
            border-radius: 12px !important;
            padding: 1.5rem 2rem !important;
            margin-bottom: 2rem !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
          }
          
          .lukhang-blogmgmt-content-title {
            color: #495057 !important;
            font-weight: 700 !important;
            font-size: 1.5rem !important;
            margin: 0 !important;
            display: flex !important;
            align-items: center !important;
          }
          
          .lukhang-blogmgmt-content-title i {
            margin-right: 1rem !important;
            font-size: 1.4rem !important;
          }
          
          .lukhang-blogmgmt-content-body {
            background: transparent !important;
            padding: 0 !important;
          }
          
          .lukhang-blogmgmt-routes-container {
            background: transparent !important;
            min-height: 400px !important;
          }
          
          @media (max-width: 992px) {
            .lukhang-blogmgmt-main-wrapper {
              padding: 1rem !important;
            }
            
            .lukhang-blogmgmt-title-custom {
              font-size: 1.5rem !important;
            }
            
            .lukhang-blogmgmt-tabs-header {
              padding: 1rem !important;
            }
            
            .lukhang-blogmgmt-nav-link {
              font-size: 1rem !important;
              padding: 0.75rem 1.5rem !important;
              min-width: 160px !important;
            }
            
            .lukhang-blogmgmt-tab-content-wrapper {
              padding: 1.5rem !important;
            }
            
            .lukhang-blogmgmt-content-title {
              font-size: 1.3rem !important;
            }
          }
          
          @media (max-width: 768px) {
            .lukhang-blogmgmt-nav-tabs {
              flex-direction: column !important;
              gap: 0.75rem !important;
            }
            
            .lukhang-blogmgmt-nav-link {
              min-width: 100% !important;
              border-radius: 12px !important;
            }
            
            .lukhang-blogmgmt-nav-link.active::before {
              display: none !important;
            }
            
            .lukhang-blogmgmt-tab-content-wrapper {
              padding: 1rem !important;
            }
          }
        `}
      </style>
      
      <Container fluid className="lukhang-blogmgmt-main-wrapper">
        <Card className="lukhang-blogmgmt-header-card">
          <Card.Body className="text-center py-4">
            <h1 className="lukhang-blogmgmt-title-custom">
              <i className="fas fa-blog me-3" style={{color : 'white'}}></i>
              Quản lý bài viết cộng đồng & cẩm nang y tế
            </h1>
          </Card.Body>
        </Card>
        
        <Card className="lukhang-blogmgmt-tabs-container">
          <Card.Header className="lukhang-blogmgmt-tabs-header">
            <Nav variant="tabs" className="lukhang-blogmgmt-nav-tabs d-flex justify-content-center">
              <Nav.Item className="lukhang-blogmgmt-nav-item">
                <Nav.Link 
                  className={`lukhang-blogmgmt-nav-link ${activeTab === 'posts' ? 'active' : ''}`}
                  onClick={() => handleTabSelect('posts')}
                >
                  <i className="fas fa-newspaper"></i>
                  Bài viết cộng đồng
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="lukhang-blogmgmt-nav-item">
                <Nav.Link 
                  className={`lukhang-blogmgmt-nav-link ${activeTab === 'health-articles' ? 'active' : ''}`}
                  onClick={() => handleTabSelect('health-articles')}
                >
                  <i className="fas fa-medkit"></i>
                 Cẩm nang y tế
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          
          <div className="lukhang-blogmgmt-tab-content-wrapper">
            <div className="lukhang-blogmgmt-routes-container">
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
          </div>
        </Card>
      </Container>
    </>
  );
};

export default BlogManagement;
