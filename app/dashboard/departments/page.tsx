"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import type { ApiDepartment } from "@/lib/api-client";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, GraduationCap, Award, TrendingUp, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { toast } from "sonner";

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

export default function DepartmentsPage() {
  const { reportDrafts } = useAppStore();
  const [departments, setDepartments] = useState<ApiDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.getDepartments();
      if (result.success && result.data) setDepartments(result.data);
    } catch {
      toast.error("Failed to load departments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  if (loading) return <DashboardSkeleton />;

  const totalFaculty = departments.reduce((sum, d) => sum + d.userCount, 0);
  const totalStudents = departments.reduce((sum, d) => sum + d.studentCount, 0);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h2 className="text-xl font-bold text-foreground">Departments</h2>
        <p className="text-sm text-muted-foreground"> · {departments.length} departments total</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Departments" value={departments.length} icon={BookOpen} color="blue" />
        <StatCard title="Total Faculty" value={totalFaculty} icon={Users} color="green" />
        <StatCard title="Total Students" value={totalStudents} icon={GraduationCap} color="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(() => {
          const totalPages = Math.ceil(departments.length / pageSize);
          const paginatedDepts = departments.slice((currentPage - 1) * pageSize, currentPage * pageSize);
          return (
            <>
              {paginatedDepts.map((dept, idx) => {
                const draft = reportDrafts.find((d) => d.departmentId === dept.id);
                const approvalPct = dept.entryCount > 0 ? Math.round((dept.approvedEntryCount / dept.entryCount) * 100) : 0;
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
                            draft.status === "APPROVED_FINAL" ? "bg-green-100 text-green-700 border-green-200" :
                            ["PENDING_OFFICE","PENDING_ADMIN","PENDING_HOD"].includes(draft.status) ? "bg-blue-100 text-blue-700 border-blue-200" :
                            draft.status === "REJECTED_NEEDS_REVIEW" ? "bg-red-100 text-red-700 border-red-200" :
                            "bg-gray-100 text-gray-600 border-gray-200"
                          }`}>
                            {draft.status.replace("_"," ")}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold">
                          {dept.hodName?.substring(0, 2).toUpperCase() || "—"}
                        </div>
                        <p className="text-xs text-muted-foreground">{dept.hodName ?? "HOD not assigned"}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-muted/40 rounded-lg p-2 text-center">
                          <p className="text-xs font-bold text-foreground">{dept.studentCount || "—"}</p>
                          <p className="text-[10px] text-muted-foreground">Students</p>
                        </div>
                        <div className="bg-muted/40 rounded-lg p-2 text-center">
                          <p className="text-xs font-bold text-foreground">{dept.userCount || "—"}</p>
                          <p className="text-[10px] text-muted-foreground">Faculty</p>
                        </div>
                        <div className="bg-muted/40 rounded-lg p-2 text-center">
                          <p className="text-xs font-bold text-foreground">{dept.approvedEntryCount}</p>
                          <p className="text-[10px] text-muted-foreground">Entries</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-muted-foreground">Approval %</span>
                          <span className="font-medium text-foreground">{approvalPct}%</span>
                        </div>
                        <div className="h-1 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${approvalPct}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            className="h-full bg-green-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              
              {totalPages > 1 && (
                <div className="col-span-full flex items-center justify-between px-2 pt-6">
                  <p className="text-xs font-medium text-muted-foreground">Page {currentPage} of {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 font-bold text-[10px] uppercase shadow-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" className="h-8 font-bold text-[10px] uppercase shadow-sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </motion.div>
  );
}
