"use client";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { MOCK_DEPARTMENTS, MOCK_USERS } from "@/lib/mock-data";
import { StatCard } from "@/components/stat-card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { CheckSquare, Clock, FileText, Eye, Award } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700 border-green-200",
  UNDER_REVIEW: "bg-blue-100 text-blue-700 border-blue-200",
  SUBMITTED: "bg-yellow-100 text-yellow-700 border-yellow-200",
  DRAFT: "bg-gray-100 text-gray-600 border-gray-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
};

export function ReviewerDashboard() {
  const { reportDrafts, approvalLogs, currentUser, notifications } = useAppStore();
  const router = useRouter();

  const pending = reportDrafts.filter((d) => d.status === "SUBMITTED").length;
  const underReview = reportDrafts.filter((d) => d.status === "UNDER_REVIEW").length;
  const approved = reportDrafts.filter((d) => d.status === "APPROVED").length;
  const myLogs = approvalLogs.filter((l) => l.reviewerUserId === currentUser?.id);
  const unread = notifications.filter((n) => n.userId === currentUser?.id && !n.isRead).length;

  const statusChart = [
    { name: "Submitted", value: pending, fill: "#f59e0b" },
    { name: "Under Review", value: underReview, fill: "#6366f1" },
    { name: "Approved", value: approved, fill: "#10b981" },
    { name: "Draft", value: reportDrafts.filter((d) => d.status === "DRAFT").length, fill: "#94a3b8" },
  ];

  return (
    <div className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Reviewer Dashboard</h2>
          <p className="text-sm text-muted-foreground">Dr. Senthilkumar Ramasamy · Annual Report Reviewer</p>
        </div>
        <Button size="sm" onClick={() => router.push("/dashboard/review")}>
          <Eye className="w-4 h-4 mr-2" /> Review Reports
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending Review" value={pending} icon={Clock} color="orange" subtitle="Needs attention" />
        <StatCard title="Under Review" value={underReview} icon={Eye} color="blue" />
        <StatCard title="Approved" value={approved} icon={CheckSquare} color="green" trend={{ value: 2, label: "this cycle" }} />
        <StatCard title="Actions Taken" value={myLogs.length} icon={Award} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Report Status Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              {statusChart.map((s) => (
                <Bar key={s.name} dataKey="value" fill={s.fill} radius={[3,3,0,0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Reports awaiting review */}
        <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Reports Awaiting Action</h3>
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/review")}>Review all</Button>
          </div>
          <div className="space-y-3">
            {reportDrafts
              .filter((d) => ["SUBMITTED","UNDER_REVIEW"].includes(d.status))
              .map((draft) => {
                const dept = MOCK_DEPARTMENTS.find((d) => d.id === draft.departmentId);
                const submitter = MOCK_USERS.find((u) => u.id === draft.createdByUserId);
                return (
                  <div key={draft.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{dept?.code} — {dept?.name}</p>
                      <p className="text-xs text-muted-foreground">By {submitter?.name} · {draft.submittedAt ? new Date(draft.submittedAt).toLocaleDateString("en-IN", { day:"numeric", month:"short" }) : "—"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[11px] border ${STATUS_COLORS[draft.status]}`}>{draft.status.replace("_"," ")}</Badge>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => router.push(`/dashboard/review/${draft.id}`)}>
                        Review
                      </Button>
                    </div>
                  </div>
                );
              })}
            {reportDrafts.filter((d) => ["SUBMITTED","UNDER_REVIEW"].includes(d.status)).length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-sm">All caught up! No reports pending.</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Review history */}
      <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Review History</h3>
        <div className="space-y-3">
          {myLogs.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No review actions yet.</p>
          ) : myLogs.map((log) => {
            const draft = reportDrafts.find((d) => d.id === log.reportDraftId);
            const dept = MOCK_DEPARTMENTS.find((d) => d.id === draft?.departmentId);
            return (
              <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${log.action === "APPROVED" ? "bg-green-500" : log.action === "REJECTED" ? "bg-red-500" : "bg-yellow-500"}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{dept?.name ?? "Dept"} — {log.action.replace("_"," ")}</p>
                  <p className="text-xs text-muted-foreground">{log.message}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">{new Date(log.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
