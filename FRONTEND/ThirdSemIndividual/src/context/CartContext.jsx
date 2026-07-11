// src/context/CartContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  // Calculate dynamic storage key based on user authentication status
  const cartStorageKey = user ? `cart_user_${user.id}` : 'cart_guest';

  // Synchronously initialize state based on active user credentials from localStorage
  const [cartItems, setCartItems] = useState(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    let initialKey = 'cart_guest';
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        initialKey = `cart_user_${parsedUser.id}`;
      } catch (e) {
        console.error('Failed to parse user from localStorage:', e);
      }
    }
    
    const savedCart = localStorage.getItem(initialKey);
    try {
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      console.error('Failed to parse initial cart from localStorage:', e);
      return [];
    }
  });

  // Track the key that matches the current loaded cartItems state to prevent race conditions
  const [lastLoadedKey, setLastLoadedKey] = useState(cartStorageKey);

  // Sync state whenever the active account key changes (e.g. login, logout, user switch)
  useEffect(() => {
    if (cartStorageKey !== lastLoadedKey) {
      const savedCart = localStorage.getItem(cartStorageKey);
      let loadedItems = [];
      try {
        loadedItems = savedCart ? JSON.parse(savedCart) : [];
      } catch (e) {
        console.error('Failed to parse cart on user transition:', e);
      }
      setCartItems(loadedItems);
      setLastLoadedKey(cartStorageKey);
    }
  }, [cartStorageKey, lastLoadedKey]);

  // Persist cart items to localStorage ONLY if the state matches the active user key
  useEffect(() => {
    if (cartStorageKey === lastLoadedKey) {
      localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
    }
  }, [cartItems, cartStorageKey, lastLoadedKey]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevItems, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}
    >
      {children}
    </CartContext.Provider>
  );
};
