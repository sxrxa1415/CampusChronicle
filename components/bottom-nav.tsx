"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import type { InstituteRole } from "@/lib/types";
import { LayoutDashboard, UploadCloud, FolderOpen, CheckSquare, BarChart3, FileText, PenSquare, BookOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: InstituteRole[];
}

const BOTTOM_NAV: BottomNavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN","DEPARTMENT_HEAD","FACULTY","REVIEWER"] },
  { label: "Upload", href: "/dashboard/upload", icon: UploadCloud, roles: ["FACULTY","DEPARTMENT_HEAD"] },
  { label: "Entries", href: "/dashboard/entries", icon: FolderOpen, roles: ["FACULTY","DEPARTMENT_HEAD"] },
  { label: "Draft", href: "/dashboard/draft", icon: FileText, roles: ["DEPARTMENT_HEAD"] },
  { label: "Review", href: "/dashboard/review", icon: CheckSquare, roles: ["REVIEWER"] },
  { label: "Builder", href: "/dashboard/report-builder", icon: PenSquare, roles: ["ADMIN"] },
  { label: "Reports", href: "/dashboard/reports", icon: BookOpen, roles: ["ADMIN","REVIEWER"] },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, roles: ["ADMIN","DEPARTMENT_HEAD","REVIEWER"] },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["ADMIN","DEPARTMENT_HEAD","FACULTY","REVIEWER"] },
];

export function BottomNav() {
  const pathname = usePathname();
  const currentUser = useAppStore((s) => s.currentUser);
  if (!currentUser) return null;

  const items = BOTTOM_NAV.filter((i) => i.roles.includes(currentUser.role)).slice(0, 5);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-stretch">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 px-1 transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", active && "text-primary")} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="bottom-indicator"
                    className="absolute bottom-0 h-0.5 w-8 bg-primary rounded-full"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
