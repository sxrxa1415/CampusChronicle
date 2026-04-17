'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api-client';

export function NotificationBadge() {
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  const safeNotifs = Array.isArray(notifications) ? notifications : [];
  const myNotifs = safeNotifs.filter((n) => n.userId === currentUser?.id);
  const unreadCount = myNotifs.filter(n => !n.isRead).length;

  const getIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('approved') || lower.includes('success')) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (lower.includes('pending') || lower.includes('review')) return <Clock className="w-4 h-4 text-yellow-500" />;
    if (lower.includes('reject') || lower.includes('deadline')) return <AlertCircle className="w-4 h-4 text-orange-500" />;
    return <Bell className="w-4 h-4 text-blue-500" />;
  };

  const handleMarkRead = async (id: string) => {
    markNotificationRead(id);
    try { await api.markNotificationRead(id); } catch { /* fallback already applied */ }
  };

  const handleMarkAll = async () => {
    markAllNotificationsRead();
    try { await api.markAllNotificationsRead(); } catch { /* fallback already applied */ }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-96 z-50"
            >
              <Card className="shadow-lg">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAll}
                        className="text-xs text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {myNotifs.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <p>No notifications</p>
                    </div>
                  ) : (
                    myNotifs.slice(0, 10).map((notif) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                        className={`p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer ${
                          !notif.isRead ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          {getIcon(notif.title)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">
                              {notif.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notif.message}
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-2">
                              {new Date(notif.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t border-border">
                  <Button variant="outline" className="w-full text-xs" onClick={() => setIsOpen(false)}>
                    Close
                  </Button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
