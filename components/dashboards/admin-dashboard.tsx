"use client";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { MOCK_DEPARTMENTS, YEARLY_TREND_DATA, RESEARCH_OUTPUT_DATA, BUDGET_DATA, DEPT_PERFORMANCE_DATA, PLACEMENT_DATA } from "@/lib/mock-data";
import { StatCard } from "@/components/stat-card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { Users, FileText, CheckSquare, BarChart3, BookOpen, Award, AlertCircle, TrendingUp } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const PIE_COLORS = ["#6366f1","#06b6d4","#f59e0b","#10b981","#f43f5e"];

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700 border-green-200",
  UNDER_REVIEW: "bg-blue-100 text-blue-700 border-blue-200",
  SUBMITTED: "bg-yellow-100 text-yellow-700 border-yellow-200",
  DRAFT: "bg-gray-100 text-gray-600 border-gray-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
};

export function AdminDashboard() {
  const { reportDrafts, metricEntries, notifications, currentUser } = useAppStore();
  const router = useRouter();

  const approved = reportDrafts.filter((d) => d.status === "APPROVED").length;
  const pending = reportDrafts.filter((d) => ["SUBMITTED","UNDER_REVIEW"].includes(d.status)).length;
  const totalEntries = metricEntries.length;
  const approvedEntries = metricEntries.filter((e) => e.status === "APPROVED").length;
  const unreadNotifs = notifications.filter((n) => n.userId === currentUser?.id && !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground"> · Academic Year 2025-26</p>
        </div>
        <Button onClick={() => router.push("/dashboard/report-builder")} size="sm">
          <FileText className="w-4 h-4 mr-2" /> Generate Report
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Departments" value={MOCK_DEPARTMENTS.length} icon={Users} color="blue" trend={{ value: 0, label: "All departments" }} />
        <StatCard title="Reports Approved" value={approved} icon={CheckSquare} color="green" trend={{ value: 12, label: "vs last year" }} />
        <StatCard title="Pending Review" value={pending} icon={AlertCircle} color="orange" subtitle="Need attention" />
        <StatCard title="Total Entries" value={totalEntries} icon={BookOpen} color="purple" trend={{ value: 8, label: "vs last year" }} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pass percentage trend */}
        <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Department Pass % Trend (4 Years)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={YEARLY_TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[65, 100]} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="cse" stroke="#6366f1" strokeWidth={2} dot={false} name="CSE" />
              <Line type="monotone" dataKey="ece" stroke="#06b6d4" strokeWidth={2} dot={false} name="ECE" />
              <Line type="monotone" dataKey="mech" stroke="#f59e0b" strokeWidth={2} dot={false} name="MECH" />
              <Line type="monotone" dataKey="civil" stroke="#10b981" strokeWidth={2} dot={false} name="CIVIL" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Budget distribution */}
        <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Budget Distribution 2023-24</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={BUDGET_DATA} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                {BUDGET_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Research output */}
        <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Research Output (4 Years)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={RESEARCH_OUTPUT_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="journals" fill="#6366f1" radius={[3,3,0,0]} name="Journals" />
              <Bar dataKey="conferences" fill="#06b6d4" radius={[3,3,0,0]} name="Conferences" />
              <Bar dataKey="patents" fill="#f59e0b" radius={[3,3,0,0]} name="Patents" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Placement by company */}
        <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Campus Placements by Company</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PLACEMENT_DATA} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="company" type="category" tick={{ fontSize: 11 }} width={70} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Bar dataKey="count" fill="#10b981" radius={[0,3,3,0]} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Report status + dept performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Department report status */}
        <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Department Report Status</h3>
          <div className="space-y-3">
            {MOCK_DEPARTMENTS.map((dept) => {
              const draft = reportDrafts.find((d) => d.departmentId === dept.id);
              const status = draft?.status ?? "NOT_STARTED";
              return (
                <div key={dept.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{dept.code}</p>
                    <p className="text-xs text-muted-foreground">{dept.name}</p>
                  </div>
                  <Badge className={`text-[11px] border ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                    {status.replace("_", " ")}
                  </Badge>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Dept performance bar */}
        <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Department Performance vs Target</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={DEPT_PERFORMANCE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[60, 100]} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="performance" fill="#6366f1" radius={[3,3,0,0]} name="Actual %" />
              <Bar dataKey="target" fill="#e2e8f0" radius={[3,3,0,0]} name="Target %" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
