const fs = require('fs');

// 1. Update normalizer.ts normalizeJob
let normContent = fs.readFileSync('src/lib/matching/normalizer.ts', 'utf8');
const oldNormJobSlice = `    const fullReqText = allReqs.join(' ');
    const edu = this.normalizeEducationLevel(job.minEducation || fullReqText);
    const subjects = this.extractSubjects(fullReqText);`;

const newNormJobSlice = `    const fullReqText = allReqs.join(' ');
    const edu = this.normalizeEducationLevel(job.minEducation || fullReqText);
    const eduReqLines = allReqs.filter(r => {
      const lower = r.toLowerCase();
      return lower.includes('স্নাতক') || lower.includes('ডিগ্রি') || lower.includes('মাস্টার্স') || 
             lower.includes('বিএসসি') || lower.includes('বিভাগ') || lower.includes('বিষয়') ||
             lower.includes('ডিপ্লোমা') || lower.includes('এইচএসসি') || lower.includes('এসএসসি') || 
             lower.includes('সম্মান') || lower.includes('অনার্স');
    });
    const eduReqText = (job.minEducation ? [job.minEducation, ...eduReqLines] : (eduReqLines.length > 0 ? eduReqLines : allReqs)).join(' ');
    const subjects = this.extractSubjects(eduReqText);`;

normContent = normContent.replace(oldNormJobSlice, newNormJobSlice);
fs.writeFileSync('src/lib/matching/normalizer.ts', normContent, 'utf8');
console.log('✅ Updated normalizer.ts normalizeJob');

// 2. Update engine.ts subject matching
let engineContent = fs.readFileSync('src/lib/matching/engine.ts', 'utf8');
const oldSubjectCheck = `        const matchesSubject = effectiveReqs.requiredSubjects.some(reqSub => {
          const s = reqSub.toLowerCase();
          return userSubject.includes(s) || s.includes(userSubject);
        });`;

const newSubjectCheck = `        const userDeg = (highestEdu.degreeName || '').toLowerCase();
        const matchesSubject = effectiveReqs.requiredSubjects.some(reqSub => {
          const s = reqSub.toLowerCase();
          if (userSubject.includes(s) || s.includes(userSubject)) return true;
          if (userDeg.includes(s) || s.includes(userDeg)) return true;
          if ((userSubject.includes('cse') || userSubject.includes('computer') || userDeg.includes('computer')) && s.includes('computer')) return true;
          if ((userSubject.includes('science') || userSubject.includes('বিজ্ঞান')) && s.includes('science')) return true;
          if ((userSubject.includes('commerce') || userSubject.includes('business') || userSubject.includes('bba')) && (s.includes('business') || s.includes('commerce') || s.includes('finance') || s.includes('accounting'))) return true;
          return false;
        });`;

engineContent = engineContent.replace(oldSubjectCheck, newSubjectCheck);
fs.writeFileSync('src/lib/matching/engine.ts', engineContent, 'utf8');
console.log('✅ Updated engine.ts subject matching logic');
