import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Alert, Spinner } from 'react-bootstrap';
import './ReceiveMedicine.css';
import MedicineReceipts from './MedicineReceipts/MedicineReceipts';
import MedicationHistory from './MedicationHistory/MedicationHistory';
import { MedicineApprovalProvider } from '../../../../context/NurseContext/MedicineApprovalContext';

// Component ReceiveMedicineMain (đã gộp từ file ReceiveMedicineMain.jsx và áp dụng Bootstrap)
const ReceiveMedicineMain = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Giả lập hiệu ứng loading
  useEffect(() => {
    // Thiết lập timeout để hiện loading indicator
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 1.5 giây để giả lập loading
    
    return () => clearTimeout(timer);
  }, []);

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
    <>
      <style>
        {`
          .lukhang-receivemedicine-main-wrapper {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            min-height: 100vh !important;
            padding: 2rem !important;
          }
          
          .lukhang-receivemedicine-header-card {
            background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%) !important;
            border: none !important;
            border-radius: 1rem !important;
            box-shadow: 0 10px 30px rgba(13, 110, 253, 0.2) !important;
            margin-bottom: 2rem !important;
          }
          
          .lukhang-receivemedicine-title-custom {
            color: white !important;
            font-weight: 700 !important;
            font-size: 2rem !important;
            margin: 0 !important;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
          }
          
          .lukhang-receivemedicine-tabs-container {
            background: white !important;
            border: none !important;
            border-radius: 1rem !important;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08) !important;
            overflow: hidden !important;
          }
          
          .lukhang-receivemedicine-tabs-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%) !important;
            border-bottom: 3px solid #e9ecef !important;
            padding: 1.5rem 2rem 0 2rem !important;
            border-radius: 1rem 1rem 0 0 !important;
          }
          
          .lukhang-receivemedicine-nav-tabs {
            border: none !important;
            gap: 0.5rem !important;
          }
          
          .lukhang-receivemedicine-nav-item {
            margin-bottom: 0 !important;
          }
          
          .lukhang-receivemedicine-nav-link {
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
          
          .lukhang-receivemedicine-nav-link:hover {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            border-color: #ced4da !important;
            color: #495057 !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
          }
          
          .lukhang-receivemedicine-nav-link.active {
            background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%) !important;
            border-color: #0d6efd !important;
            color: white !important;
            transform: translateY(-3px) !important;
            box-shadow: 0 6px 20px rgba(13, 110, 253, 0.3) !important;
            z-index: 10 !important;
          }
          
          .lukhang-receivemedicine-nav-link.active i {
            color: white !important;
          }
          
          .lukhang-receivemedicine-nav-link.active::before {
            content: '' !important;
            position: absolute !important;
            bottom: -2px !important;
            left: 0 !important;
            right: 0 !important;
            height: 4px !important;
            background: white !important;
            border-radius: 2px !important;
          }
          
          .lukhang-receivemedicine-nav-link i {
            margin-right: 0.75rem !important;
            font-size: 1.2rem !important;
            vertical-align: middle !important;
            color: #0d6efd !important;
          }
          
          .lukhang-receivemedicine-nav-link.active i {
            color: white !important;
          }
          
          .lukhang-receivemedicine-tab-content-wrapper {
            padding: 2.5rem !important;
            background: white !important;
            min-height: 600px !important;
          }
          
          .lukhang-receivemedicine-content-card {
            border: none !important;
            background: transparent !important;
          }
          
          .lukhang-receivemedicine-content-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            border: none !important;
            border-radius: 12px !important;
            padding: 1.5rem 2rem !important;
            margin-bottom: 2rem !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
          }
          
          .lukhang-receivemedicine-content-title {
            color: #495057 !important;
            font-weight: 700 !important;
            font-size: 1.5rem !important;
            margin: 0 !important;
            display: flex !important;
            align-items: center !important;
          }
          
          .lukhang-receivemedicine-content-title i {
            margin-right: 1rem !important;
            font-size: 1.4rem !important;
          }
          
          .lukhang-receivemedicine-content-body {
            background: transparent !important;
            padding: 0 !important;
          }
          
          @media (max-width: 992px) {
            .lukhang-receivemedicine-main-wrapper {
              padding: 1rem !important;
            }
            
            .lukhang-receivemedicine-title-custom {
              font-size: 1.5rem !important;
            }
            
            .lukhang-receivemedicine-tabs-header {
              padding: 1rem !important;
            }
            
            .lukhang-receivemedicine-nav-link {
              font-size: 1rem !important;
              padding: 0.75rem 1.5rem !important;
              min-width: 180px !important;
            }
            
            .lukhang-receivemedicine-tab-content-wrapper {
              padding: 1.5rem !important;
            }
            
            .lukhang-receivemedicine-content-title {
              font-size: 1.3rem !important;
            }
          }
          
          @media (max-width: 768px) {
            .lukhang-receivemedicine-nav-tabs {
              flex-direction: column !important;
              gap: 0.75rem !important;
            }
            
            .lukhang-receivemedicine-nav-link {
              min-width: 100% !important;
              border-radius: 12px !important;
            }
            
            .lukhang-receivemedicine-nav-link.active::before {
              display: none !important;
            }
            
            .lukhang-receivemedicine-tab-content-wrapper {
              padding: 1rem !important;
            }
          }
        `}
      </style>
      <Container fluid className="lukhang-receivemedicine-main-wrapper">
        <Card className="lukhang-receivemedicine-header-card">
          <Card.Body className="text-center py-4">
            <h1 className="lukhang-receivemedicine-title-custom">
              <i className="fas fa-pills me-3"></i>
              Quản lý nhận thuốc
            </h1>
          </Card.Body>
        </Card>
        
        <Tab.Container defaultActiveKey="receipts">
          <Card className="lukhang-receivemedicine-tabs-container">
            <Card.Header className="lukhang-receivemedicine-tabs-header">
              <Nav variant="tabs" className="lukhang-receivemedicine-nav-tabs d-flex justify-content-center">
                <Nav.Item className="lukhang-receivemedicine-nav-item">
                  <Nav.Link 
                    eventKey="receipts" 
                    className="lukhang-receivemedicine-nav-link"
                  >
                    <i className="fas fa-prescription-bottle-alt"></i>
                    Đơn nhận thuốc
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item className="lukhang-receivemedicine-nav-item" >
                  <Nav.Link 
                    eventKey="history" 
                    className="lukhang-receivemedicine-nav-link"
                  >
                    <i className="fas fa-history"></i>
                    Lịch sử dùng thuốc
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            
            <div className="lukhang-receivemedicine-tab-content-wrapper">
              <Tab.Content>
                <Tab.Pane eventKey="receipts">
                  <Card className="lukhang-receivemedicine-content-card">
                    <Card.Header className="lukhang-receivemedicine-content-header">
                      <h4 className="lukhang-receivemedicine-content-title">
                        <i className="fas fa-prescription-bottle-alt text-primary"></i>
                        Quản lý đơn nhận thuốc
                      </h4>
                    </Card.Header>
                    <Card.Body className="lukhang-receivemedicine-content-body">
                      <MedicineReceipts />
                    </Card.Body>
                  </Card>
                </Tab.Pane>
                <Tab.Pane eventKey="history">
                  <Card className="lukhang-receivemedicine-content-card">
                    <Card.Header className="lukhang-receivemedicine-content-header">
                      <h4 className="lukhang-receivemedicine-content-title">
                        <i className="fas fa-history text-primary"></i>
                        Lịch sử và thống kê dùng thuốc
                      </h4>
                    </Card.Header>
                    <Card.Body className="lukhang-receivemedicine-content-body">
                      <MedicationHistory />
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

// Component chính ReceiveMedicine
const ReceiveMedicine = () => {
  return (
    <MedicineApprovalProvider>
      <ReceiveMedicineMain />
    </MedicineApprovalProvider>
  );
};

// Xuất component riêng để có thể tái sử dụng ở nơi khác nếu cần
export { ReceiveMedicineMain };

// Export component chính
export default ReceiveMedicine;
