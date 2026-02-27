"use client";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { MOCK_DEPARTMENTS, MOCK_USERS, MOCK_KPIS } from "@/lib/mock-data";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, GraduationCap, Award, TrendingUp } from "lucide-react";

const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

const DEPT_COLORS = [
  "border-l-4 border-l-indigo-500",
  "border-l-4 border-l-cyan-500",
  "border-l-4 border-l-amber-500",
  "border-l-4 border-l-emerald-500",
  "border-l-4 border-l-rose-500",
  "border-l-4 border-l-violet-500",
];

const DEPT_DETAILS: Record<string, { students: number; faculty: number; founded: number }> = {
  dept1: { students: 480, faculty: 42, founded: 1994 },
  dept2: { students: 360, faculty: 35, founded: 1994 },
  dept3: { students: 240, faculty: 28, founded: 1994 },
  dept4: { students: 180, faculty: 22, founded: 1996 },
  dept5: { students: 360, faculty: 30, founded: 2001 },
  dept6: { students: 120, faculty: 15, founded: 2005 },
};

export default function DepartmentsPage() {
  const { metricEntries, reportDrafts } = useAppStore();

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h2 className="text-xl font-bold text-foreground">Departments</h2>
        <p className="text-sm text-muted-foreground"> · {MOCK_DEPARTMENTS.length} departments</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Departments" value={MOCK_DEPARTMENTS.length} icon={BookOpen} color="blue" />
        <StatCard title="Total Faculty" value={172} icon={Users} color="green" />
        <StatCard title="Total Students" value={1740} icon={GraduationCap} color="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {MOCK_DEPARTMENTS.map((dept, idx) => {
          const hod = MOCK_USERS.find((u) => u.id === dept.hodUserId);
          const kpis = MOCK_KPIS.filter((k) => k.departmentId === dept.id);
          const entries = metricEntries.filter((e) => e.departmentId === dept.id);
          const approvedEntries = entries.filter((e) => e.status === "APPROVED");
          const draft = reportDrafts.find((d) => d.departmentId === dept.id);
          const details = DEPT_DETAILS[dept.id];
          const passKpi = kpis.find((k) => k.kpiName.includes("Pass"));
          const placementKpi = kpis.find((k) => k.kpiName.includes("Placement"));

          return (
            <motion.div
              key={dept.id}
              variants={item}
              whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
              className={`bg-card rounded-xl border border-border overflow-hidden transition-shadow ${DEPT_COLORS[idx % DEPT_COLORS.length]}`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="text-xs font-bold text-primary">{dept.code}</p>
                    <h3 className="text-sm font-semibold text-foreground mt-0.5 leading-tight">{dept.name}</h3>
                  </div>
                  {draft && (
                    <Badge className={`text-[10px] shrink-0 border ${
                      draft.status === "APPROVED" ? "bg-green-100 text-green-700 border-green-200" :
                      draft.status === "UNDER_REVIEW" || draft.status === "SUBMITTED" ? "bg-blue-100 text-blue-700 border-blue-200" :
                      "bg-gray-100 text-gray-600 border-gray-200"
                    }`}>
                      {draft.status.replace("_"," ")}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold">
                    {hod?.avatar}
                  </div>
                  <p className="text-xs text-muted-foreground">{hod?.name ?? "HOD not assigned"}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-muted/40 rounded-lg p-2 text-center">
                    <p className="text-xs font-bold text-foreground">{details?.students ?? "—"}</p>
                    <p className="text-[10px] text-muted-foreground">Students</p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-2 text-center">
                    <p className="text-xs font-bold text-foreground">{details?.faculty ?? "—"}</p>
                    <p className="text-[10px] text-muted-foreground">Faculty</p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-2 text-center">
                    <p className="text-xs font-bold text-foreground">{approvedEntries.length}</p>
                    <p className="text-[10px] text-muted-foreground">Entries</p>
                  </div>
                </div>

                {(passKpi || placementKpi) && (
                  <div className="space-y-1.5">
                    {passKpi && (
                      <div>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-muted-foreground">Pass %</span>
                          <span className="font-medium text-foreground">{passKpi.kpiValue}%</span>
                        </div>
                        <div className="h-1 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${passKpi.kpiValue}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            className="h-full bg-green-500 rounded-full"
                          />
                        </div>
                      </div>
                    )}
                    {placementKpi && (
                      <div>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-muted-foreground">Placement %</span>
                          <span className="font-medium text-foreground">{placementKpi.kpiValue}%</span>
                        </div>
                        <div className="h-1 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${placementKpi.kpiValue}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 + 0.2 }}
                            className="h-full bg-blue-500 rounded-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
