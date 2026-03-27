"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { MOCK_DEPARTMENTS, MOCK_REPORTING_YEARS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Trash2, Eye, Filter, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";
import { Timeline } from "@/components/timeline";

const STATUS_STYLES: Record<string, string> = {
  APPROVED_FINAL: "bg-green-100 text-green-700 border-green-200",
  PENDING_HOD: "bg-yellow-100 text-yellow-700 border-yellow-200",
  PENDING_OFFICE: "bg-blue-100 text-blue-700 border-blue-200",
  REJECTED_NEEDS_REVIEW: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  APPROVED_FINAL: CheckCircle,
  PENDING_HOD: Clock,
  PENDING_OFFICE: RefreshCw,
  REJECTED_NEEDS_REVIEW: XCircle,
};

const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

export default function EntriesPage() {
  const { currentUser, metricEntries, deleteMetricEntry, updateMetricEntry, addApprovalLog } = useAppStore();
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("ALL");
  const [filterCat, setFilterCat] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selected, setSelected] = useState<string | null>(null);

  const isAdmin = currentUser?.role === "ADMIN";
  const isDeptHead = currentUser?.role === "DEPARTMENT_HEAD";

  const entries = metricEntries.filter((e) => {
    const matchDept = isAdmin ? true : e.departmentId === currentUser?.departmentId;
    const matchYear = filterYear === "ALL" || e.reportingYearId === filterYear;
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "ALL" || e.category === filterCat;
    const matchStatus = filterStatus === "ALL" || e.status === filterStatus;
    return matchDept && matchYear && matchSearch && matchCat && matchStatus;
  });

  const selectedEntry = entries.find((e) => e.id === selected);

  const handleDelete = (id: string, title: string) => {
    deleteMetricEntry(id);
    setSelected(null);
    toast.success("Entry deleted", { description: `"${title}" has been removed.` });
  };

  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = (id: string, title: string, currentStatus: string) => {
    let nextStatus = "APPROVED_FINAL";
    if (currentUser?.role === "DEPARTMENT_HEAD" && currentStatus === "PENDING_HOD") {
      nextStatus = "PENDING_OFFICE";
    } else if (currentUser?.role === "REVIEWER" && currentStatus === "PENDING_OFFICE") {
      nextStatus = "PENDING_ADMIN";
    } else if (currentUser?.role === "ADMIN" && currentStatus === "PENDING_ADMIN") {
      nextStatus = "APPROVED_FINAL";
    } else if (currentUser?.role === "ADMIN") {
      nextStatus = "APPROVED_FINAL"; // Admin can force approve
    }

    updateMetricEntry(id, { status: nextStatus as any, updatedAt: new Date().toISOString() });
    addApprovalLog({
      id: `log-${Date.now()}`,
      reportDraftId: id, // storing entry id here for this workflow
      reviewerUserId: currentUser?.id ?? "",
      action: currentUser?.role === "ADMIN" ? "APPROVED_FINAL" as any : "APPROVED" as any,
      message: `Advanced to ${nextStatus.replace("_", " ")}`,
      createdAt: new Date().toISOString()
    });
    setSelected(null);
    toast.success("Entry advanced", { description: `"${title}" has been moved to ${nextStatus.replace("_", " ")}.` });
  };

  const handleReject = (id: string, title: string) => {
    updateMetricEntry(id, { status: "REJECTED_NEEDS_REVIEW", reviewerComment: rejectReason || "Please provide supporting documents.", updatedAt: new Date().toISOString() });
    addApprovalLog({
      id: `log-${Date.now()}`,
      reportDraftId: id,
      reviewerUserId: currentUser?.id ?? "",
      action: "REJECTED" as any,
      message: rejectReason || "Returned for revision",
      createdAt: new Date().toISOString()
    });
    setSelected(null);
    setRejectReason("");
    toast.error("Entry returned", { description: `"${title}" has been sent back for revision.` });
  };

  const cats = Array.from(new Set(metricEntries.map((e) => e.category)));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Metric Entries</h2>
          <p className="text-sm text-muted-foreground">{entries.length} entries · Academic Year 2025-26</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search entries..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger>
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Years</SelectItem>
            {MOCK_REPORTING_YEARS.map((y) => <SelectItem key={y.id} value={y.id}>{y.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger>
            <Filter className="w-3 h-3 mr-2 text-muted-foreground hidden lg:inline-block" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {cats.map((c) => <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING_HOD">Pending</SelectItem>
            <SelectItem value="APPROVED_FINAL">Approved</SelectItem>
            <SelectItem value="REJECTED_NEEDS_REVIEW">Rejected</SelectItem>
            <SelectItem value="PENDING_OFFICE">Submitted</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Entries list */}
      <motion.div variants={item} className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-muted/30">
          <span className="col-span-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title</span>
          <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</span>
          <span className="col-span-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Value</span>
          <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</span>
          <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</span>
          <span className="col-span-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</span>
        </div>

        <AnimatePresence>
          {entries.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <p className="text-sm">No entries found.</p>
            </div>
          ) : entries.map((entry, idx) => {
            const StatusIcon = STATUS_ICONS[entry.status] ?? Clock;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: idx * 0.03 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              >
                <div className="md:col-span-4">
                  <p className="text-sm font-medium text-foreground">{entry.title}</p>
                  {entry.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{entry.description}</p>
                  )}
                </div>
                <div className="md:col-span-2 flex items-center">
                  <span className="text-xs text-muted-foreground">{entry.category.replace("_", " ")}</span>
                </div>
                <div className="md:col-span-1 flex items-center">
                  <span className="text-xs font-medium text-foreground">{entry.numericValue ?? "—"}</span>
                </div>
                <div className="md:col-span-2 flex items-center">
                  <Badge className={`text-[11px] border flex items-center gap-1 ${STATUS_STYLES[entry.status] ?? STATUS_STYLES.PENDING_HOD}`}>
                    <StatusIcon className="w-2.5 h-2.5" />
                    {entry.status}
                  </Badge>
                </div>
                <div className="md:col-span-2 flex items-center">
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                  </span>
                </div>
                <div className="md:col-span-1 flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(entry.id)}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  {isAdmin && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(entry.id, entry.title)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">{selectedEntry?.title}</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={`text-[11px] border ${STATUS_STYLES[selectedEntry.status]}`}>{selectedEntry.status}</Badge>
                <span className="text-xs text-muted-foreground">{selectedEntry.category.replace("_", " ")}</span>
              </div>
              {selectedEntry.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedEntry.description}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {selectedEntry.numericValue !== undefined && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Numeric Value</p>
                    <p className="text-lg font-bold text-foreground">{selectedEntry.numericValue}</p>
                  </div>
                )}
                {selectedEntry.textualValue && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Textual Value</p>
                    <p className="text-sm font-semibold text-foreground">{selectedEntry.textualValue}</p>
                  </div>
                )}
                {selectedEntry.studentTargets && (
                  <div className="bg-green-50 rounded-lg p-3 col-span-2">
                    <p className="text-xs font-semibold text-green-800">Mentee Targets</p>
                    <p className="text-sm text-green-900 mt-1">Papers: {selectedEntry.studentTargets.papersPublished} | Competitions: {selectedEntry.studentTargets.competitionsDone}</p>
                  </div>
                )}
                {selectedEntry.staffTargets && (
                  <div className="bg-orange-50 rounded-lg p-3 col-span-2">
                    <p className="text-xs font-semibold text-orange-800">Staff Extra Targets</p>
                    <p className="text-sm text-orange-900 mt-1">Tasks: {selectedEntry.staffTargets.tasksDone} | Extra Pay: ${selectedEntry.staffTargets.extraPay}</p>
                  </div>
                )}
                {selectedEntry.financialSpends && (
                  <div className="bg-red-50 rounded-lg p-3 col-span-2">
                    <p className="text-xs font-semibold text-red-800">Financial Spends</p>
                    <p className="text-sm text-red-900 mt-1">Amount: ${selectedEntry.financialSpends}</p>
                  </div>
                )}
              </div>
              {selectedEntry.reviewerComment && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-700 mb-1">Previous Review Note</p>
                  <p className="text-xs text-red-600">{selectedEntry.reviewerComment}</p>
                </div>
              )}
              <div className="pt-4 border-t w-full overflow-hidden">
                <Timeline events={[
                  { id: "s1", title: "Submitted by Staff", date: new Date(selectedEntry.createdAt).toLocaleDateString(), status: "completed", color: "success" },
                  { id: "s2", title: "HOD Verification", date: ["PENDING_OFFICE", "PENDING_ADMIN", "APPROVED_FINAL"].includes(selectedEntry.status) ? new Date(selectedEntry.updatedAt).toLocaleDateString() : "", status: ["PENDING_OFFICE", "PENDING_ADMIN", "APPROVED_FINAL"].includes(selectedEntry.status) ? "completed" : selectedEntry.status === "PENDING_HOD" ? "current" : "pending" as any, color: ["PENDING_OFFICE", "PENDING_ADMIN", "APPROVED_FINAL"].includes(selectedEntry.status) ? "success" : "primary" },
                  { id: "s3", title: "Office Staff Verification", date: ["PENDING_ADMIN", "APPROVED_FINAL"].includes(selectedEntry.status) ? new Date(selectedEntry.updatedAt).toLocaleDateString() : "", status: ["PENDING_ADMIN", "APPROVED_FINAL"].includes(selectedEntry.status) ? "completed" : selectedEntry.status === "PENDING_OFFICE" ? "current" : "pending" as any, color: ["PENDING_ADMIN", "APPROVED_FINAL"].includes(selectedEntry.status) ? "success" : "primary" },
                  { id: "s4", title: "Final Admin Approval", date: selectedEntry.status === "APPROVED_FINAL" ? new Date(selectedEntry.updatedAt).toLocaleDateString() : "", status: selectedEntry.status === "APPROVED_FINAL" ? "completed" : selectedEntry.status === "PENDING_ADMIN" ? "current" : "pending" as any, color: selectedEntry.status === "APPROVED_FINAL" ? "success" : "primary" },
                  ...(selectedEntry.status === "REJECTED_NEEDS_REVIEW" ? [{ id: "s5", title: "Returned for Revision", date: new Date(selectedEntry.updatedAt).toLocaleDateString(), status: "current" as any, color: "error" as any }] : [])
                ]} />
              </div>
              {((isDeptHead && selectedEntry.status === "PENDING_HOD") ||
                (currentUser?.role === "REVIEWER" && selectedEntry.status === "PENDING_OFFICE") ||
                (isAdmin && ["PENDING_ADMIN", "PENDING_OFFICE", "PENDING_HOD"].includes(selectedEntry.status))) && (
                  <div className="pt-2 border-t mt-4 space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Review Action (Optional Comment before Reject)</p>
                      <Input placeholder="Reason for revision..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="h-8 text-xs" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleApprove(selectedEntry.id, selectedEntry.title, selectedEntry.status)}>
                        {currentUser?.role === "ADMIN" ? "Final Approve" : "Approve & Advance"}
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 border-red-300 text-red-600 hover:bg-red-50" onClick={() => handleReject(selectedEntry.id, selectedEntry.title)}>
                        Return for Revision
                      </Button>
                    </div>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
