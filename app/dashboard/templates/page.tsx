'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Copy, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';

const templates = [
  {
    id: '1',
    name: 'Standard Annual Report',
    description: 'Default template with all standard sections',
    sections: ['Overview', 'Achievements', 'Challenges', 'Statistics', 'Future Plans'],
    usage: 128,
  },
  {
    id: '2',
    name: 'Research Focused',
    description: 'Emphasizes research output and publications',
    sections: ['Research Areas', 'Publications', 'Grants', 'Collaborations', 'Patents'],
    usage: 45,
  },
  {
    id: '3',
    name: 'Student Outcomes',
    description: 'Focus on student achievements and placements',
    sections: ['Placements', 'Internships', 'Competitions', 'Alumni Success', 'Feedback'],
    usage: 67,
  },
];

export default function TemplatesPage() {
  const { showToast } = useAppStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleDuplicate = (templateId: string) => {
    showToast('Template duplicated successfully!', 'success');
  };

  const handleDelete = (templateId: string) => {
    showToast('Template deleted successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Report Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and customize report templates</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template, idx) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Sections</p>
                  <div className="flex flex-wrap gap-1">
                    {template.sections.map((section) => (
                      <span
                        key={section}
                        className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                      >
                        {section}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">Used {template.usage} times</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={(e) => {
                    e.stopPropagation();
                  }}>
                    <Eye className="w-3 h-3" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicate(template.id);
                  }}>
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(template.id);
                  }}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
