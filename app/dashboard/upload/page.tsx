"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { MOCK_DEPARTMENTS, MOCK_REPORTING_YEARS } from "@/lib/mock-data";
import type { ReportMetricCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
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

const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

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

  const dept = MOCK_DEPARTMENTS.find((d) => d.id === currentUser?.departmentId);
  const activeYear = MOCK_REPORTING_YEARS.find((y) => y.isActive)!;
  
  const activeTemplate = reportTemplates.find(t => t.targetCategory === form.category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.title.trim()) {
      toast.error("Missing fields", { description: "Category and title are required." });
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));

    const id = `me_${Date.now()}`;
    addMetricEntry({
      id,
      departmentId: currentUser?.departmentId ?? "dept1",
      reportingYearId: activeYear.id,
      category: form.category as ReportMetricCategory,
      title: form.title,
      description: form.description,
      numericValue: form.numericValue ? Number(form.numericValue) : undefined,
      textualValue: form.textualValue || undefined,
      studentTargets: form.category === "STUDENT_ACHIEVEMENT"
        ? { papersPublished: Number(form.papersPublished), competitionsDone: Number(form.competitionsDone) }
        : undefined,
      staffTargets: form.category === "FACULTY_ACHIEVEMENT"
        ? { tasksDone: Number(form.tasksDone), extraPay: Number(form.extraPay) }
        : undefined,
      financialSpends: ["FINANCIAL", "OTHER", "INFRASTRUCTURE"].includes(form.category) ? Number(form.financialSpends) : undefined,
      createdByUserId: currentUser?.id ?? "",
      status: "PENDING_HOD",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    addNotification({
      id: `n_${Date.now()}`,
      userId: currentUser?.id ?? "",
      reportDraftId: undefined,
      title: "Entry Submitted",
      message: `"${form.title}" has been submitted for review.`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    setSubmitted((prev) => [form.title, ...prev]);
    setForm({ category: "", title: "", description: "", numericValue: "", textualValue: "", papersPublished: "", competitionsDone: "", tasksDone: "", extraPay: "", financialSpends: "" });
    setLoading(false);
    toast.success("Entry submitted!", { description: `"${form.title}" is now pending review.` });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl">
      <div className="flex flex-col lg:flex-row-reverse items-start gap-6">
        {/* Right Sidebar on Desktop, Top on Mobile */}
        <div className="w-full lg:w-[320px] space-y-6 shrink-0">
          {activeTemplate && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 bg-primary/5 border border-primary/20 rounded-2xl space-y-3 shadow-sm shadow-primary/5"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <h4 className="font-bold text-primary leading-tight">
                  {activeTemplate.name}
                  <span className="block text-[10px] uppercase tracking-wider opacity-70 mt-0.5 font-medium">Mapped Template Details</span>
                </h4>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed italic border-l-2 border-primary/20 pl-3">
                "{activeTemplate.description}"
              </p>
              <div className="pt-2 border-t border-primary/10">
                <p className="text-[11px] text-muted-foreground">Select this category to auto-apply report formatting guidelines for this metric.</p>
              </div>
            </motion.div>
          )}

          {/* Guidelines */}
          <motion.div variants={item} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
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
          </motion.div>
        </div>

        {/* Main Content: Form and Header */}
        <div className="flex-1 w-full space-y-6">
          {/* Header */}
          <motion.div variants={item}>
            <h2 className="text-2xl font-black tracking-tight text-foreground">Upload Metric Entry</h2>
            <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground bg-muted/30 w-fit px-3 py-1 rounded-full border border-border/50">
              <span className="font-semibold text-primary">{dept?.name ?? "Department"}</span>
              <span className="opacity-30">•</span>
              <span>{activeYear.label}</span>
            </div>
          </motion.div>

          {/* Recently submitted */}
          {submitted.length > 0 && (
            <motion.div variants={item} className="bg-green-50/50 border border-green-200/50 rounded-2xl p-5 backdrop-blur-sm">
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
            </motion.div>
          )}

          {/* Form */}
          <motion.div variants={item} className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category */}
              <div className="space-y-3">
                <Label className="text-sm font-bold tracking-tight">Category Selection <span className="text-destructive font-black">*</span></Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat.value}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setForm((f) => ({ ...f, category: cat.value }))}
                      className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all duration-300 ${form.category === cat.value
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                        : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:bg-primary/5"
                        }`}
                    >
                      {cat.label}
                    </motion.button>
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
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-green-50/30 rounded-2xl border border-green-100 space-y-5">
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
                  </motion.div>
                )}

                {form.category === "FACULTY_ACHIEVEMENT" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-orange-50/30 rounded-2xl border border-orange-100 space-y-5">
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
                        <Label className="text-xs font-bold text-orange-800/70">Extra Pay Given ($)</Label>
                        <Input className="h-11 rounded-lg border-orange-200/50 bg-white shadow-sm" type="number" placeholder="0" value={form.extraPay} onChange={e => setForm(f => ({ ...f, extraPay: e.target.value }))} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {["FINANCIAL", "OTHER", "INFRASTRUCTURE"].includes(form.category) && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-red-50/30 rounded-2xl border border-red-100 space-y-5">
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                       <h4 className="font-bold text-sm text-red-900 tracking-tight uppercase">Staff & Organization Side Spending</h4>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-red-800/70">Financial Spends ($)</Label>
                      <Input className="h-11 rounded-lg border-red-200/50 bg-white shadow-sm" type="number" placeholder="e.g. 500" value={form.financialSpends} onChange={e => setForm(f => ({ ...f, financialSpends: e.target.value }))} />
                    </div>
                  </motion.div>
                )}

                {/* File upload hint */}
                <div className="border-2 border-dashed border-primary/10 rounded-2xl p-8 text-center bg-primary/[0.02] hover:bg-primary/[0.04] transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-foreground tracking-tight">Attach supporting documents</p>
                  <p className="text-xs text-muted-foreground mt-1.5 px-10">Select PDF, DOC, or JPEG files. Max size 10MB per file.</p>
                  <Button type="button" variant="outline" size="sm" className="mt-5 rounded-xl border-primary/20 hover:bg-primary/5 text-primary font-bold">
                    <Plus className="w-4 h-4 mr-2" /> Browse Files
                  </Button>
                </div>

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
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
