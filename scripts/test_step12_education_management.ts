/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 12: EDUCATION & CERTIFICATE MANAGEMENT TEST SUITE
 * Validates Bangladesh degree taxonomy, GPA/CGPA validation, certificate verification workflow,
 * and integration with candidate profile and smart job matching.
 */

import { serverDB } from '../src/lib/db';
import { 
  BD_EDUCATION_LEVELS, 
  BD_DEGREE_PROGRAMS,
  AcademicResultValidator,
  CertificateVerificationManager
} from '../src/lib/education';
import { JobRequirementNormalizer } from '../src/lib/matching/normalizer';

async function runStep12Tests() {
  console.log('================================================================================');
  console.log('CHAKRI SHEBA — STEP 12 EDUCATION & QUALIFICATION TEST SUITE');
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      if (details) console.error(`         -> ${details}`);
      failed++;
    }
  }

  // ---------------------------------------------------------------------------
  // VECTOR 1: Bangladesh Education Levels & Degree Taxonomy
  // ---------------------------------------------------------------------------
  console.log('--- VECTOR 1: Bangladesh Education Levels & Degree Taxonomy ---');
  assert(
    BD_EDUCATION_LEVELS.length >= 6,
    'Education level catalog covers secondary through postgraduate and advanced levels',
    `Levels: ${BD_EDUCATION_LEVELS.length}`
  );

  assert(
    BD_DEGREE_PROGRAMS.length >= 10,
    'Degree program registry includes SSC, HSC, Honours, Masters, Dakhil, Alim, and Technical Diplomas',
    `Programs: ${BD_DEGREE_PROGRAMS.length}`
  );

  const sscDef = BD_DEGREE_PROGRAMS.find(p => p.code === 'ssc');
  assert(
    sscDef !== undefined && sscDef.defaultScale === 5.0,
    'SSC degree defaults to standard 5.00 grading scale'
  );

  // ---------------------------------------------------------------------------
  // VECTOR 2: Academic Result Validation Engine
  // ---------------------------------------------------------------------------
  console.log('\n--- VECTOR 2: Academic Result Validation Engine ---');
  // Valid GPA 5.00
  const validGpa = AcademicResultValidator.validateResult({
    academicStatus: 'COMPLETED',
    resultType: 'GPA',
    resultValue: '4.85',
    scale: 5.00
  });
  assert(
    validGpa.isValid === true && validGpa.normalizedGpa === 4.85,
    'Valid GPA 4.85 on 5.00 scale passes validation'
  );

  // Invalid GPA > scale
  const invalidGpa = AcademicResultValidator.validateResult({
    academicStatus: 'COMPLETED',
    resultType: 'GPA',
    resultValue: '5.50',
    scale: 5.00
  });
  assert(
    invalidGpa.isValid === false,
    'GPA 5.50 on 5.00 scale correctly rejected as out of bounds'
  );

  // Valid CGPA 4.00
  const validCgpa = AcademicResultValidator.validateResult({
    academicStatus: 'COMPLETED',
    resultType: 'CGPA',
    resultValue: '3.75',
    scale: 4.00
  });
  assert(
    validCgpa.isValid === true && validCgpa.normalizedCgpa === 3.75,
    'Valid CGPA 3.75 on 4.00 scale passes validation'
  );

  // Valid Division
  const validDivision = AcademicResultValidator.validateResult({
    academicStatus: 'COMPLETED',
    resultType: 'DIVISION',
    divisionOrClass: 'FIRST'
  });
  assert(
    validDivision.isValid === true,
    'Traditional First Division classification passes validation'
  );

  // Currently studying
  const ongoing = AcademicResultValidator.validateResult({
    academicStatus: 'CURRENTLY_STUDYING',
    expectedPassingYear: '2027'
  });
  assert(
    ongoing.isValid === true,
    'Ongoing education with expected passing year validated'
  );

  // ---------------------------------------------------------------------------
  // VECTOR 3: Bengali Numerals Parsing & Formatting
  // ---------------------------------------------------------------------------
  console.log('\n--- VECTOR 3: Bengali Numerals Parsing & Formatting ---');
  const enDigits = AcademicResultValidator.parseBnDigits('৩.৮৫');
  assert(
    enDigits === '3.85',
    'Bengali digits "৩.৮৫" correctly normalized to ASCII "3.85"'
  );

  const bnDigits = AcademicResultValidator.toBnDigits('4.50');
  assert(
    bnDigits === '৪.৫০',
    'ASCII digits "4.50" formatted to Bengali "৪.৫০"'
  );

  // ---------------------------------------------------------------------------
  // VECTOR 4: Certificate Verification State Machine
  // ---------------------------------------------------------------------------
  console.log('\n--- VECTOR 4: Certificate Verification State Machine ---');
  const candidates = serverDB.getAllCandidates();
  assert(
    candidates.length > 0,
    'Candidate directory contains profiles for verification testing'
  );

  const testCandidate = candidates.find(c => c.education && c.education.length > 0) || candidates[0];
  const testCandidateId = testCandidate.id || 'USR-01774366643';

  // Add sample education record if needed
  let eduId = (testCandidate.education && testCandidate.education[0]?.id) || '';
  if (!eduId) {
    const newEdu = serverDB.addCandidateEducation(testCandidateId, {
      degree: 'B.Sc in Computer Science',
      institution: 'University of Dhaka',
      passingYear: '2023',
      result: '3.80',
      scale: 4.00,
      level: 'bachelor',
      isVerified: false
    } as any);
    eduId = newEdu?.education?.[newEdu.education.length - 1]?.id || '';
  }

  assert(
    Boolean(eduId),
    'Test education record identified for verification lifecycle check'
  );

  // Apply verification decision
  const decisionResult = CertificateVerificationManager.applyDecision({
    candidateId: testCandidateId,
    recordId: eduId,
    recordType: 'education',
    status: 'VERIFIED',
    reviewerId: 'ADMIN-SUPER',
    remarks: 'অরিজিনাল ট্রান্সক্রিপ্ট ও সনদপত্র যাচাইপূর্বক অনুমোদিত।'
  });

  assert(
    decisionResult.success === true,
    'Admin successfully applied VERIFIED decision to academic record'
  );

  const updatedCandidate = serverDB.getCandidateById(testCandidateId);
  const targetEdu = updatedCandidate?.education?.find(e => e.id === eduId);
  assert(
    targetEdu !== undefined && (targetEdu as any).verificationStatus === 'VERIFIED',
    'Academic record verificationStatus updated to VERIFIED in database'
  );

  // ---------------------------------------------------------------------------
  // VECTOR 5: Integration with Step 09 Smart Job Matching
  // ---------------------------------------------------------------------------
  console.log('\n--- VECTOR 5: Integration with Step 09 Smart Job Matching ---');
  const normalizedLevel = JobRequirementNormalizer.normalizeEducationLevel('B.Sc in Computer Science');
  assert(
    normalizedLevel.level === 'bachelor',
    'Education normalizer maps degree to "bachelor" level for Smart Matching'
  );

  console.log('\n================================================================================');
  console.log(`STEP 12 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED | TOTAL: ${passed + failed}`);
  console.log('================================================================================');

  if (failed > 0) process.exit(1);
}

runStep12Tests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

