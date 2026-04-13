import { useState } from 'react';
import { updatePersonalInfo } from '../../../../api/Profile/profileApi';
import Loader from '../../../../components/common/Loader';
import AdminConsult from '../../../../components/forms/AdminConsult';

export default function PersonalInfo({ details, onRefetch }) {
  const userId = localStorage.getItem('userId');
  const [editMode,  setEditMode]  = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [toast,     setToast]     = useState(null);
  const [form, setForm] = useState({
    date_of_birth:         details?.date_of_birth         || '',
    gender:                details?.gender                || '',
    mother_name:           details?.mother_name           || '',
    father_name:           details?.father_name           || '',
    corresponding_address: details?.corresponding_address || '',
    permanent_address:     details?.permanent_address     || '',
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await updatePersonalInfo({ userId, ...form });
      if (res.statusCode===200) {
        setToast({ type:'success', msg:'Personal information saved!' });
        setEditMode(false); onRefetch();
      } else {
        setToast({ type:'error', msg: res.message||'Save failed' });
      }
    } catch { setToast({ type:'error', msg:'Something went wrong' }); }
    finally { setLoading(false); setTimeout(()=>setToast(null),3000); }
  };

  if (showAdmin) return <AdminConsult onBack={()=>setShowAdmin(false)} />;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.1rem' }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--navy)' }}>Personal Information</h2>
        {!editMode
          ? <button className="btn btn-outline btn-sm" onClick={()=>setEditMode(true)}>Edit</button>
          : <div style={{ display:'flex', gap:'.5rem' }}>
              <button className="btn btn-ghost btn-sm" onClick={()=>setEditMode(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={loading}>{loading?'Saving…':'Save'}</button>
            </div>}
      </div>

      <div style={{ background:'var(--warning-bg)', borderRadius:'var(--radius-md)', padding:'.75rem 1rem', marginBottom:'1.25rem', fontSize:'.82rem', color:'var(--warning)', display:'flex', alignItems:'center', gap:'.5rem' }}>
        ⚠ Name, Mobile, and Email cannot be edited.
        <span style={{ marginLeft:'auto', cursor:'pointer', fontWeight:700, textDecoration:'underline' }} onClick={()=>setShowAdmin(true)}>Contact Admin</span>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
        {[
          { label:'Full Name',     val:details?.name||'',           disabled:true,  key:null },
          { label:'Phone Number',  val:details?.mobile_number||'',  disabled:true,  key:null },
          { label:'Email Address', val:details?.email||'',          disabled:true,  key:null, full:true },
          { label:'Date of Birth', val:form.date_of_birth,          key:'date_of_birth', type:'date' },
          { label:'Gender',        val:form.gender,                  key:'gender',        isSelect:true },
          { label:"Mother's Name", val:form.mother_name,             key:'mother_name' },
          { label:"Father's Name", val:form.father_name,             key:'father_name' },
          { label:'Correspondence Address', val:form.corresponding_address, key:'corresponding_address', full:true },
          { label:'Permanent Address',      val:form.permanent_address,     key:'permanent_address',     full:true },
        ].map(f => (
          <div key={f.label} className="field" style={f.full ? { gridColumn:'1/-1' } : {}}>
            <label>{f.label}</label>
            {f.isSelect ? (
              <select value={f.val} disabled={!editMode||f.disabled} onChange={e=>f.key&&set(f.key,e.target.value)}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <input type={f.type||'text'} value={f.val} disabled={!editMode||f.disabled}
                onChange={e=>f.key&&set(f.key,e.target.value)} placeholder={f.label} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
