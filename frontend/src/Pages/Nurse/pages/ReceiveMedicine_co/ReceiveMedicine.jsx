import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Alert, Spinner } from 'react-bootstrap';
import './ReceiveMedicine.css';
import MedicineReceipts from './MedicineReceipts/MedicineReceipts';
import MedicationHistory from './MedicationHistory/MedicationHistory';
import { MedicineApprovalProvider } from '../../../../context/NurseContext/MedicineApprovalContext';

// Component ReceiveMedicineMain with state-based tab switching
const ReceiveMedicineMain = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("receipts"); // State-based tab switching

  if (isLoading) {
    return (
      <Container fluid className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải dữ liệu...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Đã xảy ra lỗi!</Alert.Heading>
          <p>{error || "Không thể tải dữ liệu. Vui lòng thử lại sau."}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Page header */}
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary fw-bold mb-2">Quản lý nhận thuốc</h2>
          <p className="text-muted">Quản lý đơn nhận thuốc và lịch sử dùng thuốc của học sinh</p>
        </Col>
      </Row>
      
      {/* State-based tab navigation */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0">
          <Nav variant="tabs" className="nav-pills-custom">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === "receipts"}
                onClick={() => setActiveTab("receipts")}
                className="d-flex align-items-center"
                style={{ cursor: 'pointer' }}
              >
                <i className="fas fa-prescription-bottle-alt me-2"></i>
                Đơn nhận thuốc
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === "history"}
                onClick={() => setActiveTab("history")}
                className="d-flex align-items-center"
                style={{ cursor: 'pointer' }}
              >
                <i className="fas fa-history me-2"></i>
                Lịch sử dùng thuốc
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        
        <Card.Body className="p-0">
          {/* Conditionally render content without unmounting */}
          <div style={{ display: activeTab === "receipts" ? "block" : "none" }}>
            <MedicineReceipts />
          </div>
          <div style={{ display: activeTab === "history" ? "block" : "none" }}>
            <MedicationHistory />
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

// Main component
const ReceiveMedicine = () => {
  return (
    <MedicineApprovalProvider>
      <div className="receive-medicine-wrapper bg-light min-vh-100">
        <ReceiveMedicineMain />
      </div>
    </MedicineApprovalProvider>
  );
};

export { ReceiveMedicineMain };
export default ReceiveMedicine;