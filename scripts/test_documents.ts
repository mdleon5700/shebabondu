import { SyntheticDocumentGenerator } from '../src/lib/testing/synthetic/synthetic-document-generator';

console.log('=== PRE-TEST: SYNTHETIC DOCUMENT GENERATOR AUDIT ===');
const docs = SyntheticDocumentGenerator.generateSampleDocuments();
console.log('Generated Documents Count:', docs.length);
docs.forEach(d => {
  console.log(`- [${d.type}] ${d.filename} (${d.sizeBytes} bytes, Watermark: "${d.watermark}")`);
});

if (docs.length >= 10 && docs.every(d => d.watermark.includes('TEST / NOT VALID'))) {
  console.log('✅ PRE-TEST PASSED: Synthetic document templates generated and verified with visible watermarks!');
} else {
  throw new Error('FAIL: Synthetic documents verification failed.');
}
