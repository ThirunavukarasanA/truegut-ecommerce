"use client";

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { LocationProvider } from "../context/LocationContext";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import CartDrawer from "./Cart/CartDrawer";
import GlobalLocationModal from "./Location/GlobalLocationModal";

export default function Providers({ children, googleClientId }) {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            {children}
            <CartDrawer />
            <GlobalLocationModal />
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
