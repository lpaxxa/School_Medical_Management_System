const API_BASE_URL = 'http://localhost:8080/api/v1';

export const reportService = {
  // Fetch vaccination report from API
  getVaccinationReport: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/nurse/getNotificationsByType/VACCINATION`);
      const data = await response.json();
      
      return processVaccinationData(data);
    } catch (error) {
      console.error('Error fetching vaccination data:', error);
      throw new Error('Không thể lấy dữ liệu tiêm chủng');
    }
  },

  // Fetch health checkup report from API
  getCheckupReport: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/nurse/getNotificationsByType/HEALTH_CHECKUP`);
      const data = await response.json();
      
      return processCheckupData(data);
    } catch (error) {
      console.error('Error fetching checkup data:', error);
      throw new Error('Không thể lấy dữ liệu khám sức khỏe');
    }
  },

  // Fetch raw vaccination data for detail view
  getVaccinationDetailData: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/nurse/getNotificationsByType/VACCINATION`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching vaccination detail data:', error);
      throw new Error('Không thể lấy chi tiết dữ liệu tiêm chủng');
    }
  },

  // Fetch raw checkup data for detail view
  getCheckupDetailData: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/nurse/getNotificationsByType/HEALTH_CHECKUP`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching checkup detail data:', error);
      throw new Error('Không thể lấy chi tiết dữ liệu khám sức khỏe');
    }
  },

  // Mock reports for other types
  getHealthReport: () => getMockHealthReport(),
  getMedicationReport: () => getMockMedicationReport()
};

// Helper functions to process API data
const processVaccinationData = (data) => {
  const totalNotifications = data.length;
  let totalRecipients = 0;
  let acceptedCount = 0;
  let pendingCount = 0;
  let rejectedCount = 0;
  
  data.forEach(notification => {
    totalRecipients += notification.recipients.length;
    notification.recipients.forEach(recipient => {
      switch(recipient.response) {
        case 'ACCEPTED':
          acceptedCount++;
          break;
        case 'PENDING':
          pendingCount++;
          break;
        case 'REJECTED':
          rejectedCount++;
          break;
      }
    });
  });
  
  const completionRate = totalRecipients > 0 ? 
    ((acceptedCount + rejectedCount) / totalRecipients * 100).toFixed(1) : 0;
  
  return {
    title: 'Báo cáo tiêm chủng',
    summary: {
      totalNotifications,
      totalRecipients,
      acceptedCount,
      pendingCount,
      rejectedCount,
      completionRate: `${completionRate}%`
    },
    charts: [
      {
        type: 'pie',
        title: 'Tình trạng phản hồi tiêm chủng',
        data: [
          { label: 'Đã chấp nhận', value: acceptedCount, color: '#4CAF50' },
          { label: 'Chờ phản hồi', value: pendingCount, color: '#FF9800' },
          { label: 'Từ chối', value: rejectedCount, color: '#F44336' }
        ]
      }
    ]
  };
};

const processCheckupData = (data) => {
  const totalNotifications = data.length;
  let totalRecipients = 0;
  let acceptedCount = 0;
  let pendingCount = 0;
  let rejectedCount = 0;
  
  data.forEach(notification => {
    totalRecipients += notification.recipients.length;
    notification.recipients.forEach(recipient => {
      switch(recipient.response) {
        case 'ACCEPTED':
          acceptedCount++;
          break;
        case 'PENDING':
          pendingCount++;
          break;
        case 'REJECTED':
          rejectedCount++;
          break;
      }
    });
  });
  
  const participationRate = totalRecipients > 0 ? 
    (acceptedCount / totalRecipients * 100).toFixed(1) : 0;
  
  return {
    title: 'Báo cáo khám sức khỏe định kỳ',
    summary: {
      totalNotifications,
      totalRecipients,
      acceptedCount,
      pendingCount,
      rejectedCount,
      participationRate: `${participationRate}%`
    },
    charts: [
      {
        type: 'pie',
        title: 'Tình trạng tham gia khám sức khỏe',
        data: [
          { label: 'Đã tham gia', value: acceptedCount, color: '#2196F3' },
          { label: 'Chờ xác nhận', value: pendingCount, color: '#FF9800' },
          { label: 'Không tham gia', value: rejectedCount, color: '#F44336' }
        ]
      }
    ]
  };
};

const getMockHealthReport = () => ({
  title: 'Báo cáo sức khỏe học sinh',
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
        { label: 'Rất tốt', value: 560, color: '#4CAF50' },
        { label: 'Tốt', value: 450, color: '#8BC34A' },
        { label: 'Trung bình', value: 190, color: '#FF9800' },
        { label: 'Cần theo dõi', value: 34, color: '#F44336' }
      ]
    }
  ]
});

const getMockMedicationReport = () => ({
  title: 'Báo cáo thuốc',
  summary: {
    totalMedications: 156,
    mostUsed: 'Paracetamol',
    inventoryValue: '45,600,000 VNĐ'
  }
});

// Helper to get period label
export const getPeriodLabel = (dateRange, startDate, endDate) => {
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