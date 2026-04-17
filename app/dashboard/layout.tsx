"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useHydrateStore } from "@/lib/use-hydrate-store";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { BottomNav } from "@/components/bottom-nav";
import { TutorialOverlay } from "@/components/tutorial-overlay";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useHydrateStore();
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useAppStore((s) => s.currentUser);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !currentUser) {
      router.push("/");
    }
  }, [currentUser, router, isHydrated]);

  if (!isHydrated || !currentUser) return null;

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Institutional Sidebar */}
      <AppSidebar />

      {/* Primary Workspace */}
      <div className="flex flex-col flex-1 min-w-0 bg-[#f9fafb]">
        <AppTopbar />
        
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-auto">
          <div key={pathname} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>
      </div>

      {/* Global Overlays & Mobile Nav */}
      <BottomNav />
      <TutorialOverlay />
    </div>
  );
}
