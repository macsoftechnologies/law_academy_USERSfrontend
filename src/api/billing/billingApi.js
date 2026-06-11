import api from "../axios";

// POST /billings/user_billings  { userId }
export const getUserBillings = async () => {
  const userId = localStorage.getItem("userId");
  const res = await api.post("/billings/user_billings", { userId });
  return res.data;
};

// POST /billings/details  { billing_id }
export const getBillingDetails = async (billing_id) => {
  const res = await api.post("/billings/details", { billing_id });
  return res.data;
};

// GET /billings/invoice/:billing_id  (download link)
export const getInvoiceUrl = (billing_id) => {
  return `https://api.raoslawacademy.com/billings/invoice/${billing_id}`;
};
