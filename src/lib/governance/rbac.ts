/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 14: ROLE-BASED ACCESS CONTROL (RBAC) ENGINE
 * Enforces server-side permissions across Super Admin, Admin, Job Manager,
 * Verification Officer, Content Editor, and Support Staff.
 */

import { serverDB } from '../db';
import { getServerSession, verifyAdminSecret } from '../auth';
import { AdminRole, AdminPermission, StaffMemberRecord } from './types';

export const ALL_PERMISSIONS: AdminPermission[] = [
  'users.read',
  'users.manage',
  'users.suspend',
  'jobs.read',
  'jobs.create',
  'jobs.update',
  'jobs.approve',
  'jobs.publish',
  'jobs.unpublish',
  'jobs.delete',
  'sources.manage',
  'verification.review',
  'content.edit',
  'content.approve',
  'publishing.manage',
  'categories.manage',
  'deadlines.manage',
  'matching.configure',
  'notifications.send',
  'certificates.review',
  'expenses.manage',
  'system.settings.manage',
  'system.health.view',
  'roles.manage',
  'audit.read',
  'analytics.view',
  'automation.manage',
  'reports.export'
];

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: ALL_PERMISSIONS,
  admin: [
    'users.read',
    'users.manage',
    'users.suspend',
    'jobs.read',
    'jobs.create',
    'jobs.update',
    'jobs.approve',
    'jobs.publish',
    'jobs.unpublish',
    'sources.manage',
    'verification.review',
    'content.edit',
    'content.approve',
    'publishing.manage',
    'categories.manage',
    'deadlines.manage',
    'matching.configure',
    'notifications.send',
    'certificates.review',
    'expenses.manage',
    'system.health.view',
    'audit.read',
    'analytics.view',
    'automation.manage',
    'reports.export'
  ],
  job_manager: [
    'jobs.read',
    'jobs.create',
    'jobs.update',
    'jobs.approve',
    'jobs.publish',
    'jobs.unpublish',
    'sources.manage',
    'publishing.manage',
    'categories.manage',
    'deadlines.manage',
    'system.health.view',
    'analytics.view',
    'reports.export'
  ],
  verification_officer: [
    'jobs.read',
    'verification.review',
    'certificates.review',
    'sources.manage',
    'system.health.view'
  ],
  content_editor: [
    'jobs.read',
    'content.edit',
    'content.approve',
    'categories.manage',
    'publishing.manage'
  ],
  support_staff: [
    'users.read',
    'jobs.read',
    'system.health.view'
  ]
};

export const ROLE_METADATA: Record<AdminRole, { nameBn: string; descriptionBn: string; badgeColor: string }> = {
  super_admin: {
    nameBn: 'সুপার অ্যাডমিনিস্ট্রেটর',
    descriptionBn: 'প্ল্যাটফর্মের সর্বময় নিয়ন্ত্রণ, রোল ম্যানেজমেন্ট, সিকিউরিটি ও সিস্টেম অডিট অ্যাক্সেস।',
    badgeColor: 'bg-emerald-700 text-white'
  },
  admin: {
    nameBn: 'প্ল্যাটফর্ম অ্যাডমিন',
    descriptionBn: 'ব্যবহারকারী পরিচালনা, জব পাবলিশিং, নোটিফিকেশন ও অপারেশনাল ব্যয় পর্যবেক্ষণ।',
    badgeColor: 'bg-blue-700 text-white'
  },
  job_manager: {
    nameBn: 'জব অপারেশনস ম্যানেজার',
    descriptionBn: 'সার্কুলার ড্রাফট পর্যালোচনা, অনুমোদন, ক্যাটাগরি ম্যাপিং ও ডেডলাইন শিডিউল।',
    badgeColor: 'bg-purple-700 text-white'
  },
  verification_officer: {
    nameBn: 'যাচাইকরণ কর্মকর্তা',
    descriptionBn: 'সার্কুলার এআই ভেরিফিকেশন, প্রমাণপত্র তুলনা ও প্রার্থীর শিক্ষাগত সনদ যাচাই।',
    badgeColor: 'bg-amber-700 text-white'
  },
  content_editor: {
    nameBn: 'কন্টেন্ট ও এসইও এডিটর',
    descriptionBn: 'কন্টেন্ট স্টুডিও, ভিজ্যুয়াল বিল্ডার ও এসইও মেটাডাটা সম্পাদনা।',
    badgeColor: 'bg-indigo-700 text-white'
  },
  support_staff: {
    nameBn: 'ক্যান্ডিডেট সাপোর্ট স্টাফ',
    descriptionBn: 'প্রার্থী ও আবেদন সংক্রান্ত সহায়তা এবং তথ্য দেখার সীমিত অনুমোদন।',
    badgeColor: 'bg-slate-700 text-white'
  }
};

