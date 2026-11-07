# Immutable Admin Action Audit Log Design
**Chakri Sheba Governance & Compliance Specification**

---

## 1. Design Principles

1. **Append-Only Immutability:** Audit records are strictly write-once and can never be edited, superseded, or deleted through administrative APIs.
2. **Deterministic Accountability:** Every state change records the exact `adminId`, client IP (when available), precise ISO timestamp, target entity, and human-readable reason.
3. **Structured Delta Tracking:** Modifications record previous values and updated values (`{ profile: { old: ..., new: ... } }`) to enable full historical reconstruction and forensics.

---

## 2. Data Structure (`AdminAuditLog`)

```typescript
export interface AdminAuditLog {
  id: string;               // Unique log ID (e.g. "log-1731034821000-a4b")
  timestamp: string;        // ISO 8601 string
  adminId: string;          // Identifier of executing admin
  action: AdminActionType;  // Enumerated action code
  targetId: string;         // ID of the modified entity (candidate, job, system)
  targetType: 'order' | 'candidate' | 'job' | 'system' | 'financial';
  changes: {
    [key: string]: {
      old?: any;
      new?: any;
    };
  };
  notes: string;            // Mandatory rationale for the action
}
```

---

## 3. Audited Administrative Events

| Action Code | Triggering UI Event | Data Recorded in `changes` |
| :--- | :--- | :--- |
| `candidate_status_update` | Verification badge toggle, suspension, or profile edit | Candidate ID, old status, new status, edited fields |
| `candidate_delete` | Permanent candidate deletion | Candidate name, phone, deletion timestamp |
| `system_config_change` | Manual wallet balance credit/debit adjustment | Amount, adjustment type (`credit`/`debit`), reason |
| `job_publish` | Circular created or moved to published status | Circular ID, organization, deadline, positions count |
| `page_published` | Visual Page Builder publication | Page slug, title, block count, revision ID |

---

## 4. Querying & Retrieval

- **Target-Specific Audit Trail:** Queryable via `serverDB.getAdminAuditLogs(targetId)` to populate candidate-specific or circular-specific audit histories.
- **Global Administrative Audit Log:** Exposed via `GET /api/admin/audit-logs` for the Platform Governance & Audit Log viewer tab (`activeTab === 'audit-logs'`).
