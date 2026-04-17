import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
) {
  const res = NextResponse.json(
    { success: true, message: "Logged out successfully.", messageType: "success" as const },
    { status: 200 },
  );
  res.cookies.set("cc-token", "", { httpOnly: true, path: "/", maxAge: 0 });
  res.cookies.set("cc-user-id", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
