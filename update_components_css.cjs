const fs = require('fs');
let content = fs.readFileSync('src/styles/components.css', 'utf8');

const newCSS = `
/* Action Buttons (Cart & Wishlist) */
.action-btn {
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
  color: var(--navy);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
  cursor: pointer;
  font-weight: 600;
  height: 34px;
  flex: none;
  font-size: 0.75rem;
}
.action-btn:disabled, .action-btn.loading {
  cursor: default;
}
.action-btn.active {
  background: #e0f2fe;
  border: 1px solid #bae6fd;
  color: var(--navy);
}

/* Dark Mode Overrides */
[data-theme="dark"] .action-btn {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  color: var(--white);
}
[data-theme="dark"] .action-btn.active {
  background: rgba(14, 165, 233, 0.15);
  border-color: rgba(14, 165, 233, 0.3);
  color: #7dd3fc;
}
`;

content += newCSS;
fs.writeFileSync('src/styles/components.css', content);
