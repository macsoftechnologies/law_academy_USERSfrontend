import api from "../axios";
export const getNotes = async (page = 1, limit = 10) => {
  const userId = localStorage.getItem("userId");
  const res = await api.get(`/notes?page=${page}&limit=${limit}&userId=${userId}`);
  return res.data;
};
 
// Notes detail
export const getNotesDetail = async (notes_id) => {
  const userId = localStorage.getItem("userId");
  const res = await api.post("/notes/details", { notes_id, userId });
  return res.data;
};
 
// Subject notes list
export const getSubjectNotes = async (page = 1, limit = 10) => {
  const userId = localStorage.getItem("userId");
  const res = await api.get(`/subject-notes?page=${page}&limit=${limit}&userId=${userId}`);
  return res.data;
};

// GET /notes/printedlist
export const getPrintedNotes = async () => {
  const res = await api.get('/notes/printedlist');
  return res.data;
};

// POST /notes/addorder
export const addNoteOrder = async ({ notes_id, address_id, payment_id, coupon_id, coupon_code = null, final_amount = null, payment_method }) => {
  const userId = localStorage.getItem('userId');
  const res = await api.post('/notes/addorder', {
    notes_id, userId, address_id, payment_id, coupon_id, coupon_code, final_amount, payment_method
  });
  return res.data;
};

export const getNoteOrders = async (page = 1, limit = 10) => {
  const userId = localStorage.getItem('userId');
  // Pass userId as a query param since your backend expects it
  const res = await api.get(`/notes/orders?page=${page}&limit=${limit}&userId=${userId}`);
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