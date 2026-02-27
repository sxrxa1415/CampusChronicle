'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  imageUrl?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  imageUrl,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-[400px] p-4"
    >
      <Card className="text-center max-w-md p-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="mb-4 flex justify-center"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-32 h-32 object-contain"
            />
          ) : (
            <div className="text-6xl">{icon}</div>
          )}
        </motion.div>

        <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mb-6">{description}</p>
        )}

        {actionLabel && onAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button onClick={onAction}>{actionLabel}</Button>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
