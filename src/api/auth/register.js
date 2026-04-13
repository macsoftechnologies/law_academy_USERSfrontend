import api from "../axios";

export const registerUser = async (data) => {
  const response = await api.post("/users/register", data);
  return response.data;
};