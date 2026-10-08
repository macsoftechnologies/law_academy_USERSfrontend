import React, { useState } from 'react';

export default function CategoryBuyModal({ categoryName, termsConditions, onProceed, onClose }) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [demoWatchedAgreed, setDemoWatchedAgreed] = useState(false);

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

        {/* Terms and Conditions Checkbox */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="category-terms-checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              style={{ marginTop: '0.25rem', cursor: 'pointer' }}
            />
            <label htmlFor="category-terms-checkbox" style={{ fontSize: '0.85rem', color: 'var(--gray-600)', cursor: 'pointer', lineHeight: '1.4' }}>
              I have read and agree to the <strong>Terms and Conditions</strong>
            </label>
          </div>
          
          {termsConditions && (
            <div style={{ 
              fontSize: '0.8rem', 
              color: 'var(--gray-600)', 
              lineHeight: '1.5',
              maxHeight: '120px', 
              overflowY: 'auto',
              padding: '0.75rem',
              background: '#f9fafb',
              border: '1px solid var(--border-muted)',
              borderRadius: 'var(--radius-md)',
              whiteSpace: 'pre-line'
            }}>
              {termsConditions}
            </div>
          )}
        </div>

        {/* Demo Watched Confirmation Checkbox */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="category-demo-checkbox"
              checked={demoWatchedAgreed}
              onChange={(e) => setDemoWatchedAgreed(e.target.checked)}
              style={{ marginTop: '0.25rem', cursor: 'pointer' }}
            />
            <label htmlFor="category-demo-checkbox" style={{ fontSize: '0.85rem', color: 'var(--gray-600)', cursor: 'pointer', lineHeight: '1.4' }}>
              I confirm that I have watched the free demo videos for the subjects.<br/>
              I am completely satisfied with the teaching quality.<br/>
              I understand and explicitly agree that the fee is non-refundable once paid under any circumstances.
            </label>
          </div>
        </div>
        
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
            disabled={!termsAccepted || !demoWatchedAgreed}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
