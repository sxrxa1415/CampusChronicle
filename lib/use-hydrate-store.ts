'use client';

import { useEffect } from 'react';

export function useHydrateStore() {
  useEffect(() => {
    // Clean up the legacy localStorage key from v1 that was causing the infinite auto-login bug upon logout, 
    // now that we rely strictly on Zustand's persist middleware for everything.
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('currentUser');
      } catch (error) {
        // ...
      }
    }
  }, []);
}
