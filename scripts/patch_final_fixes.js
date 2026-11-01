const fs = require('fs');

// 1. Fix normalizer.ts: Add 'বিএসসি' to Bachelor's/Honours
let normContent = fs.readFileSync('src/lib/matching/normalizer.ts', 'utf8');
normContent = normContent.replace(
  "lower.includes('bachelor') || lower.includes('স্নাতক')",
  "lower.includes('bachelor') || lower.includes('স্নাতক') || lower.includes('বিএসসি') || lower.includes('বি.এসসি') || lower.includes('বিবিএ') || lower.includes('বিএসএস') || lower.includes('বিএ')"
);
fs.writeFileSync('src/lib/matching/normalizer.ts', normContent, 'utf8');
console.log('✅ Added বিএসসি / বিবিএ to normalizeEducationLevel in normalizer.ts');

// 2. Fix engine.ts: Check requiredSubjects even if requiredEducationLevel is 'any'
let engineContent = fs.readFileSync('src/lib/matching/engine.ts', 'utf8');

const oldEduLevelCheck = `    // 2. Mandatory Education Level & Subject Check
    if (highestEdu && effectiveReqs.requiredEducationLevel !== 'any') {
      const candidateRank = EDU_HIERARCHY[highestEdu.level as NormalizedEducationLevel] || 0;
      const requiredRank = EDU_HIERARCHY[effectiveReqs.requiredEducationLevel] || 0;

      if (candidateRank < requiredRank) {
        return {
          status: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
          labelBn: \`শিক্ষাগত যোগ্যতা পূরণ হয়নি (প্রয়োজন \${effectiveReqs.requiredEducationLevelBn}, প্রার্থীর যোগ্যতা \${highestEdu.degreeName})\`,
          missingFields: [],
          isHardDisqualified: true
        };
      }

      // Check subject if job strictly requires specific subjects
      if (effectiveReqs.requiredSubjects && effectiveReqs.requiredSubjects.length > 0) {
        const userSubject = (highestEdu.subject || '').trim().toLowerCase();
        if (!userSubject) {
          return {
            status: 'NEEDS_MORE_INFORMATION',
            labelBn: \`ডিগ্রির মূল বিষয়ের তথ্য অনুপস্থিত (আবশ্যক: \${effectiveReqs.requiredSubjects.join(', ')})\`,
            missingFields: ['ডিগ্রির মূল বিষয় (Major Subject)'],
            isHardDisqualified: false
          };
        }
        const userDeg = (highestEdu.degreeName || '').toLowerCase();
        const matchesSubject = effectiveReqs.requiredSubjects.some(reqSub => {
          const s = reqSub.toLowerCase();
          if (userSubject.includes(s) || s.includes(userSubject)) return true;
          if (userDeg.includes(s) || s.includes(userDeg)) return true;
          if ((userSubject.includes('cse') || userSubject.includes('computer') || userDeg.includes('computer')) && s.includes('computer')) return true;
          if ((userSubject.includes('science') || userSubject.includes('বিজ্ঞান')) && s.includes('science')) return true;
          if ((userSubject.includes('commerce') || userSubject.includes('business') || userSubject.includes('bba')) && (s.includes('business') || s.includes('commerce') || s.includes('finance') || s.includes('accounting'))) return true;
          return false;
        });
        if (!matchesSubject) {
          return {
            status: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
            labelBn: \`আবশ্যক বিষয় পূরণ হয়নি (প্রয়োজন: \${effectiveReqs.requiredSubjects.join(', ')}, প্রার্থীর বিষয়: \${highestEdu.subject})\`,
            missingFields: [],
            isHardDisqualified: true
          };
        }
      }
    }`;

