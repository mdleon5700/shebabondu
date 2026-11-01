import fs from 'fs';
import path from 'path';

type UploadKind = 'candidate-documents' | 'applicant-copies';

export function privateUploadDirectory(kind: UploadKind): string {
  return path.join(process.env.CHAKRI_UPLOAD_DIR || path.join(process.cwd(), 'private', 'uploads'), kind);
}

export function findPrivateUpload(kind: UploadKind, filename: string): string {
  const safeName = path.basename(filename);
  const target = path.join(privateUploadDirectory(kind), safeName);
  return fs.existsSync(target) ? target : path.join(process.cwd(), 'public', 'uploads', kind, safeName);
}