export const INITIAL_STAFF_MEMBERS: StaffMemberRecord[] = [
  {
    id: 'STF-SUPER',
    name: 'আব্দুর রহমান লিওন',
    email: 'admin@chakrisheba.com',
    phone: '01774366643',
    role: 'super_admin',
    status: 'active',
    lastActive: new Date().toISOString(),
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  }
];

export const AdminGovernanceRbac = {
  /**
   * Check if a given role possesses a specific permission
   */
  hasPermission(role: AdminRole | string, permission: AdminPermission, customPermissions?: AdminPermission[]): boolean {
    if (role === 'super_admin' || role === 'ADMIN-SUPER') return true;

    // Check custom staff overrides
    if (customPermissions && customPermissions.includes(permission)) return true;

    const basePermissions = ROLE_PERMISSIONS[role as AdminRole];
    if (!basePermissions) return false;

    return basePermissions.includes(permission);
  },

  /**
   * Authorize incoming API request against required permission
   */
  authorizeRequest(req: Request, requiredPermission: AdminPermission): { authorized: boolean; error?: string; role?: string } {
    const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
    if (adminSecret && verifyAdminSecret(adminSecret)) {
      return { authorized: true, role: 'super_admin' };
    }

    const session = getServerSession(req);
    if (!session || session.role !== 'admin') {
      return { authorized: false, error: 'UNAUTHORIZED: Admin authentication required.' };
    }

    // Default super admin key holder
    if (session.candidateId === 'ADMIN-SUPER' || session.candidateId === 'SYNTH-ADMIN-SUPER') {
      return { authorized: true, role: 'super_admin' };
    }

    // Resolve staff record if candidateId is a staff member
    const staff = this.getStaffMemberById(session.candidateId);
    const assignedRole: AdminRole = staff ? staff.role : 'super_admin';

    if (!this.hasPermission(assignedRole, requiredPermission, staff?.customPermissions)) {
      return {
        authorized: false,
        error: `FORBIDDEN: Role '${assignedRole}' lacks required permission '${requiredPermission}'.`,
        role: assignedRole
      };
    }

    return { authorized: true, role: assignedRole };
  },

  /**
   * Get list of all staff members
   */
  getStaffMembers(): StaffMemberRecord[] {
    const list = serverDB.getStaffMembers();
    if (list && list.length > 0) return list;
    INITIAL_STAFF_MEMBERS.forEach(s => serverDB.saveStaffMember(s));
    return serverDB.getStaffMembers();
  },

  /**
   * Get specific staff member by ID
   */
  getStaffMemberById(id: string): StaffMemberRecord | null {
    const found = serverDB.getStaffMemberById(id);
    if (found) return found;
    return this.getStaffMembers().find(m => m.id === id) || null;
  },

  /**
   * Update a staff member's role
   */
  updateStaffRole(id: string, newRole: AdminRole, adminId = 'ADMIN-SUPER'): StaffMemberRecord | null {
    const staff = this.getStaffMemberById(id);
    if (!staff) return null;

    const oldRole = staff.role;
    staff.role = newRole;
    staff.updatedAt = new Date().toISOString();

    serverDB.saveStaffMember(staff);

    serverDB.recordAdminAudit({
      adminId,
      action: 'staff_role_update',
      targetId: id,
      targetType: 'staff',
      changes: {
        role: { old: oldRole, new: newRole }
      },
      notes: `Staff member ${staff.name} role changed to ${newRole}`
    });

    return staff;
  },

  /**
   * Toggle a staff member status (active / suspended)
   */
  toggleStaffStatus(id: string, adminId = 'ADMIN-SUPER'): StaffMemberRecord | null {
    const staff = this.getStaffMemberById(id);
    if (!staff) return null;

    const oldStatus = staff.status;
    staff.status = staff.status === 'active' ? 'suspended' : 'active';
    staff.updatedAt = new Date().toISOString();

    serverDB.saveStaffMember(staff);

    serverDB.recordAdminAudit({
      adminId,
      action: 'staff_status_toggle',
      targetId: id,
      targetType: 'staff',
      changes: {
        status: { old: oldStatus, new: staff.status }
      },
      notes: `Staff member ${staff.name} status updated to ${staff.status}`
    });

    return staff;
  }
};

