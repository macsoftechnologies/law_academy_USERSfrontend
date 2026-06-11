import api from "./axios";

export const getPlansByCourseId = async (course_id) => {
  try {
    const response = await api.post("/plans/bycourse", { course_id });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
