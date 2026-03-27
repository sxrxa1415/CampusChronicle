"use client";
import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { MOCK_DEPARTMENTS, MOCK_REPORTING_YEARS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  GripVertical, Plus, Trash2, FileText, Eye, Download, Send,
  CheckCircle, Layers, Zap
} from "lucide-react";
import type { ReportSectionType } from "@/lib/types";

const SECTION_TYPES: { value: ReportSectionType; label: string; icon: string }[] = [
  { value: "COVER", label: "Cover Page", icon: "📄" },
  { value: "ACADEMIC", label: "Academic", icon: "🎓" },
  { value: "RESEARCH", label: "Research", icon: "🔬" },
  { value: "FINANCIAL", label: "Financial", icon: "💰" },
  { value: "INFRASTRUCTURE", label: "Infrastructure", icon: "🏗" },
  { value: "ACHIEVEMENTS", label: "Achievements", icon: "🏆" },
  { value: "EVENTS", label: "Events", icon: "📅" },
  { value: "CUSTOM", label: "Custom", icon: "✏️" },
];

const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

export default function ReportBuilderPage() {
  const { templateSections, addTemplateSection, deleteTemplateSection, reorderTemplateSections, metricEntries, reportDrafts } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [newSection, setNewSection] = useState({
    sectionType: "CUSTOM" as ReportSectionType,
    title: "",
    description: "",
  });

  const activeYear = MOCK_REPORTING_YEARS.find((y) => y.isActive)!;
  const approvedDrafts = reportDrafts.filter((d) => ["APPROVED_FINAL", "PENDING_OFFICE", "PENDING_ADMIN"].includes(d.status));

  const handleAddSection = () => {
    if (!newSection.title.trim()) {
      toast.error("Title is required");
      return;
    }
    const id = `ts_${Date.now()}`;
    const section = {
      id,
      sectionType: newSection.sectionType,
      title: newSection.title,
      description: newSection.description,
      layoutJson: '{"cols":2}',
      createdByAdminId: "u1",
      createdAt: new Date().toISOString(),
    };
    addTemplateSection(section);
    setNewSection({ sectionType: "CUSTOM", title: "", description: "" });
    setShowAdd(false);
    toast.success("Section added to template");
  };

  const handleDelete = (id: string) => {
    deleteTemplateSection(id);
    toast.success("Section removed");
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setGenerating(false);
    setGenerated(true);
    toast.success("Annual Report Generated!", {
      description: "The institute annual report for 2025-26 is ready.",
    });
  };

  const deptStats = MOCK_DEPARTMENTS.map((d) => {
    const draft = reportDrafts.find((rd) => rd.departmentId === d.id);
    const entries = metricEntries.filter((e) => e.departmentId === d.id && e.status === "APPROVED_FINAL");
    return { ...d, status: draft?.status ?? "NOT_STARTED", entryCount: entries.length };
  });

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Report Builder</h2>
          <p className="text-sm text-muted-foreground">Compile institute-wide annual report · {activeYear.label}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
            <Eye className="w-4 h-4 mr-2" /> Preview
          </Button>
          <Button size="sm" onClick={handleGenerate} disabled={generating}>
            {generating ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              <><Zap className="w-4 h-4 mr-2" />{generated ? "Regenerate" : "Generate Report"}</>
            )}
          </Button>
        </div>
      </motion.div>

      {generated && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-700">Report Generated Successfully</p>
              <p className="text-xs text-green-600">Annual Report 2025-26 · {approvedDrafts.length} departments included</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-green-300 text-green-700">
              <Download className="w-3.5 h-3.5 mr-1.5" /> Download PDF
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <Send className="w-3.5 h-3.5 mr-1.5" /> Publish
            </Button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Template sections */}
        <motion.div variants={item} className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">Template Sections</p>
                <Badge variant="secondary" className="text-[11px]">{templateSections.length}</Badge>
              </div>
              <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Section
              </Button>
            </div>

            <Reorder.Group axis="y" values={templateSections} onReorder={reorderTemplateSections} className="divide-y divide-border">
              {templateSections.map((section) => {
                const typeInfo = SECTION_TYPES.find((t) => t.value === section.sectionType);
                return (
                  <Reorder.Item key={section.id} value={section}>
                    <motion.div
                      whileHover={{ backgroundColor: "hsl(var(--muted) / 0.2)" }}
                      className="flex items-center gap-3 px-5 py-3.5 transition-colors cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                      <span className="text-base shrink-0">{typeInfo?.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{section.title}</p>
                        {section.description && (
                          <p className="text-xs text-muted-foreground truncate">{section.description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">{section.sectionType}</Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => handleDelete(section.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </motion.div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          </div>
        </motion.div>

        {/* Department status */}
        <motion.div variants={item}>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Department Status</p>
            </div>
            <div className="divide-y divide-border">
              {deptStats.map((d) => (
                <div key={d.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">{d.code}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${d.status === "APPROVED_FINAL" ? "bg-green-100 text-green-700 border-green-200" :
                        d.status === "PENDING_ADMIN" || d.status === "PENDING_OFFICE" ? "bg-blue-100 text-blue-700 border-blue-200" :
                          d.status === "DRAFT" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                            "bg-gray-100 text-gray-600 border-gray-200"
                      }`}>
                      {d.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{d.entryCount} approved entries</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add section dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Template Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Section Type</Label>
              <div className="flex flex-wrap gap-2">
                {SECTION_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setNewSection((f) => ({ ...f, sectionType: t.value }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${newSection.sectionType === t.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/40"
                      }`}
                  >
                    <span>{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sectionTitle">Title</Label>
              <Input id="sectionTitle" placeholder="Section title..." value={newSection.title} onChange={(e) => setNewSection((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sectionDesc">Description</Label>
              <Textarea id="sectionDesc" placeholder="Optional description..." value={newSection.description} onChange={(e) => setNewSection((f) => ({ ...f, description: e.target.value }))} rows={2} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleAddSection}>Add Section</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Preview — 2025-26</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="bg-sidebar text-sidebar-foreground p-8 rounded-xl text-center">
              <h1 className="text-2xl font-bold"></h1>
              <p className="text-sidebar-foreground/70">Annual Report 2025-26</p>
            </div>
            {templateSections.map((section, idx) => (
              <div key={section.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">{idx + 1}</span>
                  <h4 className="font-semibold text-foreground text-sm">{section.title}</h4>
                </div>
                {section.description && <p className="text-xs text-muted-foreground">{section.description}</p>}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
