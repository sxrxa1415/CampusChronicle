import type {
  InstituteUser,
  InstituteStudent,
  Department,
  ReportingYear,
  DepartmentMetricEntry,
  DepartmentKPI,
  ReportTemplateSection,
  DepartmentReportDraft,
  ReportComment,
  ReportApprovalLog,
  ReportVersion,
  InstituteAnnualReport,
  ReportNotification,
} from "./types";

export const MOCK_USERS: InstituteUser[] = [
  {
    id: "u1",
    name: "Dr. Rajesh Kumar",
    email: "admin@reports.edu",
    role: "ADMIN",
    avatar: "RK",
    theme: "light",
    emailNotificationsEnabled: true,
    createdAt: "2024-06-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
  },
  {
    id: "u2",
    name: "Dr. Meenakshi Sundaram",
    email: "hod.cse@reports.edu",
    role: "DEPARTMENT_HEAD",
    departmentId: "dept1",
    avatar: "MS",
    theme: "light",
    emailNotificationsEnabled: true,
    createdAt: "2024-06-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
  },
  {
    id: "u3",
    name: "Prof. Anitha Krishnamurthy",
    email: "faculty.cse@reports.edu",
    role: "FACULTY",
    departmentId: "dept1",
    avatar: "AK",
    theme: "light",
    emailNotificationsEnabled: true,
    menteeIds: ["s1", "s2"],
    createdAt: "2024-06-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
  },
  {
    id: "u4",
    name: "Dr. Senthilkumar Ramasamy",
    email: "reviewer@reports.edu",
    role: "REVIEWER",
    avatar: "SR",
    theme: "light",
    emailNotificationsEnabled: true,
    attachedDepartmentIds: ["dept1", "dept2"],
    createdAt: "2024-06-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
  },
  {
    id: "u5",
    name: "Dr. Kavitha Murugesan",
    email: "hod.ece@reports.edu",
    role: "DEPARTMENT_HEAD",
    departmentId: "dept2",
    avatar: "KM",
    theme: "light",
    emailNotificationsEnabled: true,
    createdAt: "2024-06-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
  },
  {
    id: "u6",
    name: "Prof. Suresh Babu",
    email: "faculty.mech@reports.edu",
    role: "FACULTY",
    departmentId: "dept3",
    avatar: "SB",
    theme: "light",
    emailNotificationsEnabled: true,
    menteeIds: [],
    createdAt: "2024-06-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
  },
];

export const MOCK_STUDENTS: InstituteStudent[] = [
  { id: "s1", name: "Arjun Selvam", rollNo: "CSE001", departmentId: "dept1" },
  { id: "s2", name: "Priya Rajan", rollNo: "CSE002", departmentId: "dept1" },
  { id: "s3", name: "Karthik Subramanian", rollNo: "ECE001", departmentId: "dept2" },
  { id: "s4", name: "Divya Venkat", rollNo: "ECE002", departmentId: "dept2" },
  { id: "s5", name: "Hari Narasimhan", rollNo: "MECH001", departmentId: "dept3" },
];

export const MOCK_DEPARTMENTS: Department[] = [
  { id: "dept1", name: "Computer Science & Engineering", code: "CSE", hodUserId: "u2", createdAt: "2024-06-01T00:00:00Z" },
  { id: "dept2", name: "Electronics & Communication Engineering", code: "ECE", hodUserId: "u5", createdAt: "2024-06-01T00:00:00Z" },
  { id: "dept3", name: "Mechanical Engineering", code: "MECH", hodUserId: "u6", createdAt: "2024-06-01T00:00:00Z" },
  { id: "dept4", name: "Civil Engineering", code: "CIVIL", hodUserId: "u1", createdAt: "2024-06-01T00:00:00Z" },
  { id: "dept5", name: "Information Technology", code: "IT", hodUserId: "u1", createdAt: "2024-06-01T00:00:00Z" },
  { id: "dept6", name: "MBA", code: "MBA", hodUserId: "u1", createdAt: "2024-06-01T00:00:00Z" },
];

