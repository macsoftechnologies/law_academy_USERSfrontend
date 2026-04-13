import api from "../axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─── User Details ──────────────────────────────────────────────
export const getUserDetails = (userId) =>
  api.post("/users/details", { userId }).then(r => r.data);

// ─── Personal Info ─────────────────────────────────────────────
export const updatePersonalInfo = (payload) =>
  api.post("/users/personal_information", payload).then(r => r.data);

// ─── Certificates ──────────────────────────────────────────────
export const getUserCertificates = (userId) =>
  api.post("/users/getusercertificates", { userId }).then(r => r.data);

export const addCertificate = (formData) =>
  api.post("/users/addcertificate", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }).then(r => r.data);

export const deleteCertificate = (certificate_id) =>
  api.post("/users/deletecertificate", { certificate_id }).then(r => r.data);

// ─── ID Proofs ────────────────────────────────────────────────
export const getUserIdProofs = (userId) =>
  api.post("/users/getuserIDs", { userId }).then(r => r.data);

export const addIdProof = (formData) =>
  api.post("/users/addidproof", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }).then(r => r.data);

export const deleteIdProof = (proof_id) =>
  api.post("/users/deleteidproof", { proof_id }).then(r => r.data);

// ─── Admin Requests ───────────────────────────────────────────
export const updateDetailsRequest = (payload) =>
  api.post("/users/updatedetailsrequest", payload).then(r => r.data);

// ─── Helper for File URLs ─────────────────────────────────────
export const getFileUrl = (path) => path ? `${BASE_URL}/${path}` : null;