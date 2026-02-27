'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: { container: 'w-6 h-6', dot: 'w-2 h-2' },
    md: { container: 'w-10 h-10', dot: 'w-3 h-3' },
    lg: { container: 'w-16 h-16', dot: 'w-4 h-4' },
  };

  const dots = [0, 1, 2];

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`flex gap-2 ${sizeMap[size].container}`}>
        {dots.map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 0.8,
              delay: i * 0.1,
              repeat: Infinity,
            }}
            className={`${sizeMap[size].dot} bg-primary rounded-full`}
          />
        ))}
      </div>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
