# CHAKRI SHEBA — LOCAL WORKER RECOVERY & DISCONNECTION GUIDE

---

## 1. Failure Modes & Automated Recovery

| Failure Scenario | Automated System Response | Recovery Action |
|---|---|---|
| **Worker Network Disconnection** | Central lease expires after 10 minutes. Task state transitions to `RETRY_PENDING`. | Worker automatically reconnects on network restoration, reports IDLE state, reclaims pending work. |
| **Playwright Browser Timeout** | Browser process is terminated after 60s hard timeout. Partial screenshot captured. | Task attempt counter increments. If attempts < 3, requeues. If >= 3, escalates to `NEEDS_HUMAN_REVIEW`. |
| **Ollama Service Unavailable** | System falls back to deterministic extraction rules or optional Gemini API. | Workflow does not crash. Flags `provider_fallback_used` in result summary. |
| **Worker Host Reboot** | Windows daemon restarts on user logon. Unfinished leased tasks are safely picked up from last checkpoint. | Idempotency key guarantees zero duplicate actions or repeated commits. |

---

## 2. Emergency Kill Switch
- Administrator can pause all autonomous worker activities instantly by toggling `ENABLE_AI_ENGINEERING_WORKER = false` in Admin Settings or setting header `x-worker-halt: true`.
