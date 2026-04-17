import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface MeSuccessResponse {
  success: true;
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
    departmentId: string | null;
    avatar: string | null;
    avatarUrl: string | null;
    theme: string;
    emailNotificationsEnabled: boolean;
    attachedDepartmentIds: string[];
    menteeIds: string[];
  };
}

interface MeErrorResponse {
  success: false;
  message: string;
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<MeSuccessResponse | MeErrorResponse>> {
  const userId = request.cookies.get("cc-user-id")?.value;
  const token = request.cookies.get("cc-token")?.value;

  if (!userId || !token) {
    return NextResponse.json(
      { success: false, message: "Not authenticated." },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      attachedDepartments: { select: { departmentId: true } },
      menteeStudents: { select: { studentId: true } },
    },
  });

  if (!user) {
    const response = NextResponse.json(
      { success: false, message: "User session expired or user not found." } as MeErrorResponse,
      { status: 401 },
    );
    response.cookies.delete("cc-user-id");
    response.cookies.delete("cc-token");
    return response;
  }

  return NextResponse.json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      avatar: user.avatar,
      avatarUrl: user.avatarUrl,
      theme: user.theme,
      emailNotificationsEnabled: user.emailNotificationsEnabled,
      attachedDepartmentIds: user.attachedDepartments.map((d) => d.departmentId),
      menteeIds: user.menteeStudents.map((m) => m.studentId),
    },
  } as MeSuccessResponse);
}
