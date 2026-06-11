import api from "./axios";

export const getMarksDashboardStats = async (userId) => {
  try {
    const response = await api.post("/marksdashboard/stats", { userId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateMarksGoal = async (userId, studyTimeIncrement, mcqIncrement, studyTimeGoal, mcqGoal) => {
  try {
    const response = await api.post("/marksdashboard/update-goal", {
      userId,
      studyTimeIncrement,
      mcqIncrement,
      studyTimeGoal,
      mcqGoal
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateMarksProgress = async (userId, courseId, itemId, activityType, lawType, isCompleted) => {
  try {
    const response = await api.post("/marksdashboard/update-progress", {
      userId,
      courseId,
      itemId,
      activityType,
      lawType,
      isCompleted
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
