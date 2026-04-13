import { useState } from 'react';

const BEST_SELLERS = [
  { key:'bs1', emoji: '⚖️', title: 'Criminal Law Mastery', price: '₹1,999', strike: '₹4,999', off: '60% off' },
  { key:'bs2', emoji: '📜', title: 'Civil Law Complete Guide', price: '₹2,499', strike: '₹5,999', off: '58% off' },
  { key:'bs3', emoji: '🏛️', title: 'Indian Constitution Deep Dive', price: '₹1,499', strike: '₹3,499', off: '57% off' },
  { key:'bs4', emoji: '📋', title: 'Evidence Act Masterclass', price: '₹1,299', strike: '₹2,999', off: '57% off' },
];

export default function BestSellerSection() {
  return (
    <div className="page-section">
      <div className="page-section-head">
        <h2 className="page-section-title">Best Sellers</h2>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1.1rem' }}>
        {BEST_SELLERS.map(item => (
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