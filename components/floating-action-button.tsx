'use client';

import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

interface Action {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

interface FloatingActionButtonProps {
  actions: Action[];
}

export function FloatingActionButton({ actions }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getColorClass = (color?: string) => {
    switch (color) {
      case 'success':
        return 'bg-green-500 hover:bg-green-600';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'danger':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-primary hover:bg-primary/90';
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
        />
      )}

      {/* Action Buttons */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-24 right-4 md:hidden z-40 space-y-3"
        >
          {actions.map((action, idx) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              className={`${getColorClass(action.color)} text-white p-4 rounded-full shadow-lg flex items-center gap-2 w-max hover:shadow-xl transition-all`}
              title={action.label}
            >
              {action.icon}
              <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Main FAB Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 md:hidden z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white font-bold transition-all ${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'
        }`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Plus className="w-6 h-6" />
          )}
        </motion.div>
      </motion.button>
    </>
  );
}
