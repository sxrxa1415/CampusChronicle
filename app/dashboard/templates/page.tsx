'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Copy, Pencil, FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';
import type { ReportMetricCategory } from '@/lib/types';

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

interface ApiTemplate {
  id: string;
  name: string;
  description: string;
  targetCategory: string | null;
  guidelineFileUrl: string | null;
  sections: string[];
  createdByAdminId: string;
  createdByAdmin?: { name: string };
  createdAt: string;
}

export default function TemplatesPage() {
  const { currentUser } = useAppStore();
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newT, setNewT] = useState({ name: "", description: "", targetCategory: "" as ReportMetricCategory, guidelineFileUrl: "" });
  const [editingTemplate, setEditingTemplate] = useState<ApiTemplate | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.getTemplates();
      if (result.success && result.data) {
        setTemplates(result.data as ApiTemplate[]);
        useAppStore.getState().setReportTemplates(result.data);
      }
    } catch {
      toast.error("Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  if (!currentUser) return null;
  const isAdmin = currentUser.role === "ADMIN";

  if (loading) return <DashboardSkeleton />;

  const handleFileUpload = async (file: File, isEdit = false) => {
    setUploading(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.data) {
        if (isEdit && editingTemplate) {
          setEditingTemplate({ ...editingTemplate, guidelineFileUrl: res.data.url });
        } else {
          setNewT({ ...newT, guidelineFileUrl: res.data.url });
        }
        toast.success("Guideline file uploaded.");
      } else {
        toast.error("Upload failed.");
      }
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDuplicate = async (template: ApiTemplate) => {
    try {
      const result = await api.createTemplate({
        name: `${template.name} (Copy)`,
        description: template.description,
        targetCategory: template.targetCategory,
        guidelineFileUrl: template.guidelineFileUrl,
        sections: template.sections,
      });
      if (result.success) {
        toast.success("Template duplicated!");
        fetchTemplates();
      } else {
        toast.error(result.message || "Duplication failed.");
      }
    } catch {
      toast.error("Duplication failed.");
    }
  };

  const handleDelete = async (templateId: string) => {
    try {
      const result = await api.deleteTemplate(templateId);
      if (result.success) {
        toast.success("Template deleted!");
        fetchTemplates();
      } else {
        toast.error(result.message || "Delete failed.");
      }
    } catch {
      toast.error("Delete failed.");
    }
  };

  const handleCreate = async () => {
    if (!newT.name || !newT.targetCategory) {
      toast.warning("Template needs a name and target category.");
      return;
    }
    try {
      const result = await api.createTemplate({
        name: newT.name,
        description: newT.description,
        targetCategory: newT.targetCategory,
        guidelineFileUrl: newT.guidelineFileUrl,
        sections: ["COVER", "CUSTOM"],
      });
      if (result.success) {
        setIsAddOpen(false);
        setNewT({ name: "", description: "", targetCategory: "OTHER" as ReportMetricCategory, guidelineFileUrl: "" });
        toast.success("Template Created!");
        fetchTemplates();
      } else {
        toast.error(result.message || "Creation failed.");
      }
    } catch {
      toast.error("Creation failed.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTemplate || !editingTemplate.name || !editingTemplate.targetCategory) {
      toast.warning("Template needs a name and category.");
      return;
    }
    try {
      const result = await api.updateTemplate(editingTemplate.id, {
        name: editingTemplate.name,
        description: editingTemplate.description,
        targetCategory: editingTemplate.targetCategory,
        guidelineFileUrl: editingTemplate.guidelineFileUrl,
      });
      if (result.success) {
        setEditingTemplate(null);
        toast.success("Template updated!");
        fetchTemplates();
      } else {
        toast.error(result.message || "Update failed.");
      }
    } catch {
      toast.error("Update failed.");
    }
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
                <div className="space-y-2">
                  <Label>Guideline Document (PDF/Image)</Label>
                  <Input type="file" accept="application/pdf,image/*" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])} disabled={uploading} />
                  {uploading && <p className="text-xs text-primary animate-pulse font-medium italic">Uploading guidance artifact...</p>}
                  {newT.guidelineFileUrl && (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-green-600 font-bold italic truncate">✓ Attached: {newT.guidelineFileUrl.split('/').pop()}</p>
                      <a href={newT.guidelineFileUrl} target="_blank" className="text-[10px] text-primary hover:underline font-bold">View File</a>
                    </div>
                  )}
                </div>
                <Button className="w-full mt-2" onClick={handleCreate}>Map Template & Guidelines</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(() => {
          const totalPages = Math.ceil(templates.length / pageSize);
          const paginatedTemplates = templates.slice((currentPage - 1) * pageSize, currentPage * pageSize);
          
          return (
            <>
              {paginatedTemplates.map((template) => (
                <div key={template.id}>
                  <Card className="p-6 transition-shadow flex flex-col h-full bg-card border-border hover:shadow-md">
                    <div className="space-y-4 flex-1">
                      <div>
                        <Badge variant="outline" className="mb-2 text-[10px] text-primary border-primary/30 uppercase tracking-wider">{template.targetCategory || "UNMAPPED"}</Badge>
                        <h3 className="font-semibold text-foreground text-lg">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{template.description}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-muted-foreground italic font-medium">Policy: {template.targetCategory}</p>
                        {template.guidelineFileUrl && (
                          <a href={template.guidelineFileUrl} target="_blank" className="text-[10px] text-primary flex items-center gap-1 hover:underline font-bold">
                             <FileText className="w-3 h-3" /> View Instructional PDF
                          </a>
                        )}
                      </div>
                      
                      {isAdmin && (
                        <div className="flex gap-2">
                          {template.guidelineFileUrl && (
                            <Button 
                              variant="ghost" size="icon" 
                              className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-lg border border-border/50 shadow-sm" 
                              title="View Guidance"
                              onClick={() => window.open(template.guidelineFileUrl!, '_blank')}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-lg border border-border/50 shadow-sm" title="Edit" onClick={() => setEditingTemplate(template)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-lg border border-border/50 shadow-sm" title="Duplicate" onClick={() => handleDuplicate(template)}>
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-lg border border-border/50 shadow-sm" title="Delete" onClick={() => handleDelete(template.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="col-span-full flex items-center justify-between px-2 pt-6">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
                    Showing <span className="text-foreground">{(currentPage - 1) * pageSize + 1}</span> - <span className="text-foreground">{Math.min(currentPage * pageSize, templates.length)}</span> of <span className="text-foreground">{templates.length} templates</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" size="sm" className="h-8 font-bold uppercase text-[10px] tracking-wider rounded-lg"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <Button 
                          key={i} 
                          variant={currentPage === i + 1 ? "default" : "outline"} 
                          size="sm" 
                          className="h-8 w-8 p-0 text-xs font-bold rounded-lg"
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                    </div>
                    <Button 
                      variant="outline" size="sm" className="h-8 font-bold uppercase text-[10px] tracking-wider rounded-lg"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          );
        })()}
        {templates.length === 0 && (
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
                  <Select value={editingTemplate.targetCategory || ""} onValueChange={(val: ReportMetricCategory) => setEditingTemplate({ ...editingTemplate, targetCategory: val })}>
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
                <div className="space-y-2">
                  <Label>Update Guideline File</Label>
                  <Input type="file" accept="application/pdf,image/*" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], true)} disabled={uploading} />
                  {editingTemplate.guidelineFileUrl && (
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-green-600 font-bold">Status: Current file active</p>
                      <a href={editingTemplate.guidelineFileUrl} target="_blank" className="text-[10px] text-primary hover:underline font-bold">View Existing</a>
                    </div>
                  )}
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
