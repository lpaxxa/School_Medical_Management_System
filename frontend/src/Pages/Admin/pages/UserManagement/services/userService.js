const API_BASE_URL = 'http://localhost:8080/api/v1/account-members';

// Helper function để lấy auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function để tạo headers với authentication
const createHeaders = (includeContentType = false) => {
  const headers = {
    'Accept': 'application/json',
  };

  // Thêm Content-Type nếu cần
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }

  // Thêm Authorization token nếu có
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Lấy tất cả users
export const getAllUsers = async () => {
  try {
    console.log('Fetching users from API:', `${API_BASE_URL}/getAll`);
    console.log('Using auth token:', getAuthToken() ? 'Yes' : 'No');
    
    const response = await fetch(`${API_BASE_URL}/getAll`, {
      method: 'GET',
      headers: createHeaders(),
      credentials: 'include', // Thêm credentials cho CORS
    });

    console.log('API Response status:', response.status);
    console.log('API Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
      
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error('Unauthorized: Bạn cần đăng nhập để truy cập tính năng này');
      } else if (response.status === 403) {
        throw new Error('Forbidden: Bạn không có quyền truy cập tính năng này');
      } else if (response.status === 400) {
        throw new Error(`Bad Request: ${errorText || 'Yêu cầu không hợp lệ'}`);
      }
      
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Successfully fetched users from API:', data.length, 'users');
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Thêm user mới - sử dụng API endpoint mới /addNewMember
export const createUser = async (userData) => {
  try {
    console.log('Creating user:', userData);
    console.log('Using auth token:', getAuthToken() ? 'Yes' : 'No');
    
    const response = await fetch(`${API_BASE_URL}/addNewMember`, {
      method: 'POST',
      headers: createHeaders(true),
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Create user error: ${response.status} ${response.statusText}`, errorText);
      
      if (response.status === 401) {
        throw new Error('Unauthorized: Bạn cần đăng nhập để thực hiện thao tác này');
      } else if (response.status === 403) {
        throw new Error('Forbidden: Bạn không có quyền tạo người dùng mới');
      } else if (response.status === 400) {
        throw new Error(`Dữ liệu không hợp lệ: ${errorText}`);
      }
      
      throw new Error(`Failed to create user: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('User created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Cập nhật user theo API endpoint mới
export const updateUser = async (userId, userData) => {
  try {
    console.log('Updating user with ID:', userId);
    console.log('Update data:', userData);
    console.log('Using auth token:', getAuthToken() ? 'Yes' : 'No');
    
    // Chuẩn bị data theo format API yêu cầu - bao gồm cả role-specific fields
    const updatePayload = {
      email: userData.email,
      password: userData.password,
      phoneNumber: userData.phoneNumber,
      fullName: userData.fullName
    };

    // Thêm fields theo role
    if (userData.role === 'PARENT') {
      updatePayload.address = userData.address;
      updatePayload.relationshipType = userData.relationshipType;
      updatePayload.occupation = userData.occupation;
    } else if (userData.role === 'NURSE') {
      updatePayload.qualification = userData.qualification;
    }
    
    console.log('Update payload:', updatePayload);
    console.log('API endpoint:', `${API_BASE_URL}/update/${userId}`);
    
    const response = await fetch(`${API_BASE_URL}/update/${userId}`, {
      method: 'PUT',
      headers: createHeaders(true),
      credentials: 'include',
      body: JSON.stringify(updatePayload),
    });

    console.log('Update response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Update user error: ${response.status} ${response.statusText}`, errorText);
      
      if (response.status === 401) {
        throw new Error('Unauthorized: Bạn cần đăng nhập để thực hiện thao tác này');
      } else if (response.status === 403) {
        throw new Error('Forbidden: Bạn không có quyền cập nhật người dùng này');
      } else if (response.status === 404) {
        throw new Error(`User với ID ${userId} không tồn tại`);
      } else if (response.status === 400) {
        throw new Error(`Dữ liệu không hợp lệ: ${errorText}`);
      }
      
      throw new Error(`Failed to update user: ${response.status} ${response.statusText}`);
    }

    // API có thể trả về data hoặc chỉ status thành công
    let data;
    try {
      data = await response.json();
    } catch (e) {
      // Nếu không có JSON response, tạo response thành công
      data = { success: true, message: 'User updated successfully', userId };
    }
    
    console.log('User updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Xóa user theo API endpoint mới
export const deleteUser = async (userId) => {
  try {
    console.log('Deleting user with ID:', userId);
    console.log('Using auth token:', getAuthToken() ? 'Yes' : 'No');
    console.log('Delete API endpoint:', `${API_BASE_URL}/${userId}`);
    
    const response = await fetch(`${API_BASE_URL}/${userId}`, {
      method: 'DELETE',
      headers: createHeaders(),
      credentials: 'include',
    });

    console.log('Delete response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Delete user error: ${response.status} ${response.statusText}`, errorText);
      
      if (response.status === 401) {
        throw new Error('Unauthorized: Bạn cần đăng nhập để thực hiện thao tác này');
      } else if (response.status === 403) {
        throw new Error('Forbidden: Bạn không có quyền xóa người dùng này');
      } else if (response.status === 404) {
        throw new Error(`User với ID ${userId} không tồn tại`);
      } else if (response.status === 400) {
        throw new Error(`Không thể xóa user này: ${errorText}`);
      }
      
      throw new Error(`Failed to delete user: ${response.status} ${response.statusText}`);
    }

    // API có thể trả về data hoặc chỉ status thành công
    let data;
    try {
      data = await response.json();
    } catch (e) {
      // Nếu không có JSON response, tạo response thành công
      data = { success: true, message: 'User deleted successfully', userId };
    }

    console.log('User deleted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Chuyển đổi trạng thái active/inactive của user
export const toggleUserStatus = async (userId, isActive) => {
  try {
    console.log('Toggling user status:', userId, isActive);
    console.log('Using auth token:', getAuthToken() ? 'Yes' : 'No');
    
    const response = await fetch(`${API_BASE_URL}/toggle-status/${userId}`, {
      method: 'PATCH',
      headers: createHeaders(true),
      credentials: 'include',
      body: JSON.stringify({ isActive }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Toggle status error: ${response.status} ${response.statusText}`, errorText);
      
      if (response.status === 401) {
        throw new Error('Unauthorized: Bạn cần đăng nhập để thực hiện thao tác này');
      } else if (response.status === 403) {
        throw new Error('Forbidden: Bạn không có quyền thay đổi trạng thái người dùng này');
      }
      
      throw new Error(`Failed to toggle user status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('User status toggled successfully:', data);
    return data;
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw error;
  }
};

// Test API connection - cải thiện để test cả authentication
export const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    console.log('Auth token available:', getAuthToken() ? 'Yes' : 'No');
    console.log('API Endpoint:', `${API_BASE_URL}/getAll`);
    
    // Test với minimal request trước
    const response = await fetch(`${API_BASE_URL}/getAll`, {
      method: 'GET',
      headers: createHeaders(),
      credentials: 'include',
    });
    
    console.log('Test response status:', response.status);
    console.log('Test response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('API connection test successful:', data.length, 'users found');
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.error('API connection test failed:', response.status, errorText);
      
      let errorMessage = `${response.status}: ${errorText}`;
      
      if (response.status === 401) {
        errorMessage = 'Unauthorized - Bạn cần đăng nhập trước';
      } else if (response.status === 403) {
        errorMessage = 'Forbidden - Bạn không có quyền truy cập';
      } else if (response.status === 400) {
        errorMessage = `Bad Request - ${errorText || 'Yêu cầu không hợp lệ'}`;
      }
      
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    console.error('API connection test error:', error);
    return { success: false, error: error.message };
  }
};

// Utility functions để transform data
export const transformUserFromAPI = (apiUser) => {
  return {
    id: apiUser.memberId || apiUser.id,
    username: apiUser.username || apiUser.fullName || apiUser.email,
    email: apiUser.email,
    phoneNumber: apiUser.phoneNumber,
    role: apiUser.role,
    isActive: apiUser.isActive !== undefined ? apiUser.isActive : true,
    emailSent: apiUser.emailSent, // Thêm field emailSent
    fullName: apiUser.fullName,
    address: apiUser.address,
    emergencyPhoneNumber: apiUser.emergencyPhoneNumber,
    relationshipType: apiUser.relationshipType,
    occupation: apiUser.occupation,
    qualification: apiUser.qualification,
  };
};

export const transformUserToAPI = (formUser) => {
  // Chuyển đổi dữ liệu form thành format API phù hợp
  if (formUser.role === 'NURSE') {
    // Format cho Y tá - cập nhật theo API mới
    return {
      email: formUser.email,
      password: formUser.password,
      fullName: formUser.fullName,
      phoneNumber: formUser.phoneNumber,
      role: formUser.role,
      qualification: formUser.qualification
    };
  } else if (formUser.role === 'PARENT') {
    // Format cho Phụ huynh
    return {
      email: formUser.email,
      password: formUser.password,
      fullName: formUser.fullName,
      phoneNumber: formUser.phoneNumber,
      role: formUser.role,
      address: formUser.address,
      emergencyPhoneNumber: formUser.emergencyPhoneNumber,
      relationshipType: formUser.relationshipType,
      occupation: formUser.occupation,
      students: formUser.students || []
    };
  } else if (formUser.role === 'ADMIN') {
    // Format cho Admin (nếu cần)
    return {
      memberId: formUser.memberId || generateUserId('ADMIN'),
      email: formUser.email,
      role: formUser.role,
      phoneNumber: formUser.phoneNumber,
      token: null
    };
  }
  
  // Fallback cho các role khác
  return {
    username: formUser.username,
    email: formUser.email,
    phoneNumber: formUser.phoneNumber,
    role: formUser.role.toUpperCase(),
    password: formUser.password,
    isActive: formUser.isActive !== undefined ? formUser.isActive : true,
  };
};

// Generate user ID theo format mới
export const generateUserId = (role) => {
  const timestamp = Date.now().toString().slice(-3);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  switch (role) {
    case 'NURSE':
      return `NU${timestamp}${random}`;
    case 'PARENT':
      return `PA${timestamp}${random}`;
    case 'ADMIN':
      return `AD${timestamp}${random}`;
    default:
      return `${role.substring(0, 2).toUpperCase()}${timestamp}${random}`;
  }
}; 