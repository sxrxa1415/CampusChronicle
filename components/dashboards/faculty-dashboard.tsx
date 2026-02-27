"use client";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { MOCK_DEPARTMENTS } from "@/lib/mock-data";
import { StatCard } from "@/components/stat-card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { CheckSquare, Clock, XCircle, UploadCloud, BookOpen, Bell } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700 border-green-200",
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  SUBMITTED: "bg-blue-100 text-blue-700 border-blue-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
};

export function FacultyDashboard() {
  const { currentUser, metricEntries, notifications } = useAppStore();
  const router = useRouter();

  const myEntries = metricEntries.filter((e) => e.createdByUserId === currentUser?.id);
  const dept = MOCK_DEPARTMENTS.find((d) => d.id === currentUser?.departmentId);
  const approved = myEntries.filter((e) => e.status === "APPROVED").length;
  const pending = myEntries.filter((e) => e.status === "PENDING").length;
  const rejected = myEntries.filter((e) => e.status === "REJECTED").length;
  const myNotifs = notifications.filter((n) => n.userId === currentUser?.id && !n.isRead);

  // Trend over simulated months
  const trendData = [
    { month: "Aug", entries: 1 },
    { month: "Sep", entries: 2 },
    { month: "Oct", entries: 1 },
    { month: "Nov", entries: 3 },
    { month: "Dec", entries: 2 },
    { month: "Jan", entries: myEntries.length },
  ];

  return (
    <div className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Faculty Portal</h2>
          <p className="text-sm text-muted-foreground">{dept?.name} · {currentUser?.name}</p>
        </div>
        <Button size="sm" onClick={() => router.push("/dashboard/upload")}>
          <UploadCloud className="w-4 h-4 mr-2" /> Upload Entry
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="My Entries" value={myEntries.length} icon={BookOpen} color="blue" />
        <StatCard title="Approved" value={approved} icon={CheckSquare} color="green" />
        <StatCard title="Pending" value={pending} icon={Clock} color="orange" subtitle="Awaiting review" />
      </div>

      {/* Unread notifications */}
      {myNotifs.length > 0 && (
        <motion.div variants={item} className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-orange-600" />
            <p className="text-sm font-semibold text-orange-700">Unread Notifications ({myNotifs.length})</p>
          </div>
          <div className="space-y-2">
            {myNotifs.slice(0, 3).map((n) => (
              <div key={n.id} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Submission Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Area type="monotone" dataKey="entries" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} name="Entries" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* My entries */}
        <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">My Recent Entries</h3>
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/entries")}>View all</Button>
          </div>
          <div className="space-y-3">
            {myEntries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-start justify-between py-2 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{entry.title}</p>
                  <p className="text-[11px] text-muted-foreground">{entry.category.replace("_", " ")} · {new Date(entry.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}</p>
                </div>
                <Badge className={`text-[11px] border ml-2 shrink-0 ${STATUS_COLORS[entry.status] ?? STATUS_COLORS.PENDING}`}>
                  {entry.status}
                </Badge>
              </div>
            ))}
            {myEntries.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-muted-foreground text-sm">No entries yet</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => router.push("/dashboard/upload")}>
                  Upload your first entry
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Rejected entries that need revision */}
      {rejected > 0 && (
        <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-destructive" />
            Entries Requiring Revision
          </h3>
          <div className="space-y-3">
            {myEntries.filter((e) => e.status === "REJECTED").map((entry) => (
              <div key={entry.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-foreground">{entry.title}</p>
                {entry.reviewerComment && (
                  <p className="text-xs text-red-600 mt-1">Reviewer: {entry.reviewerComment}</p>
                )}
                <Button variant="outline" size="sm" className="mt-2 h-7 text-xs border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => router.push("/dashboard/upload")}>
                  Resubmit
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
