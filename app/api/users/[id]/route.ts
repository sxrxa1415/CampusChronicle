import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface UpdateUserBody {
  name?: string;
  role?: "ADMIN" | "DEPARTMENT_HEAD" | "FACULTY" | "REVIEWER";
  departmentId?: string | null;
  theme?: string;
  emailNotificationsEnabled?: boolean;
  attachedDepartmentIds?: string[];
  menteeIds?: string[];
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/users/[id] — get single user
export async function GET(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse> {
  const { id } = await context.params;
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      attachedDepartments: { select: { departmentId: true } },
      menteeStudents: { select: { studentId: true } },
      department: { select: { name: true, code: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
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
      department: user.department,
      createdAt: user.createdAt.toISOString(),
    },
  });
}

// PUT /api/users/[id] — update user (ADMIN or self)
export async function PUT(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse> {
  const { id } = await context.params;
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  const requester = await prisma.user.findUnique({ where: { id: userId } });
  const targetUser = id === userId ? requester : await prisma.user.findUnique({ where: { id } });
  
  const isSelf = userId === id;
  const isAdmin = requester?.role === "ADMIN";
  const isHODOfDept = requester?.role === "DEPARTMENT_HEAD" && targetUser?.departmentId === requester.departmentId;

  if (!isSelf && !isAdmin && !isHODOfDept) {
    return NextResponse.json({ success: false, message: "Insufficient permissions." }, { status: 403 });
  }

  const body = (await request.json()) as UpdateUserBody;

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.theme !== undefined) updateData.theme = body.theme;
  if (body.emailNotificationsEnabled !== undefined) updateData.emailNotificationsEnabled = body.emailNotificationsEnabled;

  // Only admin can change role and department
  if (isAdmin) {
    if (body.role !== undefined) updateData.role = body.role;
    if (body.departmentId !== undefined) updateData.departmentId = body.departmentId;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  // Authorization for mapping updates
  const isHODOfSelfDept = requester?.role === "DEPARTMENT_HEAD" && updated.departmentId === requester.departmentId;
  const canModifyMapping = isAdmin || isHODOfSelfDept;

  // Update reviewer departments (Admin only)
  if (isAdmin && body.attachedDepartmentIds !== undefined) {
    await prisma.reviewerDepartment.deleteMany({ where: { userId: id } });
    if (body.attachedDepartmentIds.length > 0) {
      await prisma.reviewerDepartment.createMany({
        data: body.attachedDepartmentIds.map((deptId) => ({ userId: id, departmentId: deptId })),
      });
    }
  }

  // Update faculty mentees (Admin or HOD of the department)
  if (canModifyMapping && body.menteeIds !== undefined) {
    await prisma.facultyMentee.deleteMany({ where: { userId: id } });
    if (body.menteeIds.length > 0) {
      await prisma.facultyMentee.createMany({
        data: body.menteeIds.map((studentId) => ({ userId: id, studentId })),
      });
    }
  }

  return NextResponse.json({
    success: true,
    message: `User ${updated.name} updated.`,
    messageType: "success",
    data: { id: updated.id, name: updated.name, role: updated.role },
  });
}

// DELETE /api/users/[id] — delete user (ADMIN only, not self)
export async function DELETE(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse> {
  const { id } = await context.params;
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  const requester = await prisma.user.findUnique({ where: { id: userId } });
  if (!requester || requester.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Admin access required." }, { status: 403 });
  }

  if (userId === id) {
    return NextResponse.json({ success: false, message: "Cannot delete your own account." }, { status: 400 });
  }

  // Clean up junction tables first
  await prisma.reviewerDepartment.deleteMany({ where: { userId: id } });
  await prisma.facultyMentee.deleteMany({ where: { userId: id } });

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({
    success: true,
    message: "User deleted successfully.",
    messageType: "success",
  });
}
