"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import LocationModal from './LocationModal';

export default function LocationModalProxy() {
     const pathname = usePathname();
     const isAdmin = pathname?.startsWith('/admin');

     if (isAdmin) {
          return null;
     }

     return <LocationModal />;
}