export const MOCK_REPORTING_YEARS: ReportingYear[] = [
  { id: "ry1", label: "2023-2024", startDate: "2023-06-01", endDate: "2024-05-31", isActive: true },
  { id: "ry2", label: "2022-2023", startDate: "2022-06-01", endDate: "2023-05-31", isActive: false },
  { id: "ry3", label: "2021-2022", startDate: "2021-06-01", endDate: "2022-05-31", isActive: false },
];

export const MOCK_METRIC_ENTRIES: DepartmentMetricEntry[] = [
  { id: "me1", departmentId: "dept1", reportingYearId: "ry1", category: "ACADEMIC", title: "University Rank Holders", description: "Students who secured University ranks in final semester exams. Arjun Selvam secured 3rd rank.", numericValue: 5, createdByUserId: "u3", studentId: "s1", status: "APPROVED_FINAL", createdAt: "2024-01-10T10:00:00Z", updatedAt: "2024-01-15T10:00:00Z", },
  { id: "me2", departmentId: "dept1", reportingYearId: "ry1", category: "RESEARCH", title: "International Journal Publications", description: "Faculty published in IEEE, Springer and Elsevier journals. Lead author: Dr. Anitha Krishnamurthy.", numericValue: 18, createdByUserId: "u3", status: "APPROVED_FINAL", createdAt: "2024-01-12T10:00:00Z", updatedAt: "2024-01-18T10:00:00Z", },
  { id: "me3", departmentId: "dept1", reportingYearId: "ry1", category: "STUDENT_ACHIEVEMENT", title: "Campus Placements", description: "Students placed in top MNCs including TCS, Infosys, Wipro, and Zoho.", numericValue: 142, createdByUserId: "u3", status: "PENDING_HOD", createdAt: "2024-02-01T10:00:00Z", updatedAt: "2024-02-01T10:00:00Z", },
  { id: "me4", departmentId: "dept1", reportingYearId: "ry1", category: "EXTRACURRICULAR", title: "Technical Symposium - TechVista 2024", description: "Annual technical symposium with 500+ participants.", numericValue: 520, createdByUserId: "u2", financialSpends: 3200, status: "APPROVED_FINAL", createdAt: "2024-02-10T10:00:00Z", updatedAt: "2024-02-15T10:00:00Z", },
  { id: "me5", departmentId: "dept1", reportingYearId: "ry1", category: "FACULTY_ACHIEVEMENT", title: "AICTE Sponsored Research Projects", description: "Faculty secured funded projects from AICTE.", numericValue: 3, createdByUserId: "u3", status: "REJECTED_NEEDS_REVIEW", reviewerComment: "Please attach proof of funding documents.", createdAt: "2024-02-20T10:00:00Z", updatedAt: "2024-02-25T10:00:00Z", },
  { id: "me6", departmentId: "dept1", reportingYearId: "ry1", category: "INFRASTRUCTURE", title: "New AI & ML Lab Setup", description: "State-of-the-art AI lab with 40 high-performance workstations.", numericValue: 40, createdByUserId: "u2", financialSpends: 15400, status: "APPROVED_FINAL", createdAt: "2024-03-01T10:00:00Z", updatedAt: "2024-03-05T10:00:00Z", },
  { id: "me7", departmentId: "dept2", reportingYearId: "ry1", category: "RESEARCH", title: "Conference Papers Presented", description: "Papers presented in national conferences by ECE faculty.", numericValue: 22, createdByUserId: "u5", status: "APPROVED_FINAL", createdAt: "2024-01-20T10:00:00Z", updatedAt: "2024-01-25T10:00:00Z", },
  { id: "me8", departmentId: "dept2", reportingYearId: "ry1", category: "STUDENT_ACHIEVEMENT", title: "GATE Qualified Students", description: "Students qualified GATE 2024 from ECE department.", numericValue: 12, createdByUserId: "u5", status: "PENDING_ADMIN", createdAt: "2024-02-05T10:00:00Z", updatedAt: "2024-02-05T10:00:00Z", },
  { id: "me9", departmentId: "dept3", reportingYearId: "ry1", category: "ACADEMIC", title: "Pass Percentage - Final Year", description: "Overall pass percentage of final year MECH students.", numericValue: 94, textualValue: "94%", createdByUserId: "u6", status: "PENDING_OFFICE", createdAt: "2024-02-15T10:00:00Z", updatedAt: "2024-02-15T10:00:00Z", },
  { id: "me10", departmentId: "dept1", reportingYearId: "ry1", category: "FINANCIAL", title: "Department Budget Utilization", description: "Annual departmental budget utilization.", numericValue: 85, textualValue: "85% utilized", createdByUserId: "u2", financialSpends: 12500, status: "PENDING_HOD", createdAt: "2024-03-10T10:00:00Z", updatedAt: "2024-03-10T10:00:00Z", },
  { id: "me11", departmentId: "dept4", reportingYearId: "ry1", category: "INFRASTRUCTURE", title: "Structural Lab Upgrades", description: "Purchased new Universal Testing Machine for the structural lab.", numericValue: 1, createdByUserId: "u1", financialSpends: 8900, status: "APPROVED_FINAL", createdAt: "2024-03-12T10:00:00Z", updatedAt: "2024-03-12T10:00:00Z", },
  { id: "me12", departmentId: "dept5", reportingYearId: "ry1", category: "STUDENT_ACHIEVEMENT", title: "Hackathon Winners", description: "IT students won 1st prize at Smart India Hackathon.", numericValue: 6, createdByUserId: "u1", status: "APPROVED_FINAL", createdAt: "2024-03-13T10:00:00Z", updatedAt: "2024-03-13T10:00:00Z", },
  { id: "me13", departmentId: "dept2", reportingYearId: "ry1", category: "FINANCIAL", title: "Robotics Workshop Funding", description: "Funds approved for the 3-day robotics workshop.", numericValue: 1, createdByUserId: "u5", financialSpends: 850, status: "PENDING_OFFICE", createdAt: "2024-03-14T10:00:00Z", updatedAt: "2024-03-14T10:00:00Z", },
  { id: "me14", departmentId: "dept5", reportingYearId: "ry1", category: "RESEARCH", title: "Cybersecurity Patents Filed", description: "IT faculty filed 3 patents in cloud security architecture.", numericValue: 3, createdByUserId: "u1", status: "PENDING_HOD", createdAt: "2024-03-15T10:00:00Z", updatedAt: "2024-03-15T10:00:00Z", },
  { id: "me15", departmentId: "dept4", reportingYearId: "ry1", category: "ACADEMIC", title: "Civil Pass Percentage", description: "Civil batch 2024 overall passing rate achieved.", numericValue: 88, textualValue: "88%", createdByUserId: "u1", status: "APPROVED_FINAL", createdAt: "2024-03-16T10:00:00Z", updatedAt: "2024-03-16T10:00:00Z", },
  { id: "me16", departmentId: "dept3", reportingYearId: "ry1", category: "EXTRACURRICULAR", title: "Auto Expo Visit", description: "Industrial visit arranged for final year students to Auto Expo.", numericValue: 110, createdByUserId: "u6", financialSpends: 1200, status: "APPROVED_FINAL", createdAt: "2024-03-17T10:00:00Z", updatedAt: "2024-03-17T10:00:00Z", },
  { id: "me17", departmentId: "dept1", reportingYearId: "ry1", category: "OTHER", title: "Alumni Meet 2024", description: "Hosted 400+ CSE alumni during the tech reunion.", numericValue: 410, createdByUserId: "u3", financialSpends: 2500, status: "APPROVED_FINAL", createdAt: "2024-03-18T10:00:00Z", updatedAt: "2024-03-18T10:00:00Z", },
  { id: "me18", departmentId: "dept2", reportingYearId: "ry1", category: "INFRASTRUCTURE", title: "VLSI Board Upgrades", description: "Bought 12 new FPGA kits for the hardware lab.", numericValue: 12, createdByUserId: "u5", financialSpends: 4300, status: "PENDING_ADMIN", createdAt: "2024-03-19T10:00:00Z", updatedAt: "2024-03-19T10:00:00Z", },
  { id: "me19", departmentId: "dept5", reportingYearId: "ry1", category: "ACADEMIC", title: "Information Tech Pass Percentage", description: "Surpassed target with highest passing batch for IT dept.", numericValue: 97, textualValue: "97%", createdByUserId: "u1", status: "APPROVED_FINAL", createdAt: "2024-03-20T10:00:00Z", updatedAt: "2024-03-20T10:00:00Z", },
  { id: "me20", departmentId: "dept4", reportingYearId: "ry1", category: "RESEARCH", title: "Concrete Durability Papers", description: "Civil faculty published 4 core journals this quarter.", numericValue: 4, createdByUserId: "u1", status: "PENDING_HOD", createdAt: "2024-03-21T10:00:00Z", updatedAt: "2024-03-21T10:00:00Z", },
  { id: "me21", departmentId: "dept3", reportingYearId: "ry1", category: "STUDENT_ACHIEVEMENT", title: "National Go-Kart Championship", description: "Mechanical team secured 2nd place in Go-Kart racing.", numericValue: 15, createdByUserId: "u6", studentId: "s5", status: "APPROVED_FINAL", createdAt: "2024-03-22T10:00:00Z", updatedAt: "2024-03-22T10:00:00Z", },
  { id: "me22", departmentId: "dept2", reportingYearId: "ry1", category: "ACADEMIC", title: "ECE Pass Percentage", description: "ECE pass rate finalized.", numericValue: 91, textualValue: "91%", createdByUserId: "u5", status: "APPROVED_FINAL", createdAt: "2024-03-23T10:00:00Z", updatedAt: "2024-03-23T10:00:00Z", },
  { id: "me23", departmentId: "dept1", reportingYearId: "ry1", category: "FACULTY_ACHIEVEMENT", title: "Best Teaching Pedagogy Award", description: "Prof. Anitha Krishnamurthy won the star faculty award.", numericValue: 1, createdByUserId: "u3", status: "APPROVED_FINAL", createdAt: "2024-03-24T10:00:00Z", updatedAt: "2024-03-24T10:00:00Z", },
  { id: "me24", departmentId: "dept3", reportingYearId: "ry1", category: "FINANCIAL", title: "CNC Machine Maintenance", description: "Annual maintenance contract for advanced machinery.", numericValue: 1, createdByUserId: "u6", financialSpends: 3200, status: "PENDING_OFFICE", createdAt: "2024-03-25T10:00:00Z", updatedAt: "2024-03-25T10:00:00Z", },
  { id: "me25", departmentId: "dept5", reportingYearId: "ry1", category: "EXTRACURRICULAR", title: "Cloud Tech Seminar", description: "Organized a 2-day AWS bootcamp for 200 students.", numericValue: 200, createdByUserId: "u1", financialSpends: 900, status: "PENDING_ADMIN", createdAt: "2024-03-26T10:00:00Z", updatedAt: "2024-03-26T10:00:00Z", },
  { id: "me26", departmentId: "dept2", reportingYearId: "ry1", category: "STUDENT_ACHIEVEMENT", title: "Placement Highest Package", description: "Student secured 18 LPA offer from Texas Instruments.", numericValue: 18, createdByUserId: "u5", studentId: "s3", status: "APPROVED_FINAL", createdAt: "2024-03-27T10:00:00Z", updatedAt: "2024-03-27T10:00:00Z", },
];

