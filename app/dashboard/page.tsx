"use client";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { AdminDashboard } from "@/components/dashboards/admin-dashboard";
import { DeptHeadDashboard } from "@/components/dashboards/dept-head-dashboard";
import { FacultyDashboard } from "@/components/dashboards/faculty-dashboard";
import { ReviewerDashboard } from "@/components/dashboards/reviewer-dashboard";

export default function DashboardPage() {
  const currentUser = useAppStore((s) => s.currentUser);
  if (!currentUser) return null;

  return (
    <div className="space-y-4">
      {currentUser.role === "ADMIN" && <AdminDashboard />}
      {currentUser.role === "DEPARTMENT_HEAD" && <DeptHeadDashboard />}
      {currentUser.role === "FACULTY" && <FacultyDashboard />}
      {currentUser.role === "REVIEWER" && <ReviewerDashboard />}
    </div>
  );
}
