'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'pending';
  color?: 'primary' | 'success' | 'warning' | 'error';
}

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  const getColorClass = (color?: string) => {
    switch (color) {
      case 'success':
        return 'bg-green-500/20 border-green-500/50';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/50';
      case 'error':
        return 'bg-red-500/20 border-red-500/50';
      default:
        return 'bg-primary/20 border-primary/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'w-3 h-3 bg-green-500 rounded-full';
      case 'current':
        return 'w-4 h-4 bg-primary rounded-full animate-pulse';
      default:
        return 'w-3 h-3 bg-muted rounded-full';
    }
  };

  return (
    <div className="space-y-6">
      {events.map((event, idx) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="relative flex gap-4"
        >
          {/* Timeline Line */}
          {idx !== events.length - 1 && (
            <div className="absolute left-1.5 top-8 w-0.5 h-16 bg-border" />
          )}

          {/* Status Dot */}
          <div className={`mt-1 ${getStatusColor(event.status)}`} />

          {/* Content */}
          <Card className={`flex-1 p-4 border-l-4 ${getColorClass(event.color)}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium">{event.date}</p>
                <h4 className="font-semibold text-foreground mt-1">{event.title}</h4>
                {event.description && (
                  <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                )}
              </div>
              <span
                className={`ml-2 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                  event.status === 'completed'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : event.status === 'current'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
