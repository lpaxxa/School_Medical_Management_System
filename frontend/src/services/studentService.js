// Đặt lại cấu hình để sử dụng API thật
const config = {
  useMockData: false,  // Đổi thành false để sử dụng API thật
  apiUrl: 'http://localhost:8080/api/v1/students'
};

// Hàm trễ để mô phỏng API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Hàm lấy tất cả học sinh
export const getAllStudents = async () => {
  try {
    if (config.useMockData) {
      await delay(500);
      return mockStudents;
    } else {
      // Sử dụng fetch thay vì axios để đơn giản hóa
      const response = await fetch(`${config.apiUrl}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API response from students:', data);
      return data;
    }
  } catch (error) {
    console.error('Error fetching students:', error);
    return mockStudents; // Fallback về mock data khi có lỗi
  }
};

// Dữ liệu mẫu học sinh - export để có thể sử dụng ở các file khác
export const mockStudents = [
  { id: 1, fullName: 'Nguyễn Văn A', class: '10A1', dateOfBirth: '2010-05-15', gender: 'Nam' },
  { id: 2, fullName: 'Trần Thị B', class: '10A1', dateOfBirth: '2010-08-20', gender: 'Nữ' },
  { id: 3, fullName: 'Haha Smith', class: '11B2', dateOfBirth: '2009-11-10', gender: 'Nam' },
  { id: 4, fullName: 'Hihi Smith', class: '11B2', dateOfBirth: '2009-12-25', gender: 'Nam' },
  { id: 5, fullName: 'Lê Thị C', class: '12C3', dateOfBirth: '2008-02-18', gender: 'Nữ' },
  { id: 6, fullName: 'Phạm Văn D', class: '12C3', dateOfBirth: '2008-04-30', gender: 'Nam' },
  { id: 7, fullName: 'Hoàng Thị E', class: '10A2', dateOfBirth: '2010-07-12', gender: 'Nữ' },
  { id: 8, fullName: 'Ngô Văn F', class: '11B3', dateOfBirth: '2009-01-25', gender: 'Nam' },
  { id: 9, fullName: 'Đỗ Thị G', class: '12C1', dateOfBirth: '2008-09-05', gender: 'Nữ' },
  { id: 10, fullName: 'Vũ Văn H', class: '10A3', dateOfBirth: '2010-03-15', gender: 'Nam' }
];