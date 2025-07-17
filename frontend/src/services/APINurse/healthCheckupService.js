import axios from 'axios';

// Cấu hình sử dụng dữ liệu giả hay API thật
const config = {
  useMockData: false,  // Đây là cài đặt, nhưng có thể bị ghi đè
  apiUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/medical-checkups`
};

// API base URL
const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1`;
// Hàm trễ để mô phỏng API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get all medical checkups
export const getAllMedicalCheckups = async () => {
  try {
    // Lấy token xác thực từ localStorage
    const token = localStorage.getItem('authToken');
    
    // Gọi API với token trong header
    const response = await axios.get(`${API_BASE_URL}/medical-checkups`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching medical checkups:', error);
    
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

// Get medical checkup by ID
export const getMedicalCheckupById = async (id) => {
  try {
    // Lấy token xác thực từ localStorage
    const token = localStorage.getItem('authToken');
    
    // Gọi API với token trong header
    const response = await axios.get(`${API_BASE_URL}/medical-checkups/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching medical checkup with ID ${id}:`, error);
    
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

// Update medical checkup
export const updateMedicalCheckup = async (id, checkupData) => {
  try {
    // Lấy token xác thực từ localStorage
    const token = localStorage.getItem('authToken');
    
    // Gọi API với token trong header
    const response = await axios.put(`${API_BASE_URL}/medical-checkups/${id}`, checkupData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error updating medical checkup with ID ${id}:`, error);
    
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

// Send notification to parent
export const sendParentNotification = async (studentId, message) => {
  try {
    // Lấy token xác thực từ localStorage
    const token = localStorage.getItem('authToken');
    
    // Chuẩn bị dữ liệu thông báo
    const notificationData = {
      type: 'HEALTH_CHECKUP',
      receiverIds: [studentId],
      title: 'Thông báo kết quả khám sức khỏe',
      content: message
    };
    
    // Gọi API với token trong header
    const response = await axios.post(`${API_BASE_URL}/notifications/create`, notificationData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    
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

// Gửi thông báo cho phụ huynh của một học sinh theo checkupId
export const notifyParent = async (checkupId) => {
  try {
    // Lấy token xác thực từ localStorage
    const token = localStorage.getItem('authToken');
    
    // Gọi API với token trong header
    const response = await axios.post(`${API_BASE_URL}/medical-checkups/${checkupId}/notify-parent`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error notifying parent for checkup ID ${checkupId}:`, error);
    
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

// Gửi thông báo cho tất cả phụ huynh (API sẽ được cung cấp sau)
export const notifyAllParents = async (message) => {
  try {
    // Lấy token xác thực từ localStorage
    const token = localStorage.getItem('authToken');
    
    // API này sẽ được cập nhật sau khi có API thật
    const response = await axios.post(`${API_BASE_URL}/medical-checkups/notify-all-parents`, { message }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error notifying all parents:', error);
    
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

// Gửi thông báo cho phụ huynh theo danh sách ID hồ sơ khám
export const batchNotifyParents = async (medicalCheckupIds) => {
  try {
    // Lấy token xác thực từ localStorage
    const token = localStorage.getItem('authToken');
    
    // Gọi API batch notification với danh sách ID hồ sơ khám
    const response = await axios.post(`${API_BASE_URL}/medical-checkups/batch-notify-parents`, medicalCheckupIds, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error batch notifying parents:', error);
    
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

// Hàm lấy tất cả bản ghi khám sức khỏe (API cũ)
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

// Hàm lấy chi tiết một bản ghi khám sức khỏe theo ID (API cũ)
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

// Thêm bản ghi khám sức khỏe mới (API cũ)
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
      const baseData = {
        // Chuyển đổi thành định dạng yyyy-MM-dd theo yêu cầu API
        checkupDate: dataToSend.checkupDate.split('T')[0],
        // Chuyển đổi studentId sang number
        studentId: parseInt(dataToSend.studentId),
        // Chuyển đổi healthCampaignId sang number
        healthCampaignId: parseInt(dataToSend.healthCampaignId),
        // Chuyển đổi parentConsentId sang number
        parentConsentId: parseInt(dataToSend.parentConsentId),
        // Chuyển đổi medicalStaffId sang number (bắt buộc phải là số)
        medicalStaffId: parseInt(dataToSend.medicalStaffId) || 1,
        // Đảm bảo specialCheckupItems là array
        specialCheckupItems: Array.isArray(dataToSend.specialCheckupItems) ? dataToSend.specialCheckupItems : [],
        // Các trường bắt buộc
        checkupType: dataToSend.checkupType || "Khám tổng quát định kỳ",
        checkupStatus: dataToSend.checkupStatus || "COMPLETED",
        // Thêm các trường theo API schema
        diagnosis: dataToSend.diagnosis || "",
        recommendations: dataToSend.notes || "", // notes được map thành recommendations
        followUpNeeded: dataToSend.followUpNeeded || false
      };

      // Thêm các trường số với giá trị mặc định theo API schema
      if (dataToSend.height && !isNaN(parseFloat(dataToSend.height)) && parseFloat(dataToSend.height) > 0) {
        baseData.height = parseFloat(dataToSend.height);
      } else {
        baseData.height = 0.1; // Giá trị mặc định theo schema
      }

      if (dataToSend.weight && !isNaN(parseFloat(dataToSend.weight)) && parseFloat(dataToSend.weight) > 0) {
        baseData.weight = parseFloat(dataToSend.weight);
      } else {
        baseData.weight = 0.1; // Giá trị mặc định theo schema
      }

      if (dataToSend.bmi && !isNaN(parseFloat(dataToSend.bmi)) && parseFloat(dataToSend.bmi) > 0) {
        baseData.bmi = parseFloat(dataToSend.bmi);
      } else {
        baseData.bmi = 0.1; // Giá trị mặc định theo schema
      }

      if (dataToSend.heartRate && !isNaN(parseInt(dataToSend.heartRate)) && parseInt(dataToSend.heartRate) > 0) {
        baseData.heartRate = parseInt(dataToSend.heartRate);
      } else {
        baseData.heartRate = 0; // Giá trị mặc định theo schema
      }

      if (dataToSend.bodyTemperature && !isNaN(parseFloat(dataToSend.bodyTemperature)) && parseFloat(dataToSend.bodyTemperature) > 0) {
        baseData.bodyTemperature = parseFloat(dataToSend.bodyTemperature);
      } else {
        baseData.bodyTemperature = 0.1; // Giá trị mặc định theo schema
      }

      // Thêm các trường text với giá trị mặc định theo API schema
      baseData.bloodPressure = (dataToSend.bloodPressure && dataToSend.bloodPressure.trim()) ? dataToSend.bloodPressure.trim() : "string";
      baseData.visionLeft = (dataToSend.visionLeft && dataToSend.visionLeft.trim()) ? dataToSend.visionLeft.trim() : "string";
      baseData.visionRight = (dataToSend.visionRight && dataToSend.visionRight.trim()) ? dataToSend.visionRight.trim() : "string";
      baseData.hearingStatus = (dataToSend.hearingStatus && dataToSend.hearingStatus.trim()) ? dataToSend.hearingStatus.trim() : "string";
      // diagnosis và recommendations đã được set ở trên với giá trị mặc định

      const formattedData = baseData;

      console.log('Original data received:', dataToSend);
      console.log('Formatted data to send:', formattedData);
      console.log('API URL:', config.apiUrl);

      // Lấy token xác thực từ localStorage
      const token = localStorage.getItem('authToken');

      // Sử dụng axios để gọi API
      const response = await axios({
        method: 'POST',
        url: config.apiUrl,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
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

// Cập nhật bản ghi khám sức khỏe (API cũ)
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

// Xóa bản ghi khám sức khỏe (API cũ)
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

// Lấy tất cả các chiến dịch khám sức khỏe (API cũ)
export const getHealthCampaigns = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/health-campaigns`);
    
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

// Lấy danh sách phụ huynh (API cũ)
export const getParents = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/parents`);
    
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

// Lấy thông tin chi tiết phụ huynh theo ID
export const getParentById = async (id) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/parents/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching parent details:', error);
    throw error;
  }
};

// Gửi thông báo khám sức khỏe (API cũ)
export const sendNotification = async (notificationData) => {
  return await sendHealthCheckupNotification(notificationData);
};

// Gửi thông báo khám sức khỏe (API cũ)
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
    
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/notifications/create`, {
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

// Get student list for a specific campaign (API cũ)
export const getCampaignStudents = async (campaignId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/health-campaigns/${campaignId}/students`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching students for campaign ${campaignId}:`, error);
    throw error;
  }
};

// Get parent consent details (API cũ)
export const getConsentDetails = async (consentId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/parent-consents/${consentId}/details`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching consent details for ID ${consentId}:`, error);
    throw error;
  }
};

// Get students requiring follow-up
export const getStudentsRequiringFollowup = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/medical-checkups/requiring-follow-up`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching students requiring follow-up:', error);
    if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      throw new Error('Không nhận được phản hồi từ máy chủ');
    } else {
      throw error;
    }
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

// Export tất cả các hàm
export default {
  // API mới
  getAllMedicalCheckups,
  getMedicalCheckupById,
  updateMedicalCheckup,
  sendParentNotification,
  notifyParent,
  notifyAllParents,
  batchNotifyParents,
  
  // API cũ
  getAllHealthCheckups,
  getHealthCheckupById,
  addHealthCheckup,
  updateHealthCheckup,
  deleteHealthCheckup,
  getHealthCampaigns,
  getParents,
  sendNotification,
  sendHealthCheckupNotification,
  getCampaignStudents,
  getConsentDetails,
  getParentById,
  getStudentsRequiringFollowup
};
