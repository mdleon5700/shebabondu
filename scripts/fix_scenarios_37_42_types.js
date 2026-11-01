const fs = require('fs');

const scenarios = [37, 38, 39, 40, 41, 42];

for (const num of scenarios) {
  const filePath = `src/lib/testing/scenarios/${num}-${num === 37 ? 'mandatory-eligibility-vs-recommendation-separation-audit' :
    num === 38 ? 'complete-education-matrix-subject-match-audit' :
    num === 39 ? 'age-boundaries-reference-date-quota-audit' :
    num === 40 ? 'experience-skills-64-district-matching-audit' :
    num === 41 ? 'new-job-publishing-matching-profile-refresh-simulation' :
    'matching-transparency-explainability-notifications-audit'}.ts`;

  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Fix category
  content = content.replace(/category: 'user_panel'/g, "category: 'user'");

  // 2. Fix JobCircular casts
  content = content.replace(/const ([a-zA-Z0-9_]+): JobCircular = \{/g, 'const $1: JobCircular = { as any : true,');
  content = content.replace(/as any : true,/g, '');
  content = content.replace(/const ([a-zA-Z0-9_]+): JobCircular = (\{[\s\S]*?\n    \});/g, 'const $1: JobCircular = ($2 as unknown as JobCircular);');

  // 3. Fix CandidateProfile casts
  content = content.replace(/const ([a-zA-Z0-9_]+): CandidateProfile = (\{[\s\S]*?\n    \});/g, 'const $1: CandidateProfile = ($2 as unknown as CandidateProfile);');

  // 4. Fix getDistrictAuditStatuses
  content = content.replace(/SyntheticUserManager\.getDistrictAuditStatuses\(\)/g, 'SyntheticUserManager.getDistrictBatchAudit().districtAudits');

  // 5. Fix publishedAt in scenario 41
  content = content.replace(/newJob\.publishedAt = new Date\(\)\.toISOString\(\);/g, '(newJob as any).publishedAt = new Date().toISOString();');

  // 6. Fix baseEdu typing
  content = content.replace(/academicStatus: 'COMPLETED'/g, "academicStatus: 'COMPLETED' as const");

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed types in scenario ${num}`);
}
