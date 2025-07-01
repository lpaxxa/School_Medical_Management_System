import axios from 'axios';

// Cấu hình sử dụng dữ liệu giả hay API thật
const config = {
  useMockData: false,  // Đây là cài đặt, nhưng có thể bị ghi đè
  apiUrl: 'http://localhost:8080/api/v1/medical-checkups'
};

// Hàm trễ để mô phỏng API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Hàm lấy tất cả bản ghi khám sức khỏe
export const getAllHealthCheckups = async () => {
  try {
    if (config.useMockData) {
      // Trả về dữ liệu mẫu nếu đang sử dụng mock data
      await delay(500); // Giả lập độ trễ mạng
      return mockHealthCheckups;
    }

    // Sử dụng fetch API thay vì axios để đảm bảo tính nhất quán
    const response = await fetch(config.apiUrl);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("API data:", data); // Debug: kiểm tra dữ liệu trả về
    return data;
  } catch (error) {
    console.error('Error fetching health checkups:', error);
    // Fallback về dữ liệu mẫu khi API gặp lỗi
    return mockHealthCheckups;
  }
};

// Hàm lấy chi tiết một bản ghi khám sức khỏe theo ID
export const getHealthCheckupById = async (id) => {
  try {
    if (config.useMockData) {
      // Tìm trong dữ liệu mẫu
      await delay(300);
      const checkup = mockHealthCheckups.find(c => c.id === id);
      return checkup || null;
    }

    const response = await fetch(`${config.apiUrl}/${id}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching health checkup with ID ${id}:`, error);
    // Fallback về dữ liệu mẫu khi API gặp lỗi
    const checkup = mockHealthCheckups.find(c => c.id === id);
    return checkup || null;
  }
};

// Thêm bản ghi khám sức khỏe mới
export const addHealthCheckup = async (checkupData) => {
  try {
    if (config.useMockData) {
      // Code xử lý mock data không thay đổi
      await delay(800);
      const newId = Math.max(...mockHealthCheckups.map(c => c.id), 0) + 1;
      const newCheckup = { id: newId, ...checkupData };
      mockHealthCheckups.push(newCheckup);
      return newCheckup;
    } else {
      // Loại bỏ trường id nếu có trong dữ liệu gửi đi
      const { id, ...dataToSend } = checkupData;
      
      // BẮT BUỘC phải chuyển đổi định dạng ngày tháng theo yêu cầu API
      const formattedData = {
        ...dataToSend,
        // Chuyển đổi thành định dạng yyyy-MM-dd theo yêu cầu API
        checkupDate: dataToSend.checkupDate.split('T')[0],
        // Chuyển đổi studentId sang number
        studentId: parseInt(dataToSend.studentId)
      };
      
      console.log('Formatted data to send:', formattedData);
      
      // Sử dụng axios để gọi API
      const response = await axios({
        method: 'POST',
        url: config.apiUrl,
        headers: {
          'Content-Type': 'application/json'
        },
        data: formattedData
      });
      
      console.log('API response:', response.data);
      return response.data;
    }
  } catch (error) {
    console.error('Error creating health checkup:', error);
    
    // Hiển thị chi tiết lỗi từ API để debug
    if (error.response) {
      console.error('Response error data:', error.response.data);
      console.error('Response error status:', error.response.status);
      console.error('Response error headers:', error.response.headers);
      throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error('Request was made but no response received:', error.request);
      throw new Error('Không nhận được phản hồi từ máy chủ');
    } else {
      console.error('Error setting up request:', error.message);
      throw error;
    }
  }
};

// Cập nhật bản ghi khám sức khỏe
export const updateHealthCheckup = async (id, checkupData) => {
  try {
    if (config.useMockData) {
      // Cập nhật trong dữ liệu mẫu
      const index = mockHealthCheckups.findIndex(c => c.id === id);
      if (index !== -1) {
        mockHealthCheckups[index] = {
          ...mockHealthCheckups[index],
          ...checkupData
        };
        return mockHealthCheckups[index];
      }
      throw new Error(`Health checkup with ID ${id} not found`);
    }

    // Sử dụng fetch thay vì axios
    const response = await fetch(`${config.apiUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(checkupData)
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating health checkup with ID ${id}:`, error);
    throw error;
  }
};

