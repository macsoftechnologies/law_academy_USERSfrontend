import { useState, useEffect } from "react";
import { updateDetailsRequest } from "../../api/Profile/profileApi";
import Loader from "../../components/common/Loader";

export default function AdminConsult({ onBack, details }) {
  const userId = localStorage.getItem("userId");

  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  const source = details || stored;

  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    name: source?.name || "",
    email: source?.email || "",
    mobile_number: source?.mobile_number || "",
  });

  const [original] = useState({
    name: source?.name || "",
    email: source?.email || "",
    mobile_number: source?.mobile_number || "",
  });

  useEffect(() => {
    if (details) {
      setForm({
        name: details.name || "",
        email: details.email || "",
        mobile_number: details.mobile_number || "",
      });
    }
  }, [details]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!agreed) return;

    const payload = { userId };
    if (form.name !== original.name) payload.name = form.name;
    if (form.email !== original.email) payload.email = form.email;
    if (form.mobile_number !== original.mobile_number)
      payload.mobile_number = form.mobile_number;

    if (Object.keys(payload).length === 1) {
      setToast({ type: "error", msg: "No changes detected." });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setLoading(true);
    try {
      const res = await updateDetailsRequest(payload);
      if (res.statusCode === 200) {
        setSubmitted(true);
      } else {
        setToast({ type: "error", msg: res.message || "Submission failed." });
        setTimeout(() => setToast(null), 3000);
      }
    } catch {
      setToast({ type: "error", msg: "Something went wrong." });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ padding: "1rem", background: "var(--success-bg)", borderRadius: "var(--radius-md)" }}>
        <div style={{ fontWeight: 600, textAlign: "center" }}>✅ Request Submitted</div>
        <div style={{ fontSize: ".85rem", color: "var(--gray-700)", marginTop: ".5rem", textAlign: "center" }}>
          Admin will review your updates and get back to you shortly.
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          <button className="btn btn-primary" onClick={onBack}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem", borderRadius: "var(--radius-md)", background: "var(--gray-50)", border: "1px solid var(--gray-200)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Consult Admin to Update Details</h3>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>✕</button>
      </div>

      {toast && <div className={`toast ${toast.type}`} style={{ marginBottom: "0.75rem" }}>{toast.msg}</div>}

      <div style={{ display: "grid", gap: "1rem" }}>
        <div className="field">
          <label>Full Name</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Full Name" />
        </div>

        <div className="field">
          <label>Phone Number</label>
          <input value={form.mobile_number} onChange={(e) => set("mobile_number", e.target.value)} placeholder="Phone Number" />
        </div>

        <div className="field">
          <label>Email Address</label>
          <input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Email Address" />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
          <input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <label htmlFor="terms" style={{ fontSize: ".85rem" }}>I accept the <span style={{ textDecoration: "underline" }}>Terms & Conditions</span></label>
        </div>

        <button className="btn btn-primary" disabled={!agreed || loading} onClick={handleSubmit}>
          {loading ? <Loader /> : "Submit Request"}
        </button>
      </div>
    </div>
  );
}