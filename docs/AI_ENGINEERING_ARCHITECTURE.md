# CHAKRI SHEBA — HYBRID AI AGENT + N8N ENGINEERING ORCHESTRATION ARCHITECTURE

> **Document Version:** 1.0.0  
> **Date:** 2026-11-08  
> **Status:** APPROVED FIRST DELIVERABLE SPECIFICATION

---

## 1. System Overview & Hybrid Topology

The Chakri Sheba Hybrid AI Engineering and Quality Assurance System combines cloud orchestration, local hardware execution, deterministic audit rules, and human-in-the-loop governance to maintain 100% production reliability across the entire job portal.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CENTRAL N8N ORCHESTRATOR                        │
│   - Workflow Engine (Local / Cloud Docker)                             │
│   - Cron & Webhook Schedulers                                          │
│   - Agent State Machine & Task Dispatcher                              │
│   - Human Approval Router (Discord / Telegram / Email / Webhook)      │
└───────────────────▲────────────────────────────────▲───────────────────┘
                    │ (Outbound HTTPS Poll)          │ (Approval & Report)
┌───────────────────▼───────────────────┐  ┌─────────▼───────────────────┐
│     CHAKRI SHEBA CENTRAL BACKEND      │  │      HUMAN SUPERVISOR       │
│  - Next.js 14 API Handlers            │  │  - Super Admin Dashboard   │
│  - Task Registry (`serverDB`)         │  │  - Approval Actions         │
│  - Immutable Audit Trails             │  │  - Code Review & Release    │
│  - Candidate & Job Core Data          │  └─────────────────────────────┘
└───────────────────▲───────────────────┘
                    │ (Outbound HTTPS / Token Auth)
┌───────────────────▼───────────────────────────────────────────────────┐
│                    LOCAL WINDOWS PC WORKER NODE                       │
│  - Host: AMD Ryzen 7 5700G (8C/16T) | 32 GB RAM | Win 11 Pro          │
│  - Playwright Chromium Headless/Visible Browser Engine                │
│  - Local AI Inference: Ollama `qwen2.5:1.5b` (AVX2 CPU, 30+ t/s)      │
│  - Deterministic Code & API Analyzers                                 │
│  - Zero Inbound Ports | Outbound HTTPS Only                           │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Principles
1. **Existing Infrastructure as Source of Truth:** The production website (`chakrisheba.com` / Render), central database (`serverDB`), and GitHub repo remain the single sources of truth. n8n is an orchestration pipeline, not a primary data store.
2. **Zero Inbound Port Exposure:** The local PC worker connects outward only. No local ports (such as Ollama 11434, Playwright debug, or local file servers) are ever exposed to the public internet.
3. **Supervised Autonomy:** All destructive actions, production deployments, and database schema mutations require explicit, authenticated human approval.
4. **Deterministic Superiority:** Core business logic checks, financial ledger verification, and route consistency use deterministic programmatic assertions rather than stochastic AI guessing.
