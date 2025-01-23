"use client"

import { scan } from 'react-scan'; // import this BEFORE react
import React, { useEffect } from 'react';


export function ReactScan() {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            scan({
                enabled: true,
                log: true, // logs render info to console (default: false)
            });
        }
    }, [])
  return <div className="hidden">React Scan mounter</div>
}