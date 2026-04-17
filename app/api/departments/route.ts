import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface DepartmentListItem {
  id: string;
  name: string;
  code: string;
  hodUserId: string;
  hodName: string | null;
  userCount: number;
  studentCount: number;
  entryCount: number;
  approvedEntryCount: number;
  createdAt: string;
}

// GET /api/departments — list all departments with stats
export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  const departments = await prisma.department.findMany({
    include: {
      _count: {
        select: {
          users: true,
          students: true,
          metricEntries: true,
        },
      },
      metricEntries: {
        where: { status: "APPROVED_FINAL" },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Fetch HOD names
  const hodIds = departments.map((d) => d.hodUserId);
  const hods = await prisma.user.findMany({
    where: { id: { in: hodIds } },
    select: { id: true, name: true },
  });
  const hodMap = new Map(hods.map((h) => [h.id, h.name]));

  const formatted: DepartmentListItem[] = departments.map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
    hodUserId: d.hodUserId,
    hodName: hodMap.get(d.hodUserId) ?? null,
    userCount: d._count.users,
    studentCount: d._count.students,
    entryCount: d._count.metricEntries,
    approvedEntryCount: d.metricEntries.length,
    createdAt: d.createdAt.toISOString(),
  }));

  return NextResponse.json({ success: true, data: formatted });
}
