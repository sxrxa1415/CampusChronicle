export type InstituteRole = "ADMIN" | "DEPARTMENT_HEAD" | "FACULTY" | "REVIEWER";

export interface InstituteUser {
  id: string;
  name: string;
  email: string;
  role: InstituteRole;
  departmentId?: string;
  avatar?: string;
  theme: "light" | "dark";
  emailNotificationsEnabled: boolean;
  attachedDepartmentIds?: string[];
  menteeIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InstituteStudent {
  id: string;
  name: string;
  rollNo: string;
  departmentId: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  hodUserId: string;
  createdAt: string;
}

export interface ReportingYear {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export type ReportMetricCategory =
  | "ACADEMIC"
  | "RESEARCH"
  | "FINANCIAL"
  | "INFRASTRUCTURE"
  | "STUDENT_ACHIEVEMENT"
  | "FACULTY_ACHIEVEMENT"
  | "EXTRACURRICULAR"
  | "OTHER";

export interface DepartmentMetricEntry {
  id: string;
  departmentId: string;
  reportingYearId: string;
  category: ReportMetricCategory;
  title: string;
  description?: string;
  numericValue?: number;
  textualValue?: string;
  attachments?: string[];
  images?: string[];
  createdByUserId: string;
  studentId?: string;
  status: "DRAFT" | "PENDING_HOD" | "PENDING_OFFICE" | "PENDING_ADMIN" | "APPROVED_FINAL" | "REJECTED_NEEDS_REVIEW";
  reviewerComment?: string;
  createdAt: string;
  updatedAt: string;
  // KPI Target and Analytics fields
  passPercentage?: number;
  placementPercentage?: number;
  researchOutputScore?: number;
  attendanceTrends?: number;
  studentTargets?: {
    papersPublished: number;
    competitionsDone: number;
  };
  staffTargets?: {
    tasksDone: number;
    extraPay: number;
  };
  financialSpends?: number;
}

export interface DepartmentKPI {
  id: string;
  departmentId: string;
  reportingYearId: string;
  kpiName: string;
  kpiValue: number;
  unit?: string;
  createdAt: string;
}

export interface DepartmentDashboardStats {
  submittedEntries: number;
  approvedEntries: number;
  rejectedEntries: number;
  pendingEntries: number;
}

export interface AdminDashboardStats {
  totalDepartmentsSubmitted: number;
  pendingDepartmentReports: number;
  approvedReports: number;
  totalPublications: number;
  totalAchievements: number;
}

export type ReportSectionType =
  | "COVER"
  | "ACADEMIC"
  | "RESEARCH"
  | "FINANCIAL"
  | "INFRASTRUCTURE"
  | "ACHIEVEMENTS"
  | "EVENTS"
  | "CUSTOM";

export interface ReportTemplateSection {
  id: string;
  sectionType: ReportSectionType;
  title: string;
  description?: string;
  layoutJson: string;
  createdByAdminId: string;
  createdAt: string;
}

export interface DepartmentReportDraft {
  id: string;
  departmentId: string;
  reportingYearId: string;
  compiledMetricEntryIds: string[];
  previewHtml?: string;
  status: "DRAFT" | "PENDING_HOD" | "PENDING_OFFICE" | "PENDING_ADMIN" | "APPROVED_FINAL" | "REJECTED_NEEDS_REVIEW";
  submittedAt?: string;
  approvedAt?: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  financialSpends?: number;
  officeStaffFinancialSpends?: number;
}

export interface ReportComment {
  id: string;
  reportDraftId: string;
  commentedByUserId: string;
  message: string;
  createdAt: string;
}

export interface ReportApprovalLog {
  id: string;
  reportDraftId: string;
  reviewerUserId: string;
  action: "APPROVED" | "REJECTED" | "REVISION_REQUESTED";
  message?: string;
  createdAt: string;
}

export interface ReportVersion {
  id: string;
  reportDraftId: string;
  versionNumber: number;
  snapshotHtml: string;
  createdByUserId: string;
  createdAt: string;
}

export interface InstituteAnnualReport {
  id: string;
  reportingYearId: string;
  departmentReportDraftIds: string[];
  templateSectionIds: string[];
  instituteLogo?: string;
  coverImage?: string;
  generatedPdfUrl?: string;
  generatedHtml?: string;
  status: "GENERATED" | "PUBLISHED";
  generatedAt: string;
}

export interface ReportNotification {
  id: string;
  userId: string;
  reportDraftId?: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ReportTutorialStep {
  id: string;
  pageRoute: string;
  stepTitle: string;
  stepDescription: string;
  stepOrder: number;
}
