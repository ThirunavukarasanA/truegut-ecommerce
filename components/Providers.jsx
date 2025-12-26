"use client";

import React from "react";
import { CartProvider } from "../context/CartContext";
import CartDrawer from "./Cart/CartDrawer";

export default function Providers({ children }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
