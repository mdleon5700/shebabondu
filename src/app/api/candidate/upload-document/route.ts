import { privateUploadDirectory } from '@/lib/private-uploads';
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { CandidateDocument } from '@/lib/types';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const session = getServerSession(req);
    if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const docType = (formData.get('docType') as string) || 'custom';
    const docTitle = (formData.get('docTitle') as string) || 'প্রয়োজনীয় প্রমাণপত্র';
    const category = (formData.get('category') as string) || 'custom';
    const replaceDocId = formData.get('replaceDocId') as string | null;
    const educationRecordId = (formData.get('educationRecordId') as string) || undefined;

    if (!file) {
      return NextResponse.json({ error: 'কোনো ফাইল পাওয়া যায়নি' }, { status: 400 });
    }

    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
    const originalName = file.name || 'document.pdf';
    const fileExt = path.extname(originalName).toLowerCase();

    if (!allowedExtensions.includes(fileExt)) {
      return NextResponse.json(
        { error: 'শুধুমাত্র PDF, JPG, JPEG, PNG অথবা WEBP ফাইল আপলোড করা যাবে।' },
        { status: 400 }
      );
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'ফাইলের আকার সর্বোচ্চ ১০ মেগাবাইট (10MB) হতে পারে।' },
        { status: 400 }
      );
    }

    const candidateId = session?.candidateId || 'GUEST_' + Date.now();
    const timestamp = Date.now();
    const cleanDocType = docType.replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanFileName = candidateId.replace(/[^a-zA-Z0-9_-]/g, '_') + '_' + cleanDocType + '_' + timestamp + fileExt;

    const uploadDir = privateUploadDirectory('candidate-documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, cleanFileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);

    // Compute cryptographic SHA-256 hash of document
    const checksumSha256 = crypto.createHash('sha256').update(buffer).digest('hex');

    const mimeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp'
    };
    const mimeType = mimeMap[fileExt] || 'application/octet-stream';
    const relativeUrl = '/api/uploads/candidate-documents/' + cleanFileName;

    let targetDocId = 'DOC-' + crypto.randomUUID();
    let version = 1;
    let previousVersionId: string | undefined = undefined;

    if (session && session.candidateId) {
      // If replacing an existing document
      if (replaceDocId) {
        const existingDocs = serverDB.getDocuments(session.candidateId);
        const oldDoc = existingDocs.find(d => d.id === replaceDocId);
        if (oldDoc) {
          targetDocId = replaceDocId;
          version = (oldDoc.version || 1) + 1;
          previousVersionId = oldDoc.fileName;
        }
      }

      const fieldMap: Record<string, string> = {
        nid_front: 'nidFrontUrl',
        nid_back: 'nidBackUrl',
        father_nid: 'fatherNidUrl',
        mother_nid: 'motherNidUrl',
        nagorik_certificate: 'nagorikCertificateUrl',
        birth_certificate: 'birthCertificateUrl',
        character_certificate: 'characterCertificateUrl',
        quota_certificate: 'quotaCertificateUrl',
        photo: 'photoUrl',
        signature: 'signatureUrl',
      };

      const profileUpdateKey = fieldMap[docType];
      if (profileUpdateKey) {
        serverDB.updateCandidate(session.candidateId, { [profileUpdateKey]: relativeUrl });
      }

      const docRecord: CandidateDocument = {
        id: targetDocId,
        type: docType || 'custom',
        title: docTitle,
        category: category,
        fileName: cleanFileName,
        fileSize: Math.round(file.size / 1024) + ' KB',
        uploadDate: new Date().toLocaleDateString('bn-BD'),
        dataUrl: relativeUrl,
        fileUrl: relativeUrl,
        secureUrl: '/api/candidate/documents/secure/' + targetDocId,
        checksumSha256,
        mimeType,
        educationRecordId,
        version,
        previousVersionId,
        replacedAt: replaceDocId ? new Date().toISOString() : undefined,
        isVerified: false,
        verificationStatus: 'PENDING_REVIEW'
      };

      serverDB.saveDocument(session.candidateId, docRecord);

      // Notification trigger for upload/replacement
      serverDB.addCandidateNotification(session.candidateId, {
        title: replaceDocId ? 'ডকুমেন্ট প্রতিস্থাপন সম্পন্ন' : 'ডকুমেন্ট আপলোড সম্পন্ন',
        message: `${docTitle} সফলভাবে ${replaceDocId ? 'প্রতিস্থাপিত' : 'আপলোড'} হয়েছে।`,
        type: 'system'
      });

      return NextResponse.json({
        success: true,
        fileUrl: relativeUrl,
        fileName: cleanFileName,
        docType,
        docTitle,
        category,
        docRecord,
        fileSizeKb: Math.round(file.size / 1024),
        checksumSha256
      });
    }

    return NextResponse.json({
      success: true,
      fileUrl: relativeUrl,
      fileName: cleanFileName,
      docType,
      docTitle,
      category,
      docRecord: null,
      fileSizeKb: Math.round(file.size / 1024),
      checksumSha256
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'ফাইল আপলোডে ত্রুটি হয়েছে' }, { status: 500 });
  }
}
