export const mockUsers = [
  // {

];

// Hàm mô phỏng API call đăng nhập
export const mockLogin = (username, password) => {
  return new Promise((resolve, reject) => {
    // Giả lập độ trễ của mạng
    setTimeout(() => {
      const user = mockUsers.find(
        (user) => user.username === username && user.password === password
      );
      
      if (user) {
        // Không trả về mật khẩu
        const { password, ...userWithoutPassword } = user;
        
        resolve({
          success: true,
          data: {
            user: userWithoutPassword,
            token: `mock-jwt-token-${Math.random().toString(36).substring(2, 15)}`
          }
        });
      } else {
        reject({
          success: false,
          message: "Tên đăng nhập hoặc mật khẩu không chính xác"
        });
      }
    }, 800); // Độ trễ 800ms để giả lập network request
  });
};