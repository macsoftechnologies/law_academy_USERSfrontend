import api from "./axios";

export const getNotificationsList = async (userId) => {
  try {
    const response = await api.post("/notifications/list", { userId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const markNotificationRead = async (userId, notificationId) => {
  try {
    const response = await api.post("/notifications/mark-read", {
      userId,
      notificationId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
