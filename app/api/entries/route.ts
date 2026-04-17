import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { EntryStatus, MetricCategory } from "@prisma/client";

interface EntryResponseItem {
  id: string;
  departmentId: string;
  reportingYearId: string;
  category: string;
  title: string;
  description: string | null;
  numericValue: number | null;
  textualValue: string | null;
  financialSpends: number | null;
  createdByUserId: string;
  createdByName: string;
  studentId: string | null;
  status: string;
  reviewerComment: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateEntryBody {
  departmentId: string;
  reportingYearId: string;
  category: MetricCategory;
  title: string;
  description?: string;
  numericValue?: number;
  textualValue?: string;
  financialSpends?: number;
  studentId?: string;
  studentTargets?: { papersPublished: number; competitionsDone: number };
  staffTargets?: { tasksDone: number; extraPay: number };
}

// GET /api/entries — list entries (role-scoped)
export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { attachedDepartments: { select: { departmentId: true } } },
  });
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found." }, { status: 401 });
  }

  // Build where clause based on role
  let whereClause: Record<string, unknown> = {};
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status") as EntryStatus | null;
  const categoryFilter = searchParams.get("category") as MetricCategory | null;
  const deptFilter = searchParams.get("departmentId");

  switch (user.role) {
    case "ADMIN":
      // Admin sees all
      break;
    case "REVIEWER":
      whereClause = {
        departmentId: { in: user.attachedDepartments.map((d) => d.departmentId) },
      };
      break;
    case "DEPARTMENT_HEAD":
      whereClause = { departmentId: user.departmentId };
      break;
    case "FACULTY":
      whereClause = { createdByUserId: userId };
      break;
  }

  if (statusFilter) {
    whereClause.status = statusFilter;
  }
  if (categoryFilter) {
    whereClause.category = categoryFilter;
  }
  if (deptFilter) {
    whereClause.departmentId = deptFilter;
  }

  const entries = await prisma.departmentMetricEntry.findMany({
    where: whereClause,
    include: {
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted: EntryResponseItem[] = entries.map((e) => ({
    id: e.id,
    departmentId: e.departmentId,
    reportingYearId: e.reportingYearId,
    category: e.category,
    title: e.title,
    description: e.description,
    numericValue: e.numericValue,
    textualValue: e.textualValue,
    financialSpends: e.financialSpends,
    createdByUserId: e.createdByUserId,
    createdByName: e.createdBy.name,
    studentId: e.studentId,
    status: e.status,
    reviewerComment: e.reviewerComment,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));

  return NextResponse.json({ success: true, data: formatted });
}

// POST /api/entries — create a new entry
export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found." }, { status: 401 });
  }

  if (!["FACULTY", "DEPARTMENT_HEAD", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ success: false, message: "Only Faculty, HOD, or Admin can create entries." }, { status: 403 });
  }

  const body = (await request.json()) as CreateEntryBody;
  const { departmentId, reportingYearId, category, title, description, numericValue, textualValue, financialSpends, studentId, studentTargets, staffTargets } = body;

  if (!departmentId || !reportingYearId || !category || !title) {
    return NextResponse.json({ success: false, message: "departmentId, reportingYearId, category, and title are required." }, { status: 400 });
  }

  const entry = await prisma.departmentMetricEntry.create({
    data: {
      departmentId,
      reportingYearId,
      category,
      title,
      description: description ?? null,
      numericValue: numericValue ?? null,
      textualValue: textualValue ?? null,
      financialSpends: financialSpends ?? null,
      studentId: studentId ?? null,
      studentTargets: studentTargets ?? undefined,
      staffTargets: staffTargets ?? undefined,
      createdByUserId: userId,
      status: "PENDING_HOD",
    },
  });

  return NextResponse.json({
    success: true,
    message: `Entry "${title}" created successfully.`,
    messageType: "success",
    data: { id: entry.id, title: entry.title, status: entry.status },
  }, { status: 201 });
}
