import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/notifications/[id] — mark single notification as read
export async function PUT(request: NextRequest, context: RouteParams): Promise<NextResponse> {
  const { id } = await context.params;
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const notif = await prisma.reportNotification.findUnique({ where: { id } });
  if (!notif || notif.userId !== userId) {
    return NextResponse.json({ success: false, message: "Notification not found." }, { status: 404 });
  }

  await prisma.reportNotification.update({ where: { id }, data: { isRead: true } });

  return NextResponse.json({ success: true, message: "Marked as read." });
}
