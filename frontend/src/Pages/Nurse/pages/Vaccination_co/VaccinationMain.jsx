import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Container, Nav, Card, Row, Col } from 'react-bootstrap';
import CreateVaccinationRecord from './CreateRecord/CreateVaccinationRecord';
import PostVaccinationMonitoring from './PostMonitoring/PostVaccinationMonitoring';
import './VaccinationMain.css';
import { VaccinationProvider } from '../../../../context/NurseContext/VaccinationContext';

const VaccinationMain = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/monitoring')) {
      return 'monitoring';
    } else {
      return 'create-record';
    }
  };

  const [activeTab, setActiveTab] = useState('create-record');

  // Sync tab state when URL changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const handleTabSelect = (selectedTab) => {
    setActiveTab(selectedTab);
    // Navigate to absolute path to avoid URL accumulation
    const basePath = '/nurse/vaccination';
    navigate(`${basePath}/${selectedTab}`, { replace: true });
  };

  return (
    <VaccinationProvider>
      <Container fluid style={{ padding: '2rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        {/* Header */}
        <Card style={{ marginBottom: '2rem', borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(13, 110, 253, 0.2)' }}>
          <Card.Body className="text-center py-4" style={{ background: 'linear-gradient(135deg, #015C92 0%, #2D82B5 30%, #428CD4 60%, #88CDF6 100%)', borderRadius: '1rem' }}>
            <h1 style={{ color: 'white', fontWeight: '700', fontSize: '2rem', margin: '0', textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <i className="fas fa-syringe me-3"></i>
              Quản lý Tiêm chủng
            </h1>
          </Card.Body>
        </Card>

        {/* Tabs */}
        <Card style={{ borderRadius: '1rem', border: 'none', boxShadow: '0 15px 40px rgba(0, 0, 0, 0.08)', overflow: 'hidden' }}>
          <Card.Header style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', borderBottom: '3px solid #e9ecef', padding: '1.5rem 2rem 0 2rem', borderRadius: '1rem 1rem 0 0' }}>
            <Nav variant="tabs" style={{ border: 'none', gap: '0.5rem' }} className="d-flex justify-content-center">
              <Nav.Item>
                <Nav.Link
                  className={activeTab === 'create-record' ? 'active' : ''}
                  onClick={() => handleTabSelect('create-record')}
                  style={{
                    background: activeTab === 'create-record' ? 'linear-gradient(135deg, #015C92 0%, #2D82B5 30%, #428CD4 60%, #88CDF6 100%)' : 'white',
                    border: `2px solid ${activeTab === 'create-record' ? '#015C92' : '#e9ecef'}`,
                    borderRadius: '15px 15px 0 0',
                    color: activeTab === 'create-record' ? 'white' : '#6c757d',
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    padding: '1rem 2rem',
                    minWidth: '200px',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fas fa-list-alt me-2"></i>
                  Danh sách tiêm chủng
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  className={activeTab === 'monitoring' ? 'active' : ''}
                  onClick={() => handleTabSelect('monitoring')}
                  style={{
                    background: activeTab === 'monitoring' ? 'linear-gradient(135deg, #015C92 0%, #2D82B5 30%, #428CD4 60%, #88CDF6 100%)' : 'white',
                    border: `2px solid ${activeTab === 'monitoring' ? '#015C92' : '#e9ecef'}`,
                    borderRadius: '15px 15px 0 0',
                    color: activeTab === 'monitoring' ? 'white' : '#6c757d',
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    padding: '1rem 2rem',
                    minWidth: '200px',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fas fa-user-md me-2"></i>
                  Theo dõi sau tiêm
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <div style={{ padding: '2.5rem', background: 'white', minHeight: '600px' }}>
            <Routes>
              <Route index element={<Navigate to="create-record" replace />} />
              <Route path="create-record" element={
                <Card style={{ border: 'none', background: 'transparent' }}>
                  <Card.Header style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', border: 'none', borderRadius: '12px', padding: '1.5rem 2rem', marginBottom: '2rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
                    <h4 style={{ color: '#495057', fontWeight: '700', fontSize: '1.5rem', margin: '0', display: 'flex', alignItems: 'center' }}>
                      <i className="fas fa-list-alt text-primary me-3" style={{ fontSize: '1.4rem' }}></i>
                      Quản lý danh sách tiêm chủng
                    </h4>
                  </Card.Header>
                  <Card.Body style={{ background: 'transparent', padding: '0' }}>
                    <CreateVaccinationRecord />
                  </Card.Body>
                </Card>
              } />
              <Route path="monitoring" element={
                <Card style={{ border: 'none', background: 'transparent' }}>
                  <Card.Header style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', border: 'none', borderRadius: '12px', padding: '1.5rem 2rem', marginBottom: '2rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
                    <h4 style={{ color: '#495057', fontWeight: '700', fontSize: '1.5rem', margin: '0', display: 'flex', alignItems: 'center' }}>
                      <i className="fas fa-user-md text-primary me-3" style={{ fontSize: '1.4rem' }}></i>
                      Theo dõi chăm sóc sau tiêm chủng
                    </h4>
                  </Card.Header>
                  <Card.Body style={{ background: 'transparent', padding: '0' }}>
                    <PostVaccinationMonitoring />
                  </Card.Body>
                </Card>
              } />
            </Routes>
          </div>
        </Card>
      </Container>
    </VaccinationProvider>
  );

  // Full render (commented out for now)
  /*
  return (
    <>
      <style>
        {`
          .lukhang-vaccination-main-wrapper {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            min-height: 100vh !important;
            padding: 2rem !important;
          }
          
          .lukhang-vaccination-header-card {
            background: linear-gradient(135deg, #015C92 0%, #2D82B5 30%, #428CD4 60%, #88CDF6 100%) !important;
            border: none !important;
            border-radius: 1rem !important;
            box-shadow: 0 10px 30px rgba(13, 110, 253, 0.2) !important;
            margin-bottom: 2rem !important;
          }
          
          .lukhang-vaccination-title-custom {
            color: white !important;
            font-weight: 700 !important;
            font-size: 2rem !important;
            margin: 0 !important;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
          }
          
          .lukhang-vaccination-tabs-container {
            background: white !important;
            border: none !important;
            border-radius: 1rem !important;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08) !important;
            overflow: hidden !important;
          }
          
          .lukhang-vaccination-tabs-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%) !important;
            border-bottom: 3px solid #e9ecef !important;
            padding: 1.5rem 2rem 0 2rem !important;
            border-radius: 1rem 1rem 0 0 !important;
          }
          
          .lukhang-vaccination-nav-tabs {
            border: none !important;
            gap: 0.5rem !important;
          }
          
          .lukhang-vaccination-nav-item {
            margin-bottom: 0 !important;
          }
          
          .lukhang-vaccination-nav-link {
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
          
          .lukhang-vaccination-nav-link:hover {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            border-color: #ced4da !important;
            color: #495057 !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
          }
          
          .lukhang-vaccination-nav-link.active {
            background: linear-gradient(135deg, #015C92 0%, #2D82B5 30%, #428CD4 60%, #88CDF6 100%) !important;
            border-color: #015C92 !important;
            color: white !important;
            transform: translateY(-3px) !important;
            box-shadow: 0 6px 20px rgba(13, 110, 253, 0.3) !important;
            z-index: 10 !important;
          }
          
          .lukhang-vaccination-nav-link.active::before {
            content: '' !important;
            position: absolute !important;
            bottom: -2px !important;
            left: 0 !important;
            right: 0 !important;
            height: 4px !important;
            background: white !important;
            border-radius: 2px !important;
          }
          
          .lukhang-vaccination-nav-link i {
            margin-right: 0.75rem !important;
            font-size: 1.2rem !important;
            vertical-align: middle !important;
            color: #0d6efd !important;
          }
          
          .lukhang-vaccination-nav-link.active i {
            color: white !important;
          }
          
          .lukhang-vaccination-tab-content-wrapper {
            padding: 2.5rem !important;
            background: white !important;
            min-height: 600px !important;
          }
          
          .lukhang-vaccination-content-card {
            border: none !important;
            background: transparent !important;
          }
          
          .lukhang-vaccination-content-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            border: none !important;
            border-radius: 12px !important;
            padding: 1.5rem 2rem !important;
            margin-bottom: 2rem !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
          }
          
          .lukhang-vaccination-content-title {
            color: #495057 !important;
            font-weight: 700 !important;
            font-size: 1.5rem !important;
            margin: 0 !important;
            display: flex !important;
            align-items: center !important;
          }
          
          .lukhang-vaccination-content-title i {
            margin-right: 1rem !important;
            font-size: 1.4rem !important;
          }
          
          .lukhang-vaccination-content-body {
            background: transparent !important;
            padding: 0 !important;
          }

          .lukhang-vaccination-routes-container {
            background: transparent !important;
            min-height: 400px !important;
          }
          
          @media (max-width: 992px) {
            .lukhang-vaccination-main-wrapper {
              padding: 1rem !important;
            }
            
            .lukhang-vaccination-title-custom {
              font-size: 1.5rem !important;
            }
            
            .lukhang-vaccination-tabs-header {
              padding: 1rem !important;
            }
            
            .lukhang-vaccination-nav-link {
              font-size: 1rem !important;
              padding: 0.75rem 1.5rem !important;
              min-width: 160px !important;
            }
            
            .lukhang-vaccination-tab-content-wrapper {
              padding: 1.5rem !important;
            }
            
            .lukhang-vaccination-content-title {
              font-size: 1.3rem !important;
            }
          }
          
          @media (max-width: 768px) {
            .lukhang-vaccination-nav-tabs {
              flex-direction: column !important;
              gap: 0.75rem !important;
            }
            
            .lukhang-vaccination-nav-link {
              min-width: 100% !important;
              border-radius: 12px !important;
            }
            
            .lukhang-vaccination-nav-link.active::before {
              display: none !important;
            }
            
            .lukhang-vaccination-tab-content-wrapper {
              padding: 1rem !important;
            }
          }
        `}
      </style>
      <VaccinationProvider>
        <Container fluid className="lukhang-vaccination-main-wrapper">
          <Card className="lukhang-vaccination-header-card">
            <Card.Body className="text-center py-4">
              <h1 className="lukhang-vaccination-title-custom">
                <i className="fas fa-syringe me-3"></i>
                Quản lý Tiêm chủng
              </h1>
            </Card.Body>
          </Card>
          
          <Card className="lukhang-vaccination-tabs-container">
            <Card.Header className="lukhang-vaccination-tabs-header">
              <Nav variant="tabs" className="lukhang-vaccination-nav-tabs d-flex justify-content-center">
                <Nav.Item className="lukhang-vaccination-nav-item">
                  <Nav.Link
                    className={`lukhang-vaccination-nav-link ${activeTab === 'create-record' ? 'active' : ''}`}
                    onClick={() => handleTabSelect('create-record')}
                  >
                    <i className="fas fa-list-alt"></i>
                    Danh sách tiêm chủng
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item className="lukhang-vaccination-nav-item">
                  <Nav.Link
                    className={`lukhang-vaccination-nav-link ${activeTab === 'monitoring' ? 'active' : ''}`}
                    onClick={() => handleTabSelect('monitoring')}
                  >
                    <i className="fas fa-user-md"></i>
                    Theo dõi sau tiêm
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>

            <div className="lukhang-vaccination-tab-content-wrapper">
              <div className="lukhang-vaccination-routes-container">
                <Routes>
                  <Route index element={<Navigate to="create-record" replace />} />
                  <Route path="create-record" element={
                    <Card className="lukhang-vaccination-content-card">
                      <Card.Header className="lukhang-vaccination-content-header">
                        <h4 className="lukhang-vaccination-content-title">
                          <i className="fas fa-list-alt text-primary"></i>
                          Quản lý danh sách tiêm chủng
                        </h4>
                      </Card.Header>
                      <Card.Body className="lukhang-vaccination-content-body">
                        <CreateVaccinationRecord />
                      </Card.Body>
                    </Card>
                  } />
                  <Route path="monitoring" element={
                    <Card className="lukhang-vaccination-content-card">
                      <Card.Header className="lukhang-vaccination-content-header">
                        <h4 className="lukhang-vaccination-content-title">
                          <i className="fas fa-user-md text-primary"></i>
                          Theo dõi chăm sóc sau tiêm chủng
                        </h4>
                      </Card.Header>
                      <Card.Body className="lukhang-vaccination-content-body">
                        <PostVaccinationMonitoring />
                      </Card.Body>
                    </Card>
                  } />
                </Routes>
              </div>
            </div>
          </Card>
        </Container>
      </VaccinationProvider>
    </>
  );
  */
};

export default VaccinationMain;
