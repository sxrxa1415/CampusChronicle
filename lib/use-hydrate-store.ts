'use client';

import { useEffect } from 'react';
import { useAppStore } from './store';
import type { InstituteUser } from './types';

export function useHydrateStore() {
  useEffect(() => {
    // Restore persisted user from localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          const user = JSON.parse(savedUser) as InstituteUser;
          useAppStore.setState({ currentUser: user });
        }
      } catch (error) {
        console.error('[v0] Failed to restore user from localStorage:', error);
      }
    }
  }, []);
}
