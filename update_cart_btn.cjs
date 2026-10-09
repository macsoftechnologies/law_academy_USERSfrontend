const fs = require('fs');
let content = fs.readFileSync('src/components/common/CartWishlistActions.jsx', 'utf8');

// The goal is to completely rewrite the Add to Cart button in CartWishlistActions.jsx
// so its style matches the Wishlist button's style.

const newButton = `<button 
          onClick={handleAddToCartClick}
          disabled={cartLoading || addedToCart}
          style={{ 
            background: addedToCart ? '#e0f2fe' : '#f5f7fa',
            border: '1px solid ' + (addedToCart ? '#bae6fd' : '#e2e8f0'),
            color: 'var(--navy)',
            borderRadius: '6px',
            padding: '0 0.75rem',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: cartLoading || addedToCart ? 'default' : 'pointer',
            transition: 'all 0.2s ease',
            flex: 'none',
            width: 'max-content'
          }}
          title="Add to Cart"
        >
          {cartLoading ? '...' : addedToCart ? '✓ In Cart' : (<>{<ShoppingCart size={16} color="var(--navy)" />} Add to Cart</>)}
        </button>`;

const regex = /<button\s+className="btn btn-outline btn-sm"[\s\S]*?<\/button>/;
content = content.replace(regex, newButton);

fs.writeFileSync('src/components/common/CartWishlistActions.jsx', content);
