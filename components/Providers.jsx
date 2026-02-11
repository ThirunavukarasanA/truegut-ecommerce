"use client";

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { LocationProvider } from "../context/LocationContext";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import CartDrawer from "./Cart/CartDrawer";

export default function Providers({ children, googleClientId }) {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
