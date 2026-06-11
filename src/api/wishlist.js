import api from "./axios";

export const addToWishlist = async (userId, course_id, enroll_type) => {
  try {
    const response = await api.post("/wishlist/add", {
      userId,
      course_id,
      enroll_type,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const removeFromWishlist = async (userId, wishlistItemId) => {
  try {
    const response = await api.post("/wishlist/remove", {
      userId,
      wishlistItemId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getWishlistList = async (userId) => {
  try {
    const response = await api.post("/wishlist/list", { userId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
