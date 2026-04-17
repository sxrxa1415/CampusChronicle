'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api-client';

export function useHydrateStore() {
  const currentUser = useAppStore((s) => s.currentUser);

  useEffect(() => {
    // Clean up legacy localStorage key
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('currentUser');
      } catch {
        // ignore
      }
    }
  }, []);

  // Hydrate users list from API when logged in (needed for notifications dispatch etc.)
  useEffect(() => {
    if (!currentUser) return;
    const store = useAppStore.getState();
    // Only hydrate if users array is empty
    if (store.users.length === 0) {
      api.getUsers().then(res => {
        if (res.success && res.data) {
          useAppStore.setState({ users: res.data as any });
        }
      }).catch(() => {/* ignore */});
    }
    // Hydrate entries
    if (store.metricEntries.length === 0) {
      api.getEntries().then(res => {
        if (res.success && res.data) {
          useAppStore.setState({ metricEntries: res.data as any });
        }
      }).catch(() => {/* ignore */});
    }
    // Hydrate notifications
    if (store.notifications.length === 0) {
      api.getNotifications().then(res => {
        if (res.success && res.data) {
          useAppStore.setState({ notifications: res.data as any });
        }
      }).catch(() => {/* ignore */});
    }
    // Hydrate templates
    if (store.reportTemplates.length === 0) {
      api.getTemplates().then(res => {
        if (res.success && res.data) {
          useAppStore.setState({ reportTemplates: res.data as any });
        }
      }).catch(() => {/* ignore */});
    }
  }, [currentUser?.id]);
}
