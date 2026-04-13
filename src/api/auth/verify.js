import api from "../axios";

export const verifyUser = async (data) => {
  const response = await api.post("/users/verify", data);
  return response.data;
};