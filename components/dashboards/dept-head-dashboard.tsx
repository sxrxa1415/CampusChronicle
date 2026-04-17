"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { StatCard } from "@/components/stat-card";
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, Legend, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { CheckSquare, Clock, FileText, UploadCloud, Users, BookOpen, Award, BarChart3, TrendingUp, AlertCircle, XCircle } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const STATUS_COLORS: Record<string, string> = {
  APPROVED_FINAL: "bg-green-100 text-green-700 border-green-200",
  PENDING_HOD: "bg-yellow-100 text-yellow-700 border-yellow-200",
  PENDING_OFFICE: "bg-blue-100 text-blue-700 border-blue-200",
  REJECTED_NEEDS_REVIEW: "bg-red-100 text-red-700 border-red-200",
};

const pillColors = ["#6366f1", "#06b6d4", "#f59e0b", "#10b981", "#f43f5e"];

const CAT_COLORS: Record<string, string> = {
  ACADEMIC: "text-blue-600",
  RESEARCH: "text-purple-600",
  STUDENT_ACHIEVEMENT: "text-green-600",
  FACULTY_ACHIEVEMENT: "text-orange-600",
  EXTRACURRICULAR: "text-teal-600",
  INFRASTRUCTURE: "text-gray-600",
  FINANCIAL: "text-red-600",
  OTHER: "text-muted-foreground",
};