// Xóa bản ghi khám sức khỏe
export const deleteHealthCheckup = async (id) => {
  try {
    if (config.useMockData) {
      // Xóa từ dữ liệu mẫu
      const index = mockHealthCheckups.findIndex(c => c.id === id);
      if (index !== -1) {
        mockHealthCheckups.splice(index, 1);
        return true;
      }
      throw new Error(`Health checkup with ID ${id} not found`);
    }

    // Sử dụng fetch thay vì axios
    const response = await fetch(`${config.apiUrl}/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting health checkup with ID ${id}:`, error);
    throw error;
  }
};

// Lấy tất cả các chiến dịch khám sức khỏe
export const getAllCheckupCampaigns = async () => {
  try {
    if (config.useMockData) {
      // Giả lập độ trễ mạng
      await delay(600);
      return mockCampaigns;
    } else {
      // Trong thực tế, API của bạn có thể có endpoint riêng cho campaigns
      // Nhưng hiện tại, ta tạm coi đây là cùng API medical-checkups
      const response = await fetch(config.apiUrl);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      
      const checkups = await response.json();
      
      // Chuyển đổi dữ liệu từ checkups thành định dạng campaigns
      // Đây chỉ là ví dụ, bạn cần điều chỉnh theo cấu trúc thực của API
      const campaigns = [
        {
          id: 1,
          name: 'Khám sức khỏe định kỳ năm 2024',
          startDate: '2024-03-15',
          endDate: '2024-04-15',
          description: 'Khám sức khỏe định kỳ cho học sinh toàn trường',
          status: 'Đã hoàn thành',
          totalStudents: 5,
          examinedStudents: 5,
          flaggedStudents: 3
        }
      ];
      
      return campaigns;
    }
  } catch (error) {
    console.error('Error fetching checkup campaigns:', error);
    // Fallback về dữ liệu mẫu khi API gặp lỗi
    return mockCampaigns;
  }
};

// Lấy danh sách học sinh cần theo dõi sức khỏe
export const getStudentsRequiringFollowup = async () => {
  try {
    if (config.useMockData) {
      // Giả lập độ trễ mạng
      await delay(500);
      
      // Lọc ra những học sinh cần theo dõi từ kết quả khám
      const followupResults = mockHealthCheckups.filter(checkup => checkup.followUpNeeded === true);
      
      // Tạo danh sách học sinh không trùng lặp
      const studentsWithFollowup = [];
      const studentIdsAdded = new Set();
      
      // Thêm thông tin học sinh (từ mockStudents) vào kết quả
      for (const result of followupResults) {
        if (!studentIdsAdded.has(result.studentId)) {
          studentIdsAdded.add(result.studentId);
          
          // Tìm học sinh tương ứng từ danh sách học sinh mẫu
          const student = mockStudents.find(s => s.id === result.studentId);
          
          if (student) {
            studentsWithFollowup.push({
              ...student,
              checkupId: result.id,
              checkupDate: result.checkupDate,
              diagnosis: result.diagnosis,
              recommendations: result.recommendations
            });
          }
        }
      }
      
      return studentsWithFollowup;
    } else {
      // Trong thực tế, backend có thể có API riêng để lấy danh sách học sinh cần theo dõi
      // Hiện tại, chúng ta sẽ lọc từ dữ liệu checkups
      const response = await fetch(config.apiUrl);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      
      const checkups = await response.json();
      const followupStudents = checkups
        .filter(c => c.followUpNeeded === true)
        .map(c => ({
          id: c.studentId,
          fullName: c.studentName,
          checkupId: c.id,
          checkupDate: c.checkupDate,
          diagnosis: c.diagnosis,
          recommendations: c.recommendations,
          class: "N/A" // Dữ liệu API của bạn không có field này
        }));
      
      return followupStudents;
    }
  } catch (error) {
    console.error('Error fetching students requiring followup:', error);
    return []; // Trả về mảng rỗng nếu có lỗi
  }
};