const newEduLevelCheck = `    // 2. Mandatory Education Level Check
    if (highestEdu) {
      if (effectiveReqs.requiredEducationLevel !== 'any') {
        const candidateRank = EDU_HIERARCHY[highestEdu.level as NormalizedEducationLevel] || 0;
        const requiredRank = EDU_HIERARCHY[effectiveReqs.requiredEducationLevel] || 0;

        if (candidateRank < requiredRank) {
          return {
            status: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
            labelBn: \`শিক্ষাগত যোগ্যতা পূরণ হয়নি (প্রয়োজন \${effectiveReqs.requiredEducationLevelBn}, প্রার্থীর যোগ্যতা \${highestEdu.degreeName})\`,
            missingFields: [],
            isHardDisqualified: true
          };
        }
      }

      // Check subject if job strictly requires specific subjects
      if (effectiveReqs.requiredSubjects && effectiveReqs.requiredSubjects.length > 0) {
        const userSubject = (highestEdu.subject || '').trim().toLowerCase();
        const userDeg = (highestEdu.degreeName || '').toLowerCase();
        if (!userSubject && !userDeg) {
          return {
            status: 'NEEDS_MORE_INFORMATION',
            labelBn: \`ডিগ্রির মূল বিষয়ের তথ্য অনুপস্থিত (আবশ্যক: \${effectiveReqs.requiredSubjects.join(', ')})\`,
            missingFields: ['ডিগ্রির মূল বিষয় (Major Subject)'],
            isHardDisqualified: false
          };
        }
        const matchesSubject = effectiveReqs.requiredSubjects.some(reqSub => {
          const s = reqSub.toLowerCase();
          if (userSubject.includes(s) || s.includes(userSubject)) return true;
          if (userDeg.includes(s) || s.includes(userDeg)) return true;
          if ((userSubject.includes('cse') || userSubject.includes('computer') || userDeg.includes('computer')) && s.includes('computer')) return true;
          if ((userSubject.includes('science') || userSubject.includes('বিজ্ঞান')) && s.includes('science')) return true;
          if ((userSubject.includes('commerce') || userSubject.includes('business') || userSubject.includes('bba')) && (s.includes('business') || s.includes('commerce') || s.includes('finance') || s.includes('accounting'))) return true;
          return false;
        });
        if (!matchesSubject) {
          return {
            status: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
            labelBn: \`আবশ্যক বিষয় পূরণ হয়নি (প্রয়োজন: \${effectiveReqs.requiredSubjects.join(', ')}, প্রার্থীর বিষয়: \${highestEdu.subject || highestEdu.degreeName})\`,
            missingFields: [],
            isHardDisqualified: true
          };
        }
      }
    }`;

engineContent = engineContent.replace(oldEduLevelCheck, newEduLevelCheck);
fs.writeFileSync('src/lib/matching/engine.ts', engineContent, 'utf8');
console.log('✅ Updated mandatory education and subject check in engine.ts');

// 3. Fix Scenario 37 authenticated session before navigating to /dashboard/recommended-jobs
let s37 = fs.readFileSync('src/lib/testing/scenarios/37-mandatory-eligibility-vs-recommendation-separation-audit.ts', 'utf8');

const oldS37Nav = `    // 4. Browser UI verification: Recommended Jobs page loads cleanly
    actionsPerformed.push('Navigating browser to /dashboard/recommended-jobs');
    try {
      await page.goto(\`\${baseUrl}/dashboard/recommended-jobs\`, { waitUntil: 'domcontentloaded', timeout: 8000 });
      const hasHeading = await page.locator('text=আপনার জন্য সুপারিশকৃত চাকরি').first().isVisible({ timeout: 3000 }).catch(() => false);
      assertions.push({
        assertion: 'Browser UI renders Smart Recommendations dashboard page',
        expected: 'true',
        actual: String(hasHeading),
        passed: hasHeading
      });
    } catch (e: any) {
      actionsPerformed.push(\`UI navigation warning: \${e.message}\`);
    }`;

const newS37Nav = `    // 4. Browser UI verification: Recommended Jobs page loads cleanly
    actionsPerformed.push('Navigating browser to /dashboard/recommended-jobs with candidate session');
    try {
      await page.goto(\`\${baseUrl}/login\`, { waitUntil: 'domcontentloaded', timeout: 8000 });
      await page.evaluate((cand: any) => {
        localStorage.setItem('cs_auth_state', JSON.stringify({ isLoggedIn: true, identifier: cand.phone || '01711000009', candidateId: cand.id }));
        localStorage.setItem('cs_user_profile', JSON.stringify(cand));
      }, bachelorCandidate);
      await page.context().addCookies([
        { name: 'cs_session_token', value: bachelorCandidate.id || 'SYNTH-USR-DHAKA-009', domain: 'localhost', path: '/' }
      ]);
      await page.goto(\`\${baseUrl}/dashboard/recommended-jobs\`, { waitUntil: 'domcontentloaded', timeout: 8000 });
      const hasHeading = await page.locator('text=আপনার জন্য সুপারিশকৃত চাকরি').first().isVisible({ timeout: 4000 }).catch(() => false);
      assertions.push({
        assertion: 'Browser UI renders Smart Recommendations dashboard page',
        expected: 'true',
        actual: String(hasHeading),
        passed: hasHeading
      });
    } catch (e: any) {
      actionsPerformed.push(\`UI navigation warning: \${e.message}\`);
    }`;

s37 = s37.replace(oldS37Nav, newS37Nav);
fs.writeFileSync('src/lib/testing/scenarios/37-mandatory-eligibility-vs-recommendation-separation-audit.ts', s37, 'utf8');
console.log('✅ Updated Scenario 37 browser session setup');
