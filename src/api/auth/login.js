import api from '../axios'; 
export const loginUser = async (payload) => {
  try {
    const response = await api.post('/users/login', payload);
    return response.data; 
  } catch (err) {
    throw err.response?.data || { message: 'Check internet' };
  }
};