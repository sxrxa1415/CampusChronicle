"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Button } from "./ui/button";
import { X, ChevronRight, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

const TUTORIAL_STEPS = [
  {
    title: "Welcome to CampusChronicle!",
    description: "This portal helps SREC manage annual reports efficiently. Let's take a quick tour.",
    action: null,
  },
  {
    title: "Dashboard Overview",
    description: "Your dashboard shows key metrics, pending actions, and recent activity tailored to your role.",
    action: "/dashboard",
  },
  {
    title: "Data Upload",
    description: "Faculty and Department Heads can upload metric entries — academic, research, placements, and more.",
    action: "/dashboard/upload",
  },
  {
    title: "Review & Approve",
    description: "Reviewers can view submitted reports, add comments, and approve or request revisions.",
    action: "/dashboard/review",
  },
  {
    title: "Analytics & Insights",
    description: "Visualize department performance, placement trends, and research output across years.",
    action: "/dashboard/analytics",
  },
  {
    title: "You're all set!",
    description: "Explore the portal at your own pace. Click the help icon anytime to restart this tutorial.",
    action: null,
  },
];

export function TutorialOverlay() {
  const { tutorialActive, tutorialStep, nextTutorialStep, endTutorial } = useAppStore();
  const router = useRouter();
  const step = TUTORIAL_STEPS[tutorialStep];
  const isLast = tutorialStep === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (step?.action) router.push(step.action);
    if (isLast) { endTutorial(); return; }
    nextTutorialStep();
  };

  return (
    <AnimatePresence>
      {tutorialActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/50 flex items-end md:items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Step {tutorialStep + 1} of {TUTORIAL_STEPS.length}
                  </span>
                </div>
                <button onClick={endTutorial} className="text-muted-foreground hover:text-foreground p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">{step.description}</p>

              {/* Progress */}
              <div className="flex gap-1 mb-6">
                {TUTORIAL_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full flex-1 transition-colors ${i <= tutorialStep ? "bg-primary" : "bg-border"}`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={endTutorial} className="flex-1">
                  Skip tour
                </Button>
                <Button size="sm" onClick={handleNext} className="flex-1">
                  {isLast ? "Done" : "Next"}
                  {!isLast && <ChevronRight className="w-3 h-3 ml-1" />}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
