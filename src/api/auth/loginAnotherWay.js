import api from '../axios';

export const loginAnotherWay = async (text) => {
  try {
    const response = await api.post('/users/loginanotherway', { text });
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: 'Something went wrong' };
  }
};