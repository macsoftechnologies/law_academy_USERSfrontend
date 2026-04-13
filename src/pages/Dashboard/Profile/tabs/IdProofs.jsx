import { useState } from 'react';
import { addIdProof, deleteIdProof } from '../../../../api/Profile/profileApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function IdProofs({ idProofs = [], onRefetch }) {
  const userId = localStorage.getItem('userId');
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ type: "", number: "", file: null });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const ID_TYPES = ["Aadhaar", "PAN", "Passport"];

  const handleAdd = async () => {
    if (!form.type || !form.number.trim()) {
      setToast({ type: "error", msg: "Fill required fields" });
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("userId", userId);
      fd.append("idType", form.type);          // <-- Correct camelCase
      fd.append("id_number", form.number);
      if (form.file) fd.append("proof_file", form.file);  // <-- match backend
      const res = await addIdProof(fd);
      if (res.statusCode === 200) {
        setToast({ type: "success", msg: "ID proof added!" });
        setAdding(false);
        setForm({ type: "", number: "", file: null });
        onRefetch();
      } else setToast({ type: "error", msg: res.message || "Failed" });
    } catch {
      setToast({ type: "error", msg: "Something went wrong" });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this ID proof?")) return;
    try {
      await deleteIdProof(id);
      onRefetch();
    } catch {
      setToast({ type: "error", msg: "Delete failed" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--navy)' }}>ID Proofs</h2>
        <button className="btn btn-gold btn-sm" onClick={() => setAdding(p => !p)}>+ Add</button>
      </div>

      {/* Toast */}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Add ID Proof Form */}
      {adding && (
        <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.25rem', border: '1.5px solid var(--gray-200)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="field">
              <label>ID Type *</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="">Select type</option>
                {ID_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>ID Number *</label>
              <input placeholder="Enter ID number" value={form.number} onChange={e => set('number', e.target.value)} />
            </div>
            <div className="field" style={{ gridColumn: '1/-1' }}>
              <label>Upload Document</label>
              <input type="file" accept=".pdf,.jpg,.png" onChange={e => set('file', e.target.files[0])} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={loading}>{loading ? "Adding…" : "Add ID Proof"}</button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {idProofs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🪪</div>
          <h3>No ID proofs added</h3>
          <p>Upload your identity documents.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {idProofs.map((id, i) => (
            <div key={i} className="card">
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Icon */}
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>🪪</div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{id.idType || "Unknown"}</div>
                  <div style={{ fontSize: '.82rem', color: 'var(--gray-500)', letterSpacing: '.05em' }}>{id.id_number}</div>
                </div>

                {/* View / Download */}
                {id.proof_file && (
                  <a href={`${BASE_URL}/${id.proof_file}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                    View / Download
                  </a>
                )}

                {/* Delete */}
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(id.proof_id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}