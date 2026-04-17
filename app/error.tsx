"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-xl shadow-red-500/25 mb-6"
        >
          <AlertTriangle className="w-10 h-10 text-white" />
        </motion.div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          An unexpected error occurred. Our team has been notified.
          {error.digest && <span className="block mt-1 text-xs font-mono text-muted-foreground/50">Ref: {error.digest}</span>}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            <RotateCcw className="w-4 h-4" /> Try Again
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/dashboard">
              <Home className="w-4 h-4" /> Go to Dashboard
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
