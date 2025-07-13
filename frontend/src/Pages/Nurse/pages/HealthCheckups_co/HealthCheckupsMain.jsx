import React, { useState, useEffect } from 'react';
import { Container, Nav, Tab, Card, Row, Col } from 'react-bootstrap';
import { HealthCheckupProvider } from '../../../../context/NurseContext/HealthCheckupContext';
import CheckupList from './CheckupList/CheckupList';
import './HealthCheckupsMain.css';

// Import renamed component
import MedicalCheckupList from './ScheduleConsultation/ScheduleConsultation';

// Export the HealthCheckupsPage component for routes
export const HealthCheckupsPage = () => {
  return (
    <HealthCheckupProvider>
      <HealthCheckups />
    </HealthCheckupProvider>
  );
};

const HealthCheckups = () => {
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = sessionStorage.getItem('healthCheckupsActiveTab');
    return (savedTab && savedTab !== 'dashboard') ? savedTab : 'campaign-list';
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    sessionStorage.setItem('healthCheckupsActiveTab', activeTab);
  }, [activeTab]);

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTabSelect = (selectedTab) => {
    setActiveTab(selectedTab);
  };

  return (
    <>
      <style>
        {`
          .lukhang-healthcheckup-main-wrapper {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            min-height: 100vh !important;
            padding: 2rem !important;
          }
          
          .lukhang-healthcheckup-header-card {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
            border: none !important;
            border-radius: 1rem !important;
            box-shadow: 0 10px 30px rgba(220, 53, 69, 0.2) !important;
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
            background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%) !important;
            border-color: #dc3545 !important;
            color: white !important;
            transform: translateY(-3px) !important;
            box-shadow: 0 6px 20px rgba(220, 53, 69, 0.3) !important;
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
        
        <Tab.Container activeKey={activeTab} onSelect={handleTabSelect}>
          <Card className="lukhang-healthcheckup-tabs-container">
            <Card.Header className="lukhang-healthcheckup-tabs-header">
              <Nav variant="tabs" className="lukhang-healthcheckup-nav-tabs d-flex justify-content-center">
                <Nav.Item className="lukhang-healthcheckup-nav-item">
                  <Nav.Link 
                    eventKey="campaign-list" 
                    className="lukhang-healthcheckup-nav-link"
                  >
                    <i className="fas fa-list text-primary"></i>
                    Danh sách đợt khám
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item className="lukhang-healthcheckup-nav-item">
                  <Nav.Link 
                    eventKey="schedule-consultation" 
                    className="lukhang-healthcheckup-nav-link"
                  >
                    <i className="fas fa-calendar-alt text-warning"></i>
                    Danh sách khám sức khỏe
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            
            <div className="lukhang-healthcheckup-tab-content-wrapper">
              <Tab.Content>
                <Tab.Pane eventKey="campaign-list">
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
                </Tab.Pane>
                
                <Tab.Pane eventKey="schedule-consultation">
                  <Card className="lukhang-healthcheckup-content-card">
                    <Card.Header className="lukhang-healthcheckup-content-header">
                      <h4 className="lukhang-healthcheckup-content-title">
                        <i className="fas fa-calendar-alt text-warning"></i>
                        Quản lý danh sách khám sức khỏe
                      </h4>
                    </Card.Header>
                    <Card.Body className="lukhang-healthcheckup-content-body">
                      <MedicalCheckupList 
                        refreshData={refreshData}
                      />
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

// Export both components but make HealthCheckupsPage the default
export { HealthCheckups };
export default HealthCheckupsPage;
