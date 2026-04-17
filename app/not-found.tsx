"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { GraduationCap, Home, ArrowLeft, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center max-w-md"
      >
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/25 mb-6">
            <SearchX className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            404
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-foreground mb-2">Page Not Found</h2>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button asChild className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            <Link href="/dashboard">
              <Home className="w-4 h-4" /> Go to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex items-center justify-center gap-2 text-muted-foreground/50"
        >
          <GraduationCap className="w-4 h-4" />
          <span className="text-xs">CampusChronicle</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
