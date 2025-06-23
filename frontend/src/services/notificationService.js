import api from "./api";
import { endpoints } from "./api";
import axios from "axios";

const notificationService = {
  /**
   * Lấy danh sách thông báo của phụ huynh
   * @param {number} parentId - ID của phụ huynh
   */
  getNotifications: async (parentId) => {
    try {
      const response = await api.get(endpoints.notifications.getTitles(parentId));
      return response;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết thông báo
   * @param {number} notificationId - ID của thông báo
   * @param {number} parentId - ID của phụ huynh
   */
  getNotificationDetail: async (notificationId, parentId) => {
    try {
      const response = await api.get(endpoints.notifications.getDetail(notificationId, parentId));
      return response;
    } catch (error) {
      console.error("Error fetching notification detail:", error);
      throw error;
    }
  },

  /**
   * Phản hồi thông báo (xác nhận hoặc từ chối)
   * @param {number} notificationId - ID của thông báo
   * @param {number} parentId - ID của phụ huynh
   * @param {string} response - Phản hồi ("ACCEPTED" hoặc "REJECTED")
   */
  respondToNotification: async (notificationId, parentId, response) => {
    try {
      console.log(`Sending response ${response} for notification ${notificationId}`);
      
      // Kiểm tra xem response có đúng định dạng không
      if (response !== "ACCEPTED" && response !== "REJECTED") {
        throw new Error(`Invalid response value: ${response}`);
      }
      
      // Gửi JSON response đơn giản (không bọc trong object)
      const jsonString = `"${response}"`;  // Chuỗi JSON đúng định dạng: "ACCEPTED"
      console.log("Sending raw JSON string:", jsonString);
      
      // Gửi dữ liệu dạng JSON
      const apiResponse = await axios({
        method: 'put',
        url: `http://localhost:8080/api/v1/notifications/respond/${notificationId}/${parentId}`,
        data: jsonString,  // Gửi chuỗi JSON đã định dạng đúng
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        transformRequest: [(data) => { 
          // Không để axios xử lý data nữa, vì chúng ta đã định dạng sẵn
          return data; 
        }]
      });
      
      console.log("Response from server:", apiResponse);
      return apiResponse;
    } catch (error) {
      console.error("Error responding to notification:", error);
      console.error("Error details:", error.response?.data || "No response data");
      throw error;
    }
  }
};

export default notificationService;