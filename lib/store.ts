"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  InstituteUser,
  DepartmentMetricEntry,
  DepartmentReportDraft,
  ReportComment,
  ReportApprovalLog,
  ReportVersion,
  ReportTemplateSection,
  InstituteReportTemplate,
  ReportSectionType,
  ReportNotification,
} from "./types";

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppStore {
  // Auth & Users
  users: InstituteUser[];
  currentUser: InstituteUser | null;
  login: (user: InstituteUser) => void;
  logout: () => void;
  updateUserTheme: (theme: "light" | "dark") => void;
  updateUserNotifications: (enabled: boolean) => void;
  updateUserAccessControls: (userId: string, updates: Partial<InstituteUser>) => void;
  addUser: (user: InstituteUser) => void;
  deleteUser: (id: string) => void;

  // Metric Entries
  metricEntries: DepartmentMetricEntry[];
  addMetricEntry: (entry: DepartmentMetricEntry) => void;
  updateMetricEntry: (id: string, updates: Partial<DepartmentMetricEntry>) => void;
  deleteMetricEntry: (id: string) => void;

  // Report Drafts
  reportDrafts: DepartmentReportDraft[];
  addReportDraft: (draft: DepartmentReportDraft) => void;
  updateReportDraft: (id: string, updates: Partial<DepartmentReportDraft>) => void;

  // Comments
  comments: ReportComment[];
  addComment: (comment: ReportComment) => void;

  // Approval Logs
  approvalLogs: ReportApprovalLog[];
  addApprovalLog: (log: ReportApprovalLog) => void;
  setApprovalLogs: (logs: ReportApprovalLog[]) => void;

  // Toast Notifications
  toasts: Toast[];
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Versions
  versions: ReportVersion[];
  addVersion: (version: ReportVersion) => void;

  // Templates
  reportTemplates: InstituteReportTemplate[];
  addReportTemplate: (template: InstituteReportTemplate) => void;
  updateReportTemplate: (id: string, updates: Partial<InstituteReportTemplate>) => void;
  deleteReportTemplate: (id: string) => void;
  setReportTemplates: (templates: InstituteReportTemplate[]) => void;
  setMetricEntries: (entries: DepartmentMetricEntry[]) => void;

  // Template Sections & Report Builder
  templateSections: ReportTemplateSection[];
  addTemplateSection: (section: ReportTemplateSection) => void;
  updateTemplateSection: (id: string, updates: Partial<ReportTemplateSection>) => void;
  deleteTemplateSection: (id: string) => void;
  reorderTemplateSections: (newOrder: ReportTemplateSection[]) => void;
  loadTemplateIntoBuilder: (templateId: string) => void;

  // Notifications
  notifications: ReportNotification[];
  addNotification: (notification: ReportNotification) => void;
  setNotifications: (notifications: ReportNotification[]) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Tutorial
  tutorialActive: boolean;
  tutorialStep: number;
  startTutorial: () => void;
  nextTutorialStep: () => void;
  endTutorial: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      users: [],
      currentUser: null,
      login: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
  updateUserAccessControls: (userId, updates) => set((s) => ({
    users: s.users.map((u) => u.id === userId ? { ...u, ...updates } : u),
    currentUser: s.currentUser?.id === userId ? { ...s.currentUser, ...updates } : s.currentUser,
  })),
  addUser: (user) => set((s) => ({ users: [user, ...s.users] })),
  deleteUser: (id) => set((s) => ({
    users: s.users.filter((u) => u.id !== id),
    currentUser: s.currentUser?.id === id ? null : s.currentUser
  })),
  updateUserTheme: (theme) =>
    set((s) => ({
      currentUser: s.currentUser ? { ...s.currentUser, theme } : null,
    })),
  updateUserNotifications: (enabled) =>
    set((s) => ({
      currentUser: s.currentUser
        ? { ...s.currentUser, emailNotificationsEnabled: enabled }
        : null,
    })),

  metricEntries: [],
  addMetricEntry: (entry) =>
    set((s) => ({ metricEntries: [entry, ...s.metricEntries] })),
  updateMetricEntry: (id, updates) =>
    set((s) => ({
      metricEntries: s.metricEntries.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    })),
  deleteMetricEntry: (id) =>
    set((s) => ({
      metricEntries: s.metricEntries.filter((e) => e.id !== id),
    })),

  reportDrafts: [],
  addReportDraft: (draft) =>
    set((s) => ({ reportDrafts: [draft, ...s.reportDrafts] })),
  updateReportDraft: (id, updates) =>
    set((s) => ({
      reportDrafts: s.reportDrafts.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    })),

  comments: [],
  addComment: (comment) =>
    set((s) => ({ comments: [comment, ...s.comments] })),

  approvalLogs: [],
  addApprovalLog: (log) =>
    set((s) => ({ approvalLogs: [log, ...s.approvalLogs] })),
  setApprovalLogs: (logs) => set({ approvalLogs: logs }),

  versions: [],
  addVersion: (version) =>
    set((s) => ({ versions: [version, ...s.versions] })),

  reportTemplates: [],
  addReportTemplate: (t) => set((s) => ({ reportTemplates: [t, ...s.reportTemplates] })),
  updateReportTemplate: (id, updates) => set((s) => ({
    reportTemplates: s.reportTemplates.map((t) => t.id === id ? { ...t, ...updates } : t)
  })),
  deleteReportTemplate: (id) => set((s) => ({
    reportTemplates: s.reportTemplates.filter((t) => t.id !== id)
  })),
  setReportTemplates: (templates) => set({ reportTemplates: templates }),
  setMetricEntries: (entries) => set({ metricEntries: entries }),

  templateSections: [],
  addTemplateSection: (section) =>
    set((s) => ({ templateSections: [section, ...s.templateSections] })),
  updateTemplateSection: (id, updates) =>
    set((s) => ({
      templateSections: s.templateSections.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
  deleteTemplateSection: (id) =>
    set((s) => ({
      templateSections: s.templateSections.filter((t) => t.id !== id),
    })),
  reorderTemplateSections: (newOrder) => set({ templateSections: newOrder }),
  loadTemplateIntoBuilder: (templateId) => set((s) => {
    const template = s.reportTemplates.find(t => t.id === templateId);
    if (!template) return s;
    const newSections = template.sections.map((secType: string, i: number) => ({
      id: `ts_gen_${Date.now()}_${i}`,
      sectionType: secType as ReportSectionType,
      title: secType.charAt(0) + secType.toLowerCase().slice(1) + " Segment",
      description: `Auto-injected ${secType} section derived from ${template.name}`,
      layoutJson: '{"cols":2}',
      createdByAdminId: s.currentUser?.id || "u1",
      createdAt: new Date().toISOString()
    }));
    return { templateSections: newSections };
  }),

  notifications: [],
  addNotification: (notification) =>
    set((s) => ({ notifications: [notification, ...s.notifications] })),
  setNotifications: (notifications) => set({ notifications }),
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    })),
  markAllNotificationsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
    })),

  tutorialActive: false,
  tutorialStep: 0,
  startTutorial: () => set({ tutorialActive: true, tutorialStep: 0 }),
  nextTutorialStep: () =>
    set((s) => ({ tutorialStep: s.tutorialStep + 1 })),
  endTutorial: () => set({ tutorialActive: false, tutorialStep: 0 }),

  toasts: [],
  showToast: (message, type) =>
    set((s) => ({
      toasts: [
        ...s.toasts,
        { id: `toast_${Date.now()}`, message, type },
      ],
    })),
  removeToast: (id) =>
    set((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
    })),
    }),
    {
      name: "campus-chronicle-storage",
      merge: (persistedState: any, currentState: AppStore): AppStore => {
        const s = persistedState as Partial<AppStore> | undefined;
        if (!s) return currentState;
        const safeArr = <T>(val: unknown): T[] => (Array.isArray(val) ? val : []);
        return {
          ...currentState,
          ...s,
          users: safeArr(s.users),
          metricEntries: safeArr(s.metricEntries),
          reportDrafts: safeArr(s.reportDrafts),
          comments: safeArr(s.comments),
          approvalLogs: safeArr(s.approvalLogs),
          versions: safeArr(s.versions),
          reportTemplates: safeArr(s.reportTemplates),
          templateSections: safeArr(s.templateSections),
          notifications: safeArr(s.notifications),
          toasts: safeArr(s.toasts),
        };
      },
    }
  )
);

export const getUserById = (id: string) =>
  useAppStore.getState().users.find((u) => u.id === id);
