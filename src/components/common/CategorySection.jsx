import { useNavigate } from 'react-router-dom';
import lecimg from '../../assets/icons/guestlect.png';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function CategorySection({ categories = [] }) {
  const navigate = useNavigate();
  const items = [
    ...categories.slice(0, 2).map(c => ({
      key: c.categoryId,
      img: `${BASE_URL}/${c.presentation_file}`,
      title: c.category_name,
      desc: c.tag_text,
      onClick: () => navigate(`/category/${c.categoryId}`),
    })),
    { key: 'guest', img: lecimg, title: 'Guest Lecturers', desc: 'Guiding Hand of the Court', onClick: () => navigate('/guest-lectures') }
  ];

  return (
    <div className="page-section">
      <div className="page-section-head">
        <h2 className="page-section-title">Categories</h2>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/categories')}>View All →</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1.1rem' }}>
        {items.map(item => (
          <div key={item.key} className="card" style={{ cursor:'pointer' }} onClick={item.onClick}>
            <div style={{ height:180, overflow:'hidden', background:'var(--gray-100)', borderRadius:'var(--radius-lg) var(--radius-lg) 0 0' }}>
              <img src={item.img} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .3s' }}
                onMouseOver={e=>e.currentTarget.style.transform='scale(1.04)'}
                onMouseOut={e=>e.currentTarget.style.transform='scale(1)'} />
            </div>
            <div className="card-body">
              <h3 style={{ fontSize:'.95rem', fontWeight:800, color:'var(--navy)', marginBottom:'.25rem' }}>{item.title}</h3>
              {item.desc && <p style={{ fontSize:'.82rem', color:'var(--gray-500)' }}>{item.desc}</p>}
              <div style={{ marginTop:'.85rem' }}>
                <span style={{ fontSize:'.8rem', fontWeight:700, color:'var(--gold)' }}>Explore →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
