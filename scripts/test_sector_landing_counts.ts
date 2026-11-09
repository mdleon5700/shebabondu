import { serverDB } from '../src/lib/db';
import { JobCircular } from '../src/lib/types';

const jobs = serverDB.getPublicJobs().filter((j: any) => !j.id?.startsWith('draft-'));

console.log('Total Public Jobs:', jobs.length);

const sectorMatchers: Record<string, (j: JobCircular) => boolean> = {
  'govt': (j) => ['govt', 'railway', 'defense', 'teacher'].includes(j.category),
  'bank': (j) => j.category === 'bank' || j.title.includes('ব্যাংক') || j.organization.includes('ব্যাংক'),
  'private': (j) => ['private', 'ngo', 'company'].includes(j.category) || j.organization.includes('কোম্পানি') || j.organization.includes('লিমিটেড') || j.organization.includes('কর্পোরেশন'),
  'engineering': (j) => {
    const texts = [j.title || '', j.organization || '', j.eligibility || ''];
    if (j.positions) j.positions.forEach(p => texts.push(p.title || '', p.minEducation || ''));
    const str = texts.join(' ').toLowerCase();
    return j.category === 'engineer' || str.includes('প্রকৌশলী') || str.includes('ইঞ্জিনিয়ার') || str.includes('engineer') || str.includes('উপসহকারী') || str.includes('পুর') || str.includes('তড়িৎ') || str.includes('যান্ত্রিক');
  },
  'it': (j) => {
    const texts = [j.title || '', j.organization || '', j.eligibility || ''];
    if (j.positions) j.positions.forEach(p => texts.push(p.title || '', p.minEducation || ''));
    const str = texts.join(' ').toLowerCase();
    return str.includes('আইটি') || str.includes('কম্পিউটার') || str.includes('ডাটা') || str.includes('প্রোগ্রামার') || str.includes('সফটওয়্যার') || str.includes('মুদ্রাক্ষরিক');
  },
  'medical': (j) => {
    const texts = [j.title || '', j.organization || '', j.eligibility || ''];
    if (j.positions) j.positions.forEach(p => texts.push(p.title || '', p.minEducation || ''));
    const str = texts.join(' ').toLowerCase();
    return j.category === 'health' || str.includes('মেডিকেল') || str.includes('ডাক্তার') || str.includes('নার্স') || str.includes('ফার্মাসিস্ট') || str.includes('স্বাস্থ্য');
  },
  'teacher': (j) => {
    const texts = [j.title || '', j.organization || '', j.eligibility || ''];
    if (j.positions) j.positions.forEach(p => texts.push(p.title || '', p.minEducation || ''));
    const str = texts.join(' ').toLowerCase();
    return j.category === 'teacher' || str.includes('শিক্ষক') || str.includes('প্রভাষক') || str.includes('অধ্যাপক');
  },
  'tutoring': (j) => {
    const texts = [j.title || '', j.organization || '', j.eligibility || ''];
    if (j.positions) j.positions.forEach(p => texts.push(p.title || '', p.minEducation || ''));
    const str = texts.join(' ').toLowerCase();
    return j.category === 'teacher' || str.includes('শিক্ষক') || str.includes('টিউশন') || str.includes('টিউটর');
  },
  'ngo': (j) => {
    const texts = [j.title || '', j.organization || '', j.eligibility || ''];
    if (j.positions) j.positions.forEach(p => texts.push(p.title || ''));
    const str = texts.join(' ').toLowerCase();
    return j.category === 'ngo' || str.includes('এনজিও') || str.includes('ব্র্যাক') || str.includes('আশা') || str.includes('টিএমএসএস') || str.includes('গ্রামীণ ব্যাংক');
  },
  'accounting-finance': (j) => {
    const texts = [j.title || '', j.organization || '', j.eligibility || ''];
    if (j.positions) j.positions.forEach(p => texts.push(p.title || '', p.minEducation || ''));
    const str = texts.join(' ').toLowerCase();
    return str.includes('হিসাব') || str.includes('হিসাবরক্ষক') || str.includes('অডিটর') || str.includes('ক্যাশিয়ার') || str.includes('ফিন্যান্স') || str.includes('অর্থ') || str.includes('সঞ্চয়') || str.includes('ক্রেডিট চেকার');
  },
  'marketing': (j) => {
    const texts = [j.title || '', j.organization || '', j.eligibility || ''];
    if (j.positions) j.positions.forEach(p => texts.push(p.title || '', p.minEducation || ''));
    const str = texts.join(' ').toLowerCase();
    return str.includes('মার্কেটিং') || str.includes('সেলস') || str.includes('sales') || str.includes('marketing') || str.includes('ব্র্যান্ড') || str.includes('টেরিটরি') || str.includes('প্রচার') || str.includes('জনসংযোগ');
  },
  'international': (j) => {
    const texts = [j.title || '', j.organization || '', j.eligibility || '', j.districts || ''];
    if (j.positions) j.positions.forEach(p => texts.push(p.title || '', p.minEducation || ''));
    const str = texts.join(' ').toLowerCase();
    return j.category === 'international' || str.includes('প্রবাসী') || str.includes('বৈদেশিক') || str.includes('আন্তর্জাতিক') || str.includes('বোয়েসেল') || str.includes('boesl') || str.includes('ওভারসিজ') || str.includes('বিদেশ');
  }
};

for (const [key, fn] of Object.entries(sectorMatchers)) {
  const matches = jobs.filter(fn);
  console.log(`- ${key}: ${matches.length} circulars`);
}