export const MOCK_KPIS: DepartmentKPI[] = [
  { id: "kpi1", departmentId: "dept1", reportingYearId: "ry1", kpiName: "Student Pass Percentage", kpiValue: 96.5, unit: "%", createdAt: "2024-01-01T00:00:00Z" },
  { id: "kpi2", departmentId: "dept1", reportingYearId: "ry1", kpiName: "Placement Rate", kpiValue: 88, unit: "%", createdAt: "2024-01-01T00:00:00Z" },
  { id: "kpi3", departmentId: "dept1", reportingYearId: "ry1", kpiName: "Publications Count", kpiValue: 18, unit: "papers", createdAt: "2024-01-01T00:00:00Z" },
  { id: "kpi4", departmentId: "dept1", reportingYearId: "ry1", kpiName: "Funded Projects", kpiValue: 3, unit: "projects", createdAt: "2024-01-01T00:00:00Z" },
  { id: "kpi5", departmentId: "dept1", reportingYearId: "ry1", kpiName: "Infrastructure Developments", kpiValue: 2, unit: "labs", createdAt: "2024-01-01T00:00:00Z" },
  { id: "kpi6", departmentId: "dept1", reportingYearId: "ry1", kpiName: "Events Conducted", kpiValue: 8, unit: "events", createdAt: "2024-01-01T00:00:00Z" },
  { id: "kpi7", departmentId: "dept2", reportingYearId: "ry1", kpiName: "Student Pass Percentage", kpiValue: 92.3, unit: "%", createdAt: "2024-01-01T00:00:00Z" },
  { id: "kpi8", departmentId: "dept2", reportingYearId: "ry1", kpiName: "Placement Rate", kpiValue: 82, unit: "%", createdAt: "2024-01-01T00:00:00Z" },
  { id: "kpi9", departmentId: "dept3", reportingYearId: "ry1", kpiName: "Student Pass Percentage", kpiValue: 94, unit: "%", createdAt: "2024-01-01T00:00:00Z" },
  { id: "kpi10", departmentId: "dept3", reportingYearId: "ry1", kpiName: "Placement Rate", kpiValue: 75, unit: "%", createdAt: "2024-01-01T00:00:00Z" },
];

