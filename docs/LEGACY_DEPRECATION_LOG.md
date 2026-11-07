# Legacy Deprecation Log
**Chakri Sheba Technical Debt & Deprecation Audit**

---

## 1. Deprecated & Retired Implementations

1. **Hardcoded Benchmark Statistics:**
   - Deprecated values: `2847`, `48921`, `1245320`, `+12.4%`, `+18.7%`, `+26.1%`.
   - Reason: Simulated metrics mislead administrators and violate the Zero Dummy Data policy.
   - Status: Permanently removed.

2. **Hardcoded SVG Donut Percentages:**
   - Deprecated values: `85.1%`, `9.8%`, `1.3%`, `3.8%`.
   - Reason: Static mockup percentages do not reflect real database circular distribution.
   - Status: Replaced with dynamic SVG trigonometric dash calculations.

3. **Bottom Canvas Redundant Inserter Controls:**
   - Deprecated: Legacy canvas buttons (`+ Add Hero Section`, `+ Add Content Block`).
   - Reason: Duplicated the Left Sidebar block library and cluttered the visual canvas.
   - Status: Cleanly superseded by `BuilderLeftSidebar.tsx`.

4. **Hardcoded Academic Dummy Credentials in 1-Click Autofill:**
   - Deprecated: Static roll `109841`, reg `1512409841`, GPA `5.00`.
   - Reason: Risked inserting fabricated test data into real Teletalk government application forms.
   - Status: Replaced with candidate's actual verified educational records (`currentCandidate.education`).

---

## 2. Backward Compatibility Guard

All deprecated legacy endpoints maintain non-breaking aliases or fallback handlers to prevent runtime regressions on legacy clients.
