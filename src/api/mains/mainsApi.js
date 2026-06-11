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

export const submitMainsSubjectAttempt = async ({ mains_subject_test_id, answer_file }) => {
  const userId = localStorage.getItem("userId");
  const formData = new FormData();
  formData.append("mains_subject_test_id", mains_subject_test_id);
  formData.append("userId", userId);
  formData.append("answer_script_file", answer_file);

  console.log("[Mains Submit] Request", {
    method: "POST",
    url: "/mains/addattempt",
    payload: {
      userId,
      mains_subject_test_id,
      answer_script_file: answer_file
        ? {
            name: answer_file.name,
            type: answer_file.type,
            size: answer_file.size,
          }
        : null,
    },
    tokenPresent: !!localStorage.getItem("token"),
  });

  // API contract from src/newjson.json:
  // POST /mains/addattempt  (form-data: userId, mains_subject_test_id, answer_script_file)
  try {
    // FIX: Rely entirely on your custom axios interceptors to pass the Bearer Token safely.
    // We remove the hardcoded config block that was wiping out your defaults.
    const res = await api.post("/mains/addattempt", formData);
    return res.data;
  } catch (error) {
    console.error("[Mains Submit] Error", {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    throw error;
  }
};

// ← NEW
export const getMainsQAList = async ({ moduleId, module, module_type, page = 1, limit = 10 }) => {
  const userId = localStorage.getItem('userId');
  const res = await api.post(
    `/qa/module/${userId}?page=${page}&limit=${limit}`,
    { module_id: moduleId, module, module_type }
  );
  return res.data;
};