"use client";

import React from "react";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import CartDrawer from "./Cart/CartDrawer";

import { LocationProvider } from "../context/LocationContext";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
