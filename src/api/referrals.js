import api from "./axios";

export const getReferralStats = async (userId) => {
  try {
    const response = await api.post("/referrals/stats", { userId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const convertToCoupon = async (userId, amount) => {
  try {
    const response = await api.post("/referrals/convert-to-coupon", {
      userId,
      amount,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
