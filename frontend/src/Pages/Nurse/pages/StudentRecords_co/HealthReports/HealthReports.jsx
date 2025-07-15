import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Spinner, Alert, Form, Table, Badge, Button, Pagination } from 'react-bootstrap';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import * as studentRecordsService from '../../../../../services/APINurse/studentRecordsService';
import './HealthReports.css';
import { FaUserGraduate, FaWeight, FaTint, FaAllergies, FaDisease, FaSyringe, FaEye, FaDownload } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const HealthReports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState([]);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({ class: '', bloodType: '', bmiCategory: '' });
  const [classList, setClassList] = useState([]);
  
  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const students = await studentRecordsService.getAllStudents();
        console.log('Students data:', students);
        
        // Sử dụng studentId thay vì healthProfileId
        const healthProfilesPromises = students.map(s => 
          studentRecordsService.getStudentHealthProfile(s.studentId)
            .catch(e => {
              console.error(`Could not fetch profile for student ID ${s.studentId}:`, e);
              return null; // Return null on error for a specific profile
            })
        );
        
        const healthProfiles = await Promise.all(healthProfilesPromises);
        console.log('Health profiles data:', healthProfiles);

        const combinedData = students.map((student, index) => ({
          ...student,
          healthProfileData: healthProfiles[index] || {},
        }));

        console.log('Combined data:', combinedData);
        setStudentData(combinedData);
        
        const classes = [...new Set(students.map(s => s.className || s.class).filter(Boolean))];
        setClassList(classes);

      } catch (err) {
        setError('Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    if (studentData.length > 0) {
      // Calculate stats
      let totalBmi = 0;
      let bmiCount = 0;
      let allergyCount = 0;
      let chronicDiseaseCount = 0;
      let vaccinationCount = 0;
      const bmiCategories = { 'Thiếu cân nặng': 0, 'Gầy': 0, 'Bình thường': 0, 'Thừa cân': 0, 'Béo phì': 0 };
      const bloodTypes = { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0, 'Unknown': 0 };

      studentData.forEach(s => {
        const healthProfile = s.healthProfileData?.healthProfile;
        const vaccinations = s.healthProfileData?.vaccinations || [];
        
        if (healthProfile?.bmi) {
          totalBmi += healthProfile.bmi;
          bmiCount++;
          const category = studentRecordsService.calculateBMICategory(healthProfile.bmi).category;
          if (bmiCategories[category] !== undefined) {
            bmiCategories[category]++;
          }
        }
        
        if (healthProfile?.allergies && healthProfile.allergies.toLowerCase() !== 'không có') {
          allergyCount++;
        }
        
        if (healthProfile?.chronicDiseases && healthProfile.chronicDiseases.toLowerCase() !== 'không có') {
          chronicDiseaseCount++;
        }
        
        if (vaccinations.length > 0) {
          vaccinationCount++;
        }
        
        if (healthProfile?.bloodType) {
          const bloodType = healthProfile.bloodType.trim();
          if (bloodTypes[bloodType] !== undefined) {
            bloodTypes[bloodType]++;
          } else {
            bloodTypes['Unknown']++;
          }
        } else {
          bloodTypes['Unknown']++;
        }
      });

      setStats({
        totalStudents: studentData.length,
        averageBmi: bmiCount > 0 ? (totalBmi / bmiCount).toFixed(2) : 0,
        allergyCount,
        chronicDiseaseCount,
        vaccinationCount,
        bmiCategories,
        bloodTypes,
      });
    }
  }, [studentData]);

  const filteredStudents = useMemo(() => {
    return studentData.filter(s => {
      const healthProfile = s.healthProfileData?.healthProfile;
      const bmiCategory = healthProfile?.bmi ? studentRecordsService.calculateBMICategory(healthProfile.bmi).category : '';
      const className = s.className || s.class;
      
      return (
        (filters.class === '' || className === filters.class) &&
        (filters.bloodType === '' || healthProfile?.bloodType === filters.bloodType) &&
        (filters.bmiCategory === '' || bmiCategory === filters.bmiCategory)
      );
    });
  }, [filters, studentData]);

  // Tính toán phân trang
  const totalStudents = filteredStudents.length;
  const totalPages = Math.ceil(totalStudents / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Reset trang khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  if (loading) {
    return <div className="text-center p-5"><Spinner animation="border" /> <p>Đang tổng hợp dữ liệu...</p></div>;
  }
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  const pieChartOptions = { 
    responsive: true, 
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Số lượng: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const bmiChartData = {
    labels: Object.keys(stats.bmiCategories || {}),
    datasets: [{
      data: Object.values(stats.bmiCategories || {}),
      backgroundColor: [
        '#FF6B6B', // Thiếu cân nặng
        '#FFA726', // Gầy
        '#4CAF50', // Bình thường
        '#FF9800', // Thừa cân
        '#F44336'  // Béo phì
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }],
  };

  const bloodTypeChartData = {
    labels: Object.keys(stats.bloodTypes || {}).filter(k => stats.bloodTypes[k] > 0),
    datasets: [{
      data: Object.values(stats.bloodTypes || {}).filter(v => v > 0),
      backgroundColor: [
        '#e74c3c', '#3498db', '#2ecc71', '#f39c12', 
        '#9b59b6', '#1abc9c', '#e67e22', '#34495e'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }],
  };

  const vaccinationChartData = {
    labels: ['Đã tiêm chủng', 'Chưa tiêm chủng'],
    datasets: [{
      data: [stats.vaccinationCount || 0, (stats.totalStudents || 0) - (stats.vaccinationCount || 0)],
      backgroundColor: ['#4CAF50', '#FF5722'],
      borderWidth: 2,
      borderColor: '#fff'
    }],
  };

  const exportToCSV = () => {
    const csvData = filteredStudents.map(s => {
      const healthProfile = s.healthProfileData?.healthProfile;
      const vaccinations = s.healthProfileData?.vaccinations || [];
      
      return {
        'Họ và tên': s.fullName || s.name,
        'Mã học sinh': s.studentId,
        'Lớp': s.className || s.class,
        'Giới tính': s.gender,
        'Ngày sinh': new Date(s.dateOfBirth).toLocaleDateString('vi-VN'),
        'BMI': healthProfile?.bmi || 'N/A',
        'Phân loại BMI': healthProfile?.bmi ? studentRecordsService.calculateBMICategory(healthProfile.bmi).category : 'N/A',
        'Nhóm máu': healthProfile?.bloodType || 'N/A',
        'Chiều cao': healthProfile?.height || 'N/A',
        'Cân nặng': healthProfile?.weight || 'N/A',
        'Dị ứng': healthProfile?.allergies || 'N/A',
        'Bệnh mãn tính': healthProfile?.chronicDiseases || 'N/A',
        'Số vaccine đã tiêm': vaccinations.length
      };
    });
    
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bao_cao_suc_khoe_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="health-reports-container">
      {/* Header */}
      <div className="report-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="report-title" style={{color : 'white'}}>
              <FaUserGraduate className="me-2" />
              Báo cáo Sức khỏe Học sinh
            </h2>
            <p className="report-subtitle text-muted">
              Tổng quan tình hình sức khỏe và tiêm chủng của học sinh
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <Row className="mb-4">
        <Col lg={2} md={4} sm={6}>
          <Card className="kpi-card blue h-100">
            <Card.Body className="d-flex align-items-center">
              <FaUserGraduate size={40} className="kpi-icon" />
              <div className="kpi-content">
                <div className="kpi-value">{stats.totalStudents || 0}</div>
                <div className="kpi-label">Tổng số học sinh</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4} sm={6}>
          <Card className="kpi-card green h-100">
            <Card.Body className="d-flex align-items-center">
              <FaWeight size={40} className="kpi-icon" />
              <div className="kpi-content">
                <div className="kpi-value">{stats.averageBmi || 0}</div>
                <div className="kpi-label">BMI trung bình</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4} sm={6}>
          <Card className="kpi-card red h-100">
            <Card.Body className="d-flex align-items-center">
              <FaTint size={40} className="kpi-icon" />
              <div className="kpi-content">
                <div className="kpi-value">
                  {Object.keys(stats.bloodTypes || {}).reduce((a, b) => 
                    (stats.bloodTypes[a] || 0) > (stats.bloodTypes[b] || 0) ? a : b, 'N/A')}
                </div>
                <div className="kpi-label">Nhóm máu phổ biến</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4} sm={6}>
          <Card className="kpi-card orange h-100">
            <Card.Body className="d-flex align-items-center">
              <FaAllergies size={40} className="kpi-icon" />
              <div className="kpi-content">
                <div className="kpi-value">{stats.allergyCount || 0}</div>
                <div className="kpi-label">HS có dị ứng</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4} sm={6}>
          <Card className="kpi-card purple h-100">
            <Card.Body className="d-flex align-items-center">
              <FaDisease size={40} className="kpi-icon" />
              <div className="kpi-content">
                <div className="kpi-value">{stats.chronicDiseaseCount || 0}</div>
                <div className="kpi-label">HS bệnh mãn tính</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4} sm={6}>
          <Card className="kpi-card teal h-100">
            <Card.Body className="d-flex align-items-center">
              <FaSyringe size={40} className="kpi-icon" />
              <div className="kpi-content">
                <div className="kpi-value">{stats.vaccinationCount || 0}</div>
                <div className="kpi-label">HS đã tiêm chủng</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col lg={4} md={6} className="mb-4">
          <Card className="chart-card h-100">
            <Card.Header className="chart-header">
              <h5 className="mb-0" style={{color : 'white'}}>
                <FaWeight className="me-2" />
                Phân loại chỉ số BMI
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="chart-container">
                <Doughnut data={bmiChartData} options={pieChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} md={6} className="mb-4">
          <Card className="chart-card h-100">
            <Card.Header className="chart-header">
              <h5 className="mb-0" style={{color : 'white'}}>
                <FaTint className="me-2" />
                Phân bố nhóm máu
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="chart-container">
                <Pie data={bloodTypeChartData} options={pieChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} md={6} className="mb-4">
          <Card className="chart-card h-100">
            <Card.Header className="chart-header">
              <h5 className="mb-0" style={{color : 'white'}}>
                <FaSyringe className="me-2" />
                Tình hình tiêm chủng
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="chart-container">
                <Doughnut data={vaccinationChartData} options={pieChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and Table */}
      <Card className="data-table-card">
        <Card.Header className="table-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0"style={{color : 'white', marginRight  : '20px'}}>
              <FaEye className="me-2"/>
              Danh sách chi tiết học sinh   
            </h5>
            <Badge bg="primary" className="student-count-badge">
              {filteredStudents.length} học sinh
            </Badge>
          </div>
        </Card.Header>
        <Card.Body>
          <Form className="filter-form mb-4">
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="filter-label">Lớp học</Form.Label>
                  <Form.Select 
                    value={filters.class} 
                    onChange={e => setFilters({...filters, class: e.target.value})}
                    className="filter-select"
                  >
                    <option value="">Tất cả các lớp</option>
                    {classList.map(c => <option key={c} value={c}>{c}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="filter-label">Nhóm máu</Form.Label>
                  <Form.Select 
                    value={filters.bloodType} 
                    onChange={e => setFilters({...filters, bloodType: e.target.value})}
                    className="filter-select"
                  >
                    <option value="">Tất cả nhóm máu</option>
                    {Object.keys(stats.bloodTypes || {}).map(bt => 
                      <option key={bt} value={bt}>{bt}</option>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="filter-label">Phân loại BMI</Form.Label>
                  <Form.Select 
                    value={filters.bmiCategory} 
                    onChange={e => setFilters({...filters, bmiCategory: e.target.value})}
                    className="filter-select"
                  >
                    <option value="">Tất cả phân loại</option>
                    {Object.keys(stats.bmiCategories || {}).map(cat => 
                      <option key={cat} value={cat}>{cat}</option>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>

          <div className="table-responsive">
            <Table hover className="modern-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Họ và tên</th>
                  <th>Lớp</th>
                  <th>BMI</th>
                  <th>Phân loại BMI</th>
                  <th>Nhóm máu</th>
                  <th>Dị ứng</th>
                  <th>Tiêm chủng</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((s, index) => {
                  const healthProfile = s.healthProfileData?.healthProfile;
                  const vaccinations = s.healthProfileData?.vaccinations || [];
                  const bmiCategory = healthProfile?.bmi ? 
                    studentRecordsService.calculateBMICategory(healthProfile.bmi) : 
                    { category: 'N/A', color: '#999' };
                  
                  return (
                    <tr key={s.id}>
                      <td>{startIndex + index + 1}</td>
                      <td>
                        <div className="student-name">
                          <strong>{s.fullName || s.name}</strong>
                          <small className="text-muted d-block">{s.studentId}</small>
                        </div>
                      </td>
                      <td>
                        <Badge bg="light" text="dark" className="class-badge">
                          {s.className || s.class}
                        </Badge>
                      </td>
                      <td>
                        <span className="bmi-value">
                          {healthProfile?.bmi || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <Badge 
                          style={{ 
                            backgroundColor: bmiCategory.color,
                            color: 'white'
                          }}
                        >
                          {bmiCategory.category}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="info" className="blood-type-badge">
                          {healthProfile?.bloodType || 'N/A'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={
                          healthProfile?.allergies && healthProfile.allergies.toLowerCase() !== 'không có' 
                            ? 'warning' : 'success'
                        }>
                          {healthProfile?.allergies && healthProfile.allergies.toLowerCase() !== 'không có' 
                            ? 'Có' : 'Không'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={vaccinations.length > 0 ? 'success' : 'danger'}>
                          {vaccinations.length > 0 ? `${vaccinations.length} mũi` : 'Chưa tiêm'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
          
          {/* Simple Pagination with "1 / 3" style */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4 px-3">
              {/* Showing entries info */}
              <div className="text-muted">
                <small>
                  Showing {startIndex + 1} to {Math.min(endIndex, totalStudents)} of {totalStudents} students
                </small>
              </div>

              {/* Pagination controls */}
              <div className="d-flex align-items-center gap-2">
                {/* First page button */}
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  title="Trang đầu"
                  style={{ minWidth: '40px' }}
                >
                  <i className="fas fa-angle-double-left"></i>
                </button>

                {/* Previous page button */}
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  title="Trang trước"
                  style={{ minWidth: '40px' }}
                >
                  <i className="fas fa-angle-left"></i>
                </button>

                {/* Current page indicator */}
                <div
                  className="px-3 py-1 text-white rounded"
                  style={{
                    minWidth: '60px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '500',
                    background: 'linear-gradient(135deg, #015C92 0%, #2D82B5 100%)'
                  }}
                >
                  {currentPage} / {totalPages}
                </div>

                {/* Next page button */}
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  title="Trang tiếp"
                  style={{ minWidth: '40px' }}
                >
                  <i className="fas fa-angle-right"></i>
                </button>

                {/* Last page button */}
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  title="Trang cuối"
                  style={{ minWidth: '40px' }}
                >
                  <i className="fas fa-angle-double-right"></i>
                </button>
              </div>
            </div>
          )}
          
        </Card.Body>
      </Card>
    </div>
  );
};

export default HealthReports;
