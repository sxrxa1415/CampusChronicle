"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import type { InstituteRole } from "@/lib/types";
import {
  LayoutDashboard, FileText, UploadCloud, ClipboardCheck,
  Settings, GraduationCap, BarChart3, Users, BookOpen,
  FolderOpen, CheckSquare, PenSquare, ChevronRight, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: InstituteRole[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "DEPARTMENT_HEAD", "FACULTY", "REVIEWER"] },
  { label: "Data Upload", href: "/dashboard/upload", icon: UploadCloud, roles: ["FACULTY", "DEPARTMENT_HEAD"] },
  { label: "My Entries", href: "/dashboard/entries", icon: FolderOpen, roles: ["FACULTY", "DEPARTMENT_HEAD"] },
  { label: "Draft & Preview", href: "/dashboard/draft", icon: FileText, roles: ["DEPARTMENT_HEAD"] },
  { label: "Review Reports", href: "/dashboard/review", icon: CheckSquare, roles: ["REVIEWER"] },
  { label: "All Reports", href: "/dashboard/reports", icon: BookOpen, roles: ["ADMIN", "REVIEWER"] },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, roles: ["ADMIN", "DEPARTMENT_HEAD", "REVIEWER", "FACULTY"] },
  { label: "User Management", href: "/dashboard/users", icon: Users, roles: ["ADMIN"] },
  { label: "Access Maps", href: "/dashboard/team", icon: ShieldCheck, roles: ["ADMIN", "DEPARTMENT_HEAD"] },
  { label: "Templates Map", href: "/dashboard/templates", icon: ClipboardCheck, roles: ["ADMIN", "DEPARTMENT_HEAD", "FACULTY", "REVIEWER"] },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["ADMIN", "DEPARTMENT_HEAD", "FACULTY", "REVIEWER"] },
];

export function AppSidebar() {
  const pathname = usePathname();
  const currentUser = useAppStore((s) => s.currentUser);
  const notifications = useAppStore((s) => s.notifications);
  const notifArr = Array.isArray(notifications) ? notifications : [];

  if (!currentUser) return null;

  const unread = notifArr.filter((n) => n.userId === currentUser.id && !n.isRead).length;
  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(currentUser.role));

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border shrink-0 sticky top-0 h-screen">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-8 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <GraduationCap className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-base font-black text-sidebar-foreground leading-tight tracking-tight">CampusChronicle</p>
          <p className="text-[10px] text-sidebar-foreground/40 uppercase tracking-widest font-bold">ERP Solutions</p>
        </div>
      </div>

      {/* User profile summary */}
      <div className="px-4 py-6 border-b border-sidebar-border bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
            {currentUser.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-sidebar-foreground truncate">{currentUser.name}</p>
            <p className="text-[10px] text-sidebar-foreground/50 font-bold uppercase tracking-tight">{currentUser.role.replace("_", " ")}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Main Menu</p>
        {visibleNav.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className="block">
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group relative",
                  active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground hover:translate-x-1"
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0 transition-transform group-hover:scale-110", active ? "text-primary-foreground" : "text-primary")} />
                <span className="truncate">{item.label}</span>
                {active && <ChevronRight className="w-4 h-4 ml-auto shrink-0 opacity-50" />}
                {item.label === "Dashboard" && unread > 0 && (
                   <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-destructive text-white text-[9px] font-black rounded-full border-2 border-sidebar">
                     {unread}
                   </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
         <div className="bg-muted/30 rounded-xl p-3 text-center">
            <p className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest">A.Y. 2025-26</p>
         </div>
      </div>
    </aside>
  );
}
