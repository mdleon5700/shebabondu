# CHAKRI SHEBA (চাকরি সেবা)
## Local Hybrid Automation Worker Setup Guide (Windows 11)

**Date:** 2026-11-07  
**Platform:** Chakri Sheba Hybrid Automation Engine  
**Target Node:** Local Windows 11 PC (Ryzen 7 5700G, 32GB RAM)  
**Cloud Host:** Render Production Deployment  

---

## 1. Architecture Overview

In this hybrid architecture:
- **Render Cloud** hosts the public web portal, central PostgreSQL database, candidate vault, and Super Admin dashboard.
- **Your Local PC** runs the browser automation (Playwright Chromium) and local AI (Ollama). It polls Render for collection tasks, visits official government portals (Alljobs Teletalk, BPSC, Bangladesh Bank), extracts text from circular PDFs, validates circular metadata using free local AI, and submits structured job drafts back to Render for admin review.
- **Benefits:**
  - **Zero Cost:** Eliminates expensive cloud headless browser servers and paid AI API subscriptions.
  - **Zero Cloud OOM Crashes:** Render's 512MB RAM tier is protected; heavy browser tabs and PDF parsers run on your 32GB RAM PC.
  - **100% Admin Control:** Every collected job is stored as a `DRAFT` with its source URL and PDF SHA-256 hash. No job is published without human approval.
  - **Strict Security:** The worker connects *outbound only* via HTTPS. No ports are opened on your PC to the internet.

```
┌─────────────────────────┐          Outbound HTTPS          ┌─────────────────────────┐
│     LOCAL WINDOWS PC    │ ───────────────────────────────> │      RENDER CLOUD       │
│  - Playwright Chromium  │    Polls tasks & submits drafts  │  - Next.js Web App      │
│  - Ollama (qwen2.5:1.5b)│                                  │  - Central Database     │
│  - SHA-256 PDF Verifier │ <─────────────────────────────── │  - Admin Review Queue   │
│  - Task Polling Worker  │       Task Leases & Config       │  - Candidate Portal     │
└─────────────────────────┘                                  └─────────────────────────┘
```

---

## 2. Prerequisites Verification

Before starting, verify your local development tools. You already have all of the following installed and verified:
- Windows 11 64-bit
- Node.js `v24.16.0` (npm `11.13.0`)
- Python `3.11.15`
- Playwright `@playwright/test 1.65.0` with Chromium browser binaries

---

## 3. Step 1: Install Ollama on Windows

Ollama is a free, open-source local LLM runner that executes quantized models with low CPU and RAM usage.

### Option A: Official Windows Installer (Recommended)
1. Download the installer from the official website:
   👉 **https://ollama.com/download/OllamaSetup.exe**
2. Run `OllamaSetup.exe` and follow the standard on-screen setup.
3. Once installed, Ollama will automatically start as a Windows background task and display an icon in your system tray (notification area).

### Option B: Windows Package Manager (PowerShell Winget)
Open PowerShell and run:
```powershell
winget install Ollama.Ollama
```

---

## 4. Step 2: Download the Recommended Free AI Model

Once Ollama is installed, open PowerShell or Command Prompt and download the recommended model:

### Recommended Workhorse Model (1.0 GB):
```powershell
ollama pull qwen2.5:1.5b
```
*Why this model?* It requires only ~1.8 GB of your 32 GB RAM, runs at 30+ tokens/sec on your AMD Ryzen 7 CPU, and possesses exceptional native Bengali and English comprehension for extracting government circular details.

### Optional High-Precision Model (2.0 GB):
```powershell
ollama pull qwen2.5:3b
```
*When to use?* For unusually large circulars containing 10+ different job designations or complex salary grade tables.

---

## 5. Step 3: Verify Ollama is Running

Run this quick command in PowerShell to test your local AI:
```powershell
curl http://localhost:11434/api/tags
```
You should see a JSON response listing `qwen2.5:1.5b`.

