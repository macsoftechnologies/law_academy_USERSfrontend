import api from "../axios";

// ── Dashboard APIs ──────────────────────────────────────────────────────────
export const getBanners = async () => {
  const res = await api.get("/banners?page=1&limit=10");
  return res.data;
};

export const getCategories = async (page = 1, limit = 10) => {
  const res = await api.get(`/categories?page=${page}&limit=${limit}`);
  return res.data;
};

export const getSubjects = async (page = 1, limit = 10) => {
  const res = await api.get(`/subjects?page=${page}&limit=${limit}`);
  return res.data;
};

// ── Category APIs ───────────────────────────────────────────────────────────
export const getCategoryDetails = async (categoryId) => {
  const res = await api.post("/categories/details", { categoryId });
  return res.data;
};

// ── Subcategory APIs ────────────────────────────────────────────────────────
export const getSubcategoriesByCategory = async (categoryId) => {
  const res = await api.post("/subcategories/getbycategory", { categoryId });
  return res.data;
};

export const getSubcategoriesByUser = async (userId, categoryId) => {
  const res = await api.post("/subcategories/getbycategorywithuser", { userId, categoryId });
  return res.data;
};

export const getSubcategoryDetails = async (subcategory_id) => {
  const res = await api.post("/subcategories/details", { subcategory_id });
  return res.data;
};

// ── Subject APIs ────────────────────────────────────────────────────────────
export const getSubjectsByLaw = async (law_id) => {
  const res = await api.post("/subjects/listbylaw", { law_id });
  return res.data;
};

export const getSubjectsByLawForUser = async (law_id, userId) => {
  const res = await api.post("/subjects/listbylawforuser", { law_id, userId });
  return res.data;
};
export const getSubjectDetails = async (subjectId) => {
  const res = await api.post("/subjects/details", { subjectId });
  return res.data;
};
// ── Guest Lecture APIs ──────────────────────────────────────────────────────
export const getGuestLectures = async (page = 1, limit = 10) => {
  const userId = localStorage.getItem("userId");
  const res = await api.get(`/guest-lectures?page=${page}&limit=${limit}&userId=${userId}`);
  return res.data;
};

export const getGuestLectureDetails = async (guest_lecture_id) => {
  const res = await api.post("/guest-lectures/details", { guest_lecture_id });
  return res.data;
};

// Laws
export const getLawsBySubcategory = async (subcategory_id) => {
  const res = await api.post("/laws/listbysubcategory", { subcategory_id });
  return res.data;
};
 

 
// Lectures
export const getLecturesBySubject = async (subjectId, userId) => {
  const body = userId ? { subjectId, userId } : { subjectId };
  const res = await api.post("/lectures/getbysubject", body);
  return res.data;
};

// ── Lecture Detail API ───────────────────────────────────────────────
export const getLectureDetail = async (lectureId) => {
  const res = await api.post("/lectures/details", { lectureId });
  return res.data;
};

export const getUserCourses = async (userId) => {
  const res = await api.post("/enrollments/user_courses", { userId });
  return res.data;
};

export const getEnrollmentDetails = async (enrollId) => {
  const res = await api.post("/enrollments/details", { enroll_id: enrollId });
  return res.data;
};