// Lấy tiêu chuẩn sức khỏe theo độ tuổi
export const getHealthStandards = async () => {
  try {
    // Luôn sử dụng dữ liệu mẫu cho health standards
    await delay(400); // Giả lập độ trễ mạng để trải nghiệm UI tốt hơn
    return mockHealthStandards;
  } catch (error) {
    console.error('Error fetching health standards:', error);
    return mockHealthStandards; // Fallback về dữ liệu mẫu
  }
};

// Lấy tất cả các chiến dịch khám sức khỏe
export const getHealthCampaigns = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/v1/health-campaigns');
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Health campaigns data:", data);
    return data;
  } catch (error) {
    console.error('Error fetching health campaigns:', error);
    // Fallback về dữ liệu mẫu khi API gặp lỗi
    return mockHealthCampaigns;
  }
};

// Lấy danh sách phụ huynh
export const getParents = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/v1/parents');
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Parents data:", data);
    return data;
  } catch (error) {
    console.error('Error fetching parents:', error);
    // Fallback về dữ liệu mẫu khi API gặp lỗi
    return mockParents;
  }
};

// Gửi thông báo khám sức khỏe (đã có sẵn sendHealthCheckupNotification, thêm alias)
export const sendNotification = async (notificationData) => {
  return await sendHealthCheckupNotification(notificationData);
};

// Gửi thông báo khám sức khỏe
export const sendHealthCheckupNotification = async (notificationData) => {
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem('authToken');
    
    // Ensure senderId is a number and not null
    const senderId = notificationData.senderId ? parseInt(notificationData.senderId) : 1;
    
    // Prepare payload with guaranteed non-null senderId
    const payload = {
      ...notificationData,
      type: 'HEALTH_CHECKUP',
      senderId: senderId,
      receiverIds: notificationData.receiverIds.map(id => parseInt(id))
    };
    
    console.log('Sending notification with payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch('http://localhost:8080/api/v1/notifications/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(payload)
    });
    
    // Log the response status and text for debugging
    const responseText = await response.text();
    console.log(`Response status: ${response.status}`);
    console.log(`Response text: ${responseText}`);
    
    if (!response.ok) {
      // Try to parse the error message if possible
      let errorMessage;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
      } catch (e) {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    // Try to parse the response as JSON if it's not empty
    if (responseText) {
      try {
        return JSON.parse(responseText);
      } catch (e) {
        console.warn('Response is not valid JSON:', responseText);
        return { success: true, message: 'Notification sent successfully' };
      }
    } else {
      return { success: true, message: 'Notification sent successfully' };
    }
  } catch (error) {
    console.error('Error sending health checkup notification:', error);
    throw error;
  }
};

// Fetch health checkup notifications
export const getHealthCheckupNotifications = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/v1/notifications/nurse/getNotificationsByType/HEALTH_CHECKUP');
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Health checkup notifications:", data);
    return data;
  } catch (error) {
    console.error('Error fetching health checkup notifications:', error);
    throw error;
  }
};

