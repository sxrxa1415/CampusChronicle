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
  const { currentUser, addMetricEntry, addNotification } = useAppStore();
  const [form, setForm] = useState({
    category: "" as ReportMetricCategory | "",
    title: "",
    description: "",
    numericValue: "",
    textualValue: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<string[]>([]);

  const dept = MOCK_DEPARTMENTS.find((d) => d.id === currentUser?.departmentId);
  const activeYear = MOCK_REPORTING_YEARS.find((y) => y.isActive)!;

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
      createdByUserId: currentUser?.id ?? "",
      status: "PENDING",
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
    setForm({ category: "", title: "", description: "", numericValue: "", textualValue: "" });
    setLoading(false);
    toast.success("Entry submitted!", { description: `"${form.title}" is now pending review.` });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-2xl">
      {/* Header */}
      <motion.div variants={item}>
        <h2 className="text-xl font-bold text-foreground">Upload Metric Entry</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {dept?.name ?? "Department"} · {activeYear.label}
        </p>
      </motion.div>

      {/* Recently submitted */}
      {submitted.length > 0 && (
        <motion.div variants={item} className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-sm font-semibold text-green-700">Recently Submitted</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {submitted.slice(0, 4).map((title, i) => (
              <Badge key={i} className="bg-green-100 text-green-700 border-green-200 text-[11px]">{title}</Badge>
            ))}
          </div>
        </motion.div>
      )}

      {/* Form */}
      <motion.div variants={item} className="bg-card border border-border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <div className="space-y-2">
            <Label>Category <span className="text-destructive">*</span></Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.value}
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setForm((f) => ({ ...f, category: cat.value }))}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    form.category === cat.value
                      ? cat.color + " ring-2 ring-offset-1 ring-primary/30"
                      : "bg-background text-muted-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {cat.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Entry Title <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              placeholder="e.g. International Journal Publications"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description / Details</Label>
            <Textarea
              id="description"
              placeholder="Provide details, context, or supporting information..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Numeric value */}
            <div className="space-y-2">
              <Label htmlFor="numeric">Numeric Value</Label>
              <Input
                id="numeric"
                type="number"
                placeholder="e.g. 18"
                value={form.numericValue}
                onChange={(e) => setForm((f) => ({ ...f, numericValue: e.target.value }))}
              />
            </div>
            {/* Textual value */}
            <div className="space-y-2">
              <Label htmlFor="textual">Textual Value / Unit</Label>
              <Input
                id="textual"
                placeholder="e.g. 94% or papers"
                value={form.textualValue}
                onChange={(e) => setForm((f) => ({ ...f, textualValue: e.target.value }))}
              />
            </div>
          </div>

          {/* File upload hint */}
          <div className="border-2 border-dashed border-border rounded-xl p-5 text-center">
            <UploadCloud className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Attach supporting documents</p>
            <p className="text-xs text-muted-foreground/70 mt-1">PDF, DOC, JPEG up to 10MB (demo — not functional)</p>
            <Button type="button" variant="outline" size="sm" className="mt-3">
              <Plus className="w-3 h-3 mr-2" /> Browse Files
            </Button>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" /> Submit Entry
              </span>
            )}
          </Button>
        </form>
      </motion.div>

      {/* Guidelines */}
      <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Submission Guidelines</h3>
        <ul className="space-y-2">
          {[
            "Each metric entry should represent a single, verifiable achievement or data point.",
            "Provide numeric values wherever applicable for KPI tracking.",
            "Entries submitted go to Pending status until reviewed by HOD/Admin.",
            "Rejected entries can be revised and resubmitted with corrections.",
            "Deadline for 2023-24 report submissions: 31st March 2024.",
          ].map((g, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
              <span className="text-xs text-muted-foreground leading-relaxed">{g}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}
