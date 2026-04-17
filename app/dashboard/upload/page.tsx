"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import type { ReportMetricCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { dispatchNotification } from "@/lib/notify";
import { UploadCloud, CheckCircle, FileText, Plus, X } from "lucide-react";

const CATEGORIES: { value: ReportMetricCategory; label: string; color: string }[] = [
  { value: "ACADEMIC", label: "Academic", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "RESEARCH", label: "Research", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "STUDENT_ACHIEVEMENT", label: "Student Achievement", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "FACULTY_ACHIEVEMENT", label: "Faculty Achievement", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "EXTRACURRICULAR", label: "Extracurricular", color: "bg-teal-100 text-teal-700 border-teal-200" },
  { value: "INFRASTRUCTURE", label: "Infrastructure", color: "bg-gray-100 text-gray-600 border-gray-200" },
  { value: "FINANCIAL", label: "Financial", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "OTHER", label: "Other", color: "bg-slate-100 text-slate-600 border-slate-200" },
];

export default function UploadPage() {
  const { currentUser, addMetricEntry, addNotification, reportTemplates } = useAppStore();
  const [form, setForm] = useState({
    category: "" as ReportMetricCategory | "",
    title: "",
    description: "",
    numericValue: "",
    textualValue: "",
    papersPublished: "",
    competitionsDone: "",
    tasksDone: "",
    extraPay: "",
    financialSpends: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [deptName, setDeptName] = useState("Department");

  const activeYearId = "ry_core";
  const activeYearLabel = "2025-26";

  useEffect(() => {
    api.getDepartments().then(res => {
      if (res.success && res.data) {
        const d = res.data.find(d => d.id === currentUser?.departmentId);
        if (d) setDeptName(d.name);
      }
    });
  }, [currentUser?.departmentId]);

  const activeTemplate = reportTemplates.find(t => t.targetCategory === form.category);

  useEffect(() => {
    // Ensure templates are loaded for mapping
    if (reportTemplates.length === 0) {
      api.getTemplates().then(res => {
        if (res.success && res.data) {
          useAppStore.getState().setReportTemplates(res.data);
        }
      });
    }
  }, [reportTemplates.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.title.trim()) {
      toast.error("Missing fields", { description: "Category and title are required." });
      return;
    }
    setLoading(true);

    try {
      // 1. Upload attached files first
      const fileUrls: string[] = [];
      if (attachedFiles.length > 0) {
        for (const file of attachedFiles) {
          const uploadRes = await api.uploadFile(file);
          if (uploadRes.success && uploadRes.data) {
            fileUrls.push(uploadRes.data.url);
          } else {
            toast.error(`Failed to upload ${file.name}: ${uploadRes.message || "Unknown error"}`);
          }
        }
      }

      // 2. Create entry with file URLs
      const entryPayload: Record<string, unknown> = {
        departmentId: currentUser?.departmentId ?? "dept1",
        reportingYearId: activeYearId,
        category: form.category,
        title: form.title,
        description: form.description || undefined,
        numericValue: form.numericValue ? Number(form.numericValue) : undefined,
        textualValue: form.textualValue || undefined,
        financialSpends: ["FINANCIAL", "OTHER", "INFRASTRUCTURE"].includes(form.category) ? Number(form.financialSpends) : undefined,
        attachmentUrls: fileUrls.length > 0 ? fileUrls : undefined,
      };
      if (form.category === "STUDENT_ACHIEVEMENT") {
        entryPayload.studentTargets = { papersPublished: Number(form.papersPublished), competitionsDone: Number(form.competitionsDone) };
      }
      if (form.category === "FACULTY_ACHIEVEMENT") {
        entryPayload.staffTargets = { tasksDone: Number(form.tasksDone), extraPay: Number(form.extraPay) };
      }

      const result = await api.createEntry(entryPayload);

      if (!result.success) {
        toast.error(result.message || "Failed to submit entry.");
        setLoading(false);
        return;
      }

      // Also add to Zustand for optimistic UI sync
      const id = (result.data as { id: string })?.id || `me_${Date.now()}`;
      addMetricEntry({
        id,
        departmentId: currentUser?.departmentId ?? "dept1",
        reportingYearId: activeYearId,
        category: form.category as ReportMetricCategory,
        title: form.title,
        description: form.description,
        numericValue: form.numericValue ? Number(form.numericValue) : undefined,
        textualValue: form.textualValue || undefined,
        financialSpends: ["FINANCIAL", "OTHER", "INFRASTRUCTURE"].includes(form.category) ? Number(form.financialSpends) : undefined,
        createdByUserId: currentUser?.id ?? "",
        status: "PENDING_HOD",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      dispatchNotification("ENTRY_SUBMITTED", {
        actorName: currentUser?.name,
        deptName: deptName,
        entryTitle: form.title,
      });

      const fileCount = fileUrls.length;
      toast.success("Entry submitted!", { description: fileCount > 0 ? `${fileCount} file(s) uploaded.` : undefined });
      setSubmitted((prev) => [form.title, ...prev]);
      setForm({ category: "", title: "", description: "", numericValue: "", textualValue: "", papersPublished: "", competitionsDone: "", tasksDone: "", extraPay: "", financialSpends: "" });
      setAttachedFiles([]);
      setUploadedUrls([]);
    } catch {
      toast.error("Submission failed", { description: "Server error. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col lg:flex-row-reverse items-start gap-6">
        {/* Right Sidebar on Desktop, Top on Mobile */}
        <div className="w-full lg:w-[320px] space-y-6 shrink-0">
          {activeTemplate && (
            <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl space-y-4 shadow-sm shadow-primary/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <h4 className="font-bold text-primary leading-tight text-sm">
                  {activeTemplate.name}
                  <span className="block text-[10px] uppercase tracking-wider opacity-70 mt-0.5 font-medium">Mapped Guidelines</span>
                </h4>
              </div>
              
              <div className="space-y-3">
                <p className="text-xs text-foreground/80 leading-relaxed italic border-l-2 border-primary/20 pl-3">
                  "{activeTemplate.description}"
                </p>

                {/* Instructional Frame */}
                {activeTemplate.guidelineFileUrl ? (
                  <div className="mt-4 overflow-hidden rounded-xl border border-primary/10 bg-white">
                    <div className="bg-primary/5 px-3 py-1.5 border-b border-primary/10 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-primary uppercase">Manual Preview</span>
                      <a href={activeTemplate.guidelineFileUrl} target="_blank" className="text-[9px] text-muted-foreground hover:text-primary underline">Open Full</a>
                    </div>
                    <div className="w-full h-[350px] relative bg-muted/20">
                      {(activeTemplate.guidelineFileUrl.toLowerCase().includes('pdf') || activeTemplate.guidelineFileUrl.startsWith('blob:')) ? (
                        <iframe 
                          src={`${activeTemplate.guidelineFileUrl}${activeTemplate.guidelineFileUrl.includes('?') ? '&' : '#'}toolbar=0&navpanes=0&scrollbar=0`} 
                          className="w-full h-full border-0" 
                          title="Guideline manual"
                          onError={(e) => console.error("Iframe load error", e)}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full p-2">
                           <img src={activeTemplate.guidelineFileUrl} alt="Guideline" className="max-w-full max-h-full object-contain shadow-sm rounded-md" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-muted/10 border-t border-border/50 text-center">
                      <a 
                        href={activeTemplate.guidelineFileUrl} 
                        download 
                        className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tight"
                      >
                        Download Original Guide
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-4 border border-dashed border-border rounded-xl bg-muted/5 text-center">
                    <p className="text-[10px] text-muted-foreground italic">No visual manual attached. Please follow the text description above.</p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-primary/10">
                <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                   Review the {activeTemplate.name} guidelines above for {form.category} compliance.
                </div>
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              Submission Guidelines
            </h3>
            <ul className="space-y-4">
              {[
                "Each metric entry should represent a single, verifiable achievement or data point.",
                "Provide numeric values wherever applicable for KPI tracking.",
                "Entries submitted go to Pending status until reviewed by HOD/Admin.",
                "Rejected entries can be revised and resubmitted with corrections.",
                "Deadline for 2025-26 report submissions: 31st March 2024.",
              ].map((g, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                  </div>
                  <span className="text-xs text-muted-foreground leading-relaxed">{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content: Form and Header */}
        <div className="flex-1 w-full space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-black tracking-tight text-foreground">Upload Metric Entry</h2>
            <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground bg-muted/30 w-fit px-3 py-1 rounded-full border border-border/50">
              <span className="font-semibold text-primary">{deptName}</span>
              <span className="opacity-30">•</span>
              <span>{activeYearLabel}</span>
            </div>
          </div>

          {/* Recently submitted */}
          {submitted.length > 0 && (
            <div className="bg-green-50/50 border border-green-200/50 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm font-bold text-green-800 tracking-tight">Recently Submitted</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {submitted.slice(0, 4).map((title, i) => (
                  <Badge key={i} className="bg-white text-green-700 border-green-200 text-[11px] font-medium shadow-sm px-3">{title}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category */}
              <div className="space-y-3">
                <Label className="text-sm font-bold tracking-tight">Category Selection <span className="text-destructive font-black">*</span></Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, category: cat.value }))}
                      className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all duration-300 ${form.category === cat.value
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                        : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:bg-primary/5"
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 pt-2">
                {/* Title */}
                <div className="space-y-2.5">
                  <Label htmlFor="title" className="text-sm font-bold tracking-tight">Entry Title <span className="text-destructive font-black">*</span></Label>
                  <Input
                    id="title"
                    className="h-12 text-sm rounded-xl border-border/50 focus:ring-4 focus:ring-primary/10 transition-all bg-muted/5 font-medium"
                    placeholder="e.g. International Journal Publications"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2.5">
                  <Label htmlFor="description" className="text-sm font-bold tracking-tight">Description / Details</Label>
                  <Textarea
                    id="description"
                    className="rounded-xl border-border/50 focus:ring-4 focus:ring-primary/10 transition-all bg-muted/5 font-medium min-h-[120px]"
                    placeholder="Provide details, context, or supporting information..."
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Numeric value */}
                  <div className="space-y-2.5">
                    <Label htmlFor="numeric" className="text-sm font-bold tracking-tight">Numeric Value</Label>
                    <Input
                      id="numeric"
                      type="number"
                      className="h-12 rounded-xl border-border/50 focus:ring-4 focus:ring-primary/10 transition-all bg-muted/5 font-medium"
                      placeholder="e.g. 18"
                      value={form.numericValue}
                      onChange={(e) => setForm((f) => ({ ...f, numericValue: e.target.value }))}
                    />
                  </div>
                  {/* Textual value */}
                  <div className="space-y-2.5">
                    <Label htmlFor="textual" className="text-sm font-bold tracking-tight">Textual Value / Unit</Label>
                    <Input
                      id="textual"
                      className="h-12 rounded-xl border-border/50 focus:ring-4 focus:ring-primary/10 transition-all bg-muted/5 font-medium"
                      placeholder="e.g. 94% or papers"
                      value={form.textualValue}
                      onChange={(e) => setForm((f) => ({ ...f, textualValue: e.target.value }))}
                    />
                  </div>
                </div>

                {form.category === "STUDENT_ACHIEVEMENT" && (
                  <div className="p-6 bg-green-50/30 rounded-2xl border border-green-100 space-y-5">
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                       <h4 className="font-bold text-sm text-green-900 tracking-tight uppercase">Mentee Data (Student Targets)</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-green-800/70">Papers Published</Label>
                        <Input className="h-11 rounded-lg border-green-200/50 bg-white shadow-sm" type="number" placeholder="0" value={form.papersPublished} onChange={e => setForm(f => ({ ...f, papersPublished: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-green-800/70">Competitions Done</Label>
                        <Input className="h-11 rounded-lg border-green-200/50 bg-white shadow-sm" type="number" placeholder="0" value={form.competitionsDone} onChange={e => setForm(f => ({ ...f, competitionsDone: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                )}

                {form.category === "FACULTY_ACHIEVEMENT" && (
                  <div className="p-6 bg-orange-50/30 rounded-2xl border border-orange-100 space-y-5">
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                       <h4 className="font-bold text-sm text-orange-900 tracking-tight uppercase">Staff Targets / Extra Tracking</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-orange-800/70">Tasks Done (Non-teaching)</Label>
                        <Input className="h-11 rounded-lg border-orange-200/50 bg-white shadow-sm" type="number" placeholder="0" value={form.tasksDone} onChange={e => setForm(f => ({ ...f, tasksDone: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-orange-800/70">Extra Pay Given (₹)</Label>
                        <Input className="h-11 rounded-lg border-orange-200/50 bg-white shadow-sm" type="number" placeholder="0" value={form.extraPay} onChange={e => setForm(f => ({ ...f, extraPay: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                )}

                {["FINANCIAL", "OTHER", "INFRASTRUCTURE"].includes(form.category) && (
                  <div className="p-6 bg-red-50/30 rounded-2xl border border-red-100 space-y-5">
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                       <h4 className="font-bold text-sm text-red-900 tracking-tight uppercase">Staff & Organization Side Spending</h4>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-red-800/70">Financial Spends (₹)</Label>
                      <Input className="h-11 rounded-lg border-red-200/50 bg-white shadow-sm" type="number" placeholder="e.g. 500" value={form.financialSpends} onChange={e => setForm(f => ({ ...f, financialSpends: e.target.value }))} />
                    </div>
                  </div>
                )}

                {/* File upload */}
                <div
                  className="border-2 border-dashed border-primary/10 rounded-2xl p-8 text-center bg-primary/[0.02] hover:bg-primary/[0.04] transition-colors cursor-pointer group relative"
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.csv,.xls,.xlsx"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const valid = files.filter((f) => f.size <= 10 * 1024 * 1024);
                      if (valid.length < files.length) {
                        toast.error("Some files exceed 10MB and were skipped.");
                      }
                      setAttachedFiles((prev) => [...prev, ...valid]);
                      e.target.value = "";
                    }}
                  />
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-foreground tracking-tight">Attach supporting documents</p>
                  <p className="text-xs text-muted-foreground mt-1.5 px-10">PDF, DOC, JPEG, PNG, CSV, XLS — Max 10MB per file.</p>
                  <Button type="button" variant="outline" size="sm" className="mt-5 rounded-xl border-primary/20 hover:bg-primary/5 text-primary font-bold">
                    <Plus className="w-4 h-4 mr-2" /> Browse Files
                  </Button>
                </div>

                {/* Attached files chips */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachedFiles.map((f, i) => (
                      <Badge key={i} className="bg-primary/5 text-primary border-primary/20 text-xs font-medium px-3 py-1.5 flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        {f.name.length > 28 ? f.name.slice(0, 25) + "..." : f.name}
                        <span className="text-[10px] text-muted-foreground">({(f.size / 1024).toFixed(0)}KB)</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i));
                          }}
                          className="ml-1 hover:text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <Button type="submit" className="w-full h-14 text-base font-black rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" size="lg" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <span className="w-5 h-5 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      SUBMITTING ENTRY...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <FileText className="w-5 h-5" /> SUBMIT METRIC ENTRY
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
