import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const facultyId = "u_fac_cse";
  const deptId = "dept_cse";
  const ryId = "ry_core";

  console.log("🌱 Seeding entries for core faculty user...");

  const existing = await prisma.departmentMetricEntry.count({ where: { createdByUserId: facultyId } });
  if (existing > 10) {
    console.log("Faculty already has enough entries.");
    return;
  }

  const entries = [
    {
      id: "fe_1",
      departmentId: deptId,
      reportingYearId: ryId,
      category: "ACADEMIC",
      title: "Embedded Systems Course Outcome 2025",
      description: "Class average increased by 15% following new lab implementation.",
      numericValue: 88,
      createdByUserId: facultyId,
      status: "APPROVED_FINAL",
      createdAt: new Date("2025-08-15"),
      updatedAt: new Date("2026-02-10")
    },
    {
      id: "fe_2",
      departmentId: deptId,
      reportingYearId: ryId,
      category: "RESEARCH",
      title: "IEEE Paper on AI in Edge Devices",
      description: "Published in IEEE Transactions, exploring low power optimization.",
      numericValue: 1,
      createdByUserId: facultyId,
      status: "PENDING_HOD",
      createdAt: new Date("2025-11-20"),
      updatedAt: new Date("2025-11-20")
    },
    {
      id: "fe_3",
      departmentId: deptId,
      reportingYearId: ryId,
      category: "STUDENT_ACHIEVEMENT",
      title: "Mentee Win at Smart India Hackathon",
      description: "Group of 4 mentees secured 1st place in Hardware edition.",
      numericValue: 4,
      createdByUserId: facultyId,
      status: "APPROVED_FINAL",
      studentTargets: { papersPublished: 2, competitionsDone: 1 },
      createdAt: new Date("2025-09-05"),
      updatedAt: new Date("2025-12-01")
    },
    {
      id: "fe_4",
      departmentId: deptId,
      reportingYearId: ryId,
      category: "FACULTY_ACHIEVEMENT",
      title: "Outstanding Faculty Award 2025",
      description: "Received for contribution to department lab development.",
      numericValue: 1,
      createdByUserId: facultyId,
      status: "PENDING_OFFICE",
      createdAt: new Date("2026-01-10"),
      updatedAt: new Date("2026-01-10")
    },
    {
      id: "fe_5",
      departmentId: deptId,
      reportingYearId: ryId,
      category: "ACADEMIC",
      title: "Guest Lecture Series on VLSI",
      description: "Arranged 3 sessions by industry experts from Intel.",
      numericValue: 3,
      createdByUserId: facultyId,
      status: "APPROVED_FINAL",
      createdAt: new Date("2025-12-15"),
      updatedAt: new Date("2025-12-15")
    }
  ];

  for (const entry of entries) {
    await prisma.departmentMetricEntry.upsert({
      where: { id: entry.id },
      update: entry,
      create: entry
    });
  }

  console.log("✅ Seeded 5 entries for Prof. R. Karthikeyan.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
