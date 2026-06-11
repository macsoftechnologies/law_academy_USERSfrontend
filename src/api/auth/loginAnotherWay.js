import api from '../axios';

export const loginAnotherWay = async (input) => {
  try {
    const text =
      typeof input === 'string'
        ? input
        : input?.text || input?.mobile_number || input?.email || '';
    const response = await api.post('/users/loginanotherway', { text });
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: 'Something went wrong' };
  }
};