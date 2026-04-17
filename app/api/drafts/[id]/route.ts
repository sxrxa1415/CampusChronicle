import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { EntryStatus } from "@prisma/client";

interface UpdateDraftBody {
  status?: EntryStatus;
  compiledMetricEntryIds?: string[];
  previewHtml?: string;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/drafts/[id]
export async function GET(request: NextRequest, context: RouteParams): Promise<NextResponse> {
  const { id } = await context.params;
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const draft = await prisma.departmentReportDraft.findUnique({
    where: { id },
    include: {
      department: { select: { name: true, code: true } },
      createdBy: { select: { name: true, avatar: true, avatarUrl: true } },
      comments: {
        include: { commentedBy: { select: { name: true, avatar: true, avatarUrl: true, role: true } } },
        orderBy: { createdAt: "desc" },
      },
      approvalLogs: {
        include: { reviewer: { select: { name: true, avatar: true, avatarUrl: true, role: true } } },
        orderBy: { createdAt: "desc" },
      },
      versions: { orderBy: { versionNumber: "desc" } },
    },
  });

  if (!draft) return NextResponse.json({ success: false, message: "Draft not found." }, { status: 404 });

  return NextResponse.json({ success: true, data: draft });
}

// PUT /api/drafts/[id] — update/submit draft
export async function PUT(request: NextRequest, context: RouteParams): Promise<NextResponse> {
  const { id } = await context.params;
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ success: false, message: "User not found." }, { status: 401 });

  const draft = await prisma.departmentReportDraft.findUnique({ where: { id } });
  if (!draft) return NextResponse.json({ success: false, message: "Draft not found." }, { status: 404 });

  const body = (await request.json()) as UpdateDraftBody;
  const updateData: Record<string, unknown> = {};

  if (body.compiledMetricEntryIds !== undefined) updateData.compiledMetricEntryIds = body.compiledMetricEntryIds;
  if (body.previewHtml !== undefined) updateData.previewHtml = body.previewHtml;

  if (body.status) {
    // Submission: DRAFT → PENDING_OFFICE
    if (body.status === "PENDING_OFFICE" && draft.status === "DRAFT" && ["DEPARTMENT_HEAD", "ADMIN"].includes(user.role)) {
      updateData.status = "PENDING_OFFICE";
      updateData.submittedAt = new Date();
    }
    // Reviewer approval: PENDING_OFFICE → PENDING_ADMIN
    else if (body.status === "PENDING_ADMIN" && draft.status === "PENDING_OFFICE" && ["REVIEWER", "ADMIN"].includes(user.role)) {
      updateData.status = "PENDING_ADMIN";
    }
    // Admin final approval: PENDING_ADMIN → APPROVED_FINAL
    else if (body.status === "APPROVED_FINAL" && draft.status === "PENDING_ADMIN" && user.role === "ADMIN") {
      updateData.status = "APPROVED_FINAL";
      updateData.approvedAt = new Date();
    }
    // Rejection (any reviewer/admin role)
    else if (body.status === "REJECTED_NEEDS_REVIEW") {
      updateData.status = "REJECTED_NEEDS_REVIEW";
    }
    else {
      return NextResponse.json({ success: false, message: "Invalid status transition." }, { status: 400 });
    }
  }

  const updated = await prisma.departmentReportDraft.update({ where: { id }, data: updateData });

  return NextResponse.json({
    success: true,
    message: `Draft updated to ${updated.status}.`,
    messageType: "success",
    data: { id: updated.id, status: updated.status },
  });
}
