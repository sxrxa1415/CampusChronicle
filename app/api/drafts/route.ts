import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface CreateDraftBody {
  departmentId: string;
  reportingYearId: string;
  compiledMetricEntryIds: string[];
}

// GET /api/drafts — list drafts (role-scoped)
export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { attachedDepartments: { select: { departmentId: true } } },
  });
  if (!user) return NextResponse.json({ success: false, message: "User not found." }, { status: 401 });

  let whereClause: Record<string, unknown> = {};
  switch (user.role) {
    case "ADMIN": break;
    case "REVIEWER":
      whereClause = { departmentId: { in: user.attachedDepartments.map((d) => d.departmentId) } };
      break;
    case "DEPARTMENT_HEAD":
      whereClause = { departmentId: user.departmentId };
      break;
    case "FACULTY":
      whereClause = { createdByUserId: userId };
      break;
  }

  const drafts = await prisma.departmentReportDraft.findMany({
    where: whereClause,
    include: {
      department: { select: { name: true, code: true } },
      createdBy: { select: { name: true, avatar: true, avatarUrl: true } },
      _count: { select: { comments: true, approvalLogs: true, versions: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const formatted = drafts.map((d) => ({
    id: d.id,
    departmentId: d.departmentId,
    department: d.department,
    reportingYearId: d.reportingYearId,
    compiledMetricEntryIds: d.compiledMetricEntryIds,
    status: d.status,
    submittedAt: d.submittedAt?.toISOString() ?? null,
    approvedAt: d.approvedAt?.toISOString() ?? null,
    createdByUserId: d.createdByUserId,
    createdBy: d.createdBy,
    commentCount: d._count.comments,
    approvalLogCount: d._count.approvalLogs,
    versionCount: d._count.versions,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));

  return NextResponse.json({ success: true, data: formatted });
}

// POST /api/drafts — create a new draft (HOD/Admin)
export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !["DEPARTMENT_HEAD", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ success: false, message: "Only HOD or Admin can create drafts." }, { status: 403 });
  }

  const body = (await request.json()) as CreateDraftBody;
  if (!body.departmentId || !body.reportingYearId) {
    return NextResponse.json({ success: false, message: "departmentId and reportingYearId are required." }, { status: 400 });
  }

  const draft = await prisma.departmentReportDraft.create({
    data: {
      departmentId: body.departmentId,
      reportingYearId: body.reportingYearId,
      compiledMetricEntryIds: body.compiledMetricEntryIds || [],
      status: "DRAFT",
      createdByUserId: userId,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Draft report created.",
    messageType: "success",
    data: { id: draft.id, status: draft.status },
  }, { status: 201 });
}
