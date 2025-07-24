import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Container, Nav, Card, Row, Col } from 'react-bootstrap';
import { HealthCheckupProvider } from '../../../../context/NurseContext/HealthCheckupContext';
import CheckupList from './CheckupList/CheckupList';
import './HealthCheckupsMain.css';

// Import renamed component
import MedicalCheckupList from './ScheduleConsultation/ScheduleConsultation';

const HealthCheckupsMain = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/schedule-consultation')) {
      return 'schedule-consultation';
    } else {
      return 'campaign-list';
    }
  };

  const [activeTab, setActiveTab] = useState('campaign-list');

  // Sync tab state when URL changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const handleTabSelect = (selectedTab) => {
    setActiveTab(selectedTab);
    // Navigate to absolute path to avoid URL accumulation
    const basePath = '/nurse/health-checkups';
    navigate(`${basePath}/${selectedTab}`, { replace: true });
  };

  return (
    <HealthCheckupProvider>
      <style>
        {`
          .lukhang-healthcheckup-main-wrapper {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            min-height: 100vh !important;
            padding: 2rem !important;
          }
          
          .lukhang-healthcheckup-header-card {
            background: linear-gradient(135deg, #015C92 0%, #2D82B5 30%, #428CD4 60%, #88CDF6 100%) !important;
            border: none !important;
            border-radius: 1rem !important;
            box-shadow: 0 10px 30px rgba(13, 110, 253, 0.2) !important;
            margin-bottom: 2rem !important;
          }
          
          .lukhang-healthcheckup-title-custom {
            color: white !important;
            font-weight: 700 !important;
            font-size: 2rem !important;
            margin: 0 !important;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
          }
          
          .lukhang-healthcheckup-tabs-container {
            background: white !important;
            border: none !important;
            border-radius: 1rem !important;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08) !important;
            overflow: hidden !important;
          }
          
          .lukhang-healthcheckup-tabs-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%) !important;
            border-bottom: 3px solid #e9ecef !important;
            padding: 1.5rem 2rem 0 2rem !important;
            border-radius: 1rem 1rem 0 0 !important;
          }
          
          .lukhang-healthcheckup-nav-tabs {
            border: none !important;
            gap: 0.5rem !important;
          }
          
          .lukhang-healthcheckup-nav-item {
            margin-bottom: 0 !important;
          }
          
          .lukhang-healthcheckup-nav-link {
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
            min-width: 220px !important;
            text-align: center !important;
            box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05) !important;
          }
          
          .lukhang-healthcheckup-nav-link:hover {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            border-color: #ced4da !important;
            color: #495057 !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
          }
          
          .lukhang-healthcheckup-nav-link.active {
            background: linear-gradient(135deg, #015C92 0%, #2D82B5 30%, #428CD4 60%, #88CDF6 100%) !important;
            border-color: #015C92 !important;
            color: white !important;
            transform: translateY(-3px) !important;
            box-shadow: 0 6px 20px rgba(1, 92, 146, 0.3) !important;
            z-index: 10 !important;
          }
          
          .lukhang-healthcheckup-nav-link.active::before {
            content: '' !important;
            position: absolute !important;
            bottom: -2px !important;
            left: 0 !important;
            right: 0 !important;
            height: 4px !important;
            background: white !important;
            border-radius: 2px !important;
          }
          
          .lukhang-healthcheckup-nav-link i {
            margin-right: 0.75rem !important;
            font-size: 1.2rem !important;
            vertical-align: middle !important;
            color: #0d6efd !important;
          }
          
          .lukhang-healthcheckup-nav-link.active i {
            color: white !important;
          }
          
          .lukhang-healthcheckup-tab-content-wrapper {
            padding: 2.5rem !important;
            background: white !important;
            min-height: 600px !important;
          }
          
          .lukhang-healthcheckup-content-card {
            border: none !important;
            background: transparent !important;
          }
          
          .lukhang-healthcheckup-content-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            border: none !important;
            border-radius: 12px !important;
            padding: 1.5rem 2rem !important;
            margin-bottom: 2rem !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
          }
          
          .lukhang-healthcheckup-content-title {
            color: #495057 !important;
            font-weight: 700 !important;
            font-size: 1.5rem !important;
            margin: 0 !important;
            display: flex !important;
            align-items: center !important;
          }
          
          .lukhang-healthcheckup-content-title i {
            margin-right: 1rem !important;
            font-size: 1.4rem !important;
          }
          
          .lukhang-healthcheckup-content-body {
            background: transparent !important;
            padding: 0 !important;
          }

          .lukhang-healthcheckup-routes-container {
            background: transparent !important;
            min-height: 400px !important;
          }
          
          @media (max-width: 992px) {
            .lukhang-healthcheckup-main-wrapper {
              padding: 1rem !important;
            }
            
            .lukhang-healthcheckup-title-custom {
              font-size: 1.5rem !important;
            }
            
            .lukhang-healthcheckup-tabs-header {
              padding: 1rem !important;
            }
            
            .lukhang-healthcheckup-nav-link {
              font-size: 1rem !important;
              padding: 0.75rem 1.5rem !important;
              min-width: 180px !important;
            }
            
            .lukhang-healthcheckup-tab-content-wrapper {
              padding: 1.5rem !important;
            }
            
            .lukhang-healthcheckup-content-title {
              font-size: 1.3rem !important;
            }
          }
          
          @media (max-width: 768px) {
            .lukhang-healthcheckup-nav-tabs {
              flex-direction: column !important;
              gap: 0.75rem !important;
            }
            
            .lukhang-healthcheckup-nav-link {
              min-width: 100% !important;
              border-radius: 12px !important;
            }
            
            .lukhang-healthcheckup-nav-link.active::before {
              display: none !important;
            }
            
            .lukhang-healthcheckup-tab-content-wrapper {
              padding: 1rem !important;
            }
          }
        `}
      </style>
      <Container fluid className="lukhang-healthcheckup-main-wrapper">
        <Card className="lukhang-healthcheckup-header-card">
          <Card.Body className="text-center py-4">
            <h1 className="lukhang-healthcheckup-title-custom">
              <i className="fas fa-heartbeat me-3"></i>
              Quản lý khám sức khỏe
            </h1>
          </Card.Body>
        </Card>
        
        <Card className="lukhang-healthcheckup-tabs-container">
          <Card.Header className="lukhang-healthcheckup-tabs-header">
            <Nav variant="tabs" className="lukhang-healthcheckup-nav-tabs d-flex justify-content-center">
              <Nav.Item className="lukhang-healthcheckup-nav-item">
                <Nav.Link
                  className={`lukhang-healthcheckup-nav-link ${activeTab === 'campaign-list' ? 'active' : ''}`}
                  onClick={() => handleTabSelect('campaign-list')}
                >
                  <i className="fas fa-list"></i>
                  Danh sách đợt khám
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="lukhang-healthcheckup-nav-item">
                <Nav.Link
                  className={`lukhang-healthcheckup-nav-link ${activeTab === 'schedule-consultation' ? 'active' : ''}`}
                  onClick={() => handleTabSelect('schedule-consultation')}
                >
                  <i className="fas fa-calendar-alt"></i>
                  Danh sách khám sức khỏe
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <div className="lukhang-healthcheckup-tab-content-wrapper">
            <div className="lukhang-healthcheckup-routes-container">
              <Routes>
                <Route index element={<Navigate to="campaign-list" replace />} />
                <Route path="campaign-list" element={
                  <Card className="lukhang-healthcheckup-content-card">
                    <Card.Header className="lukhang-healthcheckup-content-header">
                      <h4 className="lukhang-healthcheckup-content-title">
                        <i className="fas fa-list text-primary"></i>
                        Quản lý danh sách đợt khám
                      </h4>
                    </Card.Header>
                    <Card.Body className="lukhang-healthcheckup-content-body">
                      <CheckupList />
                    </Card.Body>
                  </Card>
                } />
                <Route path="schedule-consultation" element={
                  <Card className="lukhang-healthcheckup-content-card">
                    <Card.Header className="lukhang-healthcheckup-content-header">
                      <h4 className="lukhang-healthcheckup-content-title">
                        <i className="fas fa-calendar-alt text-primary"></i>
                        Quản lý danh sách khám sức khỏe
                      </h4>
                    </Card.Header>
                    <Card.Body className="lukhang-healthcheckup-content-body">
                      <MedicalCheckupList />
                    </Card.Body>
                  </Card>
                } />
              </Routes>
            </div>
          </div>
        </Card>
      </Container>
    </HealthCheckupProvider>
  );
};

export default HealthCheckupsMain;