export const MOCK_TEMPLATE_SECTIONS: ReportTemplateSection[] = [
  { id: "ts1", sectionType: "COVER", title: "Cover Page", description: "Institute logo, name, and academic year", layoutJson: '{"cols":1,"align":"center"}', createdByAdminId: "u1", createdAt: "2024-01-01T00:00:00Z" },
  { id: "ts2", sectionType: "ACADEMIC", title: "Academic Performance", description: "Pass percentages, rank holders, and results", layoutJson: '{"cols":2,"charts":true}', createdByAdminId: "u1", createdAt: "2024-01-01T00:00:00Z" },
  { id: "ts3", sectionType: "RESEARCH", title: "Research & Publications", description: "Journal papers, conference proceedings", layoutJson: '{"cols":2,"tables":true}', createdByAdminId: "u1", createdAt: "2024-01-01T00:00:00Z" },
  { id: "ts4", sectionType: "FINANCIAL", title: "Financial Summary", description: "Budget allocation and utilization", layoutJson: '{"cols":1,"charts":true}', createdByAdminId: "u1", createdAt: "2024-01-01T00:00:00Z" },
  { id: "ts5", sectionType: "INFRASTRUCTURE", title: "Infrastructure Development", description: "New labs, equipment, and facilities", layoutJson: '{"cols":2,"images":true}', createdByAdminId: "u1", createdAt: "2024-01-01T00:00:00Z" },
  { id: "ts6", sectionType: "ACHIEVEMENTS", title: "Student & Faculty Achievements", description: "Awards, ranks, and recognitions", layoutJson: '{"cols":3}', createdByAdminId: "u1", createdAt: "2024-01-01T00:00:00Z" },
  { id: "ts7", sectionType: "EVENTS", title: "Events & Activities", description: "Symposia, workshops, and cultural events", layoutJson: '{"cols":2,"timeline":true}', createdByAdminId: "u1", createdAt: "2024-01-01T00:00:00Z" },
];

