import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApprovalAction } from "@prisma/client";

interface CreateApprovalBody {
  reportDraftId: string;
  action: ApprovalAction;
  message?: string;
}

// GET /api/approvals?draftId=xxx
export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const draftId = searchParams.get("draftId");

  const whereClause: Record<string, unknown> = {};
  if (draftId) whereClause.reportDraftId = draftId;

  const logs = await prisma.reportApprovalLog.findMany({
    where: whereClause,
    include: {
      reviewer: { select: { name: true, avatar: true, avatarUrl: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: logs });
}

// POST /api/approvals — create approval action
export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !["REVIEWER", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ success: false, message: "Only Reviewer or Admin can approve." }, { status: 403 });
  }

  const body = (await request.json()) as CreateApprovalBody;
  if (!body.reportDraftId || !body.action) {
    return NextResponse.json({ success: false, message: "reportDraftId and action are required." }, { status: 400 });
  }

  const log = await prisma.reportApprovalLog.create({
    data: {
      reportDraftId: body.reportDraftId,
      reviewerUserId: userId,
      action: body.action,
      message: body.message ?? null,
    },
  });

  return NextResponse.json({
    success: true,
    message: `Report ${body.action.toLowerCase().replace("_", " ")}.`,
    messageType: body.action === "APPROVED" ? "success" : "warning",
    data: { id: log.id },
  }, { status: 201 });
}
