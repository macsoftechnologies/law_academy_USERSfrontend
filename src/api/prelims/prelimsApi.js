import api from "../axios";

export const getPrelims = async (page = 1, limit = 10) => {
  const userId = localStorage.getItem("userId");
  try {
    const res = await api.get(`/prelimes?page=${page}&limit=${limit}&userId=${userId}`);
    return res.data;
  } catch (err) {
    console.error("❌ Prelims API Error:", err);
    return { data: [], totalCount: 0 };
  }
};

export const getPrelimsDetail = async (prelimes_id) => {
  const res = await api.post("/prelimes/details", { prelimes_id });
  return res.data;
};

export const getQAList = async ({ moduleId, module, module_type, page = 1, limit = 10, userId }) => {
  const res = await api.post(`/qa/module/${userId}?page=${page}&limit=${limit}`, {
    module_id: moduleId,
    module,
    module_type,
  });
  return res.data;
};

export const getPrelimsTests = async ({ prelimsId, page = 1, limit = 10, test_type, mocktest_subject_id }) => {
  const userId = localStorage.getItem("userId");
  let url = `/prelimes-tests?page=${page}&limit=${limit}&test_type=${test_type}&userId=${userId}&prelimesId=${prelimsId}`;
  if (mocktest_subject_id) url += `&mocktest_subject_id=${mocktest_subject_id}`;
  const res = await api.get(url);
  return res.data;
};

// Fetch ONE question by question_number (1-based)
// POST /prelimes-tests/question  { prelimes_test_id, question_number }
export const getQuizQuestion = async ({ prelimes_test_id, question_number }) => {
  const res = await api.post("/prelimes-tests/question", { prelimes_test_id, question_number });
  return res.data;
};

// Fetch terms & conditions by test type (QZ | SMT | GT | PQA)
// POST /test-terms/by_type  { testType }
export const getTermsByType = async ({ testType }) => {
  const res = await api.post("/test-terms/by_type", { testType });
  return res.data;
};

// Fetch past attempts for a test
// GET /prelimes-tests/:prelimes_test_id/attempts
export const getTestAttempts = async ({ prelimes_test_id }) => {
  const res = await api.get(`/prelimes-tests/${prelimes_test_id}/attempts`);
  return res.data;
};