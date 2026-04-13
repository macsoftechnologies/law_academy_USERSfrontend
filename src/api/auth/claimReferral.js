import api from "../axios";

export const claimReferral  = async (data) => {
  const response = await api.post("/users/claimreferral", data);
  return response.data;
};