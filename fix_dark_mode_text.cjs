const fs = require('fs');
let content = fs.readFileSync('src/styles/components.css', 'utf8');

// Replace var(--white) with #ffffff in the [data-theme="dark"] .action-btn blocks
content = content.replace(
  /\[data-theme="dark"\] \.action-btn \{\s*background: rgba\(255, 255, 255, 0\.08\);\s*border-color: rgba\(255, 255, 255, 0\.12\);\s*color: var\(--white\);\s*\}/,
  `[data-theme="dark"] .action-btn {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}`
);

fs.writeFileSync('src/styles/components.css', content);