// Create a health checkup notification
export const createHealthCheckupNotification = async (notificationData) => {
  try {
    const response = await fetch('http://localhost:8080/api/v1/notifications/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...notificationData,
        type: 'HEALTH_CHECKUP'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating health checkup notification:', error);
    throw error;
  }
};

// Dữ liệu mẫu để sử dụng khi API không hoạt động
const mockHealthCheckups = [
  {
    id: 5,
    studentId: 3,
    studentName: "Haha Smith",
    checkupDate: "2025-06-21T17:04:03.714",
    checkupType: "Định kỳ",
    height: 160,
    weight: 50,
    bmi: 19.5,
    bloodPressure: "120/80",
    visionLeft: "20/20",
    visionRight: "20/20",
    hearingStatus: "Bình thường",
    heartRate: 75,
    bodyTemperature: 36.5,
    diagnosis: "Khỏe mạnh",
    recommendations: "Tiếp tục duy trì chế độ ăn uống và tập luyện",
    followUpNeeded: false,
    parentNotified: true,
    medicalStaffId: 1,
    medicalStaffName: "Nguyễn Thị Y Tá"
  },
  {
    id: 6,
    studentId: 4,
    studentName: "Hihi Smith",
    checkupDate: "2025-06-21T17:04:03.714",
    checkupType: "Khám thường",
    height: 145,
    weight: 40,
    bmi: 18.9,
    bloodPressure: "110/70",
    visionLeft: "20/30",
    visionRight: "20/25",
    hearingStatus: "Bình thường",
    heartRate: 80,
    bodyTemperature: 36.8,
    diagnosis: "Cần điều chỉnh thị lực",
    recommendations: "Đề nghị khám mắt chuyên sâu",
    followUpNeeded: true,
    parentNotified: true,
    medicalStaffId: 1,
    medicalStaffName: "Nguyễn Thị Y Tá"
  }
];

// Dữ liệu mẫu về các đợt khám sức khỏe
const mockCampaigns = [
  {
    id: 1,
    name: 'Khám sức khỏe đầu năm 2025-2026',
    startDate: '2025-05-15',
    endDate: '2025-06-30',
    description: 'Khám sức khỏe định kỳ đầu năm học cho học sinh toàn trường',
    status: 'Đang diễn ra',
    totalStudents: 800,
    examinedStudents: 650,
    flaggedStudents: 45
  },
  {
    id: 2,
    name: 'Khám sức khỏe cho học sinh Khối 10',
    startDate: '2025-07-10',
    endDate: '2025-07-20',
    description: 'Khám sức khỏe chuyên sâu dành cho học sinh Khối 10',
    status: 'Sắp diễn ra',
    totalStudents: 320,
    examinedStudents: 0,
    flaggedStudents: 0
  },
  {
    id: 3,
    name: 'Khám sức khỏe răng miệng',
    startDate: '2025-04-01',
    endDate: '2025-04-15',
    description: 'Chương trình khám và chăm sóc răng miệng cho học sinh',
    status: 'Đã hoàn thành',
    totalStudents: 800,
    examinedStudents: 780,
    flaggedStudents: 120
  },
  {
    id: 4,
    name: 'Khám sức khỏe mắt',
    startDate: '2025-03-01',
    endDate: '2025-03-10',
    description: 'Chương trình kiểm tra thị lực và sức khỏe mắt',
    status: 'Đã hoàn thành',
    totalStudents: 800,
    examinedStudents: 790,
    flaggedStudents: 95
  }
];

// Dữ liệu mẫu về chiến dịch khám sức khỏe
const mockHealthCampaigns = [
  {
    id: 1,
    title: "Chiến dịch khám sức khỏe định kỳ 2025",
    startDate: "2025-07-10",
    notes: "Khám sức khỏe định kỳ cho toàn trường",
    status: "PREPARING"
  },
  {
    id: 2,
    title: "Khám sức khỏe đầu năm học",
    startDate: "2025-08-15",
    notes: "Khám sức khỏe định kỳ cho học sinh mới nhập học",
    status: "PREPARING"
  }
];

// Dữ liệu mẫu về phụ huynh
const mockParents = [
  {
    id: 1,
    fullName: "Nguyễn Văn Hùng",
    phoneNumber: "0945678901",
    email: "nguyen.phuhuynh@gmail.com",
    address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
    occupation: null,
    relationshipType: "Bố",
    accountId: "PARENT001"
  },
  {
    id: 2,
    fullName: "Trần Thị Mai",
    phoneNumber: "0956789012",
    email: "tran.phuhuynh@gmail.com",
    address: "456 Đường Nguyễn Huệ, Quận 3, TP.HCM",
    occupation: null,
    relationshipType: "Mẹ",
    accountId: "PARENT002"
  }
];

// Import dữ liệu từ studentService để tránh trùng lặp
import { mockStudents } from './studentService';

// Định nghĩa dữ liệu mẫu về tiêu chuẩn sức khỏe theo độ tuổi
const mockHealthStandards = {
  heightWeight: [
    { ageGroup: '6-7', gender: 'Nam', minHeight: 110, maxHeight: 125, minWeight: 18, maxWeight: 25 },
    { ageGroup: '6-7', gender: 'Nữ', minHeight: 108, maxHeight: 122, minWeight: 17, maxWeight: 24 },
    { ageGroup: '8-9', gender: 'Nam', minHeight: 124, maxHeight: 135, minWeight: 23, maxWeight: 32 },
    { ageGroup: '8-9', gender: 'Nữ', minHeight: 122, maxHeight: 134, minWeight: 22, maxWeight: 31 },
    { ageGroup: '10-11', gender: 'Nam', minHeight: 134, maxHeight: 145, minWeight: 28, maxWeight: 40 },
    { ageGroup: '10-11', gender: 'Nữ', minHeight: 132, maxHeight: 147, minWeight: 27, maxWeight: 42 },
    { ageGroup: '12-13', gender: 'Nam', minHeight: 144, maxHeight: 160, minWeight: 35, maxWeight: 50 },
    { ageGroup: '12-13', gender: 'Nữ', minHeight: 145, maxHeight: 158, minWeight: 35, maxWeight: 52 },
    { ageGroup: '14-15', gender: 'Nam', minHeight: 155, maxHeight: 175, minWeight: 43, maxWeight: 65 },
    { ageGroup: '14-15', gender: 'Nữ', minHeight: 150, maxHeight: 165, minWeight: 43, maxWeight: 58 },
    { ageGroup: '16-17', gender: 'Nam', minHeight: 165, maxHeight: 185, minWeight: 55, maxWeight: 75 },
    { ageGroup: '16-17', gender: 'Nữ', minHeight: 154, maxHeight: 170, minWeight: 47, maxWeight: 63 }
  ],
  bmi: [
    { category: 'Thiếu cân', range: '< 18.5', risk: 'Tăng nguy cơ một số vấn đề sức khỏe' },
    { category: 'Bình thường', range: '18.5 - 22.9', risk: 'Nguy cơ thấp' },
    { category: 'Thừa cân', range: '23 - 24.9', risk: 'Nguy cơ tăng nhẹ' },
    { category: 'Béo phì độ I', range: '25 - 29.9', risk: 'Nguy cơ cao' },
    { category: 'Béo phì độ II', range: '≥ 30', risk: 'Nguy cơ rất cao' }
  ],
  bloodPressure: [
    { ageGroup: '6-9', category: 'Bình thường', systolic: '< 110', diastolic: '< 70' },
    { ageGroup: '6-9', category: 'Tiền tăng huyết áp', systolic: '110-120', diastolic: '70-80' },
    { ageGroup: '6-9', category: 'Tăng huyết áp', systolic: '> 120', diastolic: '> 80' },
    { ageGroup: '10-12', category: 'Bình thường', systolic: '< 115', diastolic: '< 75' },
    { ageGroup: '10-12', category: 'Tiền tăng huyết áp', systolic: '115-125', diastolic: '75-85' },
    { ageGroup: '10-12', category: 'Tăng huyết áp', systolic: '> 125', diastolic: '> 85' },
    { ageGroup: '13-15', category: 'Bình thường', systolic: '< 120', diastolic: '< 80' },
    { ageGroup: '13-15', category: 'Tiền tăng huyết áp', systolic: '120-130', diastolic: '80-85' },
    { ageGroup: '13-15', category: 'Tăng huyết áp', systolic: '> 130', diastolic: '> 85' },
    { ageGroup: '16-18', category: 'Bình thường', systolic: '< 130', diastolic: '< 85' },
    { ageGroup: '16-18', category: 'Tiền tăng huyết áp', systolic: '130-140', diastolic: '85-90' },
    { ageGroup: '16-18', category: 'Tăng huyết áp', systolic: '> 140', diastolic: '> 90' }
  ],
  vision: [
    { category: 'Bình thường', range: '20/20 - 20/30' },
    { category: 'Cận thị nhẹ', range: '20/40 - 20/60' },
    { category: 'Cận thị trung bình', range: '20/70 - 20/160' },
    { category: 'Cận thị nặng', range: '20/200 hoặc kém hơn' }
  ],
  heartRate: [
    { ageGroup: '6-8', minRate: 70, maxRate: 110 },
    { ageGroup: '9-11', minRate: 65, maxRate: 105 },
    { ageGroup: '12-15', minRate: 60, maxRate: 100 },
    { ageGroup: '16-18', minRate: 55, maxRate: 95 }
  ],
  
  // Thêm một số tiêu chuẩn mới
  bodyTemperature: [
    { category: 'Hạ thân nhiệt', range: '< 35.0°C', risk: 'Nguy hiểm, cần chăm sóc y tế ngay lập tức' },
    { category: 'Bình thường thấp', range: '35.0 - 36.5°C', risk: 'Theo dõi' },
    { category: 'Bình thường', range: '36.5 - 37.5°C', risk: 'Không có rủi ro' },
    { category: 'Sốt nhẹ', range: '37.5 - 38.0°C', risk: 'Theo dõi' },
    { category: 'Sốt', range: '38.0 - 39.0°C', risk: 'Cần điều trị hạ sốt' },
    { category: 'Sốt cao', range: '39.0 - 40.0°C', risk: 'Cần điều trị và theo dõi' },
    { category: 'Sốt rất cao', range: '> 40.0°C', risk: 'Nguy hiểm, cần chăm sóc y tế ngay lập tức' }
  ],
  
  nutrition: [
    { category: 'Thiếu dinh dưỡng', signs: 'BMI thấp, thiếu năng lượng, chậm phát triển', recommendations: 'Cải thiện chế độ ăn, bổ sung dinh dưỡng' },
    { category: 'Dinh dưỡng tốt', signs: 'BMI bình thường, năng lượng tốt, phát triển phù hợp', recommendations: 'Duy trì chế độ ăn cân bằng' },
    { category: 'Thừa cân', signs: 'BMI cao, dễ mệt mỏi', recommendations: 'Điều chỉnh chế độ ăn, tăng hoạt động thể chất' }
  ],
  
  physicalActivity: [
    { ageGroup: '6-10', minActivity: '60 phút/ngày', type: 'Hoạt động vui chơi, thể thao nhẹ nhàng' },
    { ageGroup: '11-14', minActivity: '60 phút/ngày', type: 'Kết hợp các hoạt động aerobic và tăng cường sức mạnh' },
    { ageGroup: '15-18', minActivity: '60 phút/ngày', type: 'Kết hợp các hoạt động aerobic cường độ vừa đến mạnh và tăng cường sức mạnh' }
  ],
  
  oralHealth: [
    { category: 'Tốt', description: 'Không có sâu răng, nướu khỏe mạnh', recommendations: 'Kiểm tra nha khoa 6 tháng/lần' },
    { category: 'Trung bình', description: 'Có dấu hiệu sâu răng nhẹ hoặc viêm nướu nhẹ', recommendations: 'Kiểm tra nha khoa 3-6 tháng/lần' },
    { category: 'Kém', description: 'Sâu răng, viêm nướu, có thể đau nhức', recommendations: 'Cần điều trị nha khoa ngay' }
  ],
  
  sleepRequirements: [
    { ageGroup: '6-12', hoursNeeded: '9-12 giờ/ngày' },
    { ageGroup: '13-18', hoursNeeded: '8-10 giờ/ngày' }
  ],
  
  immunizationSchedule: [
    { age: '4-6 tuổi', vaccines: ['Bạch hầu, Uốn ván, Ho gà (DTP)', 'Bại liệt', 'Sởi, Quai bị, Rubella (MMR)'] },
    { age: '11-12 tuổi', vaccines: ['Viêm gan B', 'HPV (2 liều, cách nhau 6 tháng)'] },
    { age: '16 tuổi', vaccines: ['Viêm màng não cầu khuẩn'] },
    { age: 'Hàng năm', vaccines: ['Cúm mùa'] }
  ]
};

// Lấy thông tin chi tiết học sinh theo ID
export const getStudentById = async (id) => {
  try {
    const response = await fetch(`http://localhost:8080/api/v1/students/student-id/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching student details:', error);
    throw error;
  }
};

// Unified export to make imports consistent
const healthCheckupService = {
  getAllHealthCheckups,
  getHealthCheckupById,
  addHealthCheckup,
  updateHealthCheckup,
  deleteHealthCheckup,
  getAllCheckupCampaigns,
  getStudentsRequiringFollowup,
  getHealthStandards,
  getHealthCheckupNotifications,
  createHealthCheckupNotification,
  getHealthCampaigns,
  getParents,
  sendNotification,
  sendHealthCheckupNotification,
  getStudentById
};

export default healthCheckupService;
