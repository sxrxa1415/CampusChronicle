'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface Step {
  label: string;
  status: 'completed' | 'current' | 'pending';
  icon?: React.ReactNode;
}

interface ProgressTrackerProps {
  steps: Step[];
  currentStep: number;
}

export function ProgressTracker({ steps, currentStep }: ProgressTrackerProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">Progress</h3>
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary to-primary/70"
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-3"
            >
              {/* Step Indicator */}
              <motion.div
                animate={{
                  scale: idx === currentStep ? 1.1 : 1,
                  backgroundColor:
                    step.status === 'completed'
                      ? 'var(--color-primary)'
                      : step.status === 'current'
                      ? 'var(--color-primary)'
                      : 'var(--color-border)',
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              >
                {step.status === 'completed' ? '✓' : idx + 1}
              </motion.div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    step.status === 'current'
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </p>
              </div>

              {/* Status Badge */}
              {step.status === 'completed' && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs font-medium text-green-600 dark:text-green-400"
                >
                  Done
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}