export function DeptHeadDashboard() {
  const { currentUser, notifications } = useAppStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deptName, setDeptName] = useState("Department");
  const [metricEntries, setMetricEntries] = useState<any[]>([]);
  const [myDraft, setMyDraft] = useState<any | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [entriesRes, draftsRes, deptsRes] = await Promise.all([
          api.getEntries(),
          api.getDrafts(),
          api.getDepartments()
        ]);
        if (entriesRes.success && entriesRes.data) setMetricEntries(entriesRes.data);
        if (draftsRes.success && draftsRes.data) setMyDraft(draftsRes.data.find((d: any) => d.departmentId === currentUser?.departmentId) || null);
        if (deptsRes.success && deptsRes.data) {
          const d = deptsRes.data.find((d: any) => d.id === currentUser?.departmentId);
          if (d) setDeptName(d.name);
        }
      } catch (e) {}
      setLoading(false);
    }
    fetchData();
  }, [currentUser?.departmentId]);

  const calculations = useMemo(() => {
    if (loading) return null;
    const deptEntries = metricEntries.filter((e) => e.departmentId === currentUser?.departmentId);
    const safeNotifs = Array.isArray(notifications) ? notifications : [];
    const myNotifs = safeNotifs.filter((n) => n.userId === currentUser?.id && !n.isRead).length;

    const approved = deptEntries.filter((e) => ["PENDING_OFFICE", "PENDING_ADMIN", "APPROVED_FINAL"].includes(e.status)).length;
    const pending = deptEntries.filter((e) => e.status === "PENDING_HOD").length;
    const rejected = deptEntries.filter((e) => e.status === "REJECTED_NEEDS_REVIEW").length;

    // Compute radar from entries by category (includes pending work to show active progress)
    const categories = ["ACADEMIC", "RESEARCH", "STUDENT_ACHIEVEMENT", "FACULTY_ACHIEVEMENT", "EXTRACURRICULAR"];
    const radarData = categories.map(cat => {
      const catEntries = deptEntries.filter(e => e.category === cat && e.status !== "REJECTED_NEEDS_REVIEW");
      const avg = catEntries.length ? Math.round(catEntries.reduce((s, e) => s + (e.numericValue || 0), 0) / catEntries.length) : 0;
      return { subject: cat.replace("_", " ").split(" ").slice(0, 2).join(" "), value: avg, fullMark: 100 };
    }).filter(d => d.value > 0);

    const categoryCounts = deptEntries.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1;
      return acc;
    }, {});
    const barData = Object.entries(categoryCounts).map(([cat, count]) => ({
      category: cat.replace("_", " ").slice(0, 10),
      count,
    }));

    const list = [...deptEntries].sort((a,b) => {
      const d1 = new Date(a.createdAt).getTime();
      const d2 = new Date(b.createdAt).getTime();
      return (isNaN(d1) ? 0 : d1) - (isNaN(d2) ? 0 : d2);
    });
    const grouped = list.reduce((acc, e) => {
      if (!e.createdAt) return acc;
      const dateObj = new Date(e.createdAt);
      if (isNaN(dateObj.getTime())) return acc;
      const d = dateObj.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const resultTimeline = Object.entries(grouped).map(([date, count]) => ({ date, count }));
    const submissionTimeline = resultTimeline.length > 0 ? resultTimeline : [{ date: "No Data", count: 0 }];

    return { deptEntries, myNotifs, approved, pending, rejected, radarData, barData, submissionTimeline };
  }, [loading, metricEntries, currentUser?.departmentId, notifications, currentUser?.id]);

  if (loading) return <DashboardSkeleton />;

  const { deptEntries, myNotifs, approved, pending, rejected, radarData, barData, submissionTimeline } = calculations!;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Department Dashboard</h2>
          <p className="text-sm text-muted-foreground">{deptName} · 2025-26</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/upload")}>
            <UploadCloud className="w-4 h-4 mr-2" /> Add Entry
          </Button>
          <Button size="sm" onClick={() => router.push("/dashboard/draft")}>
            <FileText className="w-4 h-4 mr-2" /> View Draft
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Entries" value={deptEntries.length} icon={BookOpen} color="blue" />
        <StatCard title="Approved" value={approved} icon={CheckSquare} color="green" trend={{ value: 5, label: "this period" }} />
        <StatCard title="Pending" value={pending} icon={Clock} color="orange" subtitle="Awaiting review" />
        <StatCard title="Rejected" value={rejected} icon={XCircle} color="red" subtitle="Need revision" />
      </div>

      {/* Draft status banner */}
      {myDraft && (
        <div
          className={cn(
            "flex items-center justify-between p-4 rounded-xl border",
            myDraft.status === "APPROVED_FINAL" ? "bg-green-50 border-green-200" :
              myDraft.status === "PENDING_ADMIN" ? "bg-blue-50 border-blue-200" :
                myDraft.status === "REJECTED_NEEDS_REVIEW" ? "bg-red-50 border-red-200" :
                  "bg-yellow-50 border-yellow-200"
          )}
        >
          <div>
            <p className="text-sm font-semibold text-foreground">
              Department Report — {myDraft.status.replace("_", " ")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {myDraft.submittedAt
                ? `Submitted on ${new Date(myDraft.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                : "Draft not yet submitted"}
            </p>
          </div>
          <Badge className={`border ${STATUS_COLORS[myDraft.status] ?? STATUS_COLORS.PENDING_HOD}`}>
            {myDraft.status.replace("_", " ")}
          </Badge>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar KPI */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" /> Key Performance Indicators
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Dept Performance" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" /> Category Distribution
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={barData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="category"
                >
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pillColors[index % pillColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', background: 'hsl(var(--card))' }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 20 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Timeline Velocity */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" /> Department Submission Velocity
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={submissionTimeline}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent entries */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Recent Metric Entries</h3>
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/entries")}>View all</Button>
        </div>
        <div className="space-y-3">
          {deptEntries.slice(0, 5).map((entry) => (
            <div key={entry.id} className="flex items-start justify-between py-2 border-b border-border last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{entry.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[11px] font-medium ${CAT_COLORS[entry.category]}`}>
                    {entry.category.replace("_", " ")}
                  </span>
                  {entry.numericValue !== undefined && entry.numericValue !== null && (
                    <span className="text-[11px] text-muted-foreground">Value: {entry.numericValue}</span>
                  )}
                </div>
              </div>
              <Badge className={`text-[11px] border ml-3 shrink-0 ${STATUS_COLORS[entry.status] ?? STATUS_COLORS.PENDING_HOD}`}>
                {entry.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}