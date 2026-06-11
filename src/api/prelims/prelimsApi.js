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

export const getQAList = async ({ moduleId, module, module_type, page = 1, limit = 10 }) => {
  const userId = localStorage.getItem("userId"); // always read from storage, never pass as arg
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

// Start a prelims test attempt
// POST /prelimes-tests/start_attempt  { userId, testId }
export const startPrelimsAttempt = async ({ testId }) => {
  const userId = localStorage.getItem("userId");
  const res = await api.post("/prelimes-tests/start_attempt", { userId, testId });
  return res.data;
};

// Save an answer for a prelims test
// POST /prelimes-tests/{attemptId}/answer  { questionId, selectedAnswer }
export const savePrelimsAnswer = async ({ attemptId, questionId, selectedAnswer }) => {
  const res = await api.post(`/prelimes-tests/${attemptId}/answer`, { questionId, selectedAnswer });
  return res.data;
};

// Submit a prelims test
// POST /prelimes-tests/{attemptId}/submit
export const submitPrelimsTest = async ({ attemptId }) => {
  const res = await api.post(`/prelimes-tests/${attemptId}/submit`);
  return res.data;
};

// Get prelims test result
// GET /prelimes-tests/{attemptId}
export const getPrelimsResult = async ({ attemptId }) => {
  const res = await api.get(`/prelimes-tests/${attemptId}`);
  return res.data;
};

// Get prelims attempts list
// GET /prelimes-tests/attempts?page=1&limit=10&test_type=SMT
export const getPrelimsAttempts = async ({ page = 1, limit = 10, test_type }) => {
  const userId = localStorage.getItem("userId");
  const res = await api.get(`/prelimes-tests/attempts?page=${page}&limit=${limit}&test_type=${test_type}&userId=${userId}`);
  return res.data;
};

// Fetch past attempts for a test
// GET /prelimes-tests/:prelimes_test_id/attempts
export const getTestAttempts = async ({ prelimes_test_id }) => {
  const res = await api.get(`/prelimes-tests/${prelimes_test_id}/attempts`);
  return res.data;
};

// GET /prelimes/mocktestsubjects?page=1&limit=10
export const getMocktestSubjects = async (page = 1, limit = 10) => {
  const res = await api.get(`/prelimes/mocktestsubjects?page=${page}&limit=${limit}`);
  return res.data;
};

// POST /prelimes/mocktestsubjectdetails  { mocktest_subject_id }
export const getMocktestSubjectDetails = async (mocktest_subject_id) => {
  const userId = localStorage.getItem('userId');
  const res = await api.post('/prelimes/mocktestsubjectdetails', { mocktest_subject_id, userId });
  return res.data;
};

// POST /prelimes/subjectmocktestbylaw  { lawId }
// Returns list of SMT tests under a specific law
export const getSubjectMocktestByLaw = async (lawId) => {
  const userId = localStorage.getItem('userId');
  const res = await api.post('/prelimes/subjectmocktestbylaw', { lawId, userId });
  return res.data;
};

// GET /prelimes-tests (SMT) with mocktest_subject_id — for loading test list after subject selected
export const getSmtTests = async ({ mocktest_subject_id, page = 1, limit = 10 }) => {
  const userId = localStorage.getItem('userId');
  const res = await api.get(
    `/prelimes-tests?page=${page}&limit=${limit}&test_type=SMT&mocktest_subject_id=${mocktest_subject_id}&userId=${userId}`
  );
  return res.data;
};

// POST /prelimes-tests/user_attempts  { testId, userId }
// Returns attempts with results for a specific test for the current user
export const getUserTestAttempts = async (testId) => {
  const userId = localStorage.getItem('userId');
  const res = await api.post('/prelimes-tests/user_attempts', { testId, userId });
  // Debug: log the attempt response so developer can verify in browser console
  try { console.debug('getUserTestAttempts', { testId, userId, res }); } catch (e) { /* ignore */ }
  return res.data;
};
