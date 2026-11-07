# CHAKRI SHEBA — PAGE BUILDER KNOWN ISSUES & RESOLUTIONS

> **Document Version:** 1.0.0  
> **Date:** 2026-11-08  
> **Status:** CLEAN & ZERO CRITICAL DEFECTS  

---

## 1. RESOLVED ISSUES DURING IMPLEMENTATION

| Issue | Root Cause | Resolution | Status |
|---|---|---|---|
| **Misplaced Closing Tags in JSX** | When wrapping the canvas in the three-panel layout, redundant closing `</div>` tags were temporarily left after modals. | Cleaned up tag hierarchy so that the three-panel flex container wraps only the canvas and inspector, with modals as root siblings. | **RESOLVED** |
| **Undo / Redo Mutation By Reference** | Deep mutations inside `PageSection` objects could contaminate previous state snapshots if cloned shallowly. | Used deep serialization (`JSON.parse(JSON.stringify(sections))`) when pushing snapshots to history stack. | **RESOLVED** |
| **Dynamic Job Template Data Loss Prevention** | Dynamic templates could risk replacing real jobs with hardcoded mock text. | Implemented dynamic variable slots (`{{job.title}}`, `{{job.organization}}`) backed by `serverDB.getPublicJobs()`. | **RESOLVED** |

---

## 2. REMAINING MINOR ITEMS / RECOMMENDATIONS
- **Drag-and-Drop Reordering:** Move Up / Down button controls and Layers tree reordering are currently 100% stable without introducing external DND libraries that might conflict with Next.js 14 App Router. An optional HTML5 native drag-drop sensor can be layered on top in future sprints if desired.
- **Media Upload Limits:** Media files are validated for persistent storage with a 10MB limit per image.
