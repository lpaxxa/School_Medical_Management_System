import React, { useState } from 'react';
import { Container, Row, Col, Nav, Tab, Badge } from 'react-bootstrap';
import Posts from './posts/Posts';
import HealthArticles from './health_articles/HealthArticles';
import './BlogManagement.css';

const BlogManagement = () => {
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <Container fluid className="blog-management py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="text-primary fw-bold mb-2">
                <i className="fas fa-blog me-2"></i>
                Quản lý Blog
              </h3>
              <p className="text-muted mb-0">
                Quản lý bài viết và nội dung sức khỏe cho cộng đồng
              </p>
            </div>
          </div>
        </Col>
      </Row>

      <Tab.Container 
        id="blog-management-tabs" 
        activeKey={activeTab} 
        onSelect={(k) => setActiveTab(k)}
      >
        <Row>
          <Col>
            <Nav variant="tabs" className="mb-4 custom-nav-tabs">
              <Nav.Item>
                <Nav.Link eventKey="posts" className="fw-semibold">
                  <i className="fas fa-file-alt me-2"></i>
                  Bài viết (Posts)
                  <Badge bg="primary" className="ms-2">3</Badge>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="health-articles" className="fw-semibold">
                  <i className="fas fa-heartbeat me-2"></i>
                  Bài viết sức khỏe (Health Articles)
                  <Badge bg="success" className="ms-2">3</Badge>
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="posts">
                <Posts />
              </Tab.Pane>
              <Tab.Pane eventKey="health-articles">
                <HealthArticles />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default BlogManagement;
