"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to manage account-related data like orders.
 * @param {Object} user - The authenticated user object from AuthContext.
 */
export function useAccountData(user) {
     const [orders, setOrders] = useState([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);

     useEffect(() => {
          const fetchOrders = async () => {
               if (!user?.email) {
                    setLoading(false);
                    return;
               }

               try {
                    setLoading(true);
                    const res = await fetch(`/api/orders?email=${user.email}`);
                    const data = await res.json();

                    if (data.success) {
                         // Sort orders by newest first
                         const sortedOrders = data.data.sort((a, b) =>
                              new Date(b.createdAt) - new Date(a.createdAt)
                         );
                         setOrders(sortedOrders);
                    } else {
                         setError(data.error || "Failed to fetch orders");
                    }
               } catch (err) {
                    console.error("Account data fetch error:", err);
                    setError("An error occurred while loading your account data.");
               } finally {
                    setLoading(false);
               }
          };

          if (user) {
               fetchOrders();
          } else {
               setLoading(false);
          }
     }, [user?.email]);

     return {
          orders,
          loading,
          error,
          refreshOrders: () => {
               setLoading(true);
               // Re-fetch logic or just trigger effect
          }
     };
}
