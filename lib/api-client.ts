/**
 * Centralized API client for CampusChronicle.
 * All fetch calls go through here for consistent error handling,
 * typing, and loader/toast integration.
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  messageType?: "success" | "error" | "warning" | "info";
  data?: T;
}

interface ApiCallOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Record<string, unknown>;
  signal?: AbortSignal;
}

export async function apiClient<T = unknown>(
  endpoint: string,
  options: ApiCallOptions = {},
): Promise<ApiResponse<T>> {
  const { method = "GET", body, signal } = options;

  const fetchOptions: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    signal,
  };

  if (body && method !== "GET") {
    fetchOptions.body = JSON.stringify(body);
  }

  const res = await fetch(endpoint, fetchOptions);
  const data: ApiResponse<T> = await res.json();

  if (!res.ok && !data.message) {
    data.message = `Request failed with status ${res.status}`;
    data.success = false;
  }

  return data;
}

// ── Typed API functions ──────────────────────────────────

export interface ApiUser {
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
  createdAt: string;
}

export interface ApiDepartment {
  id: string;
  name: string;
  code: string;
  hodUserId: string;
  hodName: string | null;
  userCount: number;
  studentCount: number;
  entryCount: number;
  approvedEntryCount: number;
  createdAt: string;
}

export interface ApiEntry {
  id: string;
  departmentId: string;
  reportingYearId: string;
  category: string;
  title: string;
  description: string | null;
  numericValue: number | null;
  textualValue: string | null;
  financialSpends: number | null;
  createdByUserId: string;
  createdByName: string;
  studentId: string | null;
  status: string;
  reviewerComment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiDraft {
  id: string;
  departmentId: string;
  department: { name: string; code: string };
  reportingYearId: string;
  compiledMetricEntryIds: string[];
  status: string;
  submittedAt: string | null;
  approvedAt: string | null;
  createdByUserId: string;
  createdBy: { name: string; avatar: string | null; avatarUrl: string | null };
  commentCount: number;
  approvalLogCount: number;
  versionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiNotification {
  id: string;
  userId: string;
  reportDraftId: string | null;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiNotificationsData {
  notifications: ApiNotification[];
  unreadCount: number;
}

export interface ApiDashboardStats {
  totalEntries: number;
  approvedEntries: number;
  pendingEntries: number;
  rejectedEntries: number;
  totalDrafts: number;
  approvedDrafts: number;
  totalUsers: number;
  totalDepartments: number;
  totalNotifications: number;
  unreadNotifications: number;
  entriesByCategory: Array<{ category: string; count: number }>;
  entriesByDepartment: Array<{ department: string; code: string; total: number; approved: number }>;
  recentEntries: Array<{ id: string; title: string; status: string; category: string; createdAt: string }>;
}

// ── Convenience wrappers ─────────────────────────────────

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiClient<{ user: ApiUser; token: string }>("/api/auth/login", { method: "POST", body: { email, password } }),
  logout: () => apiClient("/api/auth/logout", { method: "POST" }),
  me: () => apiClient<ApiUser>("/api/auth/me"),

  // Users
  getUsers: () => apiClient<ApiUser[]>("/api/users"),
  createUser: (data: Record<string, unknown>) => apiClient("/api/users", { method: "POST", body: data }),
  updateUser: (id: string, data: Record<string, unknown>) => apiClient(`/api/users/${id}`, { method: "PUT", body: data }),
  deleteUser: (id: string) => apiClient(`/api/users/${id}`, { method: "DELETE" }),

  // Departments
  getDepartments: () => apiClient<ApiDepartment[]>("/api/departments"),
  getDepartment: (id: string) => apiClient<ApiDepartment>(`/api/departments/${id}`),

  // Entries
  getEntries: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiClient<ApiEntry[]>(`/api/entries${query}`);
  },
  createEntry: (data: Record<string, unknown>) => apiClient("/api/entries", { method: "POST", body: data }),
  updateEntry: (id: string, data: Record<string, unknown>) => apiClient(`/api/entries/${id}`, { method: "PUT", body: data }),
  deleteEntry: (id: string) => apiClient(`/api/entries/${id}`, { method: "DELETE" }),

  // Drafts
  getDrafts: () => apiClient<ApiDraft[]>("/api/drafts"),
  createDraft: (data: Record<string, unknown>) => apiClient("/api/drafts", { method: "POST", body: data }),
  updateDraft: (id: string, data: Record<string, unknown>) => apiClient(`/api/drafts/${id}`, { method: "PUT", body: data }),

  // Approvals & Comments
  getApprovals: (draftId?: string) => apiClient(`/api/approvals${draftId ? `?draftId=${draftId}` : ""}`),
  createApproval: (data: Record<string, unknown>) => apiClient("/api/approvals", { method: "POST", body: data }),
  getComments: (draftId?: string) => apiClient(`/api/comments${draftId ? `?draftId=${draftId}` : ""}`),
  createComment: (data: Record<string, unknown>) => apiClient("/api/comments", { method: "POST", body: data }),

  // Templates
  getTemplates: () => apiClient<any[]>("/api/templates"),
  createTemplate: (data: Record<string, unknown>) => apiClient("/api/templates", { method: "POST", body: data }),
  updateTemplate: (id: string, data: Record<string, unknown>) => apiClient(`/api/templates/${id}`, { method: "PUT", body: data }),
  deleteTemplate: (id: string) => apiClient(`/api/templates/${id}`, { method: "DELETE" }),

  // Notifications
  getNotifications: () => apiClient<ApiNotificationsData>("/api/notifications"),
  markNotificationRead: (id: string) => apiClient(`/api/notifications/${id}`, { method: "PUT" }),
  markAllNotificationsRead: () => apiClient("/api/notifications/mark-all", { method: "PUT" }),

  // Analytics
  getDashboardStats: () => apiClient<ApiDashboardStats>("/api/analytics/dashboard"),

  // File Upload (multipart — cannot use apiClient)
  uploadFile: async (file: File): Promise<ApiResponse<ApiUploadResult>> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    return res.json();
  },
};

export interface ApiUploadResult {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
}
