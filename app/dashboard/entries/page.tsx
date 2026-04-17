"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import type { ApiEntry } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  FolderOpen, Search, CheckCircle, XCircle, Eye, Clock,
  ChevronDown, Filter, ArrowUpDown, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
  PENDING_HOD: "bg-yellow-100 text-yellow-700 border-yellow-200",
  PENDING_OFFICE: "bg-blue-100 text-blue-700 border-blue-200",
  PENDING_ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
  APPROVED_FINAL: "bg-green-100 text-green-700 border-green-200",
  REJECTED_NEEDS_REVIEW: "bg-red-100 text-red-700 border-red-200",
};

const CATEGORY_LABELS: Record<string, string> = {
  ACADEMIC: "Academic",
  RESEARCH: "Research",
  STUDENT_ACHIEVEMENT: "Student Achievement",
  FACULTY_ACHIEVEMENT: "Faculty Achievement",
  EXTRACURRICULAR: "Extracurricular",
  INFRASTRUCTURE: "Infrastructure",
  FINANCIAL: "Financial",
  OTHER: "Other",
};

const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

export default function EntriesPage() {
  const { currentUser } = useAppStore();
  const [entries, setEntries] = useState<ApiEntry[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [departments, setDepartments] = useState<ApiDepartment[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [acting, setActing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const [result, deptRes] = await Promise.all([
        api.getEntries(),
        api.getDepartments()
      ]);
      if (result.success && result.data) {
        setEntries(result.data);
      }
      if (deptRes.success && deptRes.data) {
        setDepartments(deptRes.data);
      }
    } catch {
      toast.error("Failed to load entries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const [currentPage, setCurrentPage] = useState(1);
  const [deptName, setDeptName] = useState("Department");
  const pageSize = 10;

  useEffect(() => {
    async function getDept() {
      if (currentUser?.departmentId) {
        const res = await api.getDepartment(currentUser.departmentId);
        if (res.success && res.data) setDeptName(res.data.name);
      }
    }
    getDept();
  }, [currentUser?.departmentId]);

  const filtered = useMemo(() => {
    return entries.filter(e => {
      const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.description?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || e.status === statusFilter;
      const matchCat = categoryFilter === "ALL" || e.category === categoryFilter;
      const matchDept = deptFilter === "ALL" || e.departmentId === deptFilter;
      return matchSearch && matchStatus && matchCat && matchDept;
    });
  }, [entries, search, statusFilter, categoryFilter, deptFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedEntries = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, categoryFilter, deptFilter]);

  const selectedEntry = entries.find(e => e.id === selected);

  const canApprove = currentUser?.role === "DEPARTMENT_HEAD" || currentUser?.role === "REVIEWER" || currentUser?.role === "ADMIN";

  const handleApprove = async (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    setActing(entryId);

    let newStatus = entry.status;
    if (currentUser?.role === "DEPARTMENT_HEAD" && entry.status === "PENDING_HOD") newStatus = "PENDING_OFFICE";
    else if (currentUser?.role === "REVIEWER" && entry.status === "PENDING_OFFICE") newStatus = "PENDING_ADMIN";
    else if (currentUser?.role === "ADMIN" && entry.status === "PENDING_ADMIN") newStatus = "APPROVED_FINAL";

    try {
      const result = await api.updateEntry(entryId, { status: newStatus });
      if (result.success) {
        toast.success(`Entry approved → ${newStatus.replace(/_/g, " ")}`);
        fetchEntries();
      } else {
        toast.error(result.message || "Approval failed.");
      }
    } catch {
      toast.error("Approval failed.");
    } finally {
      setActing(null);
      setSelected(null);
    }
  };

  const handleReject = async (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    setActing(entryId);

    try {
      const result = await api.updateEntry(entryId, {
        status: "REJECTED_NEEDS_REVIEW",
        reviewerComment: rejectNote || "Entry needs revision.",
      });
      if (result.success) {
        toast.success("Entry rejected.");
        fetchEntries();
      } else {
        toast.error(result.message || "Rejection failed.");
      }
    } catch {
      toast.error("Rejection failed.");
    } finally {
      setRejectNote("");
      setActing(null);
      setSelected(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Department Metric Entries</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Institutional ledger of {entries.length} achievements · {deptName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg shadow-sm" onClick={fetchEntries}>
            <Clock className="w-3.5 h-3.5 mr-2" /> Live Reload
          </Button>
        </div>
      </div>


      {/* Filters */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search entries..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {Object.keys(STATUS_STYLES).map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        {(currentUser?.role === "ADMIN" || currentUser?.role === "REVIEWER") && (
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <Building2 className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Departments</SelectItem>
              {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.code}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </motion.div>

      {/* Entries Table */}
      <motion.div variants={item} className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-muted/30">
          <span className="col-span-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title</span>
          <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</span>
          <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</span>
          <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Value</span>
          <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</span>
        </div>

        {paginatedEntries.length === 0 ? (
          <div className="py-12 text-center">
            <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No entries found matching your filters.</p>
          </div>
        ) : (
          paginatedEntries.map((entry, idx) => {
            const canAct = canApprove && (
              (currentUser?.role === "DEPARTMENT_HEAD" && entry.status === "PENDING_HOD") ||
              (currentUser?.role === "REVIEWER" && entry.status === "PENDING_OFFICE") ||
              (currentUser?.role === "ADMIN" && entry.status === "PENDING_ADMIN")
            );

            return (
              <div
                key={entry.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              >
                <div className="md:col-span-4">
                  <p className="text-sm font-semibold text-foreground">{entry.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium opacity-70">By {entry.createdByName}</p>
                  {entry.description && (
                    <p className="text-xs text-muted-foreground/70 mt-0.5 truncate max-w-xs">{entry.description}</p>
                  )}
                </div>
                <div className="md:col-span-2 flex items-center">
                  <span className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">{CATEGORY_LABELS[entry.category] || entry.category}</span>
                </div>
                <div className="md:col-span-2 flex items-center">
                  <Badge className={`text-[10px] uppercase font-bold border shadow-none ${STATUS_STYLES[entry.status] ?? STATUS_STYLES.DRAFT}`}>
                    {entry.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="md:col-span-2 flex items-center">
                  {entry.numericValue !== undefined ? (
                    <span className="text-sm font-bold text-foreground">
                      {entry.category === "FINANCIAL" ? `₹${(entry.numericValue || 0).toLocaleString()}` : entry.numericValue ?? "—"}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
                <div className="md:col-span-2 flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-8 text-xs font-bold" onClick={() => setSelected(entry.id)}>
                    <Eye className="w-3.5 h-3.5 mr-1" /> Inspect
                  </Button>
                  {canAct && (
                    <div className="flex gap-1 ml-1 pl-1 border-l border-border">
                      <Button
                        variant="ghost" size="sm"
                        className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                        onClick={() => handleApprove(entry.id)}
                        disabled={!!acting}
                      >
                        {acting === entry.id ? <Clock className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                        onClick={() => setSelected(entry.id)}
                        disabled={!!acting}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </motion.div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2 pb-8">
          <p className="text-xs font-medium text-muted-foreground">
            Showing <span className="text-foreground">{(currentPage - 1) * pageSize + 1}</span> - <span className="text-foreground">{Math.min(currentPage * pageSize, filtered.length)}</span> of <span className="text-foreground">{filtered.length} entries</span>
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" size="sm" className="h-8 font-bold uppercase text-[10px] tracking-wider"
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
                  className="h-8 w-8 p-0 text-xs font-bold"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
            </div>
            <Button 
              variant="outline" size="sm" className="h-8 font-bold uppercase text-[10px] tracking-wider"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEntry?.title || "Entry Details"}</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`text-[11px] border ${STATUS_STYLES[selectedEntry.status]}`}>
                  {selectedEntry.status.replace(/_/g, " ")}
                </Badge>
                <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[selectedEntry.category]}</span>
                <span className="text-xs text-muted-foreground">· Dept: {selectedEntry.departmentId}</span>
              </div>

              {selectedEntry.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedEntry.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                {selectedEntry.numericValue !== undefined && (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Value</p>
                    <p className="text-lg font-bold text-primary">{selectedEntry.numericValue}</p>
                    {selectedEntry.textualValue && <p className="text-xs text-muted-foreground">{selectedEntry.textualValue}</p>}
                  </div>
                )}
                {selectedEntry.financialSpends && (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Financial Spend</p>
                    <p className="text-lg font-bold text-foreground">${selectedEntry.financialSpends}</p>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Submitted by: {selectedEntry?.createdByName}</p>
                <p>Created: {new Date(selectedEntry.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                {selectedEntry.reviewerComment && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs font-semibold text-yellow-700">Reviewer Feedback</p>
                    <p className="text-xs text-yellow-600 mt-1">{selectedEntry.reviewerComment}</p>
                  </div>
                )}
              </div>

              {/* Approve/Reject actions in dialog */}
              {canApprove && (
                (currentUser?.role === "DEPARTMENT_HEAD" && selectedEntry.status === "PENDING_HOD") ||
                (currentUser?.role === "REVIEWER" && selectedEntry.status === "PENDING_OFFICE") ||
                (currentUser?.role === "ADMIN" && selectedEntry.status === "PENDING_ADMIN")
              ) && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <Textarea
                    placeholder="Add a note (optional, required for rejection)..."
                    value={rejectNote}
                    onChange={e => setRejectNote(e.target.value)}
                    rows={2}
                    className="resize-none text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm" className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={!!acting}
                      onClick={() => handleApprove(selectedEntry.id)}
                    >
                      {acting ? "Processing..." : <><CheckCircle className="w-3.5 h-3.5 mr-1.5" />Approve</>}
                    </Button>
                    <Button
                      size="sm" variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                      disabled={!!acting}
                      onClick={() => handleReject(selectedEntry.id)}
                    >
                      {acting ? "Processing..." : <><XCircle className="w-3.5 h-3.5 mr-1.5" />Reject</>}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
