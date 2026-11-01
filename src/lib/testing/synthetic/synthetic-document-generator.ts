// Synthetic Document Generator for Step 02 / 03 Testing Infrastructure
// Creates synthetic certificates, marksheets, and CVs with strict watermarking
// "TEST / NOT VALID / SYNTHETIC SAMPLE"

import fs from 'fs';
import path from 'path';

export interface SyntheticDocumentMeta {
  type: string;
  filename: string;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
  watermark: string;
  isSynthetic: true;
}

export class SyntheticDocumentGenerator {
  private static outputDir = path.join(process.cwd(), 'test-evidence', 'synthetic-documents');

  static ensureOutputDir(): string {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    return this.outputDir;
  }

  static generateSampleDocuments(): SyntheticDocumentMeta[] {
    const dir = this.ensureOutputDir();
    const documents: SyntheticDocumentMeta[] = [];

    const templates = [
      { type: 'jsc_certificate', name: 'JSC_Certificate_Synthetic_Sample.txt', title: 'JUNIOR SCHOOL CERTIFICATE (JSC) — TEST VERIFICATION' },
      { type: 'jdc_certificate', name: 'JDC_Certificate_Synthetic_Sample.txt', title: 'JUNIOR DAKHIL CERTIFICATE (JDC) — TEST VERIFICATION' },
      { type: 'jsc_jdc_marksheet', name: 'JSC_JDC_Marksheet_Synthetic_Sample.txt', title: 'JSC/JDC ACADEMIC MARKSHEET & TRANSCRIPT — TEST VERIFICATION' },
      { type: 'ssc_certificate', name: 'SSC_Certificate_Synthetic_Sample.txt', title: 'SECONDARY SCHOOL CERTIFICATE (SSC) — TEST VERIFICATION' },
      { type: 'dakhil_certificate', name: 'Dakhil_Certificate_Synthetic_Sample.txt', title: 'DAKHIL EXAMINATION CERTIFICATE — TEST VERIFICATION' },
      { type: 'ssc_dakhil_marksheet', name: 'SSC_Dakhil_Marksheet_Synthetic_Sample.txt', title: 'SSC/DAKHIL OFFICIAL MARKSHEET — TEST VERIFICATION' },
      { type: 'hsc_certificate', name: 'HSC_Certificate_Synthetic_Sample.txt', title: 'HIGHER SECONDARY CERTIFICATE (HSC) — TEST VERIFICATION' },
      { type: 'alim_certificate', name: 'Alim_Certificate_Synthetic_Sample.txt', title: 'ALIM EXAMINATION CERTIFICATE — TEST VERIFICATION' },
      { type: 'hsc_marksheet', name: 'HSC_Marksheet_Synthetic_Sample.txt', title: 'HSC TRANSCRIPT OF ACADEMIC RECORD — TEST VERIFICATION' },
      { type: 'diploma_certificate', name: 'Diploma_Certificate_Synthetic_Sample.txt', title: 'DIPLOMA IN ENGINEERING (BTEB) — TEST VERIFICATION' },
      { type: 'bachelor_certificate', name: 'Bachelor_Certificate_Synthetic_Sample.txt', title: 'BACHELOR DEGREE (B.A / B.S.S / B.COM PASS) — TEST VERIFICATION' },
      { type: 'honours_certificate', name: 'Honours_Certificate_Synthetic_Sample.txt', title: 'BACHELOR OF SCIENCE (HONOURS) — TEST VERIFICATION' },
      { type: 'degree_certificate', name: 'Degree_Pass_Certificate_Synthetic_Sample.txt', title: 'DEGREE PASS COURSE GRADUATION CERTIFICATE — TEST VERIFICATION' },
      { type: 'masters_certificate', name: 'Masters_Certificate_Synthetic_Sample.txt', title: 'MASTER OF SCIENCE (M.SC) — TEST VERIFICATION' },
      { type: 'mphil_certificate', name: 'MPhil_Certificate_Synthetic_Sample.txt', title: 'MASTER OF PHILOSOPHY (MPHIL) — TEST VERIFICATION' },
      { type: 'phd_certificate', name: 'PhD_Certificate_Synthetic_Sample.txt', title: 'DOCTOR OF PHILOSOPHY (PHD) DEGREE — TEST VERIFICATION' },
      { type: 'training_certificate', name: 'Training_Certificate_Synthetic_Sample.txt', title: 'PROFESSIONAL ICT & VOCATIONAL TRAINING CERTIFICATE — TEST VERIFICATION' },
      { type: 'academic_marksheet', name: 'Academic_Marksheet_Synthetic_Sample.txt', title: 'ACADEMIC TRANSCRIPT & MARKSHEET — TEST VERIFICATION' },
      { type: 'candidate_cv', name: 'Synthetic_Candidate_CV.md', title: 'STANDARDIZED CANONICAL CURRICULUM VITAE — TEST VERIFICATION' }
    ];

    for (const t of templates) {
      const filePath = path.join(dir, t.name);
      const content = `======================================================================
*** TEST / NOT VALID / SYNTHETIC SAMPLE / FOR TESTING PURPOSES ONLY ***
======================================================================
DOCUMENT TYPE: ${t.title}
GENERATION TIMESTAMP: ${new Date().toISOString()}
SECURITY WATERMARK: CHAKRI-SHEBA-SYNTHETIC-DOC-2026-TEST-ONLY
STATUS: SYNTHETIC SIMULATION ARTIFACT

Candidate Name: Mohammad Tanvir Rahman (Synthetic Persona)
Father's Name: Md. Rafiqul Islam
Roll Number: 102948
Registration Number: 1510293847
Passing Year: 2022
Result / GPA: 4.85 / 5.00
Board / Institution: Dhaka Education Board (Simulation)
Subject / Group: Science & Information Technology

NOTICE:
This document is generated strictly for autonomous system verification and
audit infrastructure in Chakri Sheba platform. It holds NO legal or authentic value.
======================================================================
*** TEST / NOT VALID / SYNTHETIC SAMPLE / FOR TESTING PURPOSES ONLY ***
======================================================================
`;
      fs.writeFileSync(filePath, content, 'utf8');
      const stats = fs.statSync(filePath);

      documents.push({
        type: t.type,
        filename: t.name,
        filePath,
        mimeType: t.name.endsWith('.md') ? 'text/markdown' : 'text/plain',
        sizeBytes: stats.size,
        watermark: 'TEST / NOT VALID / SYNTHETIC SAMPLE',
        isSynthetic: true
      });
    }

    return documents;
  }

