import api from "../axios";

export const resetUserPassword = async ({ userId, password }) => {
  const response = await api.post("/users/forgotpassword", { userId, password });
  return response.data;
};
