import React from 'react';

export default function CategoryBuyModal({ categoryName, onProceed, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', maxWidth: '420px', width: '100%',
        boxShadow: '0 12px 32px rgba(0,0,0,0.2)', padding: '30px', textAlign: 'center',
        animation: 'slideUp .3s ease'
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>📦</div>
        <h2 style={{ color: 'var(--navy)', marginBottom: '12px', fontSize: '1.4rem' }}>
          Unlock Full Category
        </h2>
        <p style={{ color: 'var(--gray-600)', lineHeight: '1.6', marginBottom: '25px', fontSize: '0.95rem' }}>
          Purchasing this item will unlock the entire <strong style={{color: 'var(--navy)'}}>{categoryName || 'Prelims'}</strong> category, including all related PYQs, Mock Tests, and Quizzes!
        </p>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            className="btn btn-outline" 
            style={{ flex: 1, padding: '10px' }} 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="btn btn-gold" 
            style={{ flex: 1, padding: '10px' }} 
            onClick={onProceed}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
