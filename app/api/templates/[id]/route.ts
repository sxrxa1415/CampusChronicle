import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { MetricCategory } from "@prisma/client";

interface UpdateTemplateBody {
  name?: string;
  description?: string;
  targetCategory?: MetricCategory;
  sections?: string[];
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/templates/[id]
export async function GET(request: NextRequest, context: RouteParams): Promise<NextResponse> {
  const { id } = await context.params;
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const template = await prisma.instituteReportTemplate.findUnique({
    where: { id },
    include: { createdByAdmin: { select: { name: true } } },
  });
  if (!template) return NextResponse.json({ success: false, message: "Template not found." }, { status: 404 });

  return NextResponse.json({ success: true, data: template });
}

// PUT /api/templates/[id] — update template (ADMIN only)
export async function PUT(request: NextRequest, context: RouteParams): Promise<NextResponse> {
  const { id } = await context.params;
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Admin access required." }, { status: 403 });
  }

  const body = (await request.json()) as any;
  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.targetCategory !== undefined) updateData.targetCategory = body.targetCategory;
  if (body.guidelineFileUrl !== undefined) updateData.guidelineFileUrl = body.guidelineFileUrl;
  if (body.sections !== undefined) updateData.sections = body.sections;

  const updated = await prisma.instituteReportTemplate.update({ where: { id }, data: updateData });

  return NextResponse.json({
    success: true,
    message: `Template "${updated.name}" updated.`,
    messageType: "success",
  });
}

// DELETE /api/templates/[id] — delete template (ADMIN only)
export async function DELETE(request: NextRequest, context: RouteParams): Promise<NextResponse> {
  const { id } = await context.params;
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Admin access required." }, { status: 403 });
  }

  await prisma.instituteReportTemplate.delete({ where: { id } });

  return NextResponse.json({
    success: true,
    message: "Template deleted.",
    messageType: "success",
  });
}
