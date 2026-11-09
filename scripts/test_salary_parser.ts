import store from '../src/db/local_store.json';

const toEn = (s: string) => s.replace(/[০-৯]/g, d => '0123456789'['০১২৩৪৫৬৭৮৯'.indexOf(d)]);

export function parseSalaryRange(salary: string): { min: number; max: number } {
  if (!salary) return { min: 0, max: 0 };
  const en = toEn(salary);
  const nums = en.match(/\d[\d,]*/g);
  if (!nums || nums.length === 0) return { min: 0, max: 0 };
  const cleanNums = nums.map(n => parseInt(n.replace(/,/g, ''), 10)).filter(n => n >= 5000 && n <= 200000);
  if (cleanNums.length === 0) return { min: 0, max: 0 };
  return { min: cleanNums[0], max: cleanNums[cleanNums.length - 1] };
}

const jobs: any[] = Object.values(store.jobs || {});
console.log('Total jobs:', jobs.length);

const under25k = jobs.filter(j => {
  const { min } = parseSalaryRange(j.salary);
  return min > 0 && min <= 25000;
});

const mid25_50k = jobs.filter(j => {
  const { min, max } = parseSalaryRange(j.salary);
  return max >= 25000 && min <= 50000;
});

const above35k = jobs.filter(j => {
  const { max } = parseSalaryRange(j.salary);
  return max >= 35000;
});

console.log('Starting salary <= 25k (under_25k):', under25k.length);
console.log('Scale 25k to 50k (25k_50k):', mid25_50k.length);
console.log('Max scale >= 35k (above_35k):', above35k.length);

