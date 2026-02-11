"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
     const [user, setUser] = useState(null);
     const [loading, setLoading] = useState(true);
     const router = useRouter();

     useEffect(() => {
          checkUserLoggedIn();
     }, []);

     const checkUserLoggedIn = async () => {
          try {
               // We can check if the user is verified by calling a /me endpoint or just relying on cookie presence for now.
               // Since we don't have a specific /me endpoint for customers yet, we can infer from cookie if needed,
               // but best practice is to have an endpoint.
               // For now, let's assume we store user info in localStorage ON LOGIN for simple UI persistence,
               // but verify with API in real apps.

               // Let's create a verify function:
               // We don't have a /api/auth/me? We should probably add one or use the login response.
               // For this MVP, let's look for localStorage 'customer_info' which we will set on login.
               const storedUser = localStorage.getItem("customer_info");
               if (storedUser) {
                    setUser(JSON.parse(storedUser));
               }
          } catch (error) {
               console.error("Auth check failed", error);
          } finally {
               setLoading(false);
          }
     };

     const login = (userData) => {
          setUser(userData);
          localStorage.setItem("customer_info", JSON.stringify(userData));
     };

     const logout = async () => {
          // Call logout API to remove cookie
          try {
               await fetch("/api/auth/logout", { method: "POST" }); // We need to ensure this endpoint exists generic or specific
               // If we don't have specific customer logout, we can use the generic one or create one.
               // Assuming we'll handle cookie deletion.
          } catch (err) {
               console.error("Logout error", err);
          }
          setUser(null);
          localStorage.removeItem("customer_info");
          router.push("/login");
     };

     return (
          <AuthContext.Provider value={{ user, loading, login, logout }}>
               {children}
          </AuthContext.Provider>
     );
}

export function useAuth() {
     return useContext(AuthContext);
}
