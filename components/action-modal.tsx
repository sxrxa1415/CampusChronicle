'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: 'default' | 'destructive' | 'outline';
  showCancelButton?: boolean;
  isLoading?: boolean;
}

export function ActionModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  actionLabel = 'Confirm',
  onAction,
  actionVariant = 'default',
  showCancelButton = true,
  isLoading = false,
}: ActionModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">{title}</h2>
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {children && <div className="mb-6">{children}</div>}

            <div className="flex gap-3">
              {showCancelButton && (
                <Button variant="outline" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
              )}
              <Button
                onClick={onAction}
                disabled={isLoading}
                variant={actionVariant as any}
                className="flex-1"
              >
                {isLoading ? 'Processing...' : actionLabel}
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
