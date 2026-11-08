# CHAKRI SHEBA — N8N DEPLOYMENT & HOSTING SPECIFICATION

> **Target Platform:** Local Windows PC (Ryzen 7, 32GB RAM) + Outbound Secure Tunnel / Render Docker Option  
> **Evaluation:** Zero-Cost, High-Reliability Architecture

---

## 1. Hosting Options Comparison

| Factor | Option 1: Local PC Node/Docker (Recommended) | Option 2: Render Docker Web Service | Option 3: n8n Cloud (SaaS) |
|---|---|---|---|
| **Monthly Cost** | **$0 / month (100% Free)** | $7–$25 / month (Free tier has 512MB RAM sleep) | $20+ / month |
| **RAM Availability** | **32 GB System RAM** (No OOM risk) | 512 MB (Free) / 2 GB (Paid) | Constrained by plan |
| **Proximity to Worker** | Instant localhost loopback latency (<1ms) | Public WAN latency | Public WAN latency |
| **Data Sovereignty** | Local encrypted SQLite/Postgres storage | Ephemeral without paid persistent disk | Third-party cloud |
| **Outbound Webhooks** | Outbound HTTPS directly to GitHub/Discord | Standard cloud outbound | Standard cloud outbound |

**Architecture Decision:** **Option 1 (Local PC Execution)** is recommended as the primary workhorse, leveraging the verified 32 GB RAM on the user's Ryzen 7 machine with zero cloud infrastructure overhead.

---

## 2. Secure Configuration Parameters
- **Listen Address:** `127.0.0.1` (never `0.0.0.0` without proxy auth).
- **Default Port:** `5678`.
- **Encryption:** `N8N_ENCRYPTION_KEY` generated with 256-bit entropy.
- **Webhook Ingress (Optional):** Cloudflare Tunnel (`cloudflared`) or ngrok with token authentication for incoming GitHub webhooks.
- **Database:** Local SQLite (`~/.n8n/database.sqlite`) backed up automatically.
