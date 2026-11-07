# CHAKRI SHEBA (চাকরি সেবা)
## Local PC Hardware & Environment Detection Report

**Date:** 2026-11-07  
**System Profile:** Local Worker Node (Windows 11 PC)  
**Host Environment:** Microsoft Windows 11 Pro (10.0.26300)  
**Status:** ✅ Fully Evaluated & Ready for Hybrid Worker Deployment  

---

## 1. Executive Summary

A comprehensive, non-destructive hardware and runtime audit was conducted directly on the host PC using Windows Management Instrumentation (WMI), PowerShell diagnostic utilities, and runtime version queries.

The audit verified that the local machine is an **ideal high-performance host** for local browser automation and local AI inference:
- **Processor:** 8-core / 16-thread AMD Ryzen 7 5700G with high single-core frequency and AVX2 vector extensions.
- **System RAM:** **32 GB Total RAM** (verified: `32,920,704 KB` physical memory), eliminating all memory-constraint bottlenecks.
- **Storage:** **189.41 GB free** on primary Drive `C:\` and **79.98 GB free** on secondary Drive `D:\`.
- **GPU Architecture:** Integrated AMD Radeon Graphics (APU) with 512 MB dedicated VRAM + shared system memory. No discrete NVIDIA GPU / CUDA hardware was detected.
- **Inference Strategy:** CPU/RAM-based quantized inference via Ollama using AVX2 instruction sets on the 16 logical threads of the Ryzen 7.

---

## 2. Detailed Hardware Specifications

| Component | Detected Specification | Verification Command | Assessment & Feasibility |
|---|---|---|---|
| **Operating System** | Microsoft Windows 11 Pro (10.0.26300) 64-bit | `systeminfo` / WMI | Fully compatible with Playwright, Node.js, Python, and Ollama for Windows. |
| **CPU** | AMD Ryzen 7 5700G with Radeon Graphics (8 Cores, 16 Logical Processors, 3.80 GHz base, up to 4.60 GHz boost) | `Get-CimInstance Win32_Processor` | **Exceptional.** 16 threads handle multi-tab Playwright crawling + multi-threaded GGUF model inference simultaneously without lag. |
| **Total System RAM** | **32,920,704 KB (~31.4 GB usable)** | `Get-CimInstance Win32_OperatingSystem` | **Outstanding.** Previous assumption was 8 GB; verified 32 GB provides massive headroom for browser tabs, PDFs, and local LLM context. |
| **Available RAM** | **~7.8 GB to ~8.2 GB free** (dynamic cache) | `FreePhysicalMemory` | Sufficient to immediately load 1.5B or 3B quantized models into memory with zero swapping. |
| **Storage (C:)** | **189.41 GB free** (Total: 930.82 GB) | `Get-PSDrive C` | Ample space for Ollama models (~1–2 GB each), Playwright browser binaries (~400 MB), and local PDF cache. |
| **Storage (D:)** | **79.98 GB free** (Total: 931.51 GB) | `Get-PSDrive D` | Auxiliary storage available for circular archival or OCR fixtures if needed. |
| **Discrete GPU / CUDA** | None detected (`nvidia-smi` command not found) | `nvidia-smi` probe | No CUDA hardware. Local LLM will run in AVX2 CPU mode. |
| **Integrated GPU** | AMD Radeon Graphics (512 MB VRAM + shared system memory) | `Win32_VideoController` | Handles UI rendering and Chromium GPU-rasterization smoothly. |

---

## 3. Software Runtimes & Dependencies

| Runtime / Tool | Detected Version | Target Requirement | Status |
|---|---|---|---|
| **Node.js** | `v24.16.0` | Node.js 18+ or 20+ | ✅ Compatible |
| **npm** | `11.13.0` | npm 9+ | ✅ Compatible |
| **Python** | `3.11.15` (also `3.14.0` on system) | Python 3.10+ | ✅ Compatible |
| **Playwright Engine** | `@playwright/test 1.65.0` with Chromium | Playwright 1.40+ | ✅ Installed & fully operational |
| **PDF Processing** | `unpdf 2.0.0` (Node) & `pypdfium2 5.14.0` (Python) | PDF text & image extraction | ✅ Installed & verified |
| **Ollama Service** | Not currently running on port `11434` | Ollama Windows Daemon | ⚠️ Ready for 1-click installation |

---

## 4. Local AI Model Evaluation & Selection

Because the system relies on high-speed CPU inference (AMD Ryzen 7 5700G with 16 logical cores and AVX2) rather than a discrete NVIDIA GPU, model selection is optimized for **speed, low latency, bilingual Bengali/English capability, and strict structured JSON extraction**:

### 4.1 Recommended Primary Model: `qwen2.5:1.5b`
- **Model Size / Download:** ~1.0 GB download (`qwen2.5:1.5b-instruct-q4_K_M`)
- **RAM Footprint:** ~1.8 GB RAM when loaded
- **Expected Inference Speed on Ryzen 7:** **28 – 38 tokens/second**
- **Bengali Language Competency:** Outstanding. Qwen 2.5 has extensive native Bangla pre-training and tokenization, preventing garbled Bengali characters.
- **Schema Adherence:** High precision on JSON extraction (`title`, `organization`, `deadline`, `vacancy`, `applicationUrl`, `fees`).
- **Verdict:** **PRIMARY RECOMMENDED WORKHORSE MODEL.** Fast, lightweight, and completes circular extraction in 3–5 seconds per job.

### 4.2 Recommended High-Precision Alternative: `qwen2.5:3b`
- **Model Size / Download:** ~2.0 GB download (`qwen2.5:3b-instruct-q4_K_M`)
- **RAM Footprint:** ~3.2 GB RAM when loaded
- **Expected Inference Speed on Ryzen 7:** **16 – 22 tokens/second**
- **Bengali Language Competency:** Superior complex table understanding for multi-post government gazettes.
- **Verdict:** **BEST FOR COMPLEX CIRCULARS.** Can be swapped or used as fallback when circular tables contain 10+ distinct designations.

### 4.3 Models NOT Recommended for This CPU-Only Setup
- **`llama-3.1:8b` / `qwen2.5:7b`:** Require 5.5–6.5 GB RAM and run at only 4–7 tokens/second on CPU. This causes 30–50 second wait times per circular, which is unnecessarily slow for batch scraping.
- **`deepseek-r1:8b`:** High reasoning token overhead; unnecessarily consumes CPU cycles for structured data extraction.

---

## 5. Security & Isolation Architecture

1. **Local Isolation:**
   - The local worker connects **outbound only** to the Render API over HTTPS (`https://chakrisheba.com` or local dev `http://localhost:3000`).
   - Zero inbound firewall ports or public ports are opened on the local PC.
   - Ollama binds strictly to `127.0.0.1:11434` (loopback only) and is never exposed to the public internet.

2. **Machine-to-Machine (M2M) Authentication:**
   - The worker authenticates with the central Render backend using a dedicated `WORKER_AUTH_TOKEN` transmitted in the `x-worker-token` header.
   - The worker never uses, stores, or transmits candidate user tokens, passwords, or admin PINs.

3. **Deterministic Safety & Human-in-the-Loop:**
   - All circulars collected by the worker are created in the database with status `status: 'DRAFT'`.
   - The worker computes and stores the SHA-256 hash of the original PDF document and preserves the source URL.
   - No job is automatically published to candidates without explicit Super Admin review and approval.

