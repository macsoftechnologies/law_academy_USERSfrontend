import api from "../axios";

export const enrollCourse = async ({ payment_id, enroll_type, planId }) => {
  const userId = localStorage.getItem("userId");

  // ✅ Log what is being sent
  console.log("Enrollment request payload →", {
    userId,
    payment_id,
    enroll_type,
    planId,
  });

  const res = await api.post("/enrollments/enroll", {
    userId,
    payment_id,
    enroll_type,
    planId,
  });

  // ✅ Log what is received
  console.log("Enrollment API response →", res.data);

  return res.data;
};