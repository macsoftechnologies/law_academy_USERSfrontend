import { useState, useEffect } from 'react';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function BannerCarousel({ banners = [] }) {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    if (!banners.length) return;
    const t = setInterval(() => setCur(p => (p + 1) % banners.length), 4500);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) return null;
  return (
    <div className="page-section">
      <div style={{ position:'relative', borderRadius:'var(--radius-xl)', overflow:'hidden', boxShadow:'var(--shadow-md)', aspectRatio:'16/5', background:'var(--gray-100)' }}>
        <div style={{ display:'flex', height:'100%', transition:'transform .6s cubic-bezier(.77,0,.18,1)', transform:`translateX(-${cur*100}%)` }}>
          {banners.map((b,i) => (
            <div key={b.bannerId} style={{ minWidth:'100%', height:'100%', cursor:'pointer' }}
              onClick={() => window.open(b.redirect_link,'_blank','noreferrer')}>
              <img src={`${BASE_URL}/${b.banner_file}`} alt={`Banner ${i+1}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
          ))}
        </div>
        {banners.length > 1 && <>
          <button style={arrowSt('left')} onClick={e=>{e.stopPropagation();setCur(p=>(p-1+banners.length)%banners.length);}}>&#8592;</button>
          <button style={arrowSt('right')} onClick={e=>{e.stopPropagation();setCur(p=>(p+1)%banners.length);}}>&#8594;</button>
        </>}
        <div style={{ position:'absolute', bottom:'.75rem', left:'50%', transform:'translateX(-50%)', display:'flex', gap:'.4rem', zIndex:5 }}>
          {banners.map((_,i) => (
            <button key={i} onClick={e=>{e.stopPropagation();setCur(i);}}
              style={{ height:8, width:i===cur?22:8, borderRadius:i===cur?4:'50%', background:i===cur?'var(--gold)':'rgba(255,255,255,.45)', border:'none', cursor:'pointer', padding:0, transition:'all .25s' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
const arrowSt = s => ({ position:'absolute', top:'50%', [s==='left'?'left':'right']:'1rem', transform:'translateY(-50%)', width:40, height:40, borderRadius:'50%', background:'rgba(0,0,0,.35)', color:'#fff', border:'none', cursor:'pointer', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center', zIndex:5 });
