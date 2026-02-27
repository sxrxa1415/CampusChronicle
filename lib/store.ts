"use client";
import { create } from "zustand";
import type {
  InstituteUser,
  DepartmentMetricEntry,
  DepartmentReportDraft,
  ReportComment,
  ReportApprovalLog,
  ReportVersion,
  ReportTemplateSection,
  ReportNotification,
} from "./types";
import {
  MOCK_USERS,
  MOCK_METRIC_ENTRIES,
  MOCK_REPORT_DRAFTS,
  MOCK_COMMENTS,
  MOCK_APPROVAL_LOGS,
  MOCK_VERSIONS,
  MOCK_TEMPLATE_SECTIONS,
  MOCK_NOTIFICATIONS,
} from "./mock-data";

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppStore {
  // Auth
  currentUser: InstituteUser | null;
  login: (user: InstituteUser) => void;
  logout: () => void;
  updateUserTheme: (theme: "light" | "dark") => void;
  updateUserNotifications: (enabled: boolean) => void;

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

  // Toast Notifications
  toasts: Toast[];
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Versions
  versions: ReportVersion[];
  addVersion: (version: ReportVersion) => void;

  // Template Sections
  templateSections: ReportTemplateSection[];
  addTemplateSection: (section: ReportTemplateSection) => void;
  updateTemplateSection: (id: string, updates: Partial<ReportTemplateSection>) => void;
  deleteTemplateSection: (id: string) => void;

  // Notifications
  notifications: ReportNotification[];
  addNotification: (notification: ReportNotification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Tutorial
  tutorialActive: boolean;
  tutorialStep: number;
  startTutorial: () => void;
  nextTutorialStep: () => void;
  endTutorial: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  currentUser: null,
  login: (user) => {
    set({ currentUser: user });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } catch (e) {
        console.error('[v0] Failed to save user to localStorage:', e);
      }
    }
  },
  logout: () => {
    set({ currentUser: null });
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('currentUser');
      } catch (e) {
        console.error('[v0] Failed to remove user from localStorage:', e);
      }
    }
  },
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

  metricEntries: MOCK_METRIC_ENTRIES,
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

  reportDrafts: MOCK_REPORT_DRAFTS,
  addReportDraft: (draft) =>
    set((s) => ({ reportDrafts: [draft, ...s.reportDrafts] })),
  updateReportDraft: (id, updates) =>
    set((s) => ({
      reportDrafts: s.reportDrafts.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    })),

  comments: MOCK_COMMENTS,
  addComment: (comment) =>
    set((s) => ({ comments: [comment, ...s.comments] })),

  approvalLogs: MOCK_APPROVAL_LOGS,
  addApprovalLog: (log) =>
    set((s) => ({ approvalLogs: [log, ...s.approvalLogs] })),

  versions: MOCK_VERSIONS,
  addVersion: (version) =>
    set((s) => ({ versions: [version, ...s.versions] })),

  templateSections: MOCK_TEMPLATE_SECTIONS,
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

  notifications: MOCK_NOTIFICATIONS,
  addNotification: (notification) =>
    set((s) => ({ notifications: [notification, ...s.notifications] })),
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
}));

export const getUserById = (id: string) =>
  MOCK_USERS.find((u) => u.id === id);
