'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface EntryFormProps {
  onSubmit?: (data: Record<string, any>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function EntryForm({ onSubmit, onCancel, isLoading = false }: EntryFormProps) {

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    value: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category) {
      toast.error('Please fill all required fields');
      return;
    }

    onSubmit?.(formData);
    toast.success('Entry submitted successfully!');
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
          placeholder="Enter name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
          placeholder="Enter description"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
            required
          >
            <option value="">Select category</option>
            <option value="academic">Academic</option>
            <option value="research">Research</option>
            <option value="events">Events</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Value
          </label>
          <input
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
            placeholder="Enter value"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Entry'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </motion.form>
  );
}
