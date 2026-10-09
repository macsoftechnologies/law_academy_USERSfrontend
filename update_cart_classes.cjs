const fs = require('fs');
let content = fs.readFileSync('src/components/common/CartWishlistActions.jsx', 'utf8');

const newContent = content.replace(
  /<button[\s\S]*?onClick=\{handleAddToCartClick\}[\s\S]*?<\/button>/,
  `<button 
          className={\`action-btn \${addedToCart ? 'active' : ''} \${cartLoading ? 'loading' : ''}\`}
          onClick={handleAddToCartClick}
          disabled={cartLoading || addedToCart}
          style={{ borderRadius: '6px', padding: '0 0.75rem', width: 'max-content' }}
          title="Add to Cart"
        >
          {cartLoading ? '...' : addedToCart ? '✓ In Cart' : (<>{<ShoppingCart size={16} color="var(--navy)" />} Add to Cart</>)}
        </button>`
).replace(
  /<button[\s\S]*?onClick=\{handleToggleWishlist\}[\s\S]*?<\/button>/,
  `<button 
          className={\`action-btn \${addedToWishlist ? 'active' : ''} \${wishlistLoading ? 'loading' : ''}\`}
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          style={{ borderRadius: '50%', width: '34px' }}
          title={addedToWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {wishlistLoading ? '...' : addedToWishlist ? <WishlistIcon size={22} color="var(--navy)" fill="var(--navy)" /> : <WishlistIcon size={22} color="var(--navy)" />}
        </button>`
);

fs.writeFileSync('src/components/common/CartWishlistActions.jsx', newContent);
