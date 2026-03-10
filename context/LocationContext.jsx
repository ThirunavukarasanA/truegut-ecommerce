"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { secureFetch } from "@/utils/secureFetch";
import { usePathname } from "next/navigation";

const LocationContext = createContext();

export function LocationProvider({ children }) {
     const pathname = usePathname();
     const isAdmin = pathname?.startsWith("/admin");

     const [location, setLocation] = useState({
          pincode: "",
          postOffice: "",
          vendorId: null,
          vendorName: "",
          isServiceable: false,
     });
     const [isLoaded, setIsLoaded] = useState(false);
     const [isModalOpen, setIsModalOpen] = useState(false);

     useEffect(() => {
          // Skip if admin
          if (isAdmin) {
               setIsLoaded(true);
               return;
          }

          const initLocation = async () => {
               try {
                    // Try to fetch from server first
                    const data = await secureFetch("/api/temp-customer");
                    if (data && data.success) {
                         const tempCustomer = data;
                         if (tempCustomer && tempCustomer.location) {
                              setLocation(prev => ({
                                   ...prev,
                                   ...tempCustomer.location,
                                   isServiceable: !!tempCustomer.location.pincode // If pincode exists on server, it was previously serviceable
                              }));
                         }
                    }
               } catch (e) {
                    console.error("Failed to fetch location", e);
               } finally {
                    setIsLoaded(true);
               }
          };

          initLocation();
     }, [isAdmin]); // Re-run if admin status changes (e.g. navigation)

     const updateLocation = async (newLocation) => {
          if (isAdmin) return;

          // Stability Guard: Don't update if data is identical to current state
          const isChanged = Object.keys(newLocation).some(key => newLocation[key] !== location[key]);
          if (!isChanged) return;

          // Optimistic update
          setLocation(prev => ({ ...prev, ...newLocation }));

          // Only sync to server if we have a pincode OR we are explicitly clearing (via clearLocation)
          // Actually, updateLocation is for partials. Let's just avoid redundant POSTs.
          try {
               await secureFetch("/api/temp-customer", {
                    method: "POST",
                    body: { location: { ...location, ...newLocation } } // Send full updated location
               });
          } catch (e) {
               console.error("Failed to sync location", e);
               // Revert? For now, we trust optimistic.
          }
     };

     const clearLocation = async () => {
          if (isAdmin) return;

          const emptyLocation = { pincode: "", postOffice: "", vendorId: null, vendorName: "", isServiceable: false };
          setLocation(emptyLocation);
          try {
               // We send empty location to clear it on server
               await secureFetch("/api/temp-customer", {
                    method: "POST",
                    body: { location: emptyLocation }
               });
          } catch (e) {
               console.error("Failed to clear location", e);
          }
     };

     return (
          <LocationContext.Provider
               value={{
                    ...location,
                    updateLocation,
                    clearLocation,
                    isLoaded,
                    isLocationSet: !!location.pincode,
                    isModalOpen,
                    openModal: () => setIsModalOpen(true),
                    closeModal: () => setIsModalOpen(false),
                    isAdmin // Expose if needed
               }}
          >
               {children}
          </LocationContext.Provider>
     );
}

export function useLocation() {
     const context = useContext(LocationContext);
     if (!context) {
          throw new Error("useLocation must be used within a LocationProvider");
     }
     return context;
}
