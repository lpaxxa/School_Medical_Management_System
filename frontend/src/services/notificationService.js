import api from './api';

export const getNotificationsByParentId = async (parentId) => {
  return api.get(`/notifications/getTitlesByParentId/${parentId}`);
};

export const getNotificationDetail = async (notificationId, parentId) => {
  return api.get(`/notifications/getDetail/${notificationId}/${parentId}`);
};

export const respondToNotification = async (notificationId, parentId, response) => {
  return api.post(`/notifications/respond/${notificationId}/${parentId}`, { response });
};