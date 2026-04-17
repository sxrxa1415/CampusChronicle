import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Utility for pseudo-random data
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) => Number((Math.random() * (max - min) + min).toFixed(2));
const pick = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];

async function main(): Promise<void> {
  console.log("🌱 Expanding database seeding to 100s of records...\n");

  // ── Clear existing data ──
  await prisma.reportNotification.deleteMany();
  await prisma.reportVersion.deleteMany();
  await prisma.reportApprovalLog.deleteMany();
  await prisma.reportComment.deleteMany();
  await prisma.departmentReportDraft.deleteMany();
  await prisma.departmentMetricEntry.deleteMany();
  await prisma.departmentKPI.deleteMany();
  await prisma.instituteReportTemplate.deleteMany();
  await prisma.reportTemplateSection.deleteMany();
  await prisma.instituteAnnualReport.deleteMany();
  await prisma.facultyMentee.deleteMany();
  await prisma.reviewerDepartment.deleteMany();
  await prisma.instituteStudent.deleteMany();
  await prisma.reportingYear.deleteMany();
  // Clear Users by role except specific core ones if needed? No, just wipe.
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // ── Reporting Years ──
  const ryId = "ry_core";
  await prisma.reportingYear.create({
    data: { id: ryId, label: "2025-2026", startDate: new Date("2025-06-01"), endDate: new Date("2026-05-31"), isActive: true }
  });

  // ── 1. Create Core Users ──
  const hash = await bcrypt.hash("Password@123", 10);
  
  const coreUsers = [
    { id: "u_admin", name: "Dr. K. Muthusamy", email: "admin@reports.edu", role: "ADMIN" as const, passwordHash: await bcrypt.hash("Admin@123", 10), avatar: "KM", avatarUrl: "/avatars/admin.png" },
    { id: "u_hod_cse", name: "Dr. S. Kanimozhi", email: "hod.cs@reports.edu", role: "DEPARTMENT_HEAD" as const, passwordHash: await bcrypt.hash("Hod@123", 10), avatar: "SK", avatarUrl: "/avatars/hod.png" },
    { id: "u_fac_cse", name: "Prof. R. Karthikeyan", email: "faculty1@reports.edu", role: "FACULTY" as const, passwordHash: await bcrypt.hash("Faculty@123", 10), avatar: "RK", avatarUrl: "/avatars/faculty.png" },
    { id: "u_rev1", name: "Dr. V. Saraswathi", email: "reviewer1@reports.edu", role: "REVIEWER" as const, passwordHash: await bcrypt.hash("Reviewer@123", 10), avatar: "VS", avatarUrl: "/avatars/reviewer.png" }
  ];
  for (const u of coreUsers) {
    await prisma.user.create({ data: u });
  }

  // ── 2. Create Departments ──
  const deptsData = [
    { id: "dept_cse", name: "Computer Science", code: "CSE", hodUserId: "u_hod_cse" },
    { id: "dept_ece", name: "Electronics", code: "ECE", hodUserId: "u_hod_cse" },
    { id: "dept_mech", name: "Mechanical", code: "MECH", hodUserId: "u_hod_cse" },
    { id: "dept_civil", name: "Civil", code: "CIVIL", hodUserId: "u_hod_cse" },
    { id: "dept_it", name: "Information Tech", code: "IT", hodUserId: "u_hod_cse" },
    { id: "dept_mba", name: "Business Admin", code: "MBA", hodUserId: "u_hod_cse" },
    { id: "dept_biotech", name: "Biotechnology", code: "BIOTECH", hodUserId: "u_hod_cse" },
    { id: "dept_chem", name: "Chemical Eng", code: "CHEM", hodUserId: "u_hod_cse" },
    { id: "dept_ai", name: "Artificial Intel", code: "AI", hodUserId: "u_hod_cse" },
    { id: "dept_math", name: "Mathematics", code: "MATH", hodUserId: "u_hod_cse" },
    { id: "dept_physics", name: "Physics", code: "PHYS", hodUserId: "u_hod_cse" },
    { id: "dept_arch", name: "Architecture", code: "ARCH", hodUserId: "u_hod_cse" },
    { id: "dept_auto", name: "Automobile", code: "AUTO", hodUserId: "u_hod_cse" },
    { id: "dept_bme", name: "Biomedical", code: "BME", hodUserId: "u_hod_cse" },
    { id: "dept_food", name: "Food Tech", code: "FOOD", hodUserId: "u_hod_cse" }
  ];
  for (const d of deptsData) {
    await prisma.department.create({ data: d });
  }

  // Next, update core users to map back to dept_cse
  await prisma.user.update({ where: { id: "u_hod_cse" }, data: { departmentId: "dept_cse" }});
  await prisma.user.update({ where: { id: "u_fac_cse" }, data: { departmentId: "dept_cse" }});

  // Procedural Users...
  const firstNames = ["Rajesh","Meenakshi","Anitha","Senthil","Kavitha","Suresh","Rahul","Priya","Arun","Sneha","Vikram","Neha","Karthik","Divya","Hari","Ravi","Deepa","Ashok","Lakshmi","Ganesh","Prakash","Sundar","Mani","Vijay","Ram","Krishna","Murugan","Anand"];
  const lastNames = ["Kumar","Sundaram","Krishnamurthy","Ramasamy","Murugesan","Babu","Sharma","Iyer","Nair","Menon","Reddy","Patil","Desai","Joshi","Singh","Verma","Chopra","Bose","Gupta","Rao","Pillai","Chettiar","Gounder","Thevar","Naidu","Venkatesan"];

  // Procedural Users: ~500 total
  const allUserIds: string[] = ["u_admin", "u_hod_cse", "u_fac_cse", "u_rev1"];
  const genUsers = [];
  for(let i=0; i<400; i++) {
    const fn = pick(firstNames);
    const ln = pick(lastNames);
    const role = i < 50 ? "REVIEWER" : i < 100 ? "DEPARTMENT_HEAD" : "FACULTY";
    const deptId = role !== "REVIEWER" ? pick(deptsData).id : null;
    
    const uId = `u_gen_${i}`;
    allUserIds.push(uId);
    genUsers.push({
      id: uId,
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@university.edu`,
      role: role as any,
      departmentId: deptId,
      passwordHash: hash,
      avatar: `${fn[0]}${ln[0]}`
    });
  }
  await prisma.user.createMany({ data: genUsers });

  // ── Students Generation (~500) ──
  const studentIds: string[] = [];
  const genStudents = [];
  for(let i=0; i<500; i++) {
    const sId = `s_gen_${i}`;
    studentIds.push(sId);
    genStudents.push({
      id: sId,
      name: `${pick(firstNames)} ${pick(lastNames)}`,
      rollNo: `2025${pick(deptsData).code}${i.toString().padStart(3, '0')}`,
      departmentId: pick(deptsData).id
    });
  }
  await prisma.instituteStudent.createMany({ data: genStudents });

  // ── Relational Mappings (~12 per) ──
  // Faculty-Mentee
  const facultyIds = genUsers.filter(u => u.role === "FACULTY").map(u => u.id);
  const fmMap = [];
  for(const fid of facultyIds) {
    // 10 to 15 mentees per faculty
    const numMentees = randInt(10, 15);
    for(let j=0; j<numMentees; j++) {
      fmMap.push({ userId: fid, studentId: pick(studentIds) });
    }
  }
  // Deduplicate pairs just in case
  const uniqueFmMap = Array.from(new Set(fmMap.map(a => `${a.userId}-${a.studentId}`))).map(str => {
    const [u, s] = str.split("-");
    return { userId: u, studentId: s };
  });
  await prisma.facultyMentee.createMany({ data: uniqueFmMap });

  // Reviewer-Department
  const reviewerIds = genUsers.filter(u => u.role === "REVIEWER").map(u => u.id);
  reviewerIds.push("u_rev1");
  const rdMap = [];
  for(const rid of reviewerIds) {
    // Assign 2 to 4 depts to each reviewer
    const numDepts = randInt(2, 4);
    for(let k=0; k<numDepts; k++) {
      rdMap.push({ userId: rid, departmentId: pick(deptsData).id });
    }
  }
  const uniqueRdMap = Array.from(new Set(rdMap.map(a => `${a.userId}-${a.departmentId}`))).map(str => {
    const [u, d] = str.split("-");
    return { userId: u, departmentId: d };
  });
  await prisma.reviewerDepartment.createMany({ data: uniqueRdMap });

  // ── Metric Entries (2000+) ──
  const categories = ["ACADEMIC", "RESEARCH", "STUDENT_ACHIEVEMENT", "FACULTY_ACHIEVEMENT", "EXTRACURRICULAR", "INFRASTRUCTURE", "FINANCIAL", "OTHER"];
  const statuses = ["DRAFT", "PENDING_HOD", "PENDING_OFFICE", "PENDING_ADMIN", "APPROVED_FINAL", "REJECTED_NEEDS_REVIEW"];
  
  const entryTitles = [
    "Conference Paper Presentation", "National Level Setup", "Sports Tournament Victory", 
    "Guest Lecture Conducted", "Industry Visit", "Alumni Meet", "Patent Filed", 
    "Workshop Attended", "Funding Received", "Equipment Purchased", "Pass Percentage Result",
    "Hackathon Champion", "Symposium Arranged", "Skill Development Training", "Webinar Hosted",
    "Journal Publication", "Book Chapter", "Project Grant Approval", "Community Service", "FDP Attended"
  ];
  
  const genEntries = [];
  const entryIds = [];
  for(let i=0; i<2000; i++) {
    const eId = `me_${i}`;
    entryIds.push(eId);
    genEntries.push({
      id: eId,
      departmentId: pick(deptsData).id,
      reportingYearId: ryId,
      category: pick(categories) as any,
      title: `${pick(entryTitles)} ${2024+randInt(0,2)}`,
      description: `Detailed description for this systemic record regarding ${pick(categories).toLowerCase()} initiatives in department.`,
      numericValue: randInt(1, 100),
      financialSpends: randInt(0, 500000),
      createdByUserId: pick(facultyIds),
      studentId: Math.random() > 0.6 ? pick(studentIds) : null,
      status: pick(statuses) as any,
      createdAt: new Date(Date.now() - randInt(1, 300) * 86400000),
      updatedAt: new Date(Date.now() - randInt(1, 30) * 86400000)
    });
  }
  await prisma.departmentMetricEntry.createMany({ data: genEntries });

  // ── KPIs (15-30 per department, ~300+ total) ──
  const kpiNames = ["Placement Target", "Average Package", "Research Grants", "Citations/Faculty", "PhDs Enrolled", "Hackathon Wins", "Industry Tie-ups", "Faculty Certifications", "Infrastructural Upgrades", "Consultancy Revenue", "Hostel Utilization", "Student Satisfaction Score"];
  const genKpis = [];
  for (const d of deptsData) {
    for (let i = 0; i < randInt(15, 30); i++) {
      genKpis.push({
        id: `kpi_${d.id}_${i}`,
        departmentId: d.id,
        reportingYearId: ryId,
        kpiName: pick(kpiNames) + ` Q${randInt(1,4)}`,
        kpiValue: randFloat(10, 95),
        unit: pick(["%", "LPA", "Cr", "papers", "awards"])
      });
    }
  }
  await prisma.departmentKPI.createMany({ data: genKpis });

  // ── Drafts, Comments, Logs (300+ drafts) ──
  const genDrafts = [];
  const draftIds = [];
  for(let i=0; i<300; i++) {
    const dId = `draft_${i}`;
    draftIds.push(dId);
    
    // Select between 5 to 15 entries for relation
    const draftEntries = [];
    for(let j=0; j<randInt(5, 15); j++) {
      draftEntries.push(pick(entryIds));
    }
    
    genDrafts.push({
      id: dId,
      departmentId: pick(deptsData).id,
      reportingYearId: ryId,
      status: pick(statuses.filter(s => s !== "REJECTED_NEEDS_REVIEW")) as any,
      compiledMetricEntryIds: draftEntries,
      createdByUserId: pick(["u_hod_cse", ...reviewerIds])
    });
  }
  await prisma.departmentReportDraft.createMany({ data: genDrafts });

  const genComments = [];
  const genLogs = [];
  for(const did of draftIds) {
    // 5-10 comments per draft
    for(let j=0; j<randInt(5, 10); j++) {
      genComments.push({
        id: `comment_${did}_${j}`,
        reportDraftId: did,
        commentedByUserId: pick(reviewerIds),
        message: `Automated reviewer feedback for section ${pick(["A","B","C"])}. Needs elaboration on the statistics.`
      });
    }
    // 2-6 logs per draft
    for(let k=0; k<randInt(2, 6); k++) {
      genLogs.push({
        id: `log_${did}_${k}`,
        reportDraftId: did,
        reviewerUserId: pick(reviewerIds),
        action: pick(["APPROVED", "REVISION_REQUESTED", "REJECTED"]) as any,
        message: `Action log trail generated by system.`
      });
    }
  }
  await prisma.reportComment.createMany({ data: genComments });
  await prisma.reportApprovalLog.createMany({ data: genLogs });

  // ── Notifications (1000+) ──
  const genNotifs = [];
  for(let i=0; i<1000; i++) {
    genNotifs.push({
      id: `notif_${i}`,
      userId: pick(allUserIds),
      title: `System Alert: ${pick(["Review Pending", "Approved", "Update Required", "Submission Successful"])}`,
      message: `Detailed auto-generated context for workflow event #${randInt(1000, 9999)}.`,
      isRead: Math.random() > 0.5,
      createdAt: new Date(Date.now() - randInt(1, 100) * 86400000)
    });
  }
  await prisma.reportNotification.createMany({ data: genNotifs });

  const sections = [
    { title: "Academic Excellence & Results", order: 1, category: "ACADEMIC" },
    { title: "Research & Development Output", order: 2, category: "RESEARCH" },
    { title: "Student Achievements & Placements", order: 3, category: "STUDENT_ACHIEVEMENT" },
    { title: "Staff Development & Awards", order: 4, category: "FACULTY_ACHIEVEMENT" },
    { title: "Financial Statements & Grants", order: 5, category: "FINANCIAL" },
    { title: "Infrastructural Growth", order: 6, category: "INFRASTRUCTURE" }
  ];

  // ── Template & Section Seeding (New) ──
  const mainTemplate = await prisma.instituteReportTemplate.create({
    data: {
      id: "tmpl_annual_25",
      name: "Standard Institutional Annual Report 2025",
      description: "Primary template for NAAC and NIRF alignment. Follow the attached manual for section-wise documentation requirements.",
      sections: sections, // Store metadata as JSON as required by schema
      guidelineFileUrl: "/uploads/1776410102970_How_To_Connect_MySQL_V8.0.20_to_HCP_V1.6.0_20200703.pdf",
      createdByAdminId: "u_admin"
    }
  });
  
  await prisma.instituteReportTemplate.create({
    data: {
      id: "tmpl_research_25",
      name: "Research & Publication Portfolio Guide",
      description: "Detailed guidelines for submitting journal papers, patent proofs, and conference records.",
      sections: sections.filter(s => s.category === "RESEARCH"),
      targetCategory: "RESEARCH",
      guidelineFileUrl: "/uploads/1776410418592_How_To_Connect_MySQL_V8.0.20_to_HCP_V1.6.0_20200703.pdf",
      createdByAdminId: "u_admin"
    }
  });

  for (const s of sections) {
    let sType: any = "CUSTOM";
    if (s.category === "ACADEMIC") sType = "ACADEMIC";
    if (s.category === "RESEARCH") sType = "RESEARCH";
    if (s.category === "FINANCIAL") sType = "FINANCIAL";
    if (s.category === "INFRASTRUCTURE") sType = "INFRASTRUCTURE";
    if (s.category === "STUDENT_ACHIEVEMENT") sType = "ACHIEVEMENTS";
    if (s.category === "FACULTY_ACHIEVEMENT") sType = "ACHIEVEMENTS";

    await prisma.reportTemplateSection.create({
      data: {
        id: `sec_${s.category.toLowerCase()}`,
        title: s.title,
        description: `Reporting section dedicated to ${s.title.toLowerCase()}.`,
        sectionType: sType,
        layoutJson: JSON.stringify({ category: s.category, order: s.order }),
        createdByAdminId: "u_admin"
      }
    });
  }

  // ── Annual Reports Seeding (Archives) ──
  await prisma.instituteAnnualReport.create({
    data: {
      id: "report_2024",
      reportingYearId: ryId,
      departmentReportDraftIds: draftIds.slice(0, 10),
      templateSectionIds: sections.map(s => `sec_${s.category.toLowerCase()}`),
      status: "GENERATED",
      generatedAt: new Date("2024-05-30")
    }
  });

  console.log(`✅ Created ~${allUserIds.length} Users`);
  console.log(`✅ Created ~${genStudents.length} Students`);
  console.log(`✅ Created ${uniqueFmMap.length} Faculty-Mentee Relations`);
  console.log(`✅ Created ${uniqueRdMap.length} Reviewer-Dept Relations`);
  console.log(`✅ Created ${genEntries.length} Metric Entries`);
  console.log(`✅ Created ${genKpis.length} KPIs`);
  console.log(`✅ Created ${genDrafts.length} Drafts, thousands of Comments & Logs`);
  console.log(`✅ Created ${genNotifs.length} Notifications`);
  console.log("✅ Created Institutional Report Template & 6 Major Sections");
  console.log("✅ Created Historical Annual Report Archive");

  console.log("\n🎉 HYPER-Seeding complete! Restart your dev server to see the massive data injection.\n");
}

main()
  .catch((e: Error) => {
    console.error("❌ Seed error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
