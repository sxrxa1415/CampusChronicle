"use client";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { MOCK_DEPARTMENTS, MOCK_KPIS, MOCK_USERS } from "@/lib/mock-data";
import { StatCard } from "@/components/stat-card";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { CheckSquare, Clock, XCircle, FileText, UploadCloud, Users, BookOpen, Award } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const STATUS_COLORS: Record<string, string> = {
  APPROVED_FINAL: "bg-green-100 text-green-700 border-green-200",
  PENDING_HOD: "bg-yellow-100 text-yellow-700 border-yellow-200",
  PENDING_OFFICE: "bg-blue-100 text-blue-700 border-blue-200",
  REJECTED_NEEDS_REVIEW: "bg-red-100 text-red-700 border-red-200",
};

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
  const { currentUser, metricEntries, reportDrafts, notifications } = useAppStore();
  const router = useRouter();

  const dept = MOCK_DEPARTMENTS.find((d) => d.id === currentUser?.departmentId);
  const deptEntries = metricEntries.filter((e) => e.departmentId === currentUser?.departmentId);
  const myDraft = reportDrafts.find((d) => d.departmentId === currentUser?.departmentId);
  const myKpis = MOCK_KPIS.filter((k) => k.departmentId === currentUser?.departmentId);
  const myNotifs = notifications.filter((n) => n.userId === currentUser?.id && !n.isRead).length;

  const approved = deptEntries.filter((e) => ["PENDING_OFFICE", "PENDING_ADMIN", "APPROVED_FINAL"].includes(e.status)).length;
  const pending = deptEntries.filter((e) => e.status === "PENDING_HOD").length;
  const rejected = deptEntries.filter((e) => e.status === "REJECTED_NEEDS_REVIEW").length;

  const radarData = myKpis.map((k) => ({ subject: k.kpiName.split(" ").slice(0, 2).join(" "), value: k.kpiValue, fullMark: 100 }));

  const categoryCounts = deptEntries.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.entries(categoryCounts).map(([cat, count]) => ({
    category: cat.replace("_", " ").slice(0, 10),
    count,
  }));

  return (
    <div className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Department Dashboard</h2>
          <p className="text-sm text-muted-foreground">{dept?.name ?? "Department"} · 2025-26</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/upload")}>
            <UploadCloud className="w-4 h-4 mr-2" /> Add Entry
          </Button>
          <Button size="sm" onClick={() => router.push("/dashboard/draft")}>
            <FileText className="w-4 h-4 mr-2" /> View Draft
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Entries" value={deptEntries.length} icon={BookOpen} color="blue" />
        <StatCard title="Approved" value={approved} icon={CheckSquare} color="green" trend={{ value: 5, label: "this period" }} />
        <StatCard title="Pending" value={pending} icon={Clock} color="orange" subtitle="Awaiting review" />
        <StatCard title="Rejected" value={rejected} icon={XCircle} color="red" subtitle="Need revision" />
      </div>

      {/* Draft status banner */}
      {myDraft && (
        <motion.div
          variants={item}
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
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">KPI Radar — 2025-26</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar name="KPI" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Entries by Category</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="category" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} name="Entries" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent entries */}
      <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
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
                  {entry.numericValue !== undefined && (
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
      </motion.div>
    </div>
  );
}
