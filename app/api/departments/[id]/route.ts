import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/departments/[id] — get department detail with entries, KPIs, drafts
export async function GET(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse> {
  const { id } = await context.params;
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  const dept = await prisma.department.findUnique({
    where: { id },
    include: {
      users: {
        select: { id: true, name: true, email: true, role: true, avatar: true, avatarUrl: true },
      },
      students: {
        select: { id: true, name: true, rollNo: true },
      },
      kpis: true,
      metricEntries: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      reportDrafts: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!dept) {
    return NextResponse.json({ success: false, message: "Department not found." }, { status: 404 });
  }

  const hod = await prisma.user.findUnique({
    where: { id: dept.hodUserId },
    select: { id: true, name: true, email: true, avatar: true, avatarUrl: true },
  });

  return NextResponse.json({
    success: true,
    data: {
      id: dept.id,
      name: dept.name,
      code: dept.code,
      hodUserId: dept.hodUserId,
      hod,
      users: dept.users,
      students: dept.students,
      kpis: dept.kpis.map((k) => ({
        id: k.id,
        kpiName: k.kpiName,
        kpiValue: k.kpiValue,
        unit: k.unit,
      })),
      entryCount: dept.metricEntries.length,
      approvedCount: dept.metricEntries.filter((e) => e.status === "APPROVED_FINAL").length,
      pendingCount: dept.metricEntries.filter((e) => ["PENDING_HOD", "PENDING_OFFICE", "PENDING_ADMIN"].includes(e.status)).length,
      draftCount: dept.reportDrafts.length,
      createdAt: dept.createdAt.toISOString(),
    },
  });
}
