const fs = require('fs');
let content = fs.readFileSync('src/components/common/CartWishlistActions.jsx', 'utf8');

// Fix the stretching of the "Add to Cart" button by adding flex: none and width: max-content
content = content.replace(
  "style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', minHeight: 'auto', lineHeight: 1 }}",
  "style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', minHeight: 'auto', lineHeight: 1, flex: 'none', width: 'max-content' }}"
);

fs.writeFileSync('src/components/common/CartWishlistActions.jsx', content);
