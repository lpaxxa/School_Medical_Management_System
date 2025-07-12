import React, { useState, useEffect } from 'react';
import { Container, Nav, Tab, Card } from 'react-bootstrap';
import VaccinationDashboard from './Dashboard/VaccinationDashboard';
import CreateVaccinationRecord from './CreateRecord/CreateVaccinationRecord';
import PostVaccinationMonitoring from './PostMonitoring/PostVaccinationMonitoring';
import './VaccinationMain.css';
import { VaccinationProvider } from '../../../../context/NurseContext/VaccinationContext';

const VaccinationPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Restore active tab from sessionStorage on mount
  useEffect(() => {
    const savedTab = sessionStorage.getItem('vaccinationActiveTab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // Save active tab to sessionStorage when it changes
  const handleTabSelect = (selectedTab) => {
    setActiveTab(selectedTab);
    sessionStorage.setItem('vaccinationActiveTab', selectedTab);
  };

  return (
    <VaccinationProvider>
      <Container fluid className="p-4 bg-light">
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <h1 className="h2 mb-3 text-primary">Quản lý Tiêm chủng</h1>
          </Card.Body>
        </Card>
        
        <Tab.Container activeKey={activeTab} onSelect={handleTabSelect}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom-0 pt-3 pb-0">
              <Nav variant="tabs" className="nav-tabs-custom">
                <Nav.Item>
                  <Nav.Link 
                    eventKey="dashboard" 
                    className="fw-semibold text-dark border border-bottom-0 rounded-top px-4 py-3"
                  >
                    <i className="fas fa-chart-line me-2 text-primary"></i>
                    Dashboard
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    eventKey="create-record" 
                    className="fw-semibold text-dark border border-bottom-0 rounded-top px-4 py-3"
                  >
                    <i className="fas fa-plus-circle me-2 text-success"></i>
                    Danh sách tiêm chủng
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    eventKey="monitoring" 
                    className="fw-semibold text-dark border border-bottom-0 rounded-top px-4 py-3"
                  >
                    <i className="fas fa-user-md me-2 text-info"></i>
                    Theo dõi sau tiêm
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body className="p-4">
              <Tab.Content>
                <Tab.Pane eventKey="dashboard">
                  <Card className="border-0">
                    <Card.Header className="bg-light border-0">
                      <h4 className="card-title mb-0 text-primary">
                        <i className="fas fa-chart-line me-2"></i>
                        Thống kê tiêm chủng
                      </h4>
                    </Card.Header>
                    <Card.Body>
                      <VaccinationDashboard />
                    </Card.Body>
                  </Card>
                </Tab.Pane>
                <Tab.Pane eventKey="create-record">
                  <Card className="border-0">
                    <Card.Header className="bg-light border-0">
                      <h4 className="card-title mb-0 text-success">
                        <i className="fas fa-plus-circle me-2"></i>
                        Danh sách tiêm chủng
                      </h4>
                    </Card.Header>
                    <Card.Body>
                      <CreateVaccinationRecord />
                    </Card.Body>
                  </Card>
                </Tab.Pane>
                <Tab.Pane eventKey="monitoring">
                  <Card className="border-0">
                    <Card.Header className="bg-light border-0">
                      <h4 className="card-title mb-0 text-info">
                        <i className="fas fa-user-md me-2"></i>
                        Theo dõi sau tiêm chủng
                      </h4>
                    </Card.Header>
                    <Card.Body>
                      <PostVaccinationMonitoring />
                    </Card.Body>
                  </Card>
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Tab.Container>
      </Container>
    </VaccinationProvider>
  );
};

export default VaccinationPage;
