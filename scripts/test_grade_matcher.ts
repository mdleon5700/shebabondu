import store from '../src/db/local_store.json';

const matchGrade = (jobGrade: string, selectedGrade: string) => {
  if (selectedGrade === 'all') return true;
  if (!jobGrade) return false;
  if (jobGrade === selectedGrade) return true;
  const gradeKey = selectedGrade.replace(' গ্রেড', '').trim();
  return jobGrade.includes(gradeKey);
};

const jobs: any[] = Object.values(store.jobs || {});
const testGrades = ['৯ম গ্রেড', '১০ম গ্রেড', '১১তম গ্রেড', '১৪তম গ্রেড', '১৬তম গ্রেড', '২০তম গ্রেড'];

testGrades.forEach(g => {
  const matched = jobs.filter(j => matchGrade(j.grade, g));
  console.log(`Grade "${g}": ${matched.length} jobs matched.`);
});

