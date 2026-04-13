import api from "../axios";
export const getNotes = async (page = 1, limit = 10) => {
  const userId = localStorage.getItem("userId");
  const res = await api.get(`/notes?page=${page}&limit=${limit}&userId=${userId}`);
  return res.data;
};
 
// Notes detail
export const getNotesDetail = async (notes_id) => {
  const res = await api.post("/notes/details", { notes_id });
  return res.data;
};
 
// Subject notes list
export const getSubjectNotes = async (page = 1, limit = 10) => {
  const res = await api.get(`/subject-notes?page=${page}&limit=${limit}`);
  return res.data;
};
 
 