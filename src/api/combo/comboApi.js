import api from "../axios";

// GET /combos/user/list?page=1&limit=10&userId=...
export const getCombos = async (page = 1, limit = 10) => {
  const userId = localStorage.getItem("userId");
  const res = await api.get(`/combos/user/list?page=${page}&limit=${limit}&userId=${userId}`);
  return res.data;
};

// GET /combos/user/content?combo_id=...&userId=...
export const getComboContent = async (combo_id) => {
  const userId = localStorage.getItem("userId");
  const res = await api.get(`/combos/user/content?combo_id=${combo_id}&userId=${userId}`);
  return res.data;
};

// POST /combos/preview
export const getComboPreview = async (combo_id) => {
  const res = await api.post("/combos/preview", { combo_id });
  return res.data;
};
