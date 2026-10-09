const fs = require('fs');
let content = fs.readFileSync('src/components/common/CartWishlistActions.jsx', 'utf8');

content = content.replace(/width:\s*'26px',\s*height:\s*'26px',/, "width: '34px', \n            height: '34px',");
// Increase SVG size to 22 if not already
content = content.replace(/size=\{18\}/g, "size={22}");
// Change wrapper to space-between
content = content.replace(/<div style=\{\{\s*display:\s*'flex',\s*gap:\s*'0.4rem',\s*alignItems:\s*'center'\s*\}\}>/, "<div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>");

fs.writeFileSync('src/components/common/CartWishlistActions.jsx', content);
