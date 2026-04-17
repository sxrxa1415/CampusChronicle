"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import type { ApiDraft } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Eye, CheckCircle, XCircle, MessageSquare, RotateCcw, FileText, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

const STATUS_STYLES: Record<string, string> = {
  APPROVED_FINAL: "bg-green-100 text-green-700 border-green-200",
  PENDING_ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
  PENDING_OFFICE: "bg-yellow-100 text-yellow-700 border-yellow-200",
  DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
  REJECTED_NEEDS_REVIEW: "bg-red-100 text-red-700 border-red-200",
};

interface DraftDetail {
  id: string;
  departmentId: string;
  department: { name: string; code: string };
  reportingYearId: string;
  compiledMetricEntryIds: string[];
  status: string;
  submittedAt: string | null;
  createdByUserId: string;
  createdBy: { name: string; avatar: string | null; avatarUrl: string | null };
  comments: Array<{ id: string; message: string; createdAt: string; commentedBy: { name: string; avatar: string | null; role: string } }>;
  approvalLogs: Array<{ id: string; action: string; message: string | null; createdAt: string; reviewer: { name: string; role: string } }>;
}

const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

export default function ReviewPage() {
  const { currentUser } = useAppStore();
  const [allDrafts, setAllDrafts] = useState<ApiDraft[]>([]);
  const [metricEntries, setMetricEntries] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [draftDetail, setDraftDetail] = useState<DraftDetail | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [acting, setActing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    try {
      const [draftsRes, entriesRes] = await Promise.all([
        api.getDrafts(),
        api.getEntries()
      ]);
      if (draftsRes.success && draftsRes.data) setAllDrafts(draftsRes.data);
      if (entriesRes.success && entriesRes.data) setMetricEntries(entriesRes.data);
    } catch {
      toast.error("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDrafts(); }, [fetchDrafts]);

  const fetchDetail = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/drafts/${id}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setDraftDetail(data.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (selected) fetchDetail(selected);
    else setDraftDetail(null);
  }, [selected, fetchDetail]);

  const reviewableDrafts = allDrafts.filter((d) => ["PENDING_OFFICE", "PENDING_ADMIN"].includes(d.status));
  
  const totalPages = Math.ceil(allDrafts.length / pageSize);
  const paginatedDrafts = allDrafts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const draft = draftDetail;
  const draftEntries = draft ? metricEntries.filter((e) => (draft.compiledMetricEntryIds || []).includes(e.id)) : [];

  const doAction = async (action: "APPROVED" | "REJECTED" | "REVISION_REQUESTED") => {
    if (!draft) return;
    setActing(action);

    try {
      // Create approval log
      await api.createApproval({
        reportDraftId: draft.id,
        action,
        message: reviewNote || `${action.replace("_", " ")} by reviewer.`,
      });

      // Add comment if note provided
      if (reviewNote.trim()) {
        await api.createComment({
          reportDraftId: draft.id,
          message: reviewNote,
        });
      }

      // Update draft status
      const newStatus = action === "APPROVED" ? "APPROVED_FINAL" : action === "REJECTED" ? "REJECTED_NEEDS_REVIEW" : "PENDING_ADMIN";
      await api.updateDraft(draft.id, { status: newStatus });

      toast.success(`Report ${action.toLowerCase().replace("_", " ")}.`);
      setReviewNote("");
      setSelected(null);
      fetchDrafts();
    } catch {
      toast.error("Action failed.");
    } finally {
      setActing(null);
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item}>
        <h2 className="text-xl font-bold text-foreground">Review Reports</h2>
        <p className="text-sm text-muted-foreground">
          {reviewableDrafts.length} reports awaiting action · Academic Year 2025-26
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Report list */}
        <motion.div variants={item} className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">All Reports</p>
            </div>
            {allDrafts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">No reports found.</div>
            ) : paginatedDrafts.map((d) => {
              const isActive = selected === d.id;
              return (
                <motion.button
                  key={d.id}
                  whileHover={{ x: 2 }}
                  onClick={() => setSelected(d.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 border-b border-border last:border-0 text-left transition-colors",
                    isActive ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/30"
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{d.department?.code}</p>
                    <p className="text-xs text-muted-foreground truncate">{d.department?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={`text-[10px] border ${STATUS_STYLES[d.status] || STATUS_STYLES.DRAFT}`}>
                      {d.status.replace("_", " ")}
                    </Badge>
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  </div>
                </motion.button>
              );
            })}

            {/* Pagination Mini */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground">{currentPage} / {totalPages}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                    <ChevronRight className="w-3 h-3 rotate-180" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Detail pane */}
        <motion.div variants={item} className="lg:col-span-2">
          {!draft ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center h-full flex flex-col items-center justify-center gap-3">
              <FileText className="w-10 h-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Select a report from the list to review</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={draft.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{draft.department?.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">Submitted by {draft.createdBy?.name}</p>
                      {draft.submittedAt && (
                        <span className="text-xs text-muted-foreground">· {new Date(draft.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      )}
                    </div>
                  </div>
                  <Badge className={`text-[11px] border ${STATUS_STYLES[draft.status] || STATUS_STYLES.DRAFT}`}>
                    {draft.status.replace("_", " ")}
                  </Badge>
                </div>

                {/* Entries */}
                <div className="p-5 max-h-72 overflow-y-auto space-y-3">
                  {draftEntries.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">No entries compiled in this draft.</p>
                  ) : draftEntries.map((entry) => (
                    <div key={entry.id} className="flex items-start justify-between gap-2 py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{entry.title}</p>
                        <p className="text-xs text-muted-foreground">{entry.category.replace("_", " ")}</p>
                        {entry.description && <p className="text-xs text-muted-foreground/70 mt-0.5 truncate max-w-xs">{entry.description}</p>}
                      </div>
                      {entry.numericValue !== undefined && (
                        <span className="text-sm font-bold text-primary shrink-0">{entry.numericValue}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Comments from reviewer */}
                {draft.comments && draft.comments.length > 0 && (
                  <div className="px-5 pb-4 border-t border-border pt-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Previous Comments</p>
                    {draft.comments.map((c) => (
                      <div key={c.id} className="flex items-start gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-muted text-[10px] font-bold flex items-center justify-center shrink-0">{c.commentedBy?.avatar || "?"}</div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{c.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Review actions */}
                {["PENDING_OFFICE", "PENDING_ADMIN"].includes(draft.status) && (
                  <div className="px-5 pb-5 border-t border-border pt-4 space-y-3">
                    <p className="text-xs font-semibold text-foreground">Review Note (optional)</p>
                    <Textarea
                      placeholder="Add a note or feedback..."
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      rows={2}
                      className="resize-none text-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 flex-1"
                        disabled={!!acting} onClick={() => doAction("APPROVED")}>
                        {acting === "APPROVED" ? "Approving..." : <><CheckCircle className="w-3.5 h-3.5 mr-1.5" />Approve</>}
                      </Button>
                      <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 flex-1"
                        disabled={!!acting} onClick={() => doAction("REVISION_REQUESTED")}>
                        {acting === "REVISION_REQUESTED" ? "Requesting..." : <><RotateCcw className="w-3.5 h-3.5 mr-1.5" />Request Revision</>}
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 flex-1"
                        disabled={!!acting} onClick={() => doAction("REJECTED")}>
                        {acting === "REJECTED" ? "Rejecting..." : <><XCircle className="w-3.5 h-3.5 mr-1.5" />Reject</>}
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