  static createCandidateCertificateFile(candidate: {
    id: string;
    nameBn: string;
    name?: string;
    district: string;
    phone: string;
  }, docType: string, degreeTitle: string, year: string, result: string): {
    filePath: string;
    fileName: string;
    sizeBytes: number;
    buffer: Buffer;
  } {
    const dir = this.ensureOutputDir();
    const cleanId = candidate.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${cleanId}_${docType}_${year}.txt`;
    const filePath = path.join(dir, fileName);

    const content = `======================================================================
*** TEST / NOT VALID / SYNTHETIC SAMPLE / FOR TESTING PURPOSES ONLY ***
======================================================================
ACADEMIC DOCUMENT: ${degreeTitle.toUpperCase()}
SYNTHETIC CANDIDATE ID: ${candidate.id}
CANDIDATE NAME: ${candidate.nameBn} (${candidate.name || 'Synthetic Persona'})
DISTRICT: ${candidate.district} | MOBILE: ${candidate.phone}
PASSING YEAR: ${year}
RESULT: ${result}
VERIFICATION WATERMARK: CHAKRI-SHEBA-SYNTHETIC-ACADEMIC-VERIFICATION-2026
GENERATION TIMESTAMP: ${new Date().toISOString()}

This academic document is an automated synthetic artifact produced solely
for end-to-end regression testing and cross-panel audit in Chakri Sheba.
It is strictly fictitious and holds zero legal significance.
======================================================================
*** TEST / NOT VALID / SYNTHETIC SAMPLE / FOR TESTING PURPOSES ONLY ***
======================================================================
`;
    fs.writeFileSync(filePath, content, 'utf8');
    const buffer = Buffer.from(content, 'utf8');
    return {
      filePath,
      fileName,
      sizeBytes: buffer.length,
      buffer
    };
  }
}
