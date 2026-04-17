import { toast } from "sonner";
import { useAppStore } from "@/lib/store";

// Helper to get users from store (populated from API)
const getUsers = () => useAppStore.getState().users;

// Central notification dispatch - call from any page action
export type NotifyEvent =
  | "ENTRY_SUBMITTED"
  | "ENTRY_APPROVED_BY_HOD"
  | "ENTRY_REJECTED_BY_HOD"
  | "DRAFT_CREATED"
  | "DRAFT_SUBMITTED"
  | "REPORT_APPROVED"
  | "REPORT_REJECTED"
  | "REVISION_REQUESTED"
  | "REPORT_PUBLISHED"
  | "USER_CREATED"
  | "USER_ROLE_CHANGED"
  | "USER_DELETED"
  | "TEMPLATE_CREATED"
  | "TEMPLATE_UPDATED"
  | "TEMPLATE_DELETED"
  | "SETTINGS_SAVED";

interface NotifyContext {
  actorName?: string;
  deptName?: string;
  entryTitle?: string;
  draftId?: string;
  targetUserId?: string;
  targetUserName?: string;
  extra?: string;
}

interface StakeholderNotif {
  userId: string;
  title: string;
  message: string;
}

const EVENT_CONFIG: Record<NotifyEvent, {
  toastMsg: (ctx: NotifyContext) => string;
  toastType: "success" | "error" | "warning" | "info";
  getStakeholders: (ctx: NotifyContext) => StakeholderNotif[];
}> = {
  ENTRY_SUBMITTED: {
    toastMsg: (ctx) => `Entry "${ctx.entryTitle}" submitted successfully`,
    toastType: "success",
    getStakeholders: (ctx) => {
      // Notify HOD of the department
      const hods = getUsers().filter(u => u.role === "DEPARTMENT_HEAD");
      return hods.map(h => ({
        userId: h.id,
        title: "New Entry Submitted",
        message: `${ctx.actorName} submitted "${ctx.entryTitle}" in ${ctx.deptName}.`
      }));
    }
  },
  ENTRY_APPROVED_BY_HOD: {
    toastMsg: (ctx) => `Entry forwarded for office review`,
    toastType: "success",
    getStakeholders: (ctx) => {
      const reviewers = getUsers().filter(u => u.role === "REVIEWER");
      const notifs: StakeholderNotif[] = reviewers.map(r => ({
        userId: r.id,
        title: "Entry Approved by HOD",
        message: `"${ctx.entryTitle}" of ${ctx.deptName} has been approved by HOD and needs office review.`
      }));
      if (ctx.targetUserId) {
        notifs.push({
          userId: ctx.targetUserId,
          title: "Your Entry Was Approved",
          message: `"${ctx.entryTitle}" has been approved by your HOD and sent for office review.`
        });
      }
      return notifs;
    }
  },
  ENTRY_REJECTED_BY_HOD: {
    toastMsg: (ctx) => `Entry returned to submitter`,
    toastType: "warning",
    getStakeholders: (ctx) => ctx.targetUserId ? [{
      userId: ctx.targetUserId,
      title: "Entry Needs Revision",
      message: `"${ctx.entryTitle}" was returned by your HOD. ${ctx.extra || "Please review and resubmit."}`
    }] : []
  },
  DRAFT_CREATED: {
    toastMsg: (ctx) => `Draft created for ${ctx.deptName}`,
    toastType: "success",
    getStakeholders: () => []
  },
  DRAFT_SUBMITTED: {
    toastMsg: () => "Report submitted for review",
    toastType: "success",
    getStakeholders: (ctx) => {
      const reviewers = getUsers().filter(u => u.role === "REVIEWER");
      const admins = getUsers().filter(u => u.role === "ADMIN");
      return [...reviewers, ...admins].map(u => ({
        userId: u.id,
        title: "Report Submitted for Review",
        message: `${ctx.deptName} department report has been submitted by ${ctx.actorName}.`
      }));
    }
  },
  REPORT_APPROVED: {
    toastMsg: (ctx) => `${ctx.deptName} report approved`,
    toastType: "success",
    getStakeholders: (ctx) => {
      const notifs: StakeholderNotif[] = [];
      if (ctx.targetUserId) notifs.push({
        userId: ctx.targetUserId,
        title: "Report Approved ✓",
        message: `Your ${ctx.deptName} report has been approved! ${ctx.extra || ""}`
      });
      getUsers().filter(u => u.role === "ADMIN").forEach(admin => notifs.push({
        userId: admin.id,
        title: "Report Approved",
        message: `${ctx.deptName} report was approved by ${ctx.actorName}.`
      }));
      return notifs;
    }
  },
  REPORT_REJECTED: {
    toastMsg: (ctx) => `${ctx.deptName} report rejected`,
    toastType: "error",
    getStakeholders: (ctx) => ctx.targetUserId ? [{
      userId: ctx.targetUserId,
      title: "Report Rejected",
      message: `Your ${ctx.deptName} report was rejected. ${ctx.extra || "Contact the reviewer for details."}`
    }] : []
  },
  REVISION_REQUESTED: {
    toastMsg: (ctx) => `Revision requested for ${ctx.deptName} report`,
    toastType: "warning",
    getStakeholders: (ctx) => ctx.targetUserId ? [{
      userId: ctx.targetUserId,
      title: "Revision Requested",
      message: `Changes requested on your ${ctx.deptName} report. ${ctx.extra || "Review the feedback."}`
    }] : []
  },
  REPORT_PUBLISHED: {
    toastMsg: (ctx) => "Annual report published!",
    toastType: "success",
    getStakeholders: () => getUsers().map(u => ({
      userId: u.id,
      title: "Annual Report Published 🎉",
      message: "The institute annual report has been published and is now available."
    }))
  },
  USER_CREATED: {
    toastMsg: (ctx) => `User ${ctx.targetUserName} created`,
    toastType: "success",
    getStakeholders: (ctx) => ctx.targetUserId ? [{
      userId: ctx.targetUserId,
      title: "Welcome to CampusChronicle",
      message: `Your account has been created by ${ctx.actorName}. You can now log in.`
    }] : []
  },
  USER_ROLE_CHANGED: {
    toastMsg: (ctx) => `Role updated for ${ctx.targetUserName}`,
    toastType: "info",
    getStakeholders: (ctx) => ctx.targetUserId ? [{
      userId: ctx.targetUserId,
      title: "Role Updated",
      message: `Your role has been changed by ${ctx.actorName}. ${ctx.extra || ""}`
    }] : []
  },
  USER_DELETED: {
    toastMsg: (ctx) => `User removed`,
    toastType: "success",
    getStakeholders: () => []
  },
  TEMPLATE_CREATED: {
    toastMsg: () => "Template created",
    toastType: "success",
    getStakeholders: (ctx) => getUsers().filter(u => u.role !== "ADMIN").map(u => ({
      userId: u.id,
      title: "New Report Template",
      message: `A new template "${ctx.entryTitle}" has been created. Check Templates for details.`
    }))
  },
  TEMPLATE_UPDATED: {
    toastMsg: () => "Template updated",
    toastType: "success",
    getStakeholders: () => []
  },
  TEMPLATE_DELETED: {
    toastMsg: () => "Template deleted",
    toastType: "success",
    getStakeholders: () => []
  },
  SETTINGS_SAVED: {
    toastMsg: () => "Settings saved successfully",
    toastType: "success",
    getStakeholders: () => []
  }
};

export function dispatchNotification(event: NotifyEvent, ctx: NotifyContext = {}) {
  const config = EVENT_CONFIG[event];
  if (!config) return;

  // Show toast for the actor
  const msg = config.toastMsg(ctx);
  switch (config.toastType) {
    case "success": toast.success(msg); break;
    case "error": toast.error(msg); break;
    case "warning": toast.warning(msg); break;
    case "info": toast.info(msg); break;
  }

  // Push notifications to stakeholders
  const store = useAppStore.getState();
  const stakeholders = config.getStakeholders(ctx);
  stakeholders.forEach(notif => {
    store.addNotification({
      id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: notif.userId,
      title: notif.title,
      message: notif.message,
      isRead: false,
      createdAt: new Date().toISOString(),
      ...(ctx.draftId ? { reportDraftId: ctx.draftId } : {})
    });
  });
}