export const MOCK_REPORT_DRAFTS: DepartmentReportDraft[] = [
  {
    id: "rd1", departmentId: "dept1", reportingYearId: "ry1",
    compiledMetricEntryIds: ["me1","me2","me3","me4","me6"],
    status: "PENDING_ADMIN",
    submittedAt: "2024-03-01T10:00:00Z",
    createdByUserId: "u2",
    createdAt: "2024-02-20T10:00:00Z", updatedAt: "2024-03-01T10:00:00Z",
  },
  {
    id: "rd2", departmentId: "dept2", reportingYearId: "ry1",
    compiledMetricEntryIds: ["me7","me8"],
    status: "PENDING_OFFICE",
    submittedAt: "2024-03-05T10:00:00Z",
    createdByUserId: "u5",
    createdAt: "2024-02-25T10:00:00Z", updatedAt: "2024-03-05T10:00:00Z",
  },
  {
    id: "rd3", departmentId: "dept3", reportingYearId: "ry1",
    compiledMetricEntryIds: ["me9"],
    status: "DRAFT",
    createdByUserId: "u6",
    createdAt: "2024-03-10T10:00:00Z", updatedAt: "2024-03-10T10:00:00Z",
  },
  {
    id: "rd4", departmentId: "dept4", reportingYearId: "ry1",
    compiledMetricEntryIds: [],
    status: "APPROVED_FINAL",
    submittedAt: "2024-02-15T10:00:00Z",
    approvedAt: "2024-02-20T10:00:00Z",
    createdByUserId: "u1",
    createdAt: "2024-02-10T10:00:00Z", updatedAt: "2024-02-20T10:00:00Z",
  },
];

