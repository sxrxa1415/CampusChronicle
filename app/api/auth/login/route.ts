import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface LoginRequestBody {
  email: string;
  password: string;
}

interface LoginSuccessResponse {
  success: true;
  message: string;
  messageType: "success";
  data: {
    user: {
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
    token: string;
  };
}

interface LoginErrorResponse {
  success: false;
  message: string;
  messageType: "error";
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<LoginSuccessResponse | LoginErrorResponse>> {
  try {
    const body = (await request.json()) as LoginRequestBody;
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required.", messageType: "error" } as LoginErrorResponse,
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        attachedDepartments: { select: { departmentId: true } },
        menteeStudents: { select: { studentId: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password.", messageType: "error" } as LoginErrorResponse,
        { status: 401 },
      );
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password.", messageType: "error" } as LoginErrorResponse,
        { status: 401 },
      );
    }

    // Simple token (base64 of userId:timestamp) — replace with JWT for production
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");

    const response: LoginSuccessResponse = {
      success: true,
      message: `Welcome back, ${user.name}!`,
      messageType: "success",
      data: {
        user: {
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
        token,
      },
    };

    const res = NextResponse.json(response, { status: 200 });
    res.cookies.set("cc-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    res.cookies.set("cc-user-id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Login error:", message);
    return NextResponse.json(
      { success: false, message: "Login failed. Please try again.", messageType: "error" } as LoginErrorResponse,
      { status: 500 },
    );
  }
}
