"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { MOCK_DEPARTMENTS, MOCK_USERS, MOCK_APPROVAL_LOGS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, FileText, Eye, Download, Filter } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700 border-green-200",
  UNDER_REVIEW: "bg-purple-100 text-purple-700 border-purple-200",
  SUBMITTED: "bg-yellow-100 text-yellow-700 border-yellow-200",
  DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
};

const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

export default function ReportsPage() {
  const { reportDrafts, metricEntries, comments } = useAppStore();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = reportDrafts.filter((d) => {
    const dept = MOCK_DEPARTMENTS.find((dep) => dep.id === d.departmentId);
    return !search || dept?.name.toLowerCase().includes(search.toLowerCase()) || dept?.code.toLowerCase().includes(search.toLowerCase());
  });

  const draft = reportDrafts.find((d) => d.id === selected);
  const dept = draft ? MOCK_DEPARTMENTS.find((d) => d.id === draft.departmentId) : null;
  const submitter = draft ? MOCK_USERS.find((u) => u.id === draft.createdByUserId) : null;
  const draftEntries = draft ? metricEntries.filter((e) => draft.compiledMetricEntryIds.includes(e.id)) : [];
  const draftLogs = draft ? MOCK_APPROVAL_LOGS.filter((l) => l.reportDraftId === draft.id) : [];
  const draftComments = draft ? comments.filter((c) => c.reportDraftId === draft.id) : [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item}>
        <h2 className="text-xl font-bold text-foreground">All Reports</h2>
        <p className="text-sm text-muted-foreground">{reportDrafts.length} department reports · 2023-24</p>
      </motion.div>

      <motion.div variants={item} className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </motion.div>

      <motion.div variants={item} className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-muted/30">
          {["Department","Status","Submitted","Entries","Actions"].map((h, i) => (
            <span key={h} className={`${[5,2,2,1,2][i] ? `col-span-${[5,2,2,1,2][i]}` : ""} text-xs font-semibold text-muted-foreground uppercase tracking-wide col-span-${[4,2,2,2,2][i]}`}>{h}</span>
          ))}
        </div>

        {filtered.map((d, idx) => {
          const dp = MOCK_DEPARTMENTS.find((dep) => dep.id === d.departmentId);
          const sub = MOCK_USERS.find((u) => u.id === d.createdByUserId);
          const entryCount = metricEntries.filter((e) => d.compiledMetricEntryIds.includes(e.id)).length;
          return (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
            >
              <div className="md:col-span-4">
                <p className="text-sm font-semibold text-foreground">{dp?.code}</p>
                <p className="text-xs text-muted-foreground">{dp?.name}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">By {sub?.name}</p>
              </div>
              <div className="md:col-span-2 flex items-center">
                <Badge className={`text-[11px] border ${STATUS_STYLES[d.status] ?? STATUS_STYLES.DRAFT}`}>
                  {d.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="md:col-span-2 flex items-center">
                <span className="text-xs text-muted-foreground">
                  {d.submittedAt ? new Date(d.submittedAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"2-digit" }) : "—"}
                </span>
              </div>
              <div className="md:col-span-2 flex items-center">
                <span className="text-xs text-foreground font-medium">{entryCount} entries</span>
              </div>
              <div className="md:col-span-2 flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelected(d.id)}>
                  <Eye className="w-3.5 h-3.5 mr-1" /> View
                </Button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dept?.name} — Annual Report 2023-24</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={`text-[11px] border ${STATUS_STYLES[draft.status]}`}>{draft.status.replace("_"," ")}</Badge>
                <span className="text-xs text-muted-foreground">By {submitter?.name}</span>
                {draft.submittedAt && <span className="text-xs text-muted-foreground">· Submitted {new Date(draft.submittedAt).toLocaleDateString("en-IN")}</span>}
              </div>

              {draftEntries.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Compiled Entries</p>
                  <div className="space-y-2">
                    {draftEntries.map((e) => (
                      <div key={e.id} className="flex items-start justify-between gap-2 p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-foreground">{e.title}</p>
                          <p className="text-xs text-muted-foreground">{e.category.replace("_"," ")}</p>
                        </div>
                        {e.numericValue !== undefined && (
                          <span className="text-sm font-bold text-primary">{e.numericValue}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {draftLogs.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Review History</p>
                  {draftLogs.map((log) => {
                    const reviewer = MOCK_USERS.find((u) => u.id === log.reviewerUserId);
                    return (
                      <div key={log.id} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg mb-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.action === "APPROVED" ? "bg-green-500" : log.action === "REJECTED" ? "bg-red-500" : "bg-yellow-500"}`} />
                        <div>
                          <p className="text-xs font-medium text-foreground">{log.action.replace("_"," ")} by {reviewer?.name}</p>
                          {log.message && <p className="text-xs text-muted-foreground">{log.message}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {draftComments.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Comments</p>
                  {draftComments.map((c) => {
                    const u = MOCK_USERS.find((u) => u.id === c.commentedByUserId);
                    return (
                      <div key={c.id} className="p-3 bg-muted/30 rounded-lg mb-2">
                        <p className="text-xs font-semibold text-foreground">{u?.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{c.message}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" size="sm">
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Export PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