export const MOCK_COMMENTS: ReportComment[] = [
  { id: "rc1", reportDraftId: "rd1", commentedByUserId: "u4", message: "Please add more details about the funded research projects and their outcomes.", createdAt: "2024-03-05T10:00:00Z" },
  { id: "rc2", reportDraftId: "rd1", commentedByUserId: "u4", message: "The placement data looks good. Please include company-wise breakdown.", createdAt: "2024-03-06T10:00:00Z" },
  { id: "rc3", reportDraftId: "rd2", commentedByUserId: "u4", message: "GATE qualification data needs supporting documents.", createdAt: "2024-03-07T10:00:00Z" },
];

export const MOCK_APPROVAL_LOGS: ReportApprovalLog[] = [
  { id: "al1", reportDraftId: "rd1", reviewerUserId: "u4", action: "REVISION_REQUESTED", message: "Needs additional documentation for research projects.", createdAt: "2024-03-05T10:00:00Z" },
  { id: "al2", reportDraftId: "rd4", reviewerUserId: "u4", action: "APPROVED", message: "All data verified and approved.", createdAt: "2024-02-20T10:00:00Z" },
];

export const MOCK_VERSIONS: ReportVersion[] = [
  { id: "rv1", reportDraftId: "rd1", versionNumber: 1, snapshotHtml: "<h1>CSE Draft v1</h1><p>Initial draft with academic data.</p>", createdByUserId: "u2", createdAt: "2024-02-20T10:00:00Z" },
  { id: "rv2", reportDraftId: "rd1", versionNumber: 2, snapshotHtml: "<h1>CSE Draft v2</h1><p>Added research publications and placement data.</p>", createdByUserId: "u2", createdAt: "2024-02-25T10:00:00Z" },
  { id: "rv3", reportDraftId: "rd1", versionNumber: 3, snapshotHtml: "<h1>CSE Draft v3</h1><p>Updated with reviewer feedback. All sections complete.</p>", createdByUserId: "u2", createdAt: "2024-03-01T10:00:00Z" },
];

export const MOCK_ANNUAL_REPORT: InstituteAnnualReport = {
  id: "ar1",
  reportingYearId: "ry1",
  departmentReportDraftIds: ["rd1","rd2","rd3","rd4"],
  templateSectionIds: ["ts1","ts2","ts3","ts4","ts5","ts6","ts7"],
  status: "GENERATED",
  generatedAt: "2024-03-15T10:00:00Z",
};

