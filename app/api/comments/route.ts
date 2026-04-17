import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface CreateCommentBody {
  reportDraftId: string;
  message: string;
}

// GET /api/comments?draftId=xxx
export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const draftId = searchParams.get("draftId");

  const whereClause: Record<string, unknown> = {};
  if (draftId) whereClause.reportDraftId = draftId;

  const comments = await prisma.reportComment.findMany({
    where: whereClause,
    include: {
      commentedBy: { select: { name: true, avatar: true, avatarUrl: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: comments });
}

// POST /api/comments — add comment to a draft
export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const body = (await request.json()) as CreateCommentBody;
  if (!body.reportDraftId || !body.message) {
    return NextResponse.json({ success: false, message: "reportDraftId and message are required." }, { status: 400 });
  }

  const comment = await prisma.reportComment.create({
    data: {
      reportDraftId: body.reportDraftId,
      commentedByUserId: userId,
      message: body.message,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Comment added.",
    messageType: "success",
    data: { id: comment.id },
  }, { status: 201 });
}
