import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface UserListItem {
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
  createdAt: string;
}

interface CreateUserBody {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "DEPARTMENT_HEAD" | "FACULTY" | "REVIEWER";
  departmentId?: string;
  attachedDepartmentIds?: string[];
  menteeIds?: string[];
}

// GET /api/users — list all users (ADMIN only)
export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  const requester = await prisma.user.findUnique({ where: { id: userId } });
  if (!requester || (requester.role !== "ADMIN" && requester.role !== "DEPARTMENT_HEAD")) {
    return NextResponse.json({ success: false, message: "Access required." }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    include: {
      attachedDepartments: { select: { departmentId: true } },
      menteeStudents: { select: { studentId: true } },
      department: { select: { name: true, code: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted: UserListItem[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    departmentId: u.departmentId,
    avatar: u.avatar,
    avatarUrl: u.avatarUrl,
    theme: u.theme,
    emailNotificationsEnabled: u.emailNotificationsEnabled,
    attachedDepartmentIds: u.attachedDepartments.map((d) => d.departmentId),
    menteeIds: u.menteeStudents.map((m) => m.studentId),
    createdAt: u.createdAt.toISOString(),
  }));

  return NextResponse.json({ success: true, data: formatted });
}

// POST /api/users — create a new user (ADMIN only)
export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  const requester = await prisma.user.findUnique({ where: { id: userId } });
  if (!requester || requester.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Admin access required." }, { status: 403 });
  }

  const body = (await request.json()) as CreateUserBody;
  const { name, email, password, role, departmentId, attachedDepartmentIds, menteeIds } = body;

  if (!name || !email || !password || !role) {
    return NextResponse.json({ success: false, message: "Name, email, password, and role are required." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ success: false, message: "A user with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const avatar = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const avatarUrl = role === "ADMIN" ? "/avatars/admin.png"
    : role === "DEPARTMENT_HEAD" ? "/avatars/hod.png"
    : role === "REVIEWER" ? "/avatars/reviewer.png"
    : "/avatars/faculty.png";

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      departmentId: departmentId || null,
      avatar,
      avatarUrl,
    },
  });

  // Handle reviewer department attachments
  if (role === "REVIEWER" && attachedDepartmentIds && attachedDepartmentIds.length > 0) {
    await prisma.reviewerDepartment.createMany({
      data: attachedDepartmentIds.map((deptId) => ({ userId: user.id, departmentId: deptId })),
    });
  }

  // Handle faculty mentee attachments
  if (role === "FACULTY" && menteeIds && menteeIds.length > 0) {
    await prisma.facultyMentee.createMany({
      data: menteeIds.map((studentId) => ({ userId: user.id, studentId })),
    });
  }

  return NextResponse.json({
    success: true,
    message: `User ${name} created successfully.`,
    messageType: "success",
    data: { id: user.id, name: user.name, email: user.email, role: user.role },
  }, { status: 201 });
}
