import { useState } from 'react';
import { addCertificate, deleteCertificate } from '../../../../api/Profile/profileApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CERT_TYPES = [
  "Secondary Education",
  "Intermediate Education",
  "Graduation",
  "LLB Certificate"
];

export default function EducationalInfo({ certificates = [], onRefetch }) {
  const userId = localStorage.getItem('userId');
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ type: "", marks: "", institute: "", file: null });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleAdd = async () => {
    if (!form.type || !form.institute.trim()) {
      setToast({ type: "error", msg: "Fill required fields" });
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("userId", userId);
      fd.append("certificate_standard", form.type);
      fd.append("marks_cgpa", form.marks);
      fd.append("institute_name", form.institute);
      if (form.file) fd.append("certificate_file", form.file);
      const res = await addCertificate(fd);
      if (res.statusCode === 200) {
        setToast({ type: "success", msg: "Certificate added!" });
        setAdding(false);
        setForm({ type: "", marks: "", institute: "", file: null });
        onRefetch();
      } else setToast({ type: "error", msg: res.message || "Failed" });
    } catch {
      setToast({ type: "error", msg: "Something went wrong" });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleDelete = async (certificateId) => {
    if (!window.confirm("Remove this certificate?")) return;
    try {
      await deleteCertificate(certificateId);
      onRefetch();
    } catch {
      setToast({ type: "error", msg: "Delete failed" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--navy)' }}>Educational Information</h2>
        <button className="btn btn-gold btn-sm" onClick={() => setAdding(p => !p)}>+ Add</button>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {adding && (
        <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.25rem', border: '1.5px solid var(--gray-200)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="field">
              <label>Certificate Type *</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="">Select type</option>
                {CERT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Institute *</label>
              <input placeholder="Enter institute name" value={form.institute} onChange={e => set('institute', e.target.value)} />
            </div>
            <div className="field">
              <label>Marks / CGPA</label>
              <input placeholder="Enter marks / CGPA" value={form.marks} onChange={e => set('marks', e.target.value)} />
            </div>
            <div className="field" style={{ gridColumn: '1/-1' }}>
              <label>Upload Certificate</label>
              <input type="file" accept=".pdf,.jpg,.png" onChange={e => set('file', e.target.files[0])} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={loading}>{loading ? "Adding…" : "Add Certificate"}</button>
          </div>
        </div>
      )}

      {certificates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎓</div>
          <h3>No certificates added</h3>
          <p>Add your educational qualifications.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {certificates.map((cert, i) => (
            <div key={i} className="card">
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>🎓</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{cert.certificate_standard}</div>
                  <div style={{ fontSize: '.82rem', color: 'var(--gray-500)' }}>{cert.institute_name} {cert.marks_cgpa && `· ${cert.marks_cgpa}`}</div>
                </div>
                {cert.certificate_file && (
                  <a href={`${BASE_URL}/${cert.certificate_file}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                    View / Download
                  </a>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cert.certificate_id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}