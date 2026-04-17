"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, LayoutDashboard, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-[60vh] px-4"
    >
      <div className="text-center max-w-sm">
        <motion.div
          initial={{ rotate: -10, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring" }}
          className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-5"
        >
          <AlertTriangle className="w-8 h-8 text-white" />
        </motion.div>

        <h2 className="text-lg font-bold text-foreground mb-2">Dashboard Error</h2>
        <p className="text-sm text-muted-foreground mb-6">
          This section encountered an error. Try refreshing or navigate back.
        </p>

        <div className="flex gap-3 justify-center">
          <Button onClick={reset} size="sm" className="gap-2">
            <RotateCcw className="w-3.5 h-3.5" /> Retry
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/dashboard">
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </Link>
          </Button>
        </div>

        <p className="mt-8 text-[10px] text-muted-foreground/40 flex items-center justify-center gap-1">
          <GraduationCap className="w-3 h-3" /> CampusChronicle Error Handler
        </p>
      </div>
    </motion.div>
  );
}
