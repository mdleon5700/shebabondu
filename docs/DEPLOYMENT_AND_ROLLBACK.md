# CHAKRI SHEBA — PRODUCTION DEPLOYMENT & ROLLBACK SPECIFICATION

---

## 1. Production Release Gate Checklist
Before any release is marked `READY_FOR_RELEASE`:
1. `npm run typecheck` (`tsc --noEmit`) passes with exactly 0 errors.
2. Playwright E2E regression suite passes across Desktop, Tablet, and Mobile viewports.
3. Git pre-push hook passes cleanly.
4. Database snapshot created in `src/db/local_store.json.bak`.
5. Explicit Super Admin signoff received via Approval Workflow.

---

## 2. Emergency Rollback Protocol
1. **Application Code Rollback:**
   - Execute `git revert <commit-sha>` or redeploy previous verified commit (`e60fadd` or `d63dffb`) on Render.
2. **Database State Rollback:**
   - In case of data inconsistency, atomic restore from `local_store.json.bak` takes effect within <2 seconds.
