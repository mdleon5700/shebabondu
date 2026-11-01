/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 14: CENTRALIZED CROSS-MODULE ADMIN SEARCH ENGINE
 * Enables instant global search across Candidates, Circulars, Drafts, Expenses, and Audit Logs
 * with strict role-based permission enforcement.
 */

import { serverDB } from '../db';
import { AdminGovernanceRbac } from './rbac';
import { AdminRole, AdminGlobalSearchResult } from './types';

export const AdminGlobalSearchEngine = {
  /**
   * Perform unified search across platform subsystems scoped by caller role permissions.
   */
  search(query: string, role: AdminRole = 'admin', limit = 15): AdminGlobalSearchResult[] {
    const trimmed = (query || '').trim().toLowerCase();
    if (!trimmed || trimmed.length < 2) return [];

    const results: AdminGlobalSearchResult[] = [];

    // 1. Search Candidates (requires users.read)
    if (AdminGovernanceRbac.hasPermission(role, 'users.read')) {
      const candidates = serverDB.getAllCandidates();
      for (const c of candidates) {
        const name = (c.name || (c as any).fullName || '').toLowerCase();
        const phone = (c.phone || '').toLowerCase();
        const email = (c.email || '').toLowerCase();
        const district = (c.district || '').toLowerCase();
        const title = ((c as any).currentJobTitle || (c as any).jobPreference || '').toLowerCase();

        if (
          name.includes(trimmed) ||
          phone.includes(trimmed) ||
          email.includes(trimmed) ||
          district.includes(trimmed) ||
          title.includes(trimmed)
        ) {
          results.push({
            id: c.id || '',
            type: 'candidate',
            title: c.name || (c as any).fullName || 'নামবিহীন প্রার্থী',
            subtitle: `${c.phone || ''} ${c.email ? '• ' + c.email : ''} ${c.district ? '• ' + c.district : ''}`.trim(),
            badge: 'প্রার্থী প্রোফাইল',
            targetTab: 'candidate-directory',
            detailParam: c.id
          });
        }
      }
    }

    // 2. Search Published Jobs (requires jobs.read)
    if (AdminGovernanceRbac.hasPermission(role, 'jobs.read')) {
      const jobs = serverDB.getAllJobs();
      for (const j of jobs) {
        const title = (j.title || '').toLowerCase();
        const org = (j.organization || (j as any).company || '').toLowerCase();
        const cat = (j.category || '').toLowerCase();
        const loc = ((j as any).location || (j as any).district || '').toLowerCase();

        if (
          title.includes(trimmed) ||
          org.includes(trimmed) ||
          cat.includes(trimmed) ||
          loc.includes(trimmed)
        ) {
          results.push({
            id: j.id,
            type: 'job',
            title: j.title || 'শিরোনামহীন সার্কুলার',
            subtitle: `${j.organization || 'প্রতিষ্ঠান'} • ${j.category || 'সাধারণ'} • ডেডলাইন: ${j.deadline || 'উল্লেখ নেই'}`,
            badge: 'বিজ্ঞপ্তি',
            targetTab: 'jobs',
            detailParam: j.id
          });
        }
      }
    }

    // 3. Search Drafts (requires content.edit or jobs.create)
    if (AdminGovernanceRbac.hasPermission(role, 'content.edit') || AdminGovernanceRbac.hasPermission(role, 'jobs.create')) {
      const drafts = serverDB.getCircularDrafts();
      for (const d of drafts) {
        const title = (d.extractedTitle || (d as any).title || '').toLowerCase();
        const org = (d.extractedOrg || (d as any).organization || '').toLowerCase();

        if (title.includes(trimmed) || org.includes(trimmed)) {
          results.push({
            id: d.id,
            type: 'draft',
            title: d.extractedTitle || (d as any).title || 'খসড়া সার্কুলার',
            subtitle: `${d.extractedOrg || (d as any).organization || 'প্রতিষ্ঠান'} • স্ট্যাটাস: ${d.status || 'draft'}`,
            badge: 'খসড়া / স্পাইডার',
            targetTab: 'imported-drafts',
            detailParam: d.id
          });
        }
      }
    }

    // 4. Search Operational Expenses (requires expenses.manage)
    if (AdminGovernanceRbac.hasPermission(role, 'expenses.manage')) {
      const expenses = serverDB.getOperationalExpenses();
      for (const e of expenses) {
        const title = (e.title || '').toLowerCase();
        const prov = (e.provider || '').toLowerCase();
        const inv = (e.invoiceNumber || '').toLowerCase();
        const cat = (e.category || '').toLowerCase();

        if (
          title.includes(trimmed) ||
          prov.includes(trimmed) ||
          inv.includes(trimmed) ||
          cat.includes(trimmed)
        ) {
          results.push({
            id: e.id,
            type: 'expense',
            title: e.title || 'পরিচালন ব্যয়',
            subtitle: `${e.provider} • ৳${e.amountBdt.toLocaleString('bn-BD')} • ${e.billingPeriod}`,
            badge: 'ব্যয় রেকর্ড',
            targetTab: 'platform-operations',
            detailParam: e.id
          });
        }
      }
    }

    // 5. Search Audit Logs (requires audit.read)
    if (AdminGovernanceRbac.hasPermission(role, 'audit.read')) {
      const logs = serverDB.getAdminAuditLogs();
      for (const l of logs) {
        const notes = (l.notes || '').toLowerCase();
        const action = (l.action || '').toLowerCase();
        const target = (l.targetId || '').toLowerCase();

        if (notes.includes(trimmed) || action.includes(trimmed) || target.includes(trimmed)) {
          results.push({
            id: (l as any).id || `log_${l.timestamp}`,
            type: 'audit_log',
            title: l.notes || l.action,
            subtitle: `${l.adminId} • ${l.action} • ${l.timestamp}`,
            badge: 'অডিট হিস্ট্রি',
            targetTab: 'dashboard',
            detailParam: l.targetId
          });
        }
      }
    }

    // Sort by prioritizing titles that start with or match exactly the query
    results.sort((a, b) => {
      const aLower = a.title.toLowerCase();
      const bLower = b.title.toLowerCase();
      const aStarts = aLower.startsWith(trimmed) ? 1 : 0;
      const bStarts = bLower.startsWith(trimmed) ? 1 : 0;
      return bStarts - aStarts;
    });

    return results.slice(0, limit);
  }
};
