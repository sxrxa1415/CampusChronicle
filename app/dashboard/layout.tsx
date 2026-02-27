"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — hidden on mobile */}
      <AppSidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        <AppTopbar />
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <BottomNav />
      <TutorialOverlay />
      <Toaster richColors position="top-right" />
    </div>
  );
}
