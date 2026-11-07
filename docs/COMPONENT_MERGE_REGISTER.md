# Component Merge Register
**Chakri Sheba Consolidated Code Registry**

---

## 1. Consolidated Components & Targets

| Legacy Component | Merge Action | New Consolidated Target | Status |
| :--- | :--- | :--- | :---: |
| `WebsiteCmsSeoManagement` (Visual Editor) | Merged visual editing logic | `src/components/admin/WebsiteBuilder.tsx` | Complete |
| Bottom Canvas Section Inserters | Migrated into Elements & Sections tabs | `src/components/admin/builder/BuilderLeftSidebar.tsx` | Complete |
| Ad-hoc Style Controls | Consolidated into Inspector tabs | `src/components/admin/builder/BuilderRightInspector.tsx` | Complete |
| Pre-Publish Checks | Integrated into modal checklist | `src/components/admin/builder/BuilderPublishModal.tsx` | Complete |
| Candidate Applications View | Integrated as Sub-Feature 5 | `UniversalUserWorkspace.tsx` (`applications` tab) | Complete |
| Candidate Wallet & Manual Adjustment | Integrated as Sub-Feature 7 | `UniversalUserWorkspace.tsx` (`wallet` tab) | Complete |
| Hardcoded Academic Dummy Rolls | Dynamically extracted from candidate education | `CandidateManagementHub.tsx` (1-click drawer) | Complete |

---

## 2. Invariant Safety Checks

- **Zero Regression on Existing Routes:** All API endpoints and client tabs maintain 100% backward compatibility.
- **Zero Loss of Business Data:** No candidate records, circulars, transactions, or published pages were destroyed during consolidation.
- **TypeScript Quality Gate:** Passed with 0 errors (`tsc --noEmit`).
