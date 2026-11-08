# CHAKRI SHEBA — LOCAL WORKER SECURITY DESIGN

> **Security Baseline:** Confidential Machine-to-Machine (M2M) Security Model

---

## 1. Network Boundary Rules
1. **Outbound HTTPS Exclusively:** The local worker initiates all connections to the central orchestrator and backend. Zero incoming firewall ports are opened.
2. **Loopback AI Binding:** Ollama binds strictly to `127.0.0.1:11434`. Remote HTTP requests to Ollama are blocked at the OS socket level.
3. **No Public Browser Debugging:** Playwright runs isolated instances; CDP (Chrome DevTools Protocol) ports are never mapped to public network interfaces.

---

## 2. Authentication & Credential Isolation
1. **Dedicated Worker Token:** Authenticated via `x-worker-token` header using a randomly generated 256-bit cryptographically secure token (`WORKER_AUTH_TOKEN`).
2. **Zero User Credential Access:** The worker operates on synthetic test fixtures and authorized test accounts only. It never reads or decrypts production candidate passwords.
3. **Audit Log Persistence:** Every task lease, status change, and code patch is stamped with `workerId`, IP, and timestamp in `serverDB.recordAdminAudit(...)`.
