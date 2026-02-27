"use client";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { AdminDashboard } from "@/components/dashboards/admin-dashboard";
import { DeptHeadDashboard } from "@/components/dashboards/dept-head-dashboard";
import { FacultyDashboard } from "@/components/dashboards/faculty-dashboard";
import { ReviewerDashboard } from "@/components/dashboards/reviewer-dashboard";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export default function DashboardPage() {
  const currentUser = useAppStore((s) => s.currentUser);
  if (!currentUser) return null;

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {currentUser.role === "ADMIN" && <AdminDashboard />}
      {currentUser.role === "DEPARTMENT_HEAD" && <DeptHeadDashboard />}
      {currentUser.role === "FACULTY" && <FacultyDashboard />}
      {currentUser.role === "REVIEWER" && <ReviewerDashboard />}
    </motion.div>
  );
}
