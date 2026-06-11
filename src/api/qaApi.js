import api from './axios';

export const getQADetails = async ({ qa_id }) => {
  const res = await api.post('/qa/details', { qa_id });
  return res.data;
};
