import api from "../axios";

export const getMains = async (page = 1, limit = 10) => {
  const userId = localStorage.getItem("userId");
  const res = await api.get(`/mains?page=${page}&limit=${limit}&userId=${userId}`);
  return res.data;
};

export const getMainsDetail = async (mains_id) => {
  const res = await api.post("/mains/details", { mains_id });
  return res.data;
};

export const getMainsTests = async (mains_id, page = 1, limit = 10) => {
  const res = await api.get(`/mains/mainstests?page=${page}&limit=${limit}&mains_id=${mains_id}`);
  return res.data;
};

export const getMainsTestDetail = async (mains_test_id) => {
  const res = await api.post("/mains/mainstestdetails", { mains_test_id });
  return res.data;
};

export const getMainsSubjectTests = async (mains_test_id, page = 1, limit = 10) => {
  const res = await api.get(`/mains/mainssubjecttests?page=${page}&limit=${limit}&mains_test_id=${mains_test_id}`);
  return res.data;
};

export const getMainsTestAttempts = async (mains_test_id) => {
  const userId = localStorage.getItem("userId");
  const res = await api.post("/mains/mainstestattempts", { mains_test_id, userId });
  return res.data;
};

export const getMainsAttemptDetail = async (mains_attempt_id) => {
  const res = await api.post("/mains/attemptdetails", { mains_attempt_id });
  return res.data;
};

// ← NEW
export const getMainsQAList = async ({ moduleId, module, module_type, page = 1, limit = 10 }) => {
  const res = await api.post(
    `/qa/module/${moduleId}?page=${page}&limit=${limit}`,
    { module_id: moduleId, module, module_type }
  );
  return res.data;
};