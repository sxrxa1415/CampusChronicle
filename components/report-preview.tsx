'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Eye, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';

interface ReportPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  report: {
    id: string;
    title: string;
    department: string;
    date: string;
    status: string;
    sections: {
      name: string;
      content: string;
    }[];
  };
}

export function ReportPreview({ isOpen, onClose, report }: ReportPreviewProps) {
  const { showToast } = useAppStore();
  const [activeSection, setActiveSection] = useState(0);

  const handleDownload = () => {
    showToast('Report downloading...', 'success');
  };

  const handleShare = () => {
    showToast('Share link copied to clipboard!', 'success');
  };

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
          className="w-full max-w-4xl max-h-[80vh] overflow-y-auto"
        >
          <Card className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6 pb-6 border-b border-border">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{report.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{report.department}</p>
                <div className="flex gap-3 mt-3">
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                    {report.status}
                  </span>
                  <span className="inline-block px-3 py-1 text-xs font-medium text-muted-foreground">
                    {report.date}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {report.sections.map((section, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSection(idx)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                    activeSection === idx
                      ? 'bg-primary text-white'
                      : 'bg-muted text-foreground hover:bg-muted/70'
                  }`}
                >
                  {section.name}
                </button>
              ))}
            </div>

            {/* Content */}
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-muted rounded-lg min-h-96"
            >
              <h3 className="font-semibold text-foreground mb-3">
                {report.sections[activeSection].name}
              </h3>
              <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
                {report.sections[activeSection].content}
              </p>
            </motion.div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <Button onClick={handleDownload} className="gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={handleShare} className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
