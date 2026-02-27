'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'pending' | 'warning' | 'info';
  timestamp: string;
  read: boolean;
}

export function NotificationBadge() {
  const [isOpen, setIsOpen] = useState(false);
  const notifications: NotificationItem[] = [
    {
      id: '1',
      title: 'Report Approved',
      message: 'Your annual report has been approved by the admin',
      type: 'success',
      timestamp: '2 hours ago',
      read: false,
    },
    {
      id: '2',
      title: 'Pending Review',
      message: '3 entries are pending review from department head',
      type: 'pending',
      timestamp: '1 day ago',
      read: false,
    },
    {
      id: '3',
      title: 'Submission Deadline',
      message: 'Submit your final report before March 31st',
      type: 'warning',
      timestamp: '3 days ago',
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
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
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer ${
                          !notif.read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          {getIcon(notif.type)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">
                              {notif.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notif.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {notif.timestamp}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t border-border">
                  <Button variant="outline" className="w-full text-xs">
                    View All Notifications
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
