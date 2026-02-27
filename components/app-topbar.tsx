"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { MOCK_DEPARTMENTS } from "@/lib/mock-data";
import { Bell, LogOut, Moon, Sun, GraduationCap, HelpCircle, X } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/upload": "Data Upload",
  "/dashboard/entries": "My Entries",
  "/dashboard/draft": "Draft & Preview",
  "/dashboard/review": "Review Reports",
  "/dashboard/report-builder": "Report Builder",
  "/dashboard/reports": "All Reports",
  "/dashboard/analytics": "Analytics",
  "/dashboard/departments": "Departments",
  "/dashboard/templates": "Templates",
  "/dashboard/settings": "Settings",
};

export function AppTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, notifications, markAllNotificationsRead, markNotificationRead, logout, updateUserTheme, startTutorial } = useAppStore();
  const [showNotif, setShowNotif] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  if (!currentUser) return null;

  const userNotifs = notifications.filter((n) => n.userId === currentUser.id);
  const unread = userNotifs.filter((n) => !n.isRead).length;
  const dept = currentUser.departmentId ? MOCK_DEPARTMENTS.find((d) => d.id === currentUser.departmentId) : null;
  const title = PAGE_TITLES[pathname] ?? "CampusChronicle";

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  const toggleTheme = () => {
    const newTheme = darkMode ? "light" : "dark";
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
    updateUserTheme(newTheme);
    toast.success(`${newTheme === "dark" ? "Dark" : "Light"} mode enabled`);
  };

  const typeColors: Record<string, string> = {
    info: "bg-blue-50 border-blue-200",
    success: "bg-green-50 border-green-200",
    warning: "bg-yellow-50 border-yellow-200",
    error: "bg-red-50 border-red-200",
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      {/* Left: Mobile logo + title */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-foreground leading-tight">{title}</h1>
          {dept && <p className="text-xs text-muted-foreground hidden sm:block">{dept.name}</p>}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Tutorial */}
        <Button variant="ghost" size="icon" onClick={startTutorial} className="w-8 h-8 md:w-9 md:h-9" title="Start tutorial">
          <HelpCircle className="w-4 h-4" />
        </Button>

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-8 h-8 md:w-9 md:h-9">
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost" size="icon"
            onClick={() => setShowNotif(!showNotif)}
            className="w-8 h-8 md:w-9 md:h-9 relative"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Button>

          <AnimatePresence>
            {showNotif && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-10 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-foreground" />
                      <span className="text-sm font-semibold text-foreground">Notifications</span>
                      {unread > 0 && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{unread}</Badge>}
                    </div>
                    <div className="flex items-center gap-1">
                      {unread > 0 && (
                        <button
                          onClick={() => { markAllNotificationsRead(); toast.success("All marked as read"); }}
                          className="text-[11px] text-primary hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                      <button onClick={() => setShowNotif(false)} className="p-1 rounded hover:bg-muted ml-2">
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {userNotifs.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground text-sm">No notifications</div>
                    ) : (
                      userNotifs.slice(0, 8).map((n) => (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => markNotificationRead(n.id)}
                          className={cn(
                            "px-4 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors",
                            !n.isRead && "bg-primary/5"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />}
                            <div className={n.isRead ? "pl-3.5" : ""}>
                              <p className="text-xs font-semibold text-foreground">{n.title}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                              <p className="text-[10px] text-muted-foreground/70 mt-1">
                                {new Date(n.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User avatar + logout */}
        <div className="flex items-center gap-2 ml-1">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[11px] font-bold text-primary">
            {currentUser.avatar}
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="w-8 h-8 text-muted-foreground hover:text-destructive" title="Log out">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
