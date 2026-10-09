import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../../api/cart';
import { addToWishlist, removeFromWishlist } from '../../api/wishlist';
import { useCartWishlist } from '../../context/CartWishlistContext';
import useToast from '../../hooks/useToast';
import WishlistIcon from './WishlistIcon';
import { ShoppingCart } from 'lucide-react';

export default function CartWishlistActions({ courseId, enrollType, planId, isEnrolled, courseTitle = '', hideCart = false, hideWishlist = false }) {
  const navigate = useNavigate();
  const { cart, wishlist, refresh } = useCartWishlist();
  const { showToast, ToastContainer } = useToast();
  
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
      showToast('warning', 'Please select a plan first.');
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
      showToast('error', 'Failed to add to cart. ' + (err.message || ''));
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
      showToast('error', 'Failed to update wishlist. ' + (err.message || ''));
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      {!hideCart && (
        <button 
          className={`action-btn ${addedToCart ? 'active' : ''} ${cartLoading ? 'loading' : ''}`}
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
          className={`action-btn ${addedToWishlist ? 'active' : ''} ${wishlistLoading ? 'loading' : ''}`}
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          style={{ borderRadius: '50%', width: '34px', padding: 0 }}
          title={addedToWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {wishlistLoading ? '...' : addedToWishlist ? <WishlistIcon size={22} color="currentColor" fill="currentColor" /> : <WishlistIcon size={22} color="currentColor" />}
        </button>
      )}
    </div>
    </>
  );
}
