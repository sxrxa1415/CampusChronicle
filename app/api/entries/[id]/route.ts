import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { EntryStatus } from "@prisma/client";

interface UpdateEntryBody {
  title?: string;
  description?: string;
  numericValue?: number;
  textualValue?: string;
  financialSpends?: number;
  status?: EntryStatus;
  reviewerComment?: string;
  studentId?: string;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/entries/[id]
export async function GET(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse> {
  const { id } = await context.params;
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  const entry = await prisma.departmentMetricEntry.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true, avatar: true, avatarUrl: true } },
      department: { select: { name: true, code: true } },
      student: { select: { name: true, rollNo: true } },
    },
  });

  if (!entry) {
    return NextResponse.json({ success: false, message: "Entry not found." }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: entry.id,
      departmentId: entry.departmentId,
      department: entry.department,
      reportingYearId: entry.reportingYearId,
      category: entry.category,
      title: entry.title,
      description: entry.description,
      numericValue: entry.numericValue,
      textualValue: entry.textualValue,
      financialSpends: entry.financialSpends,
      createdByUserId: entry.createdByUserId,
      createdBy: entry.createdBy,
      studentId: entry.studentId,
      student: entry.student,
      status: entry.status,
      reviewerComment: entry.reviewerComment,
      studentTargets: entry.studentTargets,
      staffTargets: entry.staffTargets,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    },
  });
}

// PUT /api/entries/[id] — update entry or change status
export async function PUT(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse> {
  const { id } = await context.params;
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found." }, { status: 401 });
  }

  const entry = await prisma.departmentMetricEntry.findUnique({ where: { id } });
  if (!entry) {
    return NextResponse.json({ success: false, message: "Entry not found." }, { status: 404 });
  }

  const body = (await request.json()) as UpdateEntryBody;
  const updateData: Record<string, unknown> = {};

  // Status transitions with RBAC
  if (body.status) {
    const validTransitions: Record<string, { roles: string[]; from: EntryStatus[] }> = {
      PENDING_OFFICE: { roles: ["DEPARTMENT_HEAD"], from: ["PENDING_HOD"] },
      PENDING_ADMIN: { roles: ["REVIEWER"], from: ["PENDING_OFFICE"] },
      APPROVED_FINAL: { roles: ["ADMIN"], from: ["PENDING_ADMIN"] },
      REJECTED_NEEDS_REVIEW: { roles: ["DEPARTMENT_HEAD", "REVIEWER", "ADMIN"], from: ["PENDING_HOD", "PENDING_OFFICE", "PENDING_ADMIN"] },
    };

    const transition = validTransitions[body.status];
    if (!transition) {
      return NextResponse.json({ success: false, message: `Invalid status transition to ${body.status}.` }, { status: 400 });
    }
    if (!transition.roles.includes(user.role)) {
      return NextResponse.json({ success: false, message: `Your role cannot perform this status change.` }, { status: 403 });
    }
    if (!transition.from.includes(entry.status)) {
      return NextResponse.json({ success: false, message: `Cannot transition from ${entry.status} to ${body.status}.` }, { status: 400 });
    }

    updateData.status = body.status;
  }

  // Field updates (owner or admin only if not status-changing)
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.numericValue !== undefined) updateData.numericValue = body.numericValue;
  if (body.textualValue !== undefined) updateData.textualValue = body.textualValue;
  if (body.financialSpends !== undefined) updateData.financialSpends = body.financialSpends;
  if (body.reviewerComment !== undefined) updateData.reviewerComment = body.reviewerComment;
  if (body.studentId !== undefined) updateData.studentId = body.studentId;

  const updated = await prisma.departmentMetricEntry.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({
    success: true,
    message: `Entry "${updated.title}" updated.`,
    messageType: "success",
    data: { id: updated.id, status: updated.status },
  });
}

// DELETE /api/entries/[id] — delete entry (owner only, DRAFT/PENDING_HOD only)
export async function DELETE(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse> {
  const { id } = await context.params;
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found." }, { status: 401 });
  }

  const entry = await prisma.departmentMetricEntry.findUnique({ where: { id } });
  if (!entry) {
    return NextResponse.json({ success: false, message: "Entry not found." }, { status: 404 });
  }

  if (entry.createdByUserId !== userId && user.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Only the owner or Admin can delete entries." }, { status: 403 });
  }

  if (!["DRAFT", "PENDING_HOD", "REJECTED_NEEDS_REVIEW"].includes(entry.status) && user.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Can only delete Draft / Pending / Rejected entries." }, { status: 400 });
  }

  await prisma.departmentMetricEntry.delete({ where: { id } });

  return NextResponse.json({
    success: true,
    message: "Entry deleted successfully.",
    messageType: "success",
  });
}
