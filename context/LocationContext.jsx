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
                              setLocation(prev => ({ ...prev, ...tempCustomer.location }));
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

          // Optimistic update
          setLocation(prev => ({ ...prev, ...newLocation }));

          try {
               await secureFetch("/api/temp-customer", {
                    method: "POST",
                    body: { location: newLocation }
               });
          } catch (e) {
               console.error("Failed to sync location", e);
               // Revert? For now, we trust optimistic.
          }
     };

     const clearLocation = async () => {
          if (isAdmin) return;

          const emptyLocation = { pincode: "", postOffice: "", vendorId: null, vendorName: "" };
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
