import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { MetricCategory } from "@prisma/client";

interface CreateTemplateBody {
  name: string;
  description: string;
  targetCategory?: MetricCategory;
  sections?: string[];
}

// GET /api/templates — list all templates
export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const templates = await prisma.instituteReportTemplate.findMany({
    include: {
      createdByAdmin: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: templates });
}

// POST /api/templates — create template (ADMIN only)
export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = request.cookies.get("cc-user-id")?.value;
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Admin access required." }, { status: 403 });
  }

  const body = (await request.json()) as any;
  if (!body.name || !body.description) {
    return NextResponse.json({ success: false, message: "name and description required." }, { status: 400 });
  }

  const template = await prisma.instituteReportTemplate.create({
    data: {
      name: body.name,
      description: body.description,
      targetCategory: body.targetCategory ?? null,
      guidelineFileUrl: body.guidelineFileUrl ?? null,
      sections: body.sections ?? [],
      createdByAdminId: userId,
    },
  });

  return NextResponse.json({
    success: true,
    message: `Template "${template.name}" created.`,
    messageType: "success",
    data: { id: template.id },
  }, { status: 201 });
}
