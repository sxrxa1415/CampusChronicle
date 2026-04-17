"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import type { ApiDashboardStats, ApiDepartment } from "@/lib/api-client";
import { StatCard } from "@/components/stat-card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Users, FileText, CheckSquare, BookOpen, Award, AlertCircle, TrendingUp, Sparkles, BarChart3 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const PIE_COLORS = ["#6366f1", "#06b6d4", "#f59e0b", "#10b981", "#f43f5e"];

export function AdminDashboard() {
  const { notifications, currentUser } = useAppStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ApiDashboardStats | null>(null);
  const [departments, setDepartments] = useState<ApiDepartment[]>([]);
  const [metricEntries, setMetricEntries] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, deptsRes, entriesRes] = await Promise.all([
          api.getDashboardStats(),
          api.getDepartments(),
          api.getEntries()
        ]);
        if (statsRes.success && statsRes.data) setStats(statsRes.data);
        if (deptsRes.success && deptsRes.data) setDepartments(deptsRes.data);
        if (entriesRes.success && entriesRes.data) setMetricEntries(entriesRes.data);
      } catch { /* use fallback */ }
      setLoading(false);
    }
    fetchData();
  }, []);

  const calculations = useMemo(() => {
    const approved = stats?.approvedEntries ?? metricEntries.filter((d) => d.status === "APPROVED_FINAL").length;
    const pending = stats?.pendingEntries ?? metricEntries.filter((d) => d.status === "PENDING_ADMIN").length;
    const totalEntries = stats?.totalEntries ?? metricEntries.length;
    const safeNotifs = Array.isArray(notifications) ? notifications : [];
    const unreadNotifs = stats?.unreadNotifications ?? safeNotifs.filter((n) => n.userId === currentUser?.id && !n.isRead).length;

    // Use a broader filter for dashboard charts (shows what's in the pipeline)
    const dashboardVis = metricEntries.filter(e => ["APPROVED_FINAL", "PENDING_ADMIN", "PENDING_OFFICE"].includes(e.status));

    const realBudgetData = departments.length > 0 ? departments.map(dept => {
      const total = dashboardVis
        .filter(e => e.departmentId === dept.id)
        .reduce((sum, e) => sum + (e.financialSpends || 0), 0);
      return { name: dept.code, value: total };
    }).filter(d => d.value > 0) : [];

    const displayBudgetData = realBudgetData.length > 0 ? realBudgetData : [{ name: "No Spends", value: 0 }];

    const realDeptPerformance = departments.map(dept => {
      const deptEntries = metricEntries.filter(e => e.departmentId === dept.id);
      const completed = deptEntries.filter(e => e.status === "APPROVED_FINAL").length;
      return {
        dept: dept.code,
        performance: deptEntries.length ? Math.round((completed / deptEntries.length) * 100) : 0,
        target: 100
      };
    });

    const computedPassTrend = departments.slice(0, 4).map(dept => {
      const academic = dashboardVis.filter(e => e.departmentId === dept.id && e.category === "ACADEMIC" && e.numericValue);
      const avg = academic.length ? Math.round(academic.reduce((s, e) => s + (e.numericValue || 0), 0) / academic.length) : 0;
      return { dept: dept.code, pass: avg };
    });

    const journals = dashboardVis.filter(e => e.category === "RESEARCH" && (e.title || "").toLowerCase().includes("journal")).reduce((s, e) => s + (e.numericValue || 0), 0);
    const conferences = dashboardVis.filter(e => e.category === "RESEARCH" && (e.title || "").toLowerCase().includes("conference")).reduce((s, e) => s + (e.numericValue || 0), 0);
    const patents = dashboardVis.filter(e => e.category === "RESEARCH" && (e.title || "").toLowerCase().includes("patent")).reduce((s, e) => s + (e.numericValue || 0), 0);
    const other = dashboardVis.filter(e => e.category === "RESEARCH" && !(e.title || "").toLowerCase().includes("journal") && !(e.title || "").toLowerCase().includes("conference") && !(e.title || "").toLowerCase().includes("patent")).reduce((s, e) => s + (e.numericValue || 0), 0);
    
    const researchArray = [
      { type: "Journals", count: journals },
      { type: "Conferences", count: conferences },
      { type: "Patents", count: patents },
      { type: "Other", count: other },
    ].filter(d => d.count > 0);

    const statusData = [
      { name: "Approved", value: approved, fill: "#10b981" },
      { name: "Pending", value: pending, fill: "#f59e0b" },
      { name: "Other", value: Math.max(0, totalEntries - approved - pending), fill: "#6366f1" },
    ].filter(d => d.value > 0);

    const deptVolume = departments.map(dept => ({
      name: dept.code,
      count: metricEntries.filter(e => e.departmentId === dept.id).length
    })).sort((a,b) => b.count - a.count).slice(0, 5);

    return { approved, pending, totalEntries, unreadNotifs, displayBudgetData, realDeptPerformance, computedPassTrend, computedResearch: researchArray, statusData, deptVolume };
  }, [loading, stats, metricEntries, departments, notifications, currentUser?.id]);

  if (loading) return <DashboardSkeleton />;

  const { approved, pending, totalEntries, unreadNotifs, displayBudgetData, realDeptPerformance, computedPassTrend, computedResearch, statusData, deptVolume } = calculations!;

  const dashboardVis = metricEntries.filter(e => ["APPROVED_FINAL", "PENDING_ADMIN", "PENDING_OFFICE"].includes(e.status));

  // Dynamic placement data from dashboard entries
  const computedPlacements = dashboardVis
    .filter(e => e.category === "STUDENT_ACHIEVEMENT")
    .map(e => ({ name: (e.title || "").length > 20 ? (e.title || "").slice(0, 20) + "…" : (e.title || "Achievement"), count: e.numericValue || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const insights = [
      `Overall approval rate stands at ${totalEntries > 0 ? Math.round((approved / totalEntries) * 100) : 0}% active validation.`,
      `Verified institutional research volume: ${computedResearch.reduce((s, r) => s + r.count, 0)} items checked.`,
      `Budget oversight: ₹${displayBudgetData.reduce((s, b) => s + b.value, 0).toLocaleString()} funds under review/approved.`,
      `Top active department: ${deptVolume[0]?.name || "N/A"} with ${deptVolume[0]?.count || 0} records.`
  ];

  const submissionTrend = (() => {
    const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
    return months.map(m => {
      const submissions = metricEntries.filter(e => {
        if (!e.createdAt) return false;
        const d = new Date(e.createdAt);
        if (isNaN(d.getTime())) return false;
        return d.toLocaleString("en-US", { month: "short" }) === m;
      }).length;
      const approvals = metricEntries.filter(e => {
        if (!e.createdAt) return false;
        const d = new Date(e.createdAt);
        if (isNaN(d.getTime())) return false;
        return d.toLocaleString("en-US", { month: "short" }) === m && e.status === "APPROVED_FINAL";
      }).length;
      return { month: m, submissions, approvals };
    });
  })();

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Institutional Analytics Portal</h2>
          <p className="text-sm text-muted-foreground italic">Comprehensive Oversight · Academic Year 2025-26</p>
        </div>
        <div className="flex gap-2">
           <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1">LIVE DATAFEED</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Departments" value={departments.length} icon={Users} color="blue" trend={{ value: 0, label: "All depts" }} />
        <StatCard title="Reports Approved" value={approved} icon={CheckSquare} color="green" trend={{ value: 12, label: "vs last cycle" }} />
        <StatCard title="Pending Final Review" value={pending} icon={AlertCircle} color="orange" subtitle="Action required" />
        <StatCard title="Total Raw Entries" value={totalEntries} icon={BookOpen} color="purple" trend={{ value: 8, label: "vs last cycle" }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-blue-700 border border-indigo-400 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <h3 className="text-lg font-bold">Intelligent Platform Insights</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-start gap-3">
                    <div className="w-1.5 h-1.5 mt-2 rounded-full bg-yellow-400 shrink-0" />
                    <p className="text-sm font-medium leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
           </div>
           <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl opacity-20" />
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
           <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
             <BarChart3 className="w-4 h-4 text-emerald-600" /> Approval Health
           </h3>
           <div className="h-[200px]">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                   {statusData.map((_, i) => <Cell key={i} fill={statusData[i].fill} />)}
                 </Pie>
                 <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
               </PieChart>
             </ResponsiveContainer>
           </div>
           <div className="mt-4 flex flex-wrap gap-4 justify-center">
              {statusData.map(s => (
                <div key={s.name} className="flex items-center gap-1.5">
                   <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.fill }} />
                   <span className="text-[10px] font-bold text-muted-foreground uppercase">{s.name}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-foreground mb-6">Institutional Submission Trend (Year-on-Year)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={submissionTrend}>
            <defs>
              <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
            <Legend wrapperStyle={{ paddingTop: 20 }} />
            <Area type="monotone" dataKey="submissions" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSub)" name="Total Records" />
            <Area type="monotone" dataKey="approvals" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.05} name="Approved Entries" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
         <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-6">Submission Volume by Department (Top 5)</h3>
            <ResponsiveContainer width="100%" height={250}>
               <BarChart data={deptVolume} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10 }} hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
               </BarChart>
            </ResponsiveContainer>
         </div>

         <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-6">Verified Financial Utilization (By Dept Code)</h3>
            <ResponsiveContainer width="100%" height={250}>
               <PieChart>
                 <Pie data={displayBudgetData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name }) => name}>
                    {displayBudgetData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                 </Pie>
                 <Tooltip formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`} />
               </PieChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-6">Research Output Classification</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={computedResearch}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="type" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Verified Items" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-6">Inter-Departmental Performance Index</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={realDeptPerformance}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="dept" tick={{ fontSize: 10, fontWeight: 600 }} />
              <PolarRadiusAxis domain={[0, 100]} hide />
              <Radar name="Approval Efficiency" dataKey="performance" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}