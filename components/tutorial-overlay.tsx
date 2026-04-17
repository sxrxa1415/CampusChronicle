"use client";
import { useAppStore } from "@/lib/store";
import { Button } from "./ui/button";
import { X, ChevronRight, BookOpen, GraduationCap, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const TUTORIAL_STEPS = [
  {
    title: "Welcome to CampusChronicle!",
    description: "Your unified institutional reporting platform. Efficient, secure, and transparent data management.",
    icon: GraduationCap,
    action: null,
  },
  {
    title: "Intelligence Dashboard",
    description: "Monitor real-time KPIs, department health scores, and pending audit actions from one central cockpit.",
    icon: BookOpen,
    action: "/dashboard",
  },
  {
    title: "Data Submission Console",
    description: "Submit metric entries with institutional guidelines. Upload supporting documents for NIRF/NAAC audits.",
    icon: BookOpen,
    action: "/dashboard/upload",
  },
  {
    title: "Audit Feedback Loop",
    description: "HODs and Reviewers collaborate here to verify data integrity and request revisions on report drafts.",
    icon: BookOpen,
    action: "/dashboard/review",
  },
  {
    title: "Institutional Archive",
    description: "Access finalized annual reports and comprehensive PDF exports for official accreditation purposes.",
    icon: BookOpen,
    action: "/dashboard/reports",
  },
];

export function TutorialOverlay() {
  const { tutorialActive, tutorialStep, nextTutorialStep, endTutorial } = useAppStore();
  const router = useRouter();
  
  if (!tutorialActive) return null;

  const step = TUTORIAL_STEPS[tutorialStep];
  const isLast = tutorialStep === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (step?.action) router.push(step.action);
    if (isLast) { endTutorial(); return; }
    nextTutorialStep();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-card border border-border rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="relative p-10 text-center flex-1">
          {/* Decorative background element */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10" />
          
          <button 
            onClick={endTutorial} 
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8 shadow-inner">
            {isLast ? <CheckCircle className="w-10 h-10 text-primary" /> : <BookOpen className="w-10 h-10 text-primary" />}
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3">Institutional Guide</p>
          <h3 className="text-2xl font-black text-foreground mb-4 tracking-tight leading-tight">{step.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-10 px-4">{step.description}</p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2.5 mb-2">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === tutorialStep ? "w-8 bg-primary" : "w-1.5 bg-muted-foreground/30"}`}
              />
            ))}
          </div>
        </div>

        <div className="px-10 py-8 bg-muted/30 border-t border-border flex gap-4">
          <Button variant="ghost" size="lg" onClick={endTutorial} className="flex-1 rounded-2xl font-bold text-muted-foreground hover:bg-white">
            Dismiss
          </Button>
          <Button size="lg" onClick={handleNext} className="flex-1 rounded-2xl font-black shadow-lg shadow-primary/20">
            {isLast ? "Begin Working" : "Understand Next"}
            {!isLast && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
