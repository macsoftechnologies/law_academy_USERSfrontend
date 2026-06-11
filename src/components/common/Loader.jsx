import React from 'react';
import './Loader.css'; // Make sure to create this file

export default function Loader({ 
  visible = true, 
  overlay = false, 
  className = '' 
}) {
  if (!visible) return null;

  const content = (
    <div className={`loader-box ${className}`}>
      {/* Three dots to match the App logic */}
      {[0, 1, 2].map((i) => (
        <div 
          key={i} 
          className={`dot ${i === 1 ? 'dot-gold' : 'dot-primary'}`} 
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );

  if (overlay) {
    return (
      <div className="loader-overlay">
        {content}
      </div>
    );
  }

  return (
    <div className="loader-inline-container">
      {content}
    </div>
  );
}