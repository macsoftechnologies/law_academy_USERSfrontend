const fs = require('fs');
let content = fs.readFileSync('src/components/common/CartWishlistActions.jsx', 'utf8');

// Add imports
if (!content.includes('WishlistIcon')) {
  content = content.replace(
    "import useToast from '../../hooks/useToast';",
    "import useToast from '../../hooks/useToast';\nimport WishlistIcon from './WishlistIcon';\nimport { ShoppingCart } from 'lucide-react';"
  );
}

// Replace the return block
content = content.replace(
  /<div style=\{\{ display: 'flex', gap: '0\.4rem', alignItems: 'center' \}\}>[\s\S]*?<\/div>/,
  `<div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      {!hideCart && (
        <button 
          className={\`action-btn \${addedToCart ? 'active' : ''} \${cartLoading ? 'loading' : ''}\`}
          onClick={handleAddToCartClick}
          disabled={cartLoading || addedToCart}
          style={{ borderRadius: '6px', padding: '0 0.75rem', flex: 'none', width: 'max-content' }}
          title="Add to Cart"
        >
          {cartLoading ? '...' : addedToCart ? '✓ In Cart' : (<>{<ShoppingCart size={16} color="currentColor" />} Add to Cart</>)}
        </button>
      )}

      {!hideWishlist && (
        <button 
          className={\`action-btn \${addedToWishlist ? 'active' : ''} \${wishlistLoading ? 'loading' : ''}\`}
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          style={{ borderRadius: '50%', width: '34px', padding: 0 }}
          title={addedToWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {wishlistLoading ? '...' : addedToWishlist ? <WishlistIcon size={22} color="currentColor" fill="currentColor" /> : <WishlistIcon size={22} color="currentColor" />}
        </button>
      )}
    </div>`
);

fs.writeFileSync('src/components/common/CartWishlistActions.jsx', content);
