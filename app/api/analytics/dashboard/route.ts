import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface DashboardStats {
  totalEntries: number;
  approvedEntries: number;
  pendingEntries: number;
  rejectedEntries: number;
  totalDrafts: number;
  approvedDrafts: number;
  totalUsers: number;
  totalDepartments: number;
  totalNotifications: number;
  unreadNotifications: number;
  entriesByCategory: Array<{ category: string; count: number }>;
  entriesByDepartment: Array<{ department: string; code: string; total: number; approved: number }>;
  recentEntries: Array<{ id: string; title: string; status: string; category: string; createdAt: string }>;
}

// GET /api/analytics/dashboard — aggregated dashboard statistics
export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ success: false, message: "User not found." }, { status: 401 });

  // Parallel queries for speed
  const [
    totalEntries,
    approvedEntries,
    pendingEntries,
    rejectedEntries,
    totalDrafts,
    approvedDrafts,
    totalUsers,
    totalDepartments,
    totalNotifications,
    unreadNotifications,
    categoryCounts,
    departments,
    recentEntries,
  ] = await Promise.all([
    prisma.departmentMetricEntry.count(),
    prisma.departmentMetricEntry.count({ where: { status: "APPROVED_FINAL" } }),
    prisma.departmentMetricEntry.count({ where: { status: { in: ["PENDING_HOD", "PENDING_OFFICE", "PENDING_ADMIN"] } } }),
    prisma.departmentMetricEntry.count({ where: { status: "REJECTED_NEEDS_REVIEW" } }),
    prisma.departmentReportDraft.count(),
    prisma.departmentReportDraft.count({ where: { status: "APPROVED_FINAL" } }),
    prisma.user.count(),
    prisma.department.count(),
    prisma.reportNotification.count({ where: { userId } }),
    prisma.reportNotification.count({ where: { userId, isRead: false } }),
    prisma.departmentMetricEntry.groupBy({
      by: ["category"],
      _count: { id: true },
    }),
    prisma.department.findMany({
      select: {
        name: true,
        code: true,
        _count: { select: { metricEntries: true } },
        metricEntries: { where: { status: "APPROVED_FINAL" }, select: { id: true } },
      },
    }),
    prisma.departmentMetricEntry.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, title: true, status: true, category: true, createdAt: true },
    }),
  ]);

  const stats: DashboardStats = {
    totalEntries,
    approvedEntries,
    pendingEntries,
    rejectedEntries,
    totalDrafts,
    approvedDrafts,
    totalUsers,
    totalDepartments,
    totalNotifications,
    unreadNotifications,
    entriesByCategory: categoryCounts.map((c) => ({
      category: c.category,
      count: c._count.id,
    })),
    entriesByDepartment: departments.map((d) => ({
      department: d.name,
      code: d.code,
      total: d._count.metricEntries,
      approved: d.metricEntries.length,
    })),
    recentEntries: recentEntries.map((e) => ({
      id: e.id,
      title: e.title,
      status: e.status,
      category: e.category,
      createdAt: e.createdAt.toISOString(),
    })),
  };

  return NextResponse.json({ success: true, data: stats });
}
