'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface CallToActionProps {
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  image?: string;
  variant?: 'primary' | 'success' | 'warning' | 'info';
  fullWidth?: boolean;
}

export function CallToAction({
  title,
  description,
  primaryAction,
  secondaryAction,
  image,
  variant = 'primary',
  fullWidth = false,
}: CallToActionProps) {
  const getGradient = () => {
    switch (variant) {
      case 'success':
        return 'from-green-500/10 to-green-500/5';
      case 'warning':
        return 'from-yellow-500/10 to-yellow-500/5';
      case 'info':
        return 'from-blue-500/10 to-blue-500/5';
      default:
        return 'from-primary/10 to-primary/5';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={fullWidth ? 'w-full' : ''}
    >
      <Card className={`relative overflow-hidden bg-gradient-to-br ${getGradient()} p-8 md:p-12`}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12" />

        {/* Content */}
        <div className="relative z-10">
          <div className={`grid gap-8 ${image ? 'md:grid-cols-2' : ''}`}>
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col justify-center"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                {title}
              </h2>
              {description && (
                <p className="text-muted-foreground text-base md:text-lg mb-6 leading-relaxed">
                  {description}
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {primaryAction && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={primaryAction.onClick}
                      className="gap-2"
                      size="lg"
                    >
                      {primaryAction.label}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
                {secondaryAction && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={secondaryAction.onClick}
                      variant="outline"
                      size="lg"
                    >
                      {secondaryAction.label}
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Image Content */}
            {image && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="hidden md:flex items-center justify-center"
              >
                <img
                  src={image}
                  alt={title}
                  className="max-w-full h-auto rounded-lg"
                />
              </motion.div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
