import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Alert } from 'react-bootstrap';
import './ReceiveMedicine.css';
import MedicineReceipts from './MedicineReceipts/MedicineReceipts';
import MedicationHistory from './MedicationHistory/MedicationHistory';

// Component ReceiveMedicineMain (đã gộp từ file ReceiveMedicineMain.jsx và áp dụng Bootstrap)
const ReceiveMedicineMain = () => {
  return (
    <Container fluid className="py-4">
      {/* Page header with Bootstrap styling */}
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary fw-bold mb-2">Quản lý nhận thuốc</h2>
          <p className="text-muted">Quản lý đơn nhận thuốc và lịch sử dùng thuốc của học sinh</p>
        </Col>
      </Row>
      
      {/* Bootstrap Tab navigation */}
      <Tab.Container defaultActiveKey="receipts">
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-0">
            <Nav variant="tabs" className="nav-pills-custom">
              <Nav.Item>
                <Nav.Link eventKey="receipts" className="d-flex align-items-center">
                  <i className="fas fa-prescription-bottle-alt me-2"></i>
                  Đơn nhận thuốc
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="history" className="d-flex align-items-center">
                  <i className="fas fa-history me-2"></i>
                  Lịch sử dùng thuốc
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          
          <Card.Body className="p-0">
            <Tab.Content>
              <Tab.Pane eventKey="receipts">
                <MedicineReceipts />
              </Tab.Pane>
              <Tab.Pane eventKey="history">
                <MedicationHistory />
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>
    </Container>
  );
};

// Component chính ReceiveMedicine
const ReceiveMedicine = () => {
  return (
    <div className="receive-medicine-wrapper bg-light min-vh-100">
      <ReceiveMedicineMain />
    </div>
  );
};

// Xuất component riêng để có thể tái sử dụng ở nơi khác nếu cần
export { ReceiveMedicineMain };

// Export component chính
export default ReceiveMedicine;
