const API_BASE_URL = '/api/v1';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Chưa đăng nhập. Vui lòng đăng nhập lại.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const reportService = {
  // Fetch vaccination report from API
  getVaccinationReport: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/nurse/getNotificationsByType/VACCINATION`, {
        headers: getAuthHeaders()
      });
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
      const response = await fetch(`${API_BASE_URL}/notifications/nurse/getNotificationsByType/HEALTH_CHECKUP`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      return processCheckupData(data);
    } catch (error) {
      console.error('Error fetching checkup data:', error);
      throw new Error('Không thể lấy dữ liệu khám sức khỏe');
    }
  },

  // Fetch vaccine report from API
  getVaccineReport: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vaccines/getAllVaccine`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      return processVaccineData(data);
    } catch (error) {
      console.error('Error fetching vaccine data:', error);
      throw new Error('Không thể lấy dữ liệu vaccine');
    }
  },

  // Fetch raw vaccination data for detail view
  getVaccinationDetailData: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/nurse/getNotificationsByType/VACCINATION`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();

      // Ensure each notification has senderName field
      const processedData = data.map(notification => ({
        ...notification,
        senderName: notification.senderName || notification.createdBy || 'Y tá trường học'
      }));

      return processedData;
    } catch (error) {
      console.error('Error fetching vaccination detail data:', error);
      throw new Error('Không thể lấy chi tiết dữ liệu tiêm chủng');
    }
  },

  // Fetch raw checkup data for detail view
  getCheckupDetailData: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/nurse/getNotificationsByType/HEALTH_CHECKUP`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();

      // Ensure each notification has senderName field
      const processedData = data.map(notification => ({
        ...notification,
        senderName: notification.senderName || notification.createdBy || 'Y tá trường học'
      }));

      return processedData;
    } catch (error) {
      console.error('Error fetching checkup detail data:', error);
      throw new Error('Không thể lấy chi tiết dữ liệu khám sức khỏe');
    }
  },

  // Fetch vaccine detail data for detail view
  getVaccineDetailData: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vaccines/getAllVaccine`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching vaccine detail data:', error);
      throw new Error('Không thể lấy chi tiết dữ liệu vaccine');
    }
  },

  // Fetch medication detail data for detail view
  getMedicationDetailData: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/medication-items/get-all`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching medication detail data:', error);
      throw new Error('Không thể lấy chi tiết dữ liệu thuốc');
    }
  },

  // Mock reports for other types
  getHealthReport: () => getMockHealthReport(),
  getMedicationReport: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/medication-items/get-all`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const stats = {
          total: data.length,
          lowStock: data.filter(item => item.stockQuantity < 20).length,
          nearExpiry: data.filter(item => {
            const expiryDate = new Date(item.expiryDate);
            const sixMonthsFromNow = new Date();
            sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
            return expiryDate <= sixMonthsFromNow;
          }).length,
          byType: {}
        };
        
        data.forEach(item => {
          const type = item.itemType || 'Khác';
          stats.byType[type] = (stats.byType[type] || 0) + 1;
        });
        
        return {
          title: 'Báo cáo thuốc và vật tư y tế',
          summary: {
            totalMedications: stats.total,
            lowStockItems: stats.lowStock,
            nearExpiryItems: stats.nearExpiry,
            medicationTypes: Object.keys(stats.byType).length
          },
          charts: [
            {
              type: 'pie',
              title: 'Phân loại thuốc theo loại',
              data: Object.entries(stats.byType).map(([type, count], index) => ({
                label: type,
                value: count,
                color: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'][index % 5]
              }))
            }
          ]
        };
      }
      
      return getMockMedicationReport();
    } catch (error) {
      console.error('Error fetching medication report:', error);
      return getMockMedicationReport();
    }
  }
};

// Helper functions to process API data
const processVaccineData = (data) => {
  if (!Array.isArray(data)) {
    return getMockVaccineReport();
  }

  const totalVaccines = data.length;
  const activeVaccines = data.filter(v => v.isActive).length;
  const inactiveVaccines = data.filter(v => !v.isActive).length;
  const multiDoseVaccines = data.filter(v => v.totalDoses > 1).length;
  const singleDoseVaccines = data.filter(v => v.totalDoses === 1).length;

  // Phân loại theo nhóm tuổi
  const ageGroups = {
    'Trẻ sơ sinh (0-1 tuổi)': data.filter(v => v.maxAgeMonths <= 12).length,
    'Trẻ em (1-5 tuổi)': data.filter(v => v.minAgeMonths <= 60 && v.maxAgeMonths > 12).length,
    'Thiếu niên (5+ tuổi)': data.filter(v => v.minAgeMonths > 60).length
  };

  return {
    title: 'Báo cáo vaccine',
    summary: {
      totalVaccines,
      activeVaccines,
      inactiveVaccines,
      multiDoseVaccines,
      singleDoseVaccines,
      ageGroups: Object.keys(ageGroups).length
    },
    charts: [
      {
        type: 'pie',
        title: 'Trạng thái vaccine',
        data: [
          { label: 'Đang sử dụng', value: activeVaccines, color: '#4CAF50' },
          { label: 'Tạm dừng', value: inactiveVaccines, color: '#F44336' }
        ]
      },
      {
        type: 'pie',
        title: 'Phân loại theo số liều',
        data: [
          { label: 'Một liều', value: singleDoseVaccines, color: '#2196F3' },
          { label: 'Nhiều liều', value: multiDoseVaccines, color: '#FF9800' }
        ]
      },
      {
        type: 'bar',
        title: 'Phân bố theo nhóm tuổi',
        data: Object.entries(ageGroups).map(([group, count], index) => ({
          label: group,
          value: count,
          color: ['#9C27B0', '#3F51B5', '#009688'][index % 3]
        }))
      }
    ]
  };
};

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

const getMockVaccineReport = () => ({
  title: 'Báo cáo vaccine',
  summary: {
    totalVaccines: 14,
    activeVaccines: 13,
    inactiveVaccines: 1,
    multiDoseVaccines: 6,
    singleDoseVaccines: 8,
    ageGroups: 3
  },
  charts: [
    {
      type: 'pie',
      title: 'Trạng thái vaccine',
      data: [
        { label: 'Đang sử dụng', value: 13, color: '#4CAF50' },
        { label: 'Tạm dừng', value: 1, color: '#F44336' }
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