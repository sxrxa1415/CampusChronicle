"use client";
import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import type { ApiDraft } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileText, Send, Eye, Clock, CheckCircle, History, MessageSquare, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
  PENDING_OFFICE: "bg-blue-100 text-blue-700 border-blue-200",
  PENDING_ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
  APPROVED_FINAL: "bg-green-100 text-green-700 border-green-200",
  REJECTED_NEEDS_REVIEW: "bg-red-100 text-red-700 border-red-200",
};

interface DraftComment {
  id: string;
  message: string;
  createdAt: string;
  commentedBy: {
    name: string;
    avatar: string | null;
    role: string;
  };
}

interface DraftVersion {
  id: string;
  versionNumber: number;
  snapshotHtml: string | null;
  createdAt: string;
}

interface DraftDetail {
  id: string;
  departmentId: string;
  department: { name: string; code: string };
  reportingYearId: string;
  compiledMetricEntryIds: string[];
  status: string;
  submittedAt: string | null;
  approvedAt: string | null;
  createdByUserId: string;
  createdBy: { name: string; avatar: string | null; avatarUrl: string | null };
  comments: DraftComment[];
  versions: DraftVersion[];
  versionCount?: number;
  commentCount?: number;
}

export default function DraftPage() {
  const { currentUser } = useAppStore();
  const [drafts, setDrafts] = useState<ApiDraft[]>([]);
  const [metricEntries, setMetricEntries] = useState<any[]>([]);
  const [draftDetail, setDraftDetail] = useState<DraftDetail | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "history" | "comments">("preview");
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const activeYearId = "ry_core";
  const activeYearLabel = "2025-26";

  const fetchDraftsData = useCallback(async () => {
    setLoading(true);
    try {
      const [draftsRes, entriesRes] = await Promise.all([
        api.getDrafts(),
        api.getEntries()
      ]);
      if (entriesRes.success && entriesRes.data) {
        setMetricEntries(entriesRes.data);
      }
      if (draftsRes.success && draftsRes.data) {
        setDrafts(draftsRes.data);
        const myD = draftsRes.data.find(d => d.departmentId === currentUser?.departmentId && d.reportingYearId === activeYearId);
        if (myD) {
          setDraftDetail(myD as any);
        } else {
          setDraftDetail(null);
        }
      }
    } catch {
      toast.error("Failed to load drafts.");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.departmentId, activeYearId]);

  useEffect(() => { 
    fetchDraftsData(); 
  }, [fetchDraftsData]);

  const handleCreateDraft = async () => {
    const approvedIds = metricEntries
      .filter((e) => e.departmentId === currentUser?.departmentId && e.status === "APPROVED_FINAL")
      .map((e) => e.id);

    try {
      const result = await api.createDraft({
        departmentId: currentUser?.departmentId ?? "dept1",
        reportingYearId: activeYearId,
        compiledMetricEntryIds: approvedIds,
      });
      if (result.success) {
        toast.success("Draft created!");
        fetchDraftsData();
      } else {
        toast.error(result.message || "Failed to create draft.");
      }
    } catch {
      toast.error("Failed to create draft.");
    }
  };

  const handleSubmitDraft = async () => {
    if (!draftDetail) return;
    setSubmitting(true);
    try {
      const result = await api.updateDraft(draftDetail.id, { status: "PENDING_OFFICE" });
      if (result.success) {
        toast.success("Draft submitted for review!");
        fetchDraftsData();
      } else {
        toast.error(result.message || "Submission failed.");
      }
    } catch {
      toast.error("Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !draftDetail) return;
    try {
      const result = await api.createComment({
        reportDraftId: draftDetail.id,
        message: newComment,
      });
      if (result.success) {
        setNewComment("");
        toast.success("Comment added");
        fetchDraftsData();
      }
    } catch {
      toast.error("Failed to add comment.");
    }
  };

  if (loading) return <DashboardSkeleton />;

  const myDraft = draftDetail;
  const draftEntries = myDraft
    ? metricEntries.filter((e) => (myDraft.compiledMetricEntryIds || []).includes(e.id))
    : [];

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-xl font-bold text-foreground">Draft & Preview</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {myDraft?.department?.name || "Department Overview"} · {activeYearLabel}
          </p>
        </div>
        <div className="flex gap-2">
          {!myDraft ? (
            <Button size="sm" className="h-9 px-4 rounded-lg shadow-sm" onClick={handleCreateDraft}>
              <Plus className="w-3.5 h-3.5 mr-2" /> Initialize Draft
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Badge className={cn("text-[10px] border px-3 py-1 font-bold uppercase", STATUS_STYLES[myDraft.status] || STATUS_STYLES.DRAFT)}>
                {myDraft.status.replace("_", " ")}
              </Badge>
              {myDraft.status === "DRAFT" && (
                <Button size="sm" className="h-9 px-4 rounded-lg shadow-sm" onClick={handleSubmitDraft} disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Filing...
                    </span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 mr-2" />
                      Submit for Audit
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {!myDraft ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-base font-bold text-foreground mb-1">No Active Draft</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto italic">
            Compile your department's approved metric entries into a formal annual report draft to begin the verification cycle.
          </p>
          <Button onClick={handleCreateDraft} className="h-9 px-6 rounded-lg font-bold uppercase text-[11px] tracking-wider">
            Initialize Report Draft 2025-26
          </Button>
        </div>
      ) : (
        <>
          <div className="flex gap-1 bg-muted/30 p-1 rounded-xl border border-border w-fit font-bold uppercase text-[10px]">
            {(["preview", "history", "comments"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-lg transition-all",
                  activeTab === tab
                    ? "bg-card text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab === "history" ? `History (${myDraft.versionCount || 0})` : tab === "comments" ? `Comments (${myDraft.commentCount || 0})` : "Preview"}
              </button>
            ))}
          </div>

          <div className="pt-2">
            {activeTab === "preview" && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="bg-slate-900 text-white p-8 text-center">
                  <div className="inline-block bg-white/10 px-6 py-2 rounded-full border border-white/10">
                    <p className="text-base font-semibold">Annual Report 2025-26</p>
                    <p className="text-sm text-white/70">{myDraft.department?.name}</p>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {draftEntries.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8 italic">No approved entries included yet.</p>
                  ) : (
                    (() => {
                      const totalPages = Math.ceil(draftEntries.length / pageSize);
                      const paginatedDraftEntries = draftEntries.slice((currentPage - 1) * pageSize, currentPage * pageSize);
                      return (
                        <div className="space-y-4">
                          {paginatedDraftEntries.map((entry) => (
                            <div key={entry.id} className="border border-border rounded-lg p-4">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-xs font-medium text-primary uppercase tracking-wider">{entry.category.replace("_", " ")}</p>
                                  <h4 className="text-sm font-semibold text-foreground mt-1">{entry.title}</h4>
                                  {entry.description && (
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{entry.description}</p>
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
                          ))}
                          
                          {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                              <span className="text-[11px] text-muted-foreground font-medium">Page {currentPage} of {totalPages}</span>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="h-7 text-[10px] uppercase font-bold" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</Button>
                                <Button variant="outline" size="sm" className="h-7 text-[10px] uppercase font-bold" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <History className="w-4 h-4" /> Version History
                </h3>
                {(!myDraft.versions || myDraft.versions.length === 0) ? (
                  <div className="text-center py-12">
                     <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                     <p className="text-muted-foreground text-sm">No version history yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...myDraft.versions].reverse().map((v) => (
                      <div key={v.id} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                          v{v.versionNumber}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Version {v.versionNumber}</p>
                          <p className="text-xs text-muted-foreground">{new Date(v.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "comments" && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Audit Feedback Trail
                </h3>
                <div className="space-y-3 mb-5 max-h-[400px] overflow-y-auto pr-2">
                  {(!myDraft.comments || myDraft.comments.length === 0) ? (
                    <div className="text-center py-8">
                       <MessageSquare className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                       <p className="text-muted-foreground text-xs italic">No reviewer comments yet.</p>
                    </div>
                  ) : myDraft.comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold text-foreground shrink-0 border border-border">
                        {c.commentedBy?.avatar || "?"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-foreground">{c.commentedBy?.name}</p>
                          <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed bg-muted/20 p-2 rounded-lg">{c.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-4 border-t border-border mt-2">
                  <Textarea
                    placeholder="Type your response or clarification..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    className="flex-1 resize-none bg-muted/10 text-sm"
                  />
                  <Button size="sm" onClick={handlePostComment} disabled={!newComment.trim()} className="self-end h-10 px-4">Post</Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
