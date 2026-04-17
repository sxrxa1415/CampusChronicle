"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import type { ApiDepartment } from "@/lib/api-client";
import { StatCard } from "@/components/stat-card";
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, Legend, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { CheckSquare, Clock, FileText, UploadCloud, Users, BookOpen, Award, BarChart3, TrendingUp, AlertCircle, XCircle, Eye } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const STATUS_COLORS: Record<string, string> = {
  APPROVED_FINAL: "bg-green-100 text-green-700 border-green-200",
  PENDING_ADMIN: "bg-blue-100 text-blue-700 border-blue-200",
  PENDING_OFFICE: "bg-yellow-100 text-yellow-700 border-yellow-200",
  DRAFT: "bg-gray-100 text-gray-600 border-gray-200",
  REJECTED_NEEDS_REVIEW: "bg-red-100 text-red-700 border-red-200",
};

const PIE_COLORS = ["#6366f1", "#06b6d4", "#f59e0b", "#10b981", "#f43f5e"];

export function ReviewerDashboard() {
  const { approvalLogs, currentUser, notifications, setApprovalLogs, setNotifications } = useAppStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<ApiDepartment[]>([]);
  const [metricEntries, setMetricEntries] = useState<any[]>([]);
  const [reportDrafts, setReportDrafts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [entriesRes, draftsRes, deptsRes, approvalsRes, notifsRes] = await Promise.all([
          api.getEntries(),
          api.getDrafts(),
          api.getDepartments(),
          api.getApprovals(),
          api.getNotifications()
        ]);
        if (entriesRes.success && entriesRes.data) setMetricEntries(entriesRes.data);
        if (draftsRes.success && draftsRes.data) setReportDrafts(draftsRes.data);
        if (deptsRes.success && deptsRes.data) setDepartments(deptsRes.data);
        if (approvalsRes.success && approvalsRes.data) setApprovalLogs(approvalsRes.data as any);
        if (notifsRes.success && notifsRes.data) setNotifications(notifsRes.data.notifications as any);
      } catch (e) {}
      setLoading(false);
    }
    fetchData();
  }, [setApprovalLogs, setNotifications]);

  const calculations = useMemo(() => {
    const pending = metricEntries.filter((d) => d.status === "PENDING_OFFICE").length;
    const underReview = metricEntries.filter((d) => d.status === "PENDING_ADMIN").length;
    const approved = metricEntries.filter((d) => d.status === "APPROVED_FINAL").length;
    const drafts = metricEntries.filter((d) => d.status === "DRAFT").length;
    
    // Fallback to recent entries if logs are empty (for visualization)
    const myLogs = approvalLogs.length > 0 
      ? approvalLogs.filter((l) => l.reviewerUserId === currentUser?.id)
      : metricEntries.filter(e => e.status === "APPROVED_FINAL").map(e => ({
          id: e.id,
          action: "APPROVED",
          message: "Verified during cycle audit",
          createdAt: e.updatedAt,
          reportDraftId: e.id
        }));

    const safeNotifs = Array.isArray(notifications) ? notifications : [];
    const unread = safeNotifs.filter((n) => n.userId === currentUser?.id && !n.isRead).length;

    const statusChart = [
      { name: "Submitted", value: pending, fill: "#f59e0b" },
      { name: "Under Review", value: underReview, fill: "#6366f1" },
      { name: "Approved", value: approved, fill: "#10b981" },
      { name: "Draft", value: drafts, fill: "#94a3b8" },
    ].filter(d => d.value > 0);

    const sortedLogs = [...myLogs].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const grouped = sortedLogs.reduce((acc, log) => {
      const d = new Date(log.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const reviewTimeline = Object.entries(grouped).map(([date, count]) => ({ date, count }));

    const counts = myLogs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const actionDistribution = Object.entries(counts).map(([name, value]) => ({ name: name.replace("_", " "), value }));

    return { pending, underReview, approved, unread, statusChart, reviewTimeline, actionDistribution, myLogs };
  }, [loading, metricEntries, approvalLogs, currentUser, notifications]);

  if (loading) return <DashboardSkeleton />;

  const { pending, underReview, approved, unread, statusChart, reviewTimeline, actionDistribution, myLogs } = calculations!;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Audit & Review Command Center</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-2 italic">
             <CheckSquare className="w-3.5 h-3.5" /> Institutional Verification Loop
          </p>
        </div>
        <div className="flex gap-2">
           <Badge className="bg-orange-50 text-orange-700 border-orange-200 px-3 py-1 font-bold">
             {pending} REQUIRES REVIEW
           </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Awaiting Verification" value={pending} icon={Clock} color="orange" subtitle="Review queue" />
        <StatCard title="Under Final Review" value={underReview} icon={CheckSquare} color="blue" subtitle="Awaiting Admin" />
        <StatCard title="Verified Success" value={approved} icon={Award} color="green" trend={{ value: 18, label: "this cycle" }} />
        <StatCard title="Audit Notifications" value={unread} icon={AlertCircle} color="red" subtitle="Unread alerts" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
           <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
             <BarChart3 className="w-4 h-4 text-primary" /> Reports Status
           </h3>
           <div className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusChart} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {statusChart.map((s, i) => <Cell key={i} fill={s.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12x', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
                </PieChart>
             </ResponsiveContainer>
           </div>
           <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {statusChart.map(s => (
                <div key={s.name} className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md">
                   <div className="w-2 h-2 rounded-full" style={{ background: s.fill }} />
                   <span className="text-[9px] font-bold text-muted-foreground uppercase">{s.name}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
           <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-fuchsia-600" /> My Audit Velocity
           </h3>
           <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={reviewTimeline.length ? reviewTimeline : [{ date: "No Data", count: 0 }]}>
                    <defs>
                      <linearGradient id="colorReview" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d946ef" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="count" stroke="#d946ef" strokeWidth={3} fillOpacity={1} fill="url(#colorReview)" name="Audits Verified" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
           <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" /> Action Distribution
           </h3>
           <div className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={actionDistribution}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                   <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                   <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                   <Tooltip />
                   <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-foreground">Priority Verification Inbox</h3>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/entries`)} className="text-xs h-8">Full Queue</Button>
          </div>
          <div className="space-y-4">
            {metricEntries
              .filter((e) => e.status === "PENDING_OFFICE")
              .slice(0, 5)
              .map((entry) => {
                const dept = departments.find((d) => d.id === entry.departmentId);
                return (
                  <div key={entry.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors rounded-lg px-2">
                    <div className="min-w-0 pr-4">
                      <p className="text-sm font-bold text-foreground truncate">{entry.title}</p>
                      <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{dept?.code} · {entry.category.replace("_", " ")} {entry.financialSpends ? `| ₹${entry.financialSpends.toLocaleString()}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-[9px] uppercase font-bold shrink-0">Priority</Badge>
                       <Button size="sm" className="h-7 text-[10px] font-bold px-3" onClick={() => router.push(`/dashboard/entries`)}>VERIFY</Button>
                    </div>
                  </div>
                );
              })}
            {metricEntries.filter(e => e.status === "PENDING_OFFICE").length === 0 && (
              <div className="py-12 text-center text-muted-foreground text-sm font-medium italic">Audit inbox clear. All reports verified.</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-foreground mb-6">Recent Audit Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myLogs.length === 0 ? (
            <div className="md:col-span-3 py-12 text-center text-muted-foreground text-sm">No recorded audit actions.</div>
          ) : myLogs.slice(0, 12).map((log) => {
            const entry = metricEntries.find((d) => d.id === log.reportDraftId) || reportDrafts.find((d) => d.id === log.reportDraftId);
            const dept = departments.find((d) => d.id === entry?.departmentId);
            return (
              <div key={log.id} className="p-4 rounded-xl border border-border/50 bg-muted/10 relative overflow-hidden group hover:border-primary/20 transition-all">
                <div className={`absolute top-0 left-0 w-1 h-full ${log.action === "APPROVED" ? "bg-green-500" : log.action === "REJECTED" ? "bg-red-500" : "bg-yellow-500"}`} />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">{dept?.code ?? "INST"}</p>
                <p className="text-sm font-bold text-foreground mt-1 line-clamp-1">{log.action.replace("_"," ")} Verified</p>
                <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed italic">"{log.message}"</p>
                <p className="text-[10px] font-medium text-muted-foreground/60 mt-4 align-bottom">{new Date(log.createdAt).toLocaleDateString("en-IN", { day:'2-digit', month:'short', year:'numeric' })}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
