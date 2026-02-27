'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const PATH_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  upload: 'Data Upload',
  entries: 'My Entries',
  draft: 'Draft & Preview',
  review: 'Review Reports',
  'report-builder': 'Report Builder',
  reports: 'All Reports',
  analytics: 'Analytics',
  departments: 'Departments',
  templates: 'Templates',
  settings: 'Settings',
};

export function Breadcrumb() {
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const parts = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

    let currentPath = '';
    parts.forEach((part, idx) => {
      currentPath += `/${part}`;
      const label = PATH_LABELS[part] || part.charAt(0).toUpperCase() + part.slice(1);
      breadcrumbs.push({
        label,
        href: idx === parts.length - 1 ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  };

  if (pathname === '/') return null;

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="flex items-center gap-1 text-sm">
      {breadcrumbs.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="flex items-center gap-1"
        >
          {idx > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          {item.href ? (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {idx === 0 ? <Home className="w-4 h-4" /> : item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </motion.div>
      ))}
    </nav>
  );
}
