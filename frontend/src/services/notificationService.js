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
      
      // Sử dụng api instance thay vì axios trực tiếp
      // Và sử dụng đúng endpoints đã định nghĩa
      const apiResponse = await api({
        method: 'put',
        url: endpoints.notifications.respond(notificationId, parentId),
        data: `"${response}"`,  // Format chuỗi JSON đúng
        headers: {
          'Content-Type': 'application/json'
          // Không cần thêm Authorization vì interceptor đã xử lý
        },
        transformRequest: [(data) => data] // Không để axios tự xử lý dữ liệu
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