export const MOCK_NOTIFICATIONS: ReportNotification[] = [
  { id: "n1", userId: "u2", reportDraftId: "rd1", title: "Report Under Review", message: "Your CSE department report is now under review by Dr. Senthilkumar.", isRead: false, createdAt: "2024-03-01T10:00:00Z" },
  { id: "n2", userId: "u2", reportDraftId: "rd1", title: "Revision Requested", message: "Reviewer has requested revisions for your department report. Check comments.", isRead: false, createdAt: "2024-03-05T10:00:00Z" },
  { id: "n3", userId: "u4", reportDraftId: "rd2", title: "New Report for Review", message: "ECE department report submitted by Dr. Kavitha Murugesan is awaiting your review.", isRead: false, createdAt: "2024-03-05T10:00:00Z" },
  { id: "n4", userId: "u3", reportDraftId: "rd1", title: "Entry Approved", message: "Your entry 'International Journal Publications' has been approved.", isRead: true, createdAt: "2024-01-18T10:00:00Z" },
  { id: "n5", userId: "u3", reportDraftId: "rd1", title: "Entry Rejected", message: "Your entry 'AICTE Sponsored Research Projects' was rejected. Please check reviewer comments.", isRead: false, createdAt: "2024-02-25T10:00:00Z" },
  { id: "n6", userId: "u1", title: "Institute Report Generated", message: "Annual Report 2023-2024 has been successfully generated and is ready for review.", isRead: false, createdAt: "2024-03-15T10:00:00Z" },
  { id: "n7", userId: "u1", reportDraftId: "rd4", title: "Report Approved", message: "Civil Engineering department report has been approved by reviewer.", isRead: true, createdAt: "2024-02-20T10:00:00Z" },
];

export const DEMO_CREDENTIALS = [
  { email: "admin@reports.edu", password: "Admin@123", role: "ADMIN", name: "Dr. Rajesh Kumar" },
  { email: "hod.cse@reports.edu", password: "Hod@123", role: "DEPARTMENT_HEAD", name: "Dr. Meenakshi Sundaram" },
  { email: "faculty.cse@reports.edu", password: "Faculty@123", role: "FACULTY", name: "Prof. Anitha Krishnamurthy" },
  { email: "reviewer@reports.edu", password: "Review@123", role: "REVIEWER", name: "Dr. Senthilkumar Ramasamy" },
];

export const YEARLY_TREND_DATA = [
  { year: "2020-21", cse: 82, ece: 78, mech: 75, civil: 70 },
  { year: "2021-22", cse: 87, ece: 82, mech: 79, civil: 74 },
  { year: "2022-23", cse: 91, ece: 87, mech: 85, civil: 80 },
  { year: "2023-24", cse: 96, ece: 92, mech: 94, civil: 88 },
];

export const RESEARCH_OUTPUT_DATA = [
  { year: "2020-21", journals: 8, conferences: 12, patents: 1 },
  { year: "2021-22", journals: 11, conferences: 18, patents: 2 },
  { year: "2022-23", journals: 15, conferences: 24, patents: 3 },
  { year: "2023-24", journals: 18, conferences: 30, patents: 4 },
];

export const BUDGET_DATA = [
  { name: "Lab Equipment", value: 35 },
  { name: "Faculty Dev.", value: 20 },
  { name: "Events", value: 15 },
  { name: "Infrastructure", value: 20 },
  { name: "Misc", value: 10 },
];

export const PLACEMENT_DATA = [
  { company: "TCS", count: 42 },
  { company: "Infosys", count: 38 },
  { company: "Zoho", count: 22 },
  { company: "Wipro", count: 18 },
  { company: "Cognizant", count: 15 },
  { company: "Others", count: 7 },
];

export const DEPT_PERFORMANCE_DATA = [
  { dept: "CSE", performance: 96, target: 90 },
  { dept: "ECE", performance: 92, target: 90 },
  { dept: "MECH", performance: 88, target: 85 },
  { dept: "CIVIL", performance: 84, target: 85 },
  { dept: "IT", performance: 94, target: 90 },
  { dept: "MBA", performance: 91, target: 88 },
];
