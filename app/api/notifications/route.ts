import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/notifications — list notifications for current user
export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const notifications = await prisma.reportNotification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = await prisma.reportNotification.count({
    where: { userId, isRead: false },
  });

  return NextResponse.json({
    success: true,
    data: {
      notifications: notifications.map((n) => ({
        id: n.id,
        userId: n.userId,
        reportDraftId: n.reportDraftId,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    },
  });
}

interface CreateNotificationBody {
  userId: string;
  reportDraftId?: string;
  title: string;
  message: string;
}

// POST /api/notifications — push a notification
export async function POST(request: NextRequest): Promise<NextResponse> {
  const callerId = request.cookies.get("cc-user-id")?.value;
  if (!callerId) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const body = (await request.json()) as CreateNotificationBody;
  if (!body.userId || !body.title || !body.message) {
    return NextResponse.json({ success: false, message: "userId, title, and message required." }, { status: 400 });
  }

  const notification = await prisma.reportNotification.create({
    data: {
      userId: body.userId,
      reportDraftId: body.reportDraftId ?? null,
      title: body.title,
      message: body.message,
    },
  });

  return NextResponse.json({
    success: true,
    data: { id: notification.id },
  }, { status: 201 });
}
