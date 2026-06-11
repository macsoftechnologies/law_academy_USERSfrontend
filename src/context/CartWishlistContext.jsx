import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCartList } from '../api/cart';
import { getWishlistList } from '../api/wishlist';

const CartWishlistContext = createContext();

export const CartWishlistProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLists = async () => {
    const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return {}; } })();
    const userId = localStorage.getItem('userId') || user?._id || user?.id;
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      const [cartRes, wishRes] = await Promise.all([
        getCartList(userId).catch(() => ({ data: [] })),
        getWishlistList(userId).catch(() => ({ data: [] }))
      ]);
      if (cartRes?.data) setCart(cartRes.data);
      if (wishRes?.data) setWishlist(wishRes.data);
    } catch (err) {
      console.error('Failed to fetch cart/wishlist', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  return (
    <CartWishlistContext.Provider value={{ cart, wishlist, refresh: fetchLists, loading }}>
      {children}
    </CartWishlistContext.Provider>
  );
};

export const useCartWishlist = () => useContext(CartWishlistContext);
