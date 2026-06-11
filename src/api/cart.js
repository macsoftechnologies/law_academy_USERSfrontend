import api from "./axios";

export const addToCart = async (userId, course_id, enroll_type, planId) => {
  try {
    const response = await api.post("/cart/add", {
      userId,
      course_id,
      enroll_type,
      planId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const removeFromCart = async (userId, cartItemId) => {
  try {
    const response = await api.post("/cart/remove", {
      userId,
      cartItemId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCartList = async (userId) => {
  try {
    const response = await api.post("/cart/list", { userId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const moveFromWishlistToCart = async (userId, wishlistItemId, planId) => {
  try {
    const response = await api.post("/cart/move-from-wishlist", {
      userId,
      wishlistItemId,
      planId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
