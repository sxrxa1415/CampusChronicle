"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { MOCK_DEPARTMENTS, MOCK_USERS, MOCK_REPORTING_YEARS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileText, Send, Eye, Clock, CheckCircle, History, MessageSquare, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
  PENDING_OFFICE: "bg-blue-100 text-blue-700 border-blue-200",
  PENDING_ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
  APPROVED_FINAL: "bg-green-100 text-green-700 border-green-200",
  REJECTED_NEEDS_REVIEW: "bg-red-100 text-red-700 border-red-200",
};

const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

export default function DraftPage() {
  const { currentUser, metricEntries, reportDrafts, addReportDraft, updateReportDraft, versions, addVersion, comments, addComment, notifications, addNotification } = useAppStore();
  const [activeTab, setActiveTab] = useState<"preview" | "history" | "comments">("preview");
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dept = MOCK_DEPARTMENTS.find((d) => d.id === currentUser?.departmentId);
  const activeYear = MOCK_REPORTING_YEARS.find((y) => y.isActive)!;

  const myDraft = reportDrafts.find((d) => d.departmentId === currentUser?.departmentId && d.reportingYearId === activeYear.id);
  const draftEntries = myDraft
    ? metricEntries.filter((e) => myDraft.compiledMetricEntryIds.includes(e.id))
    : metricEntries.filter((e) => e.departmentId === currentUser?.departmentId && e.status === "APPROVED_FINAL");

  const draftVersions = myDraft ? versions.filter((v) => v.reportDraftId === myDraft.id) : [];
  const draftComments = myDraft ? comments.filter((c) => c.reportDraftId === myDraft.id) : [];

  const handleCreateDraft = () => {
    const id = `rd_${Date.now()}`;
    const approvedIds = metricEntries
      .filter((e) => e.departmentId === currentUser?.departmentId && e.status === "APPROVED_FINAL")
      .map((e) => e.id);

    addReportDraft({
      id,
      departmentId: currentUser?.departmentId ?? "dept1",
      reportingYearId: activeYear.id,
      compiledMetricEntryIds: approvedIds,
      status: "DRAFT",
      createdByUserId: currentUser?.id ?? "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    addVersion({
      id: `rv_${Date.now()}`,
      reportDraftId: id,
      versionNumber: 1,
      snapshotHtml: `<h1>${dept?.name} Draft v1</h1><p>Auto-generated from ${approvedIds.length} approved entries.</p>`,
      createdByUserId: currentUser?.id ?? "",
      createdAt: new Date().toISOString(),
    });

    toast.success("Draft created!", { description: `Report draft created with ${approvedIds.length} approved entries.` });
  };

  const handleSubmit = async () => {
    if (!myDraft) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));

    updateReportDraft(myDraft.id, {
      status: "PENDING_OFFICE",
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    addVersion({
      id: `rv_${Date.now()}`,
      reportDraftId: myDraft.id,
      versionNumber: draftVersions.length + 1,
      snapshotHtml: `<h1>${dept?.name} v${draftVersions.length + 1}</h1><p>Submitted for review on ${new Date().toLocaleDateString("en-IN")}.</p>`,
      createdByUserId: currentUser?.id ?? "",
      createdAt: new Date().toISOString(),
    });

    addNotification({
      id: `n_${Date.now()}`,
      userId: "u4",
      reportDraftId: myDraft.id,
      title: "Report Submitted for Review",
      message: `${dept?.name} department report has been submitted by ${currentUser?.name}.`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    setSubmitting(false);
    toast.success("Report submitted!", { description: "The reviewer has been notified." });
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !myDraft) return;
    addComment({
      id: `rc_${Date.now()}`,
      reportDraftId: myDraft.id,
      commentedByUserId: currentUser?.id ?? "",
      message: newComment,
      createdAt: new Date().toISOString(),
    });
    setNewComment("");
    toast.success("Comment added");
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 max-w-3xl">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Draft & Preview</h2>
          <p className="text-sm text-muted-foreground">{dept?.name} · {activeYear.label}</p>
        </div>
        <div className="flex gap-2">
          {!myDraft ? (
            <Button size="sm" onClick={handleCreateDraft}>
              <Plus className="w-4 h-4 mr-2" /> Create Draft
            </Button>
          ) : (
            <>
              <Badge className={`text-[11px] border px-3 py-1 ${STATUS_STYLES[myDraft.status]}`}>
                {myDraft.status.replace("_", " ")}
              </Badge>
              {myDraft.status === "DRAFT" && (
                <Button size="sm" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <span className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Submitting...</span> : <><Send className="w-4 h-4 mr-2" />Submit for Review</>}
                </Button>
              )}
            </>
          )}
        </div>
      </motion.div>

      {!myDraft ? (
        <motion.div variants={item} className="bg-card border border-border rounded-xl p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-base font-semibold text-foreground mb-2">No Draft Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create a draft to compile approved metric entries into a report.</p>
          <Button onClick={handleCreateDraft}>Create Draft Report</Button>
        </motion.div>
      ) : (
        <>
          {/* Tabs */}
          <motion.div variants={item} className="flex gap-1 bg-muted/30 p-1 rounded-xl border border-border w-fit">
            {(["preview", "history", "comments"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize",
                  activeTab === tab
                    ? "bg-card text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab === "history" ? `History (${draftVersions.length})` : tab === "comments" ? `Comments (${draftComments.length})` : "Preview"}
              </button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === "preview" && (
              <motion.div key="preview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Report header */}
                <div className="bg-sidebar text-sidebar-foreground p-8 text-center">
                  <h1 className="text-2xl font-bold mb-1"></h1>
                  <p className="text-sidebar-foreground/70 text-sm"></p>
                  <div className="mt-4 inline-block bg-sidebar-accent px-6 py-2 rounded-full">
                    <p className="text-base font-semibold">Annual Report 2025-26</p>
                    <p className="text-sm text-sidebar-foreground/70">{dept?.name}</p>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {draftEntries.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">No approved entries included yet.</p>
                  ) : (
                    draftEntries.map((entry, i) => (
                      <div key={entry.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-medium text-primary">{entry.category.replace("_", " ")}</p>
                            <h4 className="text-sm font-semibold text-foreground mt-1">{entry.title}</h4>
                            {entry.description && (
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{entry.description}</p>
                            )}
                          </div>
                          {entry.numericValue !== undefined && (
                            <div className="bg-primary/10 rounded-lg px-3 py-2 text-center shrink-0">
                              <p className="text-2xl font-bold text-primary leading-tight">{entry.numericValue}</p>
                              {entry.textualValue && <p className="text-[10px] text-muted-foreground">{entry.textualValue}</p>}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "history" && (
              <motion.div key="history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <History className="w-4 h-4" /> Version History
                </h3>
                {draftVersions.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No version history yet.</p>
                ) : (
                  <div className="space-y-3">
                    {[...draftVersions].reverse().map((v) => {
                      const user = MOCK_USERS.find((u) => u.id === v.createdByUserId);
                      return (
                        <div key={v.id} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                            v{v.versionNumber}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Version {v.versionNumber}</p>
                            <p className="text-xs text-muted-foreground">By {user?.name} · {new Date(v.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</p>
                            <p className="text-xs text-muted-foreground/70 mt-1 italic">{v.snapshotHtml.replace(/<[^>]+>/g,"").slice(0,80)}...</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "comments" && (
              <motion.div key="comments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Comments & Feedback
                </h3>
                <div className="space-y-3 mb-5">
                  {draftComments.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">No comments yet.</p>
                  ) : draftComments.map((c) => {
                    const user = MOCK_USERS.find((u) => u.id === c.commentedByUserId);
                    return (
                      <div key={c.id} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold text-foreground shrink-0">
                          {user?.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-foreground">{user?.name}</p>
                            <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{c.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment or note..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    className="flex-1 resize-none"
                  />
                  <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>Add</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}
