"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import type { InstituteRole } from "@/lib/types";
import {
  LayoutDashboard, FileText, UploadCloud, ClipboardCheck,
  Settings, GraduationCap, BarChart3, Users, BookOpen,
  FolderOpen, CheckSquare, PenSquare, ChevronRight
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
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN","DEPARTMENT_HEAD","FACULTY","REVIEWER"] },
  { label: "Data Upload", href: "/dashboard/upload", icon: UploadCloud, roles: ["FACULTY","DEPARTMENT_HEAD"] },
  { label: "My Entries", href: "/dashboard/entries", icon: FolderOpen, roles: ["FACULTY","DEPARTMENT_HEAD"] },
  { label: "Draft & Preview", href: "/dashboard/draft", icon: FileText, roles: ["DEPARTMENT_HEAD"] },
  { label: "Review Reports", href: "/dashboard/review", icon: CheckSquare, roles: ["REVIEWER"] },
  { label: "Report Builder", href: "/dashboard/report-builder", icon: PenSquare, roles: ["ADMIN"] },
  { label: "All Reports", href: "/dashboard/reports", icon: BookOpen, roles: ["ADMIN","REVIEWER"] },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, roles: ["ADMIN","DEPARTMENT_HEAD","REVIEWER"] },
  { label: "Departments", href: "/dashboard/departments", icon: Users, roles: ["ADMIN"] },
  { label: "Templates", href: "/dashboard/templates", icon: ClipboardCheck, roles: ["ADMIN"] },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["ADMIN","DEPARTMENT_HEAD","FACULTY","REVIEWER"] },
];

export function AppSidebar() {
  const pathname = usePathname();
  const currentUser = useAppStore((s) => s.currentUser);
  const notifications = useAppStore((s) => s.notifications);

  if (!currentUser) return null;

  const unread = notifications.filter((n) => n.userId === currentUser.id && !n.isRead).length;
  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(currentUser.role));

  return (
    <aside className="hidden md:flex flex-col w-60 bg-sidebar border-r border-sidebar-border shrink-0 sticky top-0 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-sidebar-foreground leading-tight">CampusChronicle</p>
          <p className="text-[10px] text-sidebar-foreground/50">SREC · 2023-24</p>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-xs font-bold text-sidebar-primary">
            {currentUser.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">{currentUser.name.split(" ").slice(0,2).join(" ")}</p>
            <p className="text-[10px] text-sidebar-foreground/50 truncate">{currentUser.role.replace("_", " ")}</p>
          </div>
          {unread > 0 && (
            <Badge className="ml-auto text-[10px] px-1.5 py-0.5 bg-destructive text-destructive-foreground border-0">
              {unread}
            </Badge>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {visibleNav.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {active && <ChevronRight className="w-3 h-3 ml-auto shrink-0" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-sidebar-border">
        <p className="text-[10px] text-sidebar-foreground/30 text-center">v1.0.0 · Academic Year 2023-24</p>
      </div>
    </aside>
  );
}
