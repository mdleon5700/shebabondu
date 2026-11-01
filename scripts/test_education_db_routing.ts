import { serverDB } from '../src/lib/db';
import { SyntheticUserManager } from '../src/lib/testing/synthetic/synthetic-user-manager';

async function testEducationRouting() {
  console.log('=== TESTING STEP 03 EDUCATION & DOCUMENT DB ROUTING ===');

  const testId = 'SYNTH-USR-DHAKA-001';
  const initialUser = serverDB.getCandidateById(testId);
  if (!initialUser) throw new Error('Failed to find test synthetic user');

  const initialEduCount = (initialUser.education || []).length;
  console.log(`Initial education count for ${testId}: ${initialEduCount}`);

  // 1. Test addCandidateEducation
  const newEdu = {
    id: `edu_test_${Date.now()}`,
    level: 'উচ্চ মাধ্যমিক (HSC)',
    degree: 'Higher Secondary Certificate',
    boardOrUni: 'ঢাকা শিক্ষা বোর্ড',
    year: '2020',
    result: 'GPA 5.00',
    resultType: 'GPA' as const,
    scale: 5.0,
    gpa: 5.0,
    academicStatus: 'COMPLETED' as const,
    verificationStatus: 'PENDING_REVIEW' as const
  };

  const added = serverDB.addCandidateEducation(testId, newEdu as any);
  if (!added || !added.education) throw new Error('addCandidateEducation failed');
  console.log(`✅ addCandidateEducation success: new count = ${added.education.length}`);
  if (added.education.length !== initialEduCount + 1) throw new Error('Count mismatch after add');

  // 2. Test updateCandidateEducation
  const updated = serverDB.updateCandidateEducation(testId, newEdu.id, {
    verificationStatus: 'VERIFIED',
    verificationRemarks: 'অফিসিয়াল বোর্ড ডাটাবেস অনুযায়ী ভেরিফায়েড।'
  });
  if (!updated) throw new Error('updateCandidateEducation failed');
  const found = updated.education?.find(e => e.id === newEdu.id);
  if (found?.verificationStatus !== 'VERIFIED') throw new Error('Updated status not reflected');
  console.log(`✅ updateCandidateEducation success: status = ${found?.verificationStatus}`);

  // 3. Test saveDocument & getDocuments
  const testDoc = {
    id: `DOC-TEST-${Date.now().toString().slice(-4)}`,
    type: 'hsc_certificate',
    title: 'এইচএসসি সনদপত্র (টেস্ট)',
    category: 'education',
    fileName: 'test_hsc_cert.txt',
    fileSize: '24 KB',
    uploadDate: new Date().toLocaleDateString('bn-BD'),
    dataUrl: '/uploads/test_hsc_cert.txt',
    fileUrl: '/uploads/test_hsc_cert.txt',
    isVerified: false
  };

  const docsAfterSave = serverDB.saveDocument(testId, testDoc as any);
  console.log(`✅ saveDocument success: total docs = ${docsAfterSave.length}`);

  const fetchedDocs = serverDB.getDocuments(testId);
  if (!fetchedDocs.some(d => d.id === testDoc.id)) throw new Error('Saved document not found in getDocuments');
  console.log(`✅ getDocuments success: retrieved ${fetchedDocs.length} documents`);

  // 4. Test updateDocumentVerification
  const verifUpdated = serverDB.updateDocumentVerification(testId, testDoc.id, {
    isVerified: true,
    verificationStatus: 'VERIFIED',
    verificationRemarks: 'টেস্ট সনদপত্র অনুমোদিত'
  });
  if (!verifUpdated) throw new Error('updateDocumentVerification failed');
  const verifiedDoc = serverDB.getDocuments(testId).find(d => d.id === testDoc.id);
  if (!verifiedDoc?.isVerified) throw new Error('Document verification flag not updated');
  console.log(`✅ updateDocumentVerification success: verified = ${verifiedDoc?.isVerified}`);

  // 5. Test deleteCandidateEducation & deleteDocument
  serverDB.deleteCandidateEducation(testId, newEdu.id);
  const userAfterDelete = serverDB.getCandidateById(testId);
  if (userAfterDelete?.education?.some(e => e.id === newEdu.id)) {
    throw new Error('Education record was not deleted');
  }
  console.log(`✅ deleteCandidateEducation success: cleaned up test record`);

  serverDB.deleteDocument(testId, testDoc.id);
  const docsAfterDelete = serverDB.getDocuments(testId);
  if (docsAfterDelete.some(d => d.id === testDoc.id)) {
    throw new Error('Document was not deleted');
  }
  console.log(`✅ deleteDocument success: cleaned up test document`);

  // 6. Test Data Isolation Verification
  const isolation = SyntheticUserManager.verifyDataIsolation();
  console.log(`\n--- Production Data Isolation Guard ---`);
  console.log(`Real Candidates in local_store.json: ${isolation.realCandidatesCount} (Must be strictly 41)`);
  console.log(`Synthetic Candidates in store: ${isolation.syntheticCandidatesCount}`);
  if (isolation.realCandidatesCount !== 41) {
    throw new Error(`ISOLATION FAILURE: local_store.json was contaminated! Expected 41, got ${isolation.realCandidatesCount}`);
  }
  console.log('🎉 100% PASS: Database routing and complete isolation confirmed!');
}

testEducationRouting().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});