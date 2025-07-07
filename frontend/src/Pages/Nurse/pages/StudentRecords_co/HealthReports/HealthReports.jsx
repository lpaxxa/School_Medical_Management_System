import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Spinner, Alert, Form, Table } from 'react-bootstrap';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import * as studentRecordsService from '../../../../../services/APINurse/studentRecordsService';
import './HealthReports.css';
import { FaUserGraduate, FaWeight, FaTint, FaAllergies, FaDisease } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend);

const HealthReports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState([]);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({ class: '', bloodType: '', bmiCategory: '' });
  const [classList, setClassList] = useState([]);
  
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const students = await studentRecordsService.getAllStudents();
        const healthProfilesPromises = students.map(s => 
          studentRecordsService.getStudentHealthProfile(s.healthProfileId)
            .catch(e => {
              console.error(`Could not fetch profile for student ID ${s.id}:`, e);
              return null; // Return null on error for a specific profile
            })
        );
        
        const healthProfiles = await Promise.all(healthProfilesPromises);

        const combinedData = students.map((student, index) => ({
          ...student,
          healthProfile: healthProfiles[index] || {},
        }));

        setStudentData(combinedData);
        
        const classes = [...new Set(students.map(s => s.className).filter(Boolean))];
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
      const bmiCategories = { 'Thiếu cân nặng': 0, 'Gầy': 0, 'Bình thường': 0, 'Thừa cân': 0, 'Béo phì': 0 };
      const bloodTypes = { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0, 'Unknown': 0 };

      studentData.forEach(s => {
        if (s.healthProfile?.bmi) {
          totalBmi += s.healthProfile.bmi;
          bmiCount++;
          const category = studentRecordsService.calculateBMICategory(s.healthProfile.bmi).category;
          if (bmiCategories[category] !== undefined) {
            bmiCategories[category]++;
          }
        }
        if (s.healthProfile?.allergies && s.healthProfile.allergies.toLowerCase() !== 'không có') {
          allergyCount++;
        }
        if (s.healthProfile?.chronicDiseases && s.healthProfile.chronicDiseases.toLowerCase() !== 'không có') {
          chronicDiseaseCount++;
        }
        if (s.healthProfile?.bloodType) {
            const bloodType = s.healthProfile.bloodType.trim();
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
        bmiCategories,
        bloodTypes,
      });
    }
  }, [studentData]);

  const filteredStudents = useMemo(() => {
    return studentData.filter(s => {
      const bmiCategory = s.healthProfile?.bmi ? studentRecordsService.calculateBMICategory(s.healthProfile.bmi).category : '';
      return (
        (filters.class === '' || s.className === filters.class) &&
        (filters.bloodType === '' || s.healthProfile?.bloodType === filters.bloodType) &&
        (filters.bmiCategory === '' || bmiCategory === filters.bmiCategory)
      );
    });
  }, [filters, studentData]);

  if (loading) {
    return <div className="text-center p-5"><Spinner animation="border" /> <p>Đang tổng hợp dữ liệu...</p></div>;
  }
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  const pieChartOptions = { responsive: true, maintainAspectRatio: false };
  const bmiChartData = {
    labels: Object.keys(stats.bmiCategories || {}),
    datasets: [{ data: Object.values(stats.bmiCategories || {}), backgroundColor: ['#ff9800', '#ffeb3b', '#4caf50', '#ff9800', '#f44336'] }],
  };
  const bloodTypeChartData = {
    labels: Object.keys(stats.bloodTypes || {}).filter(k => stats.bloodTypes[k] > 0),
    datasets: [{ data: Object.values(stats.bloodTypes || {}).filter(v => v > 0), backgroundColor: ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6'] }],
  };

  return (
    <div className="health-reports-container">
      {/* KPI Cards */}
      <Row className="mb-4">
        <Col><Card className="kpi-card blue"><FaUserGraduate size={30} /><div><span>Tổng số học sinh</span><strong>{stats.totalStudents}</strong></div></Card></Col>
        <Col><Card className="kpi-card green"><FaWeight size={30} /><div><span>BMI trung bình</span><strong>{stats.averageBmi}</strong></div></Card></Col>
        <Col><Card className="kpi-card red"><FaTint size={30} /><div><span>Nhóm máu phổ biến</span><strong>{Object.keys(stats.bloodTypes || {}).reduce((a, b) => (stats.bloodTypes[a] > stats.bloodTypes[b] ? a : b), 'N/A')}</strong></div></Card></Col>
        <Col><Card className="kpi-card orange"><FaAllergies size={30} /><div><span>HS dị ứng</span><strong>{stats.allergyCount}</strong></div></Card></Col>
        <Col><Card className="kpi-card purple"><FaDisease size={30} /><div><span>HS bệnh mãn tính</span><strong>{stats.chronicDiseaseCount}</strong></div></Card></Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header as="h5">Phân loại chỉ số BMI</Card.Header>
            <Card.Body><div className="chart-container"><Pie data={bmiChartData} options={pieChartOptions} /></div></Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Header as="h5">Phân bố nhóm máu</Card.Header>
            <Card.Body><div className="chart-container"><Pie data={bloodTypeChartData} options={pieChartOptions} /></div></Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and Table */}
      <Card>
        <Card.Header as="h5">Danh sách chi tiết</Card.Header>
        <Card.Body>
          <Form as={Row} className="mb-3">
            <Col md={4}><Form.Select value={filters.class} onChange={e => setFilters({...filters, class: e.target.value})}><option value="">Tất cả các lớp</option>{classList.map(c => <option key={c} value={c}>{c}</option>)}</Form.Select></Col>
            <Col md={4}><Form.Select value={filters.bloodType} onChange={e => setFilters({...filters, bloodType: e.target.value})}><option value="">Tất cả nhóm máu</option>{Object.keys(stats.bloodTypes || {}).map(bt => <option key={bt} value={bt}>{bt}</option>)}</Form.Select></Col>
            <Col md={4}><Form.Select value={filters.bmiCategory} onChange={e => setFilters({...filters, bmiCategory: e.target.value})}><option value="">Tất cả BMI</option>{Object.keys(stats.bmiCategories || {}).map(cat => <option key={cat} value={cat}>{cat}</option>)}</Form.Select></Col>
          </Form>
          <Table striped bordered hover responsive>
            <thead><tr><th>Họ và tên</th><th>Lớp</th><th>BMI</th><th>Phân loại BMI</th><th>Nhóm máu</th><th>Dị ứng</th></tr></thead>
                  <tbody>
              {filteredStudents.map(s => (
                <tr key={s.id}>
                  <td>{s.fullName}</td>
                  <td>{s.className}</td>
                  <td>{s.healthProfile?.bmi || 'N/A'}</td>
                  <td>{s.healthProfile?.bmi ? studentRecordsService.calculateBMICategory(s.healthProfile.bmi).category : 'N/A'}</td>
                  <td>{s.healthProfile?.bloodType || 'N/A'}</td>
                  <td>{s.healthProfile?.allergies || 'N/A'}</td>
                        </tr>
              ))}
                  </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default HealthReports;
