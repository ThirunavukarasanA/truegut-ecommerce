"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to get IP
  const getClientIp = async () => {
    try {
      const res = await fetch('https://api.ipify.org/?format=json');
      const data = await res.json();
      return data.ip;
    } catch (error) {
      console.error('Failed to fetch IP', error);
      return null;
    }
  };

  // Sync Cart with API
  const fetchCart = async () => {
    if (authLoading) return;
    setLoading(true);
    try {
      const endpoint = user ? "/api/cart" : "/api/temp-cart";
      const ip = !user ? await getClientIp() : null;

      const headers = {};
      if (ip) headers['x-client-ip'] = ip;

      const res = await fetch(endpoint, { headers });
      const data = await res.json();
      if (data.success && data.cart) {
        const cartdata = data.cart.items
          .filter(item => item.productId) // Filter out deleted products
          .map(item => ({
            ...item,
            id: item.productId._id || item.productId, // Handle populated vs unpopulated
            variantId: item.variantId?._id || item.variantId, // Handle populated vs unpopulated
            slug: item.productId.slug, // Add slug for linking
            name: item.name || item.productId.name, // Robust Fallback
            variantName: item.variantId?.name || item.variantName || "Standard", // Robust Fallback
            // Standardize Image URL: Ensure we always get a string
            image: (() => {
              const raw = item.image || item.productId.image || (item.productId.images && item.productId.images[0]);
              if (!raw) return "/images/placeholder.png";
              const url = typeof raw === "string" ? raw : raw.url;
              return url || "/images/placeholder.png";
            })(),
            price: item.price !== undefined ? item.price : (item.variantId?.price || item.productId.price || 0), // Robust Fallback
            stock: item.stock !== undefined ? item.stock : 999, // Max stock from API (default to high if missing)
            sku: item.variantId?.sku || item.productId.productCode || "",
            weight: item.variantId?.weightGrams || 0
          })) || [];
        setCartItems(cartdata);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Failed to fetch cart", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user, authLoading]);

  useEffect(() => {
    isCartOpen
      ? (document.body.style.overflow = "hidden")
      : (document.body.style.overflow = "auto");

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isCartOpen]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const addToCart = async (product) => {
    // product expected: { id/productId, variantId, quantity, ... }
    setLoading(true);
    try {
      const endpoint = user ? "/api/cart" : "/api/temp-cart";
      const payload = {
        productId: product.id || product._id,
        variantId: product.variantId,
        quantity: product.quantity || 1,
        name: product.name,
        // Ensure strictly string
        image: (() => {
          const img = product.image || (product.images && product.images[0]);
          return (typeof img === 'object' && img !== null) ? img.url : img;
        })(),
        price: product.price
      };

      const ip = !user ? await getClientIp() : null;
      const headers = { "Content-Type": "application/json" };
      if (ip) headers["x-client-ip"] = ip;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to add to cart");
        return;
      }

      // Refresh cart
      await fetchCart();
      openCart();
    } catch (error) {
      console.error("Add to cart error", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId, variantId) => {
    setLoading(true);
    try {
      const endpoint = user ? "/api/cart" : "/api/temp-cart";

      const ip = !user ? await getClientIp() : null;
      const headers = { "Content-Type": "application/json" };
      if (ip) headers["x-client-ip"] = ip;

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: headers,
        body: JSON.stringify({ productId: itemId, variantId })
      });

      if (res.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Remove from cart error", error);
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (itemId, variantId, quantity) => {
    setLoading(true);
    try {
      const endpoint = user ? "/api/cart" : "/api/temp-cart";

      const ip = !user ? await getClientIp() : null;
      const headers = { "Content-Type": "application/json" };
      if (ip) headers["x-client-ip"] = ip;

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify({ productId: itemId, variantId, quantity })
      });

      const data = await res.json();
      if (!res.ok) {
        // Optionally handle stock error toast here
        return data;
      }

      await fetchCart();
      return { success: true };
    } catch (error) {
      console.error("Update quantity error", error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        cartItems,
        addToCart,
        removeFromCart,
        updateItemQuantity,
        loading,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