To test interactive inference in Bengali:
```powershell
ollama run qwen2.5:1.5b "বাংলাদেশ সরকারের চাকরির বিজ্ঞপ্তির মূল তথ্য কী কী?"
```
You will receive an instant, fluent Bengali response directly from your CPU without any internet connection.

---

## 6. Step 4: Configure the Local Worker Environment

Create a dedicated local environment file in your project root:
`C:\Users\Leon Rahman\.gemini\antigravity\scratch\chakri-sheba-workspace\.env.worker.local`

```ini
# Central Server URL (Point to Render in production or localhost in development)
CENTRAL_API_URL=http://localhost:3000

# Worker Machine-to-Machine Secret Token (Must match the WORKER_AUTH_TOKEN set on Render)
WORKER_AUTH_TOKEN=cs_worker_secure_secret_token_change_in_prod_2026

# Local AI Configuration
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:1.5b

# Optional Cloud AI Fallback (Used only when local AI is offline or quota remains)
# GEMINI_API_KEY=your_gemini_api_key_here

# Worker Operational Settings
WORKER_POLL_INTERVAL_MS=30000
WORKER_HEADLESS=true
WORKER_MAX_CONCURRENT_JOBS=2
WORKER_ENABLE_PDF_DOWNLOAD=true
```

---

## 7. Step 5: Run the Local Worker

### Test Run in Development Mode:
To test the worker against your local Chakri Sheba server:
```powershell
cd "C:\Users\Leon Rahman\.gemini\antigravity\scratch\chakri-sheba-workspace"
npm run worker:local
```
Or directly via Node.js:
```powershell
node scripts/local_spider_worker.js
```

### What the Worker Does Automatically:
1. **Heartbeat & Handshake:** Checks in with Render via `POST /api/worker/tasks/acquire`.
2. **Receives Scrape Task:** (e.g. `source: 'teletalk-alljobs'`, `targetUrl: 'https://alljobs.teletalk.com.bd'`).
3. **Navigates via Playwright:** Opens Chromium locally, loads the page, handles pagination, and discovers new circular links.
4. **Downloads Circular PDF:** Computes SHA-256 hash. If this hash was already processed, it skips duplicate parsing.
5. **Extracts Information:** Reads text via `unpdf` / `pypdfium2` and prompts local `qwen2.5:1.5b` to output a validated JSON schema.
6. **Submits Draft:** Posts the extracted circular and verification evidence back to `POST /api/worker/tasks/submit`.
7. **Waits for Next Task:** Sleeps for the configured polling interval.

---

## 8. Step 6: How Admin Reviews & Publishes Jobs

1. The administrator logs into the Chakri Sheba Admin Console at `/admin`.
2. Navigate to **Job Verification Queue** or **Spider Hub**.
3. The newly collected jobs appear with a distinct badge:  
   `[Status: DRAFT]` | `[Source: Teletalk Alljobs]` | `[Evidence Verified: YES]`
4. The admin reviews the extracted post name, vacancy count, application deadline, and official circular PDF.
5. With one click, the admin clicks **"Approve & Publish"**.
6. The job immediately goes live on the public portal for candidates to browse and prepare their applications.

---

## 9. Safety, Privacy & Security Guarantees

- **No Public IP or Port Forwarding:** The worker operates strictly outbound. You never need to open ports in your home router or configure DDNS.
- **Ollama Loopback Only:** Ollama listens exclusively on `127.0.0.1:11434`. It cannot be contacted from outside your machine.
- **Zero Candidate Data Exposure:** The worker only handles public government circular URLs and public PDFs. Candidate profiles, NID documents, and CV data are stored exclusively in Render's secure vault and are never sent to the scraping worker.
- **Graceful Pausing:** You can press `Ctrl + C` in the worker terminal at any time to pause collection without losing database state.
- **Permanently 100% Free:** No paid subscriptions, no API rate limit charges, and no hidden fees for you or the candidates.

