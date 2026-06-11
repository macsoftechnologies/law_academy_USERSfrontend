import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../../api/cart';
import { addToWishlist, removeFromWishlist } from '../../api/wishlist';
import { useCartWishlist } from '../../context/CartWishlistContext';

export default function CartWishlistActions({ courseId, enrollType, planId, isEnrolled, courseTitle = '', hideCart = false, hideWishlist = false }) {
  const navigate = useNavigate();
  const { cart, wishlist, refresh } = useCartWishlist();
  
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  // Cart items are specific to plans, so check planId too
  const addedToCart = cart.some(item => 
    item.course_id === courseId && 
    item.enroll_type === enrollType &&
    (!planId || item.planId === planId || item.plan?.planId === planId || item.plan?.plan_id === planId)
  );
  
  // Wishlist items are per course
  const addedToWishlist = wishlist.some(item => item.course_id === courseId && item.enroll_type === enrollType);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return {};
    }
  })();
  const userId = localStorage.getItem('userId') || user?._id || user?.id;

  if (isEnrolled) {
    return null;
  }

  const handleAddToCartClick = async () => {
    if (!userId) {
      navigate('/login');
      return;
    }
    if (!planId) {
      alert('Please select a plan first.');
      return;
    }
    try {
      setCartLoading(true);
      
      await addToCart(userId, courseId, enrollType, planId);
      // Save the course title locally so Cart page can display it correctly
      if (courseTitle) {
        localStorage.setItem(`cart_title_${courseId}`, courseTitle);
      }
      await refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to add to cart. ' + (err.message || ''));
    } finally {
      setCartLoading(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!userId) {
      navigate('/login');
      return;
    }
    try {
      setWishlistLoading(true);
      if (addedToWishlist) {
        const wishlistItem = wishlist.find(item => item.course_id === courseId);
        if (wishlistItem) {
          await removeFromWishlist(userId, wishlistItem.wishlistItemId);
        }
      } else {
        await addToWishlist(userId, courseId, enrollType);
      }
      await refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to update wishlist. ' + (err.message || ''));
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
      {!hideCart && (
        <button 
          className="btn btn-outline btn-sm"
          onClick={handleAddToCartClick}
          disabled={cartLoading || addedToCart}
          style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', minHeight: 'auto', lineHeight: 1 }}
          title="Add to Cart"
        >
          {cartLoading ? '...' : addedToCart ? '✓ In Cart' : '🛒 Add to Cart'}
        </button>
      )}

      {!hideWishlist && (
        <button 
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          style={{ 
            background: addedToWishlist ? '#ffebf0' : '#f5f7fa', 
            border: '1px solid ' + (addedToWishlist ? '#ffb3c6' : '#e2e8f0'), 
            borderRadius: '50%', 
            width: '26px', 
            height: '26px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: wishlistLoading ? 'default' : 'pointer',
            color: addedToWishlist ? '#e63946' : '#a0aec0',
            fontSize: '0.9rem',
            transition: 'all 0.2s ease'
          }}
          title={addedToWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {wishlistLoading ? '...' : addedToWishlist ? '❤️' : '🤍'}
        </button>
      )}
    </div>
  );
}
