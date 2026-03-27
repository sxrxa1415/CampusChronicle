'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Copy, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import type { ReportSectionType, InstituteReportTemplate, ReportMetricCategory } from '@/lib/types';

const CATEGORY_OPTIONS: { value: ReportMetricCategory; label: string }[] = [
  { value: "ACADEMIC", label: "Academic" },
  { value: "RESEARCH", label: "Research" },
  { value: "STUDENT_ACHIEVEMENT", label: "Student Achievement" },
  { value: "FACULTY_ACHIEVEMENT", label: "Faculty Achievement" },
  { value: "EXTRACURRICULAR", label: "Extracurricular" },
  { value: "INFRASTRUCTURE", label: "Infrastructure" },
  { value: "FINANCIAL", label: "Financial" },
  { value: "OTHER", label: "Other" },
];

export default function TemplatesPage() {
  const router = useRouter();
  const { 
    currentUser, reportTemplates, 
    addReportTemplate, deleteReportTemplate, updateReportTemplate,
    showToast 
  } = useAppStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newT, setNewT] = useState({ name: "", description: "", targetCategory: "" as ReportMetricCategory });
  const [editingTemplate, setEditingTemplate] = useState<InstituteReportTemplate | null>(null);

  if (!currentUser) return null;
  const isAdmin = currentUser.role === "ADMIN";

  const handleDuplicate = (template: InstituteReportTemplate) => {
    addReportTemplate({
      ...template,
      id: `rt_${Date.now()}`,
      name: `${template.name} (Copy)`,
      usage: 0,
      createdAt: new Date().toISOString()
    });
    showToast('Template duplicated successfully!', 'success');
  };

  const handleDelete = (templateId: string) => {
    deleteReportTemplate(templateId);
    showToast('Template deleted successfully!', 'success');
  };

  const handleCreate = () => {
    if (!newT.name || !newT.targetCategory) return showToast("Template needs a name and target category.", "warning");
    addReportTemplate({
      id: `rt_${Date.now()}`,
      name: newT.name,
      description: newT.description,
      targetCategory: newT.targetCategory,
      sections: ["COVER", "CUSTOM"],
      usage: 0,
      createdByAdminId: currentUser.id,
      createdAt: new Date().toISOString()
    });
    setIsAddOpen(false);
    setNewT({ name: "", description: "", targetCategory: "OTHER" });
    showToast("Template Created!", "success");
  };

  const handleSaveEdit = () => {
    if (!editingTemplate || !editingTemplate.name || !editingTemplate.targetCategory) return showToast("Template needs a name and category.", "warning");
    updateReportTemplate(editingTemplate.id, {
      name: editingTemplate.name,
      description: editingTemplate.description,
      targetCategory: editingTemplate.targetCategory,
    });
    setEditingTemplate(null);
    showToast('Template updated successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Report Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin 
              ? "Map specific templates to upload categories for the staff to follow."
              : "View the designated templates and formats configured by the Administration."}
          </p>
        </div>
        
        {isAdmin && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shrink-0">
                <Plus className="w-4 h-4" /> New Template Mapping
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assemble New Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Target Report Category</Label>
                  <Select value={newT.targetCategory} onValueChange={(val: ReportMetricCategory) => setNewT({ ...newT, targetCategory: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an upload category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input value={newT.name} onChange={e => setNewT({ ...newT, name: e.target.value })} placeholder="e.g. Audit Format..." />
                </div>
                <div className="space-y-2">
                  <Label>Instruction details & Format guidelines</Label>
                  <Textarea value={newT.description} onChange={e => setNewT({ ...newT, description: e.target.value })} placeholder="Tell staff how to submit for this category..." rows={3} />
                </div>
                <Button className="w-full mt-2" onClick={handleCreate}>Map Template</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTemplates.map((template, idx) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="p-6 transition-shadow flex flex-col h-full bg-card border-border">
              <div className="space-y-4 flex-1">
                <div>
                  <Badge variant="outline" className="mb-2 text-[10px] text-primary border-primary/30 uppercase tracking-wider">{template.targetCategory || "UNMAPPED"}</Badge>
                  <h3 className="font-semibold text-foreground text-lg">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{template.description}</p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Mapped to {template.targetCategory}</p>
                
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" title="Edit" onClick={() => setEditingTemplate(template)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" title="Duplicate" onClick={() => handleDuplicate(template)}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" title="Delete" onClick={() => handleDelete(template.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
        {reportTemplates.length === 0 && (
          <div className="col-span-full p-8 text-center text-muted-foreground bg-card border border-border rounded-xl">
            No templates currently exist.
          </div>
        )}
      </div>

      {isAdmin && (
        <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Template Mapping</DialogTitle>
            </DialogHeader>
            {editingTemplate && (
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Target Report Category</Label>
                  <Select value={editingTemplate.targetCategory} onValueChange={(val: ReportMetricCategory) => setEditingTemplate({ ...editingTemplate, targetCategory: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an upload category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input value={editingTemplate.name} onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })} placeholder="e.g. Audit Format..." />
                </div>
                <div className="space-y-2">
                  <Label>Instruction details & Format guidelines</Label>
                  <Textarea value={editingTemplate.description} onChange={e => setEditingTemplate({ ...editingTemplate, description: e.target.value })} placeholder="Tell staff how to submit for this category..." rows={3} />
                </div>
                <Button className="w-full mt-2" onClick={handleSaveEdit}>Save Changes</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
