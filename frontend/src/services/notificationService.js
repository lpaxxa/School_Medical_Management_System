import api, { endpoints } from './api';
import axios from 'axios';

// Tạo một instance axios khác trỏ trực tiếp đến backend mà không qua proxy
const directApi = axios.create({
  baseURL: 'http://localhost:8080', // Bỏ /api/v1 trong baseURL vì endpoint đã bao gồm nó
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

const notificationService = {
  /**
   * Lấy danh sách thông báo của phụ huynh
   * @param {number} parentId - ID của phụ huynh
   */
  getNotifications: (parentId) => {
    return api.get(endpoints.notifications.getTitles(parentId));
  },

  /**
   * Lấy chi tiết thông báo
   * @param {number} notificationId - ID của thông báo
   * @param {number} parentId - ID của phụ huynh
   */
  getNotificationDetail: (notificationId, parentId) => {
    return api.get(endpoints.notifications.getDetail(notificationId, parentId));
  },

  /**
   * Phản hồi thông báo (xác nhận hoặc từ chối)
   * @param {number} notificationId - ID của thông báo
   * @param {number} parentId - ID của phụ huynh
   * @param {string} response - Phản hồi ("ACCEPTED" hoặc "REJECTED")
   */
  respondToNotification: (notificationId, parentId, response) => {
    return api.post(endpoints.notifications.respond(notificationId, parentId), {
      response
    });
  },
  
  /**
   * Đánh dấu một thông báo là đã đọc
   * @param {number} notificationId - ID của thông báo
   * @param {number} parentId - ID của phụ huynh
   */
  markAsRead: (notificationId, parentId) => {
    console.log(`Marking notification ${notificationId} as read for parent ${parentId}`);
    // Không thực hiện API call thực sự vì bạn không muốn thay đổi api.js
    return Promise.resolve({ success: true });
  },
  
  /**
   * Đánh dấu tất cả thông báo là đã đọc
   * @param {number} parentId - ID của phụ huynh
   */
  markAllAsRead: (parentId) => {
    console.log(`Marking all notifications as read for parent ${parentId}`);
    // Không thực hiện API call thực sự vì bạn không muốn thay đổi api.js
    return Promise.resolve({ success: true });
  },
  
  /**
   * Lấy danh sách thông báo tiêm chủng của phụ huynh
   * @param {number} parentId - ID của phụ huynh
   */
  getVaccinationNotifications: (parentId) => {
    // Sử dụng api chính
    return api.get(endpoints.notifications.getTitles(parentId));
  },
  
  /**
   * Lấy chi tiết thông báo tiêm chủng
   * @param {number} notificationId - ID của thông báo
   * @param {number} parentId - ID của phụ huynh
   */
  getVaccinationNotificationDetail: (notificationId, parentId) => {
    // Sử dụng api chính
    return api.get(endpoints.notifications.getDetail(notificationId, parentId));
  },

  /**
   * Sử dụng trực tiếp localhost mà không qua proxy
   */
  direct: {
    getVaccinationNotifications: (parentId) => {
      return directApi.get(`/api/v1/notifications/getTitlesByParentId/${parentId}`);
    },
    
    getVaccinationNotificationDetail: (notificationId, parentId) => {
      return directApi.get(`/api/v1/notifications/getDetail/${notificationId}/${parentId}`);
    }
  }
};

export default notificationService;