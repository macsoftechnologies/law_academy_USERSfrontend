const fs = require('fs');
let content = fs.readFileSync('src/components/common/CartWishlistActions.jsx', 'utf8');

// Replace pink background with light blue
content = content.replace(
  "background: addedToWishlist ? '#ffebf0' : '#f5f7fa',",
  "background: addedToWishlist ? '#e0f2fe' : '#f5f7fa',"
);

// Replace pink border with light blue border
content = content.replace(
  "border: '1px solid ' + (addedToWishlist ? '#ffb3c6' : '#e2e8f0'),",
  "border: '1px solid ' + (addedToWishlist ? '#bae6fd' : '#e2e8f0'),"
);

// Replace red color with navy
content = content.replace(
  "color: addedToWishlist ? '#e63946' : '#a0aec0',",
  "color: addedToWishlist ? 'var(--navy)' : '#a0aec0',"
);

fs.writeFileSync('src/components/common/CartWishlistActions.jsx', content);
