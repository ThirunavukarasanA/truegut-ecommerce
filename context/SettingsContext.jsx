"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
     const [settings, setSettings] = useState({
          storeName: "Fermentaa Kombucha",
          currency: { code: "INR", symbol: "₹" }
     });
     const [loading, setLoading] = useState(true);

     const fetchSettings = async () => {
          try {
               const res = await fetch('/api/admin/settings');
               const data = await res.json();
               if (data.success) {
                    setSettings(data.data);
               }
          } catch (error) {
               console.error("Failed to load global settings", error);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchSettings();
     }, []);

     return (
          <SettingsContext.Provider value={{ settings, loading, reloadSettings: fetchSettings }}>
               {children}
          </SettingsContext.Provider>
     );
}

export function useSettings() {
     const context = useContext(SettingsContext);
     if (!context) {
          throw new Error('useSettings must be used within a SettingsProvider');
     }
     return context;
}
