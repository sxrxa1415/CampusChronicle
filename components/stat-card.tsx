"use client";
import { useEffect, useRef, useState } from "react";
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

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Simple intersection observer to trigger animation
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const duration = 800;
        const startTime = performance.now();

        function animate(currentTime: number) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(eased * value));
          if (progress < 1) requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{display.toLocaleString()}</span>;
}

export function StatCard({ title, value, subtitle, icon: Icon, color = "blue", trend, className }: StatCardProps) {
  const isNumeric = typeof value === "number";

  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border p-5 flex flex-col gap-3 cursor-default transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-l-4",
        color === "blue" ? "border-l-blue-500" : 
        color === "green" ? "border-l-green-500" : 
        color === "orange" ? "border-l-orange-500" : 
        color === "purple" ? "border-l-purple-500" : 
        color === "red" ? "border-l-red-500" : "border-l-teal-500",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold",
            trend.value >= 0 ? "text-green-600" : "text-red-500"
          )}>
            {trend.value >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {trend.value >= 0 ? "+" : ""}{trend.value}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-black text-foreground leading-tight tracking-tight">
          {isNumeric ? <AnimatedCounter value={value as number} /> : value}
        </p>
        <p className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mt-1">{title}</p>
        {subtitle && <p className="text-[10px] text-muted-foreground/60 italic mt-0.5">{subtitle}</p>}
        {trend && <p className="text-[9px] text-muted-foreground/50 mt-1 uppercase font-medium">{trend.label}</p>}
      </div>
    </div>
  );
}
