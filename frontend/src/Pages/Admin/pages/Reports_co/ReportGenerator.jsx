import React, { useState } from "react";
import "./ReportGenerator.css";

const ReportGenerator = () => {
  const [reportType, setReportType] = useState('health');
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generatedReport, setGeneratedReport] = useState(null);

  const reportTypes = [
    {
      id: 'health',
      title: 'Báo cáo sức khỏe',
      icon: 'fas fa-heartbeat',
      description: 'Thống kê sức khỏe học sinh'
    },
    {
      id: 'vaccination',
      title: 'Báo cáo tiêm chủng',
      icon: 'fas fa-syringe',
      description: 'Kết quả chiến dịch tiêm chủng'
    },
    {
      id: 'medication',
      title: 'Báo cáo thuốc',
      icon: 'fas fa-pills',
      description: 'Thống kê sử dụng thuốc'
    },
    {
      id: 'users',
      title: 'Báo cáo người dùng',
      icon: 'fas fa-users',
      description: 'Thống kê tài khoản'
    }
  ];

  const generateReport = () => {
    console.log('Generating report:', { reportType, dateRange, startDate, endDate });
    
    // Mock report data based on type
    const mockReports = {
      health: getMockHealthReport(),
      vaccination: getMockVaccinationReport(),
      medication: getMockMedicationReport(),
      users: getMockUsersReport()
    };
    
    setGeneratedReport(mockReports[reportType]);
  };

  const getMockHealthReport = () => {
    return {
      title: 'Báo cáo sức khỏe học sinh',
      period: getPeriodLabel(),
      summary: {
        totalExaminations: 1234,
        abnormalFindings: 43,
        referralsIssued: 12,
        completionRate: '94%'
      },
      charts: [
        {
          type: 'pie',
          title: 'Phân loại sức khỏe',
          data: [
            { label: 'Rất tốt', value: 560 },
            { label: 'Tốt', value: 450 },
            { label: 'Trung bình', value: 190 },
            { label: 'Cần theo dõi', value: 34 }
          ]
        },
        {
          type: 'bar',
          title: 'Chỉ số BMI theo khối lớp',
          data: [
            { label: 'Lớp 10', normal: 342, overweight: 28, underweight: 15 },
            { label: 'Lớp 11', normal: 321, overweight: 32, underweight: 12 },
            { label: 'Lớp 12', normal: 315, overweight: 24, underweight: 18 }
          ]
        }
      ]
    };
  };

  // Helper function to get date range label
  const getPeriodLabel = () => {
    switch(dateRange) {
      case 'week':
        return 'Tuần này (5/6/2025 - 11/6/2025)';
      case 'month':
        return 'Tháng này (1/6/2025 - 30/6/2025)';
      case 'quarter':
        return 'Quý này (1/4/2025 - 30/6/2025)';
      case 'year':
        return 'Năm học 2024-2025';
      case 'custom':
        return `Từ ${startDate || '...'} đến ${endDate || '...'}`;
      default:
        return 'Thời gian không xác định';
    }
  };

  // Mock function stubs for other report types
  const getMockVaccinationReport = () => ({ title: 'Báo cáo tiêm chủng', period: getPeriodLabel() });
  const getMockMedicationReport = () => ({ title: 'Báo cáo thuốc', period: getPeriodLabel() });
  const getMockUsersReport = () => ({ title: 'Báo cáo người dùng', period: getPeriodLabel() });

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1 className="reports-title">
          <i className="fas fa-chart-bar"></i> Báo cáo &amp; Thống kê
        </h1>
        <p className="reports-subtitle">
          Tạo và xem các báo cáo thống kê về sức khỏe học sinh và hoạt động của hệ thống
        </p>
      </div>
      
      <div className="report-generator">
        <h2 className="generator-title">Tạo báo cáo mới</h2>
        
        <div className="report-types">
          {reportTypes.map(type => (
            <div 
              key={type.id}
              className={`report-type-item ${reportType === type.id ? 'selected' : ''}`}
              onClick={() => setReportType(type.id)}
            >
              <div className="report-type-icon">
                <i className={type.icon}></i>
              </div>
              <h3 className="report-type-title">{type.title}</h3>
              <p className="report-type-desc">{type.description}</p>
            </div>
          ))}
        </div>
        
        <div className="date-ranges">
          <div 
            className={`date-range-item ${dateRange === 'week' ? 'selected' : ''}`}
            onClick={() => setDateRange('week')}
          >
            <i className="far fa-calendar-alt"></i> Tuần này
          </div>
          <div 
            className={`date-range-item ${dateRange === 'month' ? 'selected' : ''}`}
            onClick={() => setDateRange('month')}
          >
            <i className="far fa-calendar-alt"></i> Tháng này
          </div>
          <div 
            className={`date-range-item ${dateRange === 'quarter' ? 'selected' : ''}`}
            onClick={() => setDateRange('quarter')}
          >
            <i className="far fa-calendar-alt"></i> Quý này
          </div>
          <div 
            className={`date-range-item ${dateRange === 'year' ? 'selected' : ''}`}
            onClick={() => setDateRange('year')}
          >
            <i className="far fa-calendar-alt"></i> Năm học
          </div>
          <div 
            className={`date-range-item ${dateRange === 'custom' ? 'selected' : ''}`}
            onClick={() => setDateRange('custom')}
          >
            <i className="fas fa-calendar-plus"></i> Tùy chọn
          </div>
        </div>
        
        {dateRange === 'custom' && (
          <div className="custom-date-range">
            <input 
              type="date" 
              className="date-input"
              placeholder="Ngày bắt đầu"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>đến</span>
            <input 
              type="date" 
              className="date-input"
              placeholder="Ngày kết thúc"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        )}
        
        <button className="generate-btn" onClick={generateReport}>
          <i className="fas fa-chart-line"></i> Tạo báo cáo
        </button>
      </div>
      
      {generatedReport && (
        <div className="generated-report">
          <h2>{generatedReport.title}</h2>
          <p className="report-period">{generatedReport.period}</p>
          
          <p>Báo cáo đã được tạo thành công. Chi tiết báo cáo sẽ hiển thị tại đây.</p>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
