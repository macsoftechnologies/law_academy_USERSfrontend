import api from "../axios";

export const enrollCourse = async ({ payment_id, enroll_type, planId, coupon_code = null, final_amount = null, course_title }) => {
  const userId = localStorage.getItem("userId");



  const res = await api.post("/enrollments/enroll", {
    userId,
    payment_id,
    enroll_type,
    planId,
    coupon_code,
    final_amount,
    course_title
  });


  return res.data;
};

export const calculatePrice = async (payload) => {
  const res = await api.post("/enrollments/calculate-price", payload);
  return res.data;
};

export const getAllCoupons = async (page = 1, limit = 10) => {
  const res = await api.get(`/coupons?page=${page}&limit=${limit}`);
  return res.data;
};


export const verifyCoupon = async (code) => {
  const res = await api.get(`/coupons?page=1&limit=100`);
  if (res.data?.statusCode === 200) {
    const coupon = res.data.data.find(c => c.coupon_code.toUpperCase() === code.toUpperCase() && c.status.toLowerCase() === 'active');
    return coupon || null;
  }
  return null;
};