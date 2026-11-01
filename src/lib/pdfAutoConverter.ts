import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * Triggers asynchronous background PDF-to-PNG conversion
 * Runs the Python Google PDFium converter without blocking server execution.
 */
export function triggerAutoPdfConversion(jobId: string, pdfInput: string) {
  if (!jobId || !pdfInput) return;

  // Don't convert if it's already an image URL
  const lower = pdfInput.toLowerCase();
  if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.svg') || lower.endsWith('.webp')) {
    return;
  }

  const scriptPath = path.join(process.cwd(), 'scripts', 'pdf_to_circular_images.py');
  if (!fs.existsSync(scriptPath)) {
    console.warn(`[Auto-PDF-Converter] Script not found at: ${scriptPath}`);
    return;
  }

  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  const logFile = path.join(logsDir, 'pdf_converter.log');
  let outLog: number | 'ignore' = 'ignore';
  try {
    outLog = fs.openSync(logFile, 'a');
  } catch {}

  console.log(`[Auto-PDF-Converter] 🚀 Triggering automatic background conversion for ${jobId} -> ${pdfInput}`);

  try {
    const child = spawn('python', [scriptPath, '--input', pdfInput, '--job-id', jobId], {
      detached: true,
      stdio: ['ignore', outLog, outLog],
      shell: process.platform === 'win32',
      windowsHide: true
    });
    child.unref();
  } catch (err: any) {
    console.error(`[Auto-PDF-Converter] Failed to spawn converter:`, err.message);
  }
}
