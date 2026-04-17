"use client";
import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import type { ApiNotification } from "@/lib/api-client";
import { Bell, LogOut, Moon, Sun, GraduationCap, HelpCircle, X, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard Overview",
  "/dashboard/upload": "Metric Submission",
  "/dashboard/entries": "My Records",
  "/dashboard/draft": "Institution Draft",
  "/dashboard/review": "Audit Console",
  "/dashboard/reports": "Final Archive",
  "/dashboard/analytics": "Intelligence Center",
  "/dashboard/users": "Identity Control",
  "/dashboard/team": "Access Mapping",
  "/dashboard/templates": "Report Designer",
  "/dashboard/settings": "System Config",
};

export function AppTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, notifications: zustandNotifs, markAllNotificationsRead, markNotificationRead, logout, updateUserTheme, startTutorial } = useAppStore();
  const [showNotif, setShowNotif] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [apiNotifs, setApiNotifs] = useState<ApiNotification[]>([]);
  const [apiUnread, setApiUnread] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const result = await api.getNotifications();
      if (result.success && result.data) {
        setApiNotifs(result.data.notifications);
        setApiUnread(result.data.unreadCount);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { 
    if (currentUser) fetchNotifications(); 
  }, [fetchNotifications, currentUser]);

  if (!currentUser) return null;

  const safeZustandNotifs = Array.isArray(zustandNotifs) ? zustandNotifs : [];
  const userNotifs = apiNotifs.length > 0 ? apiNotifs : safeZustandNotifs.filter((n) => n.userId === currentUser.id);
  const unreadCount = apiNotifs.length > 0 ? apiUnread : safeZustandNotifs.filter((n) => n.userId === currentUser.id && !n.isRead).length;
  const title = PAGE_TITLES[pathname] ?? "Portal Control";

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch { /* ignore */ }
    logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  const toggleTheme = () => {
    const newTheme = darkMode ? "light" : "dark";
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
    updateUserTheme(newTheme);
    toast.success(`${newTheme === "dark" ? "Dark" : "Light"} mode active`);
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
           <h1 className="text-lg font-black text-foreground tracking-tight leading-none">{title}</h1>
           <div className="flex items-center gap-1.5 mt-1 border-l-2 border-primary/30 pl-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Academic Hub</span>
              <ChevronRight className="w-2.5 h-2.5 text-muted-foreground/40" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{currentUser.role.replace("_", " ")}</span>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={startTutorial} className="hidden sm:flex h-9 gap-2 text-xs font-bold border border-transparent hover:border-border rounded-xl">
          <HelpCircle className="w-4 h-4 text-primary" /> Guide
        </Button>

        <div className="w-[1px] h-6 bg-border mx-2 hidden sm:block" />

        <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-10 h-10 rounded-xl hover:bg-muted">
          {darkMode ? <Sun className="w-5 h-5 text-orange-400" /> : <Moon className="w-5 h-5 text-primary" />}
        </Button>

        <div className="relative">
          <Button
            variant="ghost" size="icon"
            onClick={() => setShowNotif(!showNotif)}
            className="w-10 h-10 rounded-xl relative hover:bg-muted"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-destructive text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-card">
                {unreadCount > 9 ? "!" : unreadCount}
              </span>
            )}
          </Button>

          {showNotif && (
            <>
              <div className="fixed inset-0 z-40 bg-black/5 md:bg-transparent" onClick={() => setShowNotif(false)} />
              <div
                className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
                  <span className="text-xs font-black uppercase tracking-widest text-foreground">Activity Feed</span>
                  <button onClick={() => setShowNotif(false)} className="p-1 hover:bg-muted rounded-lg transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {userNotifs.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground text-xs font-medium italic">All caught up! No notifications.</div>
                  ) : (
                    userNotifs.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          api.markNotificationRead(n.id);
                          markNotificationRead(n.id);
                        }}
                        className={cn(
                          "px-5 py-4 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-all",
                          !n.isRead && "bg-primary/[0.03] border-l-2 border-l-primary"
                        )}
                      >
                         <p className="text-[11px] font-black text-foreground leading-tight">{n.title}</p>
                         <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{n.message}</p>
                         <p className="text-[10px] font-bold text-muted-foreground/40 mt-3 uppercase tracking-tighter">
                           {new Date(n.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                         </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="w-[1px] h-6 bg-border mx-2" />

        <div className="flex items-center gap-3 pl-1">
          <div className="hidden lg:block text-right">
             <p className="text-xs font-black text-foreground leading-none">{currentUser.name.split(" ")[0]}</p>
             <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Online</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-black text-primary shadow-inner">
            {currentUser.avatar}
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="w-10 h-10 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
