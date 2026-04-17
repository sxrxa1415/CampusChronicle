import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/notifications/mark-all — mark all notifications as read for current user
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const result = await prisma.reportNotification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({
    success: true,
    message: `${result.count} notifications marked as read.`,
  });
}
