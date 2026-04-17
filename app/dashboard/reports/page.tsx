"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import type { ApiDraft } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, FileText, Eye, Download, Filter, Building2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, string> = {
  APPROVED_FINAL: "bg-green-100 text-green-700 border-green-200",
  PENDING_ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
  PENDING_OFFICE: "bg-yellow-100 text-yellow-700 border-yellow-200",
  DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
  REJECTED_NEEDS_REVIEW: "bg-red-100 text-red-700 border-red-200",
};

const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

interface DraftDetail {
  id: string;
  departmentId: string;
  department: { name: string; code: string };
  compiledMetricEntryIds: string[];
  status: string;
  submittedAt: string | null;
  createdByUserId: string;
  createdBy: { name: string; avatar: string | null };
  comments: Array<{ id: string; message: string; createdAt: string; commentedBy: { name: string } }>;
  approvalLogs: Array<{ id: string; action: string; message: string | null; createdAt: string; reviewer: { name: string } }>;
}

export default function ReportsPage() {
  const [drafts, setDrafts] = useState<ApiDraft[]>([]);
  const [metricEntries, setMetricEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [departments, setDepartments] = useState<ApiDepartment[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [draftDetail, setDraftDetail] = useState<DraftDetail | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    try {
      const [draftsRes, entriesRes] = await Promise.all([
        api.getDrafts(),
        api.getEntries()
      ]);
      if (draftsRes.success && draftsRes.data) setDrafts(draftsRes.data);
      if (entriesRes.success && entriesRes.data) setMetricEntries(entriesRes.data);
      
      const deptsRes = await api.getDepartments();
      if (deptsRes.success && deptsRes.data) setDepartments(deptsRes.data);
    } catch {
      toast.error("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDrafts(); }, [fetchDrafts]);

  // Fetch detail when selecting a draft
  useEffect(() => {
    if (!selected) { setDraftDetail(null); return; }
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/drafts/${selected}`, { credentials: "include" });
        const data = await res.json();
        if (data.success) setDraftDetail(data.data);
      } catch { /* ignore */ }
    }
    fetchDetail();
  }, [selected]);

  useEffect(() => { setCurrentPage(1); }, [search, deptFilter]);

  const filtered = drafts.filter((d) => {
    const matchSearch = !search || d.department?.name.toLowerCase().includes(search.toLowerCase()) || d.department?.code.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "ALL" || d.departmentId === deptFilter;
    return matchSearch && matchDept;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedReports = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const draftEntries = draftDetail ? metricEntries.filter((e) => (draftDetail.compiledMetricEntryIds || []).includes(e.id)) : [];

  if (loading) return <DashboardSkeleton />;

  const handleExportPDF = () => {
    if (!draftDetail) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups to export PDF.");
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>${draftDetail.department.name} - Annual Report 2025-26</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; color: #111827; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { font-size: 24px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px; }
            .meta { color: #6b7280; font-size: 14px; margin-bottom: 30px; }
            h2 { font-size: 18px; color: #374151; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin-block: 15px; }
            th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
            th { background-color: #f3f4f6; font-size: 14px; font-weight: 600; }
            td { font-size: 14px; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; background: #e5e7eb; border: 1px solid #d1d5db; }
            @media print {
              body { padding: 0; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <h1>${draftDetail.department.name} (${draftDetail.department.code}) - Annual Report</h1>
          <div class="meta">
            <span class="badge" style="text-transform: capitalize;">${draftDetail.status.replace("_", " ")}</span>
            <p><strong>Prepared By:</strong> ${draftDetail.createdBy?.name || 'System'}</p>
            <p><strong>Submitted On:</strong> ${draftDetail.submittedAt ? new Date(draftDetail.submittedAt).toLocaleDateString("en-IN") : "Pending"}</p>
          </div>

          <h2>Compiled Metrics & Entries</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Metric Title</th>
                <th>Value / Proof</th>
              </tr>
            </thead>
            <tbody>
              ${draftEntries.map(e => `
                <tr>
                  <td>${e.category.replace("_", " ")}</td>
                  <td>${e.title}</td>
                  <td>${e.numericValue !== null && e.numericValue !== undefined ? e.numericValue : 'Documented'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Review Trail & Approvals</h2>
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Reviewer</th>
                <th>Date</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              ${(draftDetail.approvalLogs || []).map(log => `
                <tr>
                  <td><strong>${log.action.replace("_", " ")}</strong></td>
                  <td>${log.reviewer?.name || 'System'}</td>
                  <td>${new Date(log.createdAt).toLocaleDateString("en-IN")}</td>
                  <td>${log.message || '--'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 50px; font-size: 12px; color: #9ca3af; text-align: center;">
            <p>Generated by CampusChronicle Reporting System automatically.</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item}>
        <h2 className="text-xl font-bold text-foreground">All Reports</h2>
        <p className="text-sm text-muted-foreground">{drafts.length} department reports · 2025-26</p>
      </motion.div>

      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Departments</SelectItem>
            {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.code}</SelectItem>)}
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div variants={item} className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-muted/30">
          {["Department", "Status", "Submitted", "Entries", "Actions"].map((h, i) => (
            <span key={h} className={`col-span-${[4, 2, 2, 2, 2][i]} text-xs font-semibold text-muted-foreground uppercase tracking-wide`}>{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">No reports found.</div>
        ) : paginatedReports.map((d, idx) => {
          const entryCount = (d.compiledMetricEntryIds || []).length;
          return (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
            >
              <div className="md:col-span-4">
                <p className="text-sm font-semibold text-foreground">{d.department?.code}</p>
                <p className="text-xs text-muted-foreground">{d.department?.name}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">By {d.createdBy?.name}</p>
              </div>
              <div className="md:col-span-2 flex items-center">
                <Badge className={`text-[11px] border ${STATUS_STYLES[d.status] ?? STATUS_STYLES.DRAFT}`}>
                  {d.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="md:col-span-2 flex items-center">
                <span className="text-xs text-muted-foreground">
                  {d.submittedAt ? new Date(d.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2">
          <p className="text-xs font-medium text-muted-foreground">
            Showing <span className="text-foreground">{(currentPage - 1) * pageSize + 1}</span> - <span className="text-foreground">{Math.min(currentPage * pageSize, filtered.length)}</span> of <span className="text-foreground">{filtered.length} reports</span>
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

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draftDetail?.department?.name} — Annual Report 2025-26</DialogTitle>
          </DialogHeader>
          {draftDetail && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={`text-[11px] border ${STATUS_STYLES[draftDetail.status]}`}>{draftDetail.status.replace("_", " ")}</Badge>
                <span className="text-xs text-muted-foreground">By {draftDetail.createdBy?.name}</span>
                {draftDetail.submittedAt && <span className="text-xs text-muted-foreground">· Submitted {new Date(draftDetail.submittedAt).toLocaleDateString("en-IN")}</span>}
              </div>

              {draftEntries.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Compiled Entries</p>
                  <div className="space-y-2">
                    {draftEntries.map((e) => (
                      <div key={e.id} className="flex items-start justify-between gap-2 p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-foreground">{e.title}</p>
                          <p className="text-xs text-muted-foreground">{e.category.replace("_", " ")}</p>
                        </div>
                        {e.numericValue !== undefined && (
                          <span className="text-sm font-bold text-primary">{e.numericValue}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {draftDetail.approvalLogs && draftDetail.approvalLogs.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Review History</p>
                  {draftDetail.approvalLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg mb-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.action === "APPROVED" ? "bg-green-500" : log.action === "REJECTED" ? "bg-red-500" : "bg-yellow-500"}`} />
                      <div>
                        <p className="text-xs font-medium text-foreground">{log.action.replace("_", " ")} by {log.reviewer?.name}</p>
                        {log.message && <p className="text-xs text-muted-foreground">{log.message}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {draftDetail.comments && draftDetail.comments.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Comments</p>
                  {draftDetail.comments.map((c) => (
                    <div key={c.id} className="p-3 bg-muted/30 rounded-lg mb-2">
                      <p className="text-xs font-semibold text-foreground">{c.commentedBy?.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.message}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" size="sm" onClick={handleExportPDF}>
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
