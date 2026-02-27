"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "blue" | "green" | "orange" | "purple" | "red" | "teal";
  trend?: { value: number; label: string };
  className?: string;
}

const colorMap = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  green: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  red: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  teal: "bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } },
};

export function StatCard({ title, value, subtitle, icon: Icon, color = "blue", trend, className }: StatCardProps) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
      className={cn(
        "bg-card rounded-xl border border-border p-5 flex flex-col gap-3 cursor-default",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trend.value >= 0 ? "text-green-600" : "text-red-500"
          )}>
            {trend.value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value >= 0 ? "+" : ""}{trend.value}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>}
        {trend && <p className="text-xs text-muted-foreground/70 mt-1">{trend.label}</p>}
      </div>
    </motion.div>
  );
}
