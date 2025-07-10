import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import notificationService from "../services/notificationService";
import { useStudentData } from "./StudentDataContext";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

// Thêm vào NotificationContext các phương thức để làm việc với localStorage
const getReadNotificationsFromStorage = () => {
  try {
    const stored = localStorage.getItem("readNotifications");
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return {};
  }
};

const saveReadNotificationsToStorage = (readMap) => {
  try {
    localStorage.setItem("readNotifications", JSON.stringify(readMap));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export const NotificationProvider = ({ children }) => {
  // State cho số lượng thông báo chưa đọc
  const [unreadCount, setUnreadCount] = useState(0);
  // State lưu danh sách ID thông báo đã đọc
  const [readNotifications, setReadNotifications] = useState(
    getReadNotificationsFromStorage()
  );

  // Safely destructure with default values
  const studentDataContext = useStudentData();
  const parentInfo = studentDataContext?.parentInfo || null;
  const students = studentDataContext?.students || [];

  // Lấy parentId từ context
  const getParentId = useCallback(() => {
    if (parentInfo?.id) return parentInfo.id;
    if (students?.length > 0 && students[0]?.parentId)
      return students[0].parentId;
    return null;
  }, [parentInfo, students]);

  // Fetch và cập nhật số lượng thông báo chưa đọc
  const refreshNotifications = useCallback(async () => {
    const parentId = getParentId();
    if (!parentId) return;

    try {
      const response = await notificationService.getNotifications(parentId);

      if (response && response.data && Array.isArray(response.data)) {
        // Lọc các thông báo chưa đọc, tính cả những thông báo đã đánh dấu đọc trong ứng dụng
        const unreadNotifications = response.data.filter((notification) => {
          // Kiểm tra notification có tồn tại và có id
          if (!notification || !notification.id) return false;

          return !notification.isRead && !readNotifications[notification.id];
        });
        setUnreadCount(unreadNotifications.length);
      } else {
        // Nếu response không đúng format, đặt về 0
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
      // Không thay đổi unreadCount nếu có lỗi, giữ nguyên giá trị hiện tại
    }
  }, [getParentId, readNotifications]);

  // Đánh dấu một thông báo là đã đọc
  const markAsRead = useCallback(
    (notificationId) => {
      setReadNotifications((prev) => {
        const updated = { ...prev, [notificationId]: true };
        saveReadNotificationsToStorage(updated);
        return updated;
      });

      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    [setReadNotifications, setUnreadCount]
  );

  // Đánh dấu tất cả thông báo là đã đọc
  const markAllAsRead = useCallback((notifications) => {
    if (!notifications || !notifications.length) return;

    setReadNotifications((prev) => {
      const updated = { ...prev };

      // Thêm tất cả thông báo vào object của các thông báo đã đọc
      notifications.forEach((notification) => {
        updated[notification.id] = true;
      });

      // Lưu vào localStorage
      saveReadNotificationsToStorage(updated);
      return updated;
    });

    // Cập nhật số thông báo chưa đọc
    setUnreadCount(0);
  }, []);

  // Cập nhật số lượng thông báo chưa đọc
  const updateUnreadCount = useCallback((count) => {
    setUnreadCount(count);
  }, []);

  // Phương thức lấy trạng thái đã đọc của một thông báo
  const isNotificationRead = useCallback(
    (notificationId) => {
      return !!readNotifications[notificationId];
    },
    [readNotifications]
  );

  // Fetch notifications khi component mount hoặc parentId thay đổi
  useEffect(() => {
    if (getParentId()) {
      refreshNotifications();
    }
  }, [refreshNotifications, getParentId]);

  // Tự động cập nhật mỗi 2 phút
  useEffect(() => {
    const interval = setInterval(() => {
      if (getParentId()) {
        refreshNotifications();
      }
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [refreshNotifications, getParentId]);

  // Cung cấp các phương thức và state qua context
  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        markAsRead,
        isNotificationRead,
        readNotifications,
        markAllAsRead,
        refreshNotifications,
        updateUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
