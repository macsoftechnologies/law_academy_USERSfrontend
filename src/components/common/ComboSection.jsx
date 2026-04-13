import { useState } from 'react';

const COMBOS = [
  { key:'combo1', emoji: '🏆', title: 'Judiciary Full Preparation Package', price: '₹4,999', strike: '₹12,999', off: '62% off' },
  { key:'combo2', emoji: '📚', title: 'Law Entrance Combo — CLAT + AILET', price: '₹3,499', strike: '₹8,999', off: '61% off' },
  { key:'combo3', emoji: '⚖️', title: 'Civil & Criminal Law Combo Pack', price: '₹2,999', strike: '₹6,999', off: '57% off' },
  { key:'combo4', emoji: '🎓', title: 'AIBE Complete Preparation Combo', price: '₹3,999', strike: '₹9,499', off: '58% off' },
  ];

export default function ComboSection() {
  return (
    <div className="page-section">
      <div className="page-section-head">
        <h2 className="page-section-title">Combo Courses</h2>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1.1rem' }}>
        {COMBOS.map(item => (
          <div key={item.key} className="card" style={{ cursor:'pointer' }}>
            <div style={{
              height:180,
              overflow:'hidden',
              background:'var(--gray-100)',
              borderRadius:'var(--radius-lg) var(--radius-lg) 0 0',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              fontSize:'2rem'
            }}>
              {item.emoji}
            </div>
            <div className="card-body">
              <h3 style={{ fontSize:'.95rem', fontWeight:800, color:'var(--navy)', marginBottom:'.25rem' }}>{item.title}</h3>
              <div style={{ fontSize:'.82rem', color:'var(--gray-500)', marginBottom:'.5rem' }}>
                <span style={{ fontWeight:700, color:'var(--gold)', marginRight:'.5rem' }}>{item.price}</span>
                <span style={{ textDecoration:'line-through', color:'var(--gray-400)' }}>{item.strike}</span>
                <span style={{ marginLeft:'.5rem', color:'var(--green-500)' }}>{item.off}</span>
              </div>
              <div style={{ marginTop:'.85rem' }}>
                <span style={{ fontSize:'.8rem', fontWeight:700, color:'var(--gold)' }}>Enroll →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}