"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import type { ApiDepartment } from "@/lib/api-client";
import { StatCard } from "@/components/stat-card";
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, Legend, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { CheckSquare, Clock, FileText, UploadCloud, Users, BookOpen, Award, BarChart3, TrendingUp, AlertCircle, XCircle, Bell } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const STATUS_COLORS: Record<string, string> = {
  APPROVED_FINAL: "bg-green-100 text-green-700 border-green-200",
  PENDING_HOD: "bg-yellow-100 text-yellow-700 border-yellow-200",
  PENDING_OFFICE: "bg-blue-100 text-blue-700 border-blue-200",
  REJECTED_NEEDS_REVIEW: "bg-red-100 text-red-700 border-red-200",
};

export function FacultyDashboard() {
  const { currentUser, notifications } = useAppStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metricEntries, setMetricEntries] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [entriesRes] = await Promise.all([
          api.getEntries()
        ]);
        if (entriesRes.success && entriesRes.data) setMetricEntries(entriesRes.data);
      } catch (e) {}
      setLoading(false);
    }
    fetchData();
  }, [currentUser?.departmentId]);

  const calculations = useMemo(() => {
    const myEntries = metricEntries.filter((e) => e.createdByUserId === currentUser?.id);
    const approved = myEntries.filter((e) => e.status === "APPROVED_FINAL").length;
    const pending = myEntries.filter((e) => e.status === "PENDING_HOD").length;
    const rejected = myEntries.filter((e) => e.status === "REJECTED_NEEDS_REVIEW").length;
    const safeNotifs = Array.isArray(notifications) ? notifications : [];
    const myNotifs = safeNotifs.filter((n) => n.userId === currentUser?.id && !n.isRead);

    // Trend computed from actual entries grouped by month
    const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
    const grouped = months.map(month => {
      const count = myEntries.filter(e => {
        if (!e.createdAt) return false;
        const d = new Date(e.createdAt);
        if (isNaN(d.getTime())) return false;
        return d.toLocaleString("en-US", { month: "short" }) === month;
      }).length;
      return { month, entries: count };
    });
    
    // Target summaries
    const totalMenteePapers = myEntries.reduce((sum, e) => sum + (e.studentTargets?.papersPublished || 0), 0);
    const totalStaffPay = myEntries.reduce((sum, e) => sum + (e.staffTargets?.extraPay || 0), 0);
    const totalFinancials = myEntries.reduce((sum, e) => sum + (e.financialSpends || 0), 0);

    const categoryDistribution = myEntries.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const catData = Object.entries(categoryDistribution).map(([name, value]) => ({ name: name.replace("_", " "), value }));

    const contributionRadar = myEntries.length > 0 ? [
      { subject: "Academic", A: myEntries.filter(e => e.category === "ACADEMIC").length * 20, fullMark: 100 },
      { subject: "Research", A: myEntries.filter(e => e.category === "RESEARCH").length * 20, fullMark: 100 },
      { subject: "Students", A: myEntries.filter(e => e.category === "STUDENT_ACHIEVEMENT").length * 20, fullMark: 100 },
      { subject: "Events", A: myEntries.filter(e => e.category === "EXTRACURRICULAR").length * 20, fullMark: 100 },
      { subject: "Other", A: myEntries.filter(e => e.category === "OTHER").length * 20, fullMark: 100 },
    ] : [
      { subject: "Academic", A: 10, fullMark: 100 },
      { subject: "Research", A: 5, fullMark: 100 },
      { subject: "Students", A: 15, fullMark: 100 },
      { subject: "Events", A: 0, fullMark: 100 },
      { subject: "Other", A: 10, fullMark: 100 },
    ];

    return { myEntries, approved, pending, rejected, myNotifs, trendData: grouped, totalMenteePapers, totalStaffPay, totalFinancials, catData, contributionRadar };
  }, [loading, metricEntries, currentUser, notifications]);

  if (loading) return <DashboardSkeleton />;

  const { myEntries, approved, pending, rejected, trendData, totalMenteePapers, catData, contributionRadar } = calculations!;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Faculty Insights Portal</h2>
          <p className="text-sm text-muted-foreground italic">Comprehensive Oversight · Academic Year 2025-26</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/upload")}>
            <UploadCloud className="w-4 h-4 mr-2" /> Upload Report
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Uploads" value={myEntries.length} icon={BookOpen} color="blue" />
        <StatCard title="Approved" value={approved} icon={CheckSquare} color="green" trend={{ value: 4, label: "this cycle" }} />
        <StatCard title="Review Required" value={pending} icon={Clock} color="orange" subtitle="Awaiting HOD" />
        <StatCard title="Papers Published" value={totalMenteePapers} icon={Award} color="purple" subtitle="Mentee activity" />
      </div>

      {/* Middle Row: Radar and Activity Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
         <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-6">Submission Intensity Trend</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorEnt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="entries" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorEnt)" name="Reports" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-6">Contribution Radar</h3>
            <div className="h-[280px]">
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="80%" data={contributionRadar}>
                   <PolarGrid stroke="hsl(var(--border))" />
                   <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 600 }} />
                   <Radar name="My Activity" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                   <Tooltip />
                 </RadarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* Row 3 - Categorical and List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category Breakdown Bar */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
           <h3 className="text-sm font-bold text-foreground mb-6">Upload Classification</h3>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={catData} layout="vertical">
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                 <XAxis type="number" hide />
                 <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontWeight: 600 }} width={80} axisLine={false} tickLine={false} />
                 <Tooltip />
                 <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* My entries */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-foreground">Recent Submission Log</h3>
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/entries")} className="text-xs h-8">View all</Button>
          </div>
          <div className="space-y-4">
            {myEntries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-start justify-between py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors rounded-lg px-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{entry.title}</p>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{entry.category.replace("_", " ")} · {new Date(entry.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}</p>
                </div>
                <Badge className={`text-[10px] uppercase tracking-wider py-0.5 font-bold border ml-4 shrink-0 ${STATUS_COLORS[entry.status] ?? STATUS_COLORS.PENDING_HOD}`}>
                  {entry.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rejected/Revision Alerts */}
      {rejected > 0 && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-destructive mb-4 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Action Required: Revise Rejected Submissions ({rejected})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myEntries.filter((e) => e.status === "REJECTED_NEEDS_REVIEW").map((entry) => (
              <div key={entry.id} className="p-4 bg-white/50 backdrop-blur-sm border border-destructive/10 rounded-xl">
                <p className="text-sm font-bold text-foreground">{entry.title}</p>
                {entry.reviewerComment && (
                  <p className="text-xs text-destructive mt-1.5 leading-relaxed bg-destructive/5 p-2 rounded-lg italic">" {entry.reviewerComment} "</p>
                )}
                <Button variant="destructive" size="sm" className="mt-3 h-8 text-xs font-bold w-full"
                  onClick={() => router.push("/dashboard/upload")}>
                  Modify & Resubmit
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
