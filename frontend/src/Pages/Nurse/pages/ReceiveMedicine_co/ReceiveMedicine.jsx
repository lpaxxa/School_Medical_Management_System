import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav } from 'react-bootstrap';
import './ReceiveMedicine.css';
import MedicineReceipts from './MedicineReceipts/MedicineReceipts';
import MedicationHistory from './MedicationHistory/MedicationHistory';

// Component ReceiveMedicineMain
const ReceiveMedicineMain = () => {
  const [activeTab, setActiveTab] = useState('receipts');

  // Tab configuration - removed administration tab
  const tabs = [
    {
      key: 'receipts',
      title: 'Đơn nhận thuốc',
      icon: 'fas fa-prescription-bottle-alt',
      component: <MedicineReceipts />
    },
    {
      key: 'history',
      title: 'Lịch sử dùng thuốc',
      icon: 'fas fa-history',
      component: <MedicationHistory />
    }
  ];

  // Get the currently active component
  const getCurrentComponent = () => {
    const currentTab = tabs.find(tab => tab.key === activeTab);
    return currentTab ? currentTab.component : null;
  };

  return (
    <Container fluid className="py-4">
      {/* Page header */}
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary fw-bold mb-2">Quản lý nhận thuốc</h2>
          <p className="text-muted">Quản lý đơn nhận thuốc và lịch sử dùng thuốc của học sinh</p>
        </Col>
      </Row>
      
      {/* Tab navigation */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0">
          <Nav variant="tabs" className="nav-pills-custom">
            {tabs.map((tab) => (
              <Nav.Item key={tab.key}>
                <Nav.Link 
                  active={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="d-flex align-items-center"
                  style={{ cursor: 'pointer' }}
                >
                  <i className={`${tab.icon} me-2`}></i>
                  {tab.title}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Card.Header>
        
        <Card.Body className="p-0">
          {/* Render only the active component */}
          <div className="active-tab-content">
            {getCurrentComponent()}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

// Main component
const ReceiveMedicine = () => {
  return (
    <div className="receive-medicine-wrapper bg-light min-vh-100">
      <ReceiveMedicineMain />
    </div>
  );
};

export { ReceiveMedicineMain };
export default ReceiveMedicine;
