import React, { useState } from 'react';
import { Container, Nav, Tab, Card, Row, Col } from 'react-bootstrap';
import StudentList from './StudentList/StudentList';
import HealthReports from './HealthReports/HealthReports';
import './StudentRecordsMain.css';

// Component StudentRecords gốc từ file StudentRecords.jsx
const StudentRecords = () => {
  const [activeTab, setActiveTab] = useState('list');
  
  const handleTabSelect = (selectedTab) => {
    setActiveTab(selectedTab);
  };

  return (
    <>
      <style>
        {`
          .lukhang-studentrecords-main-wrapper {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            min-height: 100vh !important;
            padding: 2rem !important;
          }
          
          .lukhang-studentrecords-header-card {
            background: linear-gradient(135deg, #015C92 0%, #2D82B5 30%, #428CD4 60%, #88CDF6 100%) !important;
            border: none !important;
            border-radius: 1rem !important;
            box-shadow: 0 10px 30px rgba(13, 110, 253, 0.2) !important;
            margin-bottom: 2rem !important;
          }
          
          .lukhang-studentrecords-title-custom {
            color: white !important;
            font-weight: 700 !important;
            font-size: 2rem !important;
            margin: 0 !important;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
          }
          
          .lukhang-studentrecords-tabs-container {
            background: white !important;
            border: none !important;
            border-radius: 1rem !important;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08) !important;
            overflow: hidden !important;
          }
          
          .lukhang-studentrecords-tabs-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%) !important;
            border-bottom: 3px solid #e9ecef !important;
            padding: 1.5rem 2rem 0 2rem !important;
            border-radius: 1rem 1rem 0 0 !important;
          }
          
          .lukhang-studentrecords-nav-tabs {
            border: none !important;
            gap: 0.5rem !important;
          }
          
          .lukhang-studentrecords-nav-item {
            margin-bottom: 0 !important;
          }
          
          .lukhang-studentrecords-nav-link {
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
          
          .lukhang-studentrecords-nav-link:hover {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            border-color: #ced4da !important;
            color: #495057 !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
          }
          
          .lukhang-studentrecords-nav-link.active {
            background: linear-gradient(135deg, #015C92 0%, #2D82B5 30%, #428CD4 60%, #88CDF6 100%) !important;
            border-color: #015C92 !important;
            color: white !important;
            transform: translateY(-3px) !important;
            box-shadow: 0 6px 20px rgba(13, 110, 253, 0.3) !important;
            z-index: 10 !important;
          }
          
          .lukhang-studentrecords-nav-link.active::before {
            content: '' !important;
            position: absolute !important;
            bottom: -2px !important;
            left: 0 !important;
            right: 0 !important;
            height: 4px !important;
            background: white !important;
            border-radius: 2px !important;
          }
          
          .lukhang-studentrecords-nav-link i {
            margin-right: 0.75rem !important;
            font-size: 1.2rem !important;
            vertical-align: middle !important;
            color: #0d6efd !important;
          }
          
          .lukhang-studentrecords-nav-link.active i {
            color: white !important;
          }
          
          .lukhang-studentrecords-tab-content-wrapper {
            padding: 2.5rem !important;
            background: white !important;
            min-height: 600px !important;
          }
          
          .lukhang-studentrecords-content-card {
            border: none !important;
            background: transparent !important;
          }
          
          .lukhang-studentrecords-content-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            border: none !important;
            border-radius: 12px !important;
            padding: 1.5rem 2rem !important;
            margin-bottom: 2rem !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
          }
          
          .lukhang-studentrecords-content-title {
            color: #495057 !important;
            font-weight: 700 !important;
            font-size: 1.5rem !important;
            margin: 0 !important;
            display: flex !important;
            align-items: center !important;
          }
          
          .lukhang-studentrecords-content-title i {
            margin-right: 1rem !important;
            font-size: 1.4rem !important;
          }
          
          .lukhang-studentrecords-content-body {
            background: transparent !important;
            padding: 0 !important;
          }
          
          @media (max-width: 992px) {
            .lukhang-studentrecords-main-wrapper {
              padding: 1rem !important;
            }
            
            .lukhang-studentrecords-title-custom {
              font-size: 1.5rem !important;
            }
            
            .lukhang-studentrecords-tabs-header {
              padding: 1rem !important;
            }
            
            .lukhang-studentrecords-nav-link {
              font-size: 1rem !important;
              padding: 0.75rem 1.5rem !important;
              min-width: 180px !important;
            }
            
            .lukhang-studentrecords-tab-content-wrapper {
              padding: 1.5rem !important;
            }
            
            .lukhang-studentrecords-content-title {
              font-size: 1.3rem !important;
            }
          }
          
          @media (max-width: 768px) {
            .lukhang-studentrecords-nav-tabs {
              flex-direction: column !important;
              gap: 0.75rem !important;
            }
            
            .lukhang-studentrecords-nav-link {
              min-width: 100% !important;
              border-radius: 12px !important;
            }
            
            .lukhang-studentrecords-nav-link.active::before {
              display: none !important;
            }
            
            .lukhang-studentrecords-tab-content-wrapper {
              padding: 1rem !important;
            }
          }
        `}
      </style>
      <Container fluid className="lukhang-studentrecords-main-wrapper">
        <Card className="lukhang-studentrecords-header-card">
          <Card.Body className="text-center py-4">
            <h1 className="lukhang-studentrecords-title-custom">
              <i className="fas fa-user-graduate me-3"></i>
              Hồ sơ Y tế Học sinh
            </h1>
          </Card.Body>
        </Card>
        
        <Tab.Container activeKey={activeTab} onSelect={handleTabSelect}>
          <Card className="lukhang-studentrecords-tabs-container">
            <Card.Header className="lukhang-studentrecords-tabs-header">
              <Nav variant="tabs" className="lukhang-studentrecords-nav-tabs d-flex justify-content-center">
                <Nav.Item className="lukhang-studentrecords-nav-item">
                  <Nav.Link 
                    eventKey="list" 
                    className="lukhang-studentrecords-nav-link"
                  >
                    <i className="fas fa-list"></i>
                    Danh sách học sinh
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item className="lukhang-studentrecords-nav-item">
                  <Nav.Link 
                    eventKey="reports" 
                    className="lukhang-studentrecords-nav-link"
                  >
                    <i className="fas fa-chart-bar"></i>
                    Báo cáo sức khỏe
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            
            <div className="lukhang-studentrecords-tab-content-wrapper">
              <Tab.Content>
                <Tab.Pane eventKey="list">
                  <Card className="lukhang-studentrecords-content-card">
                    <Card.Header className="lukhang-studentrecords-content-header">
                      <h4 className="lukhang-studentrecords-content-title">
                        <i className="fas fa-list text-info"></i>
                        Quản lý danh sách học sinh
                      </h4>
                    </Card.Header>
                    <Card.Body className="lukhang-studentrecords-content-body">
                      <StudentList />
                    </Card.Body>
                  </Card>
                </Tab.Pane>
                
                <Tab.Pane eventKey="reports">
                  <Card className="lukhang-studentrecords-content-card">
                    <Card.Header className="lukhang-studentrecords-content-header">
                      <h4 className="lukhang-studentrecords-content-title">
                        <i className="fas fa-chart-bar text-primary"></i>
                        Báo cáo và thống kê sức khỏe
                      </h4>
                    </Card.Header>
                    <Card.Body className="lukhang-studentrecords-content-body">
                      <HealthReports />
                    </Card.Body>
                  </Card>
                </Tab.Pane>
              </Tab.Content>
            </div>
          </Card>
        </Tab.Container>
      </Container>
    </>
  );
};

// Component StudentRecordsPage từ file index.jsx
const StudentRecordsPage = () => {
  return (
    <div className="student-records-page">
      <StudentRecords />
    </div>
  );
};

export { StudentRecords };
export default StudentRecordsPage;
