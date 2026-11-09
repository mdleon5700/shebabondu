import { serverDB } from '../src/lib/db';
import { JobCircular } from '../src/lib/types';

const jobs = serverDB.getPublicJobs();

function testIsJobFeatured(job: JobCircular) {
  if (job.featured === true) return { isFeatured: true, priority: 85, reason: 'admin_featured' };
  if (job.isHot === true) return { isFeatured: true, priority: 75, reason: 'admin_hot' };
  
  // High vacancy criteria (>= 30 posts)
  const posts = job.totalPosts || 0;
  if (posts >= 30) {
    const priority = 50 + Math.min(20, Math.floor(posts / 10));
    return { isFeatured: true, priority, reason: `high_vacancy_${posts}` };
  }

  // A-grade / 9th-10th grade in govt/autonomous (posts >= 5)
  const isOfficerGrade = job.grade?.includes('৯ম') || job.grade?.includes('১০ম') || job.grade?.includes('১ম') || job.grade?.includes('২য়');
  const isGovtOrCorp = ['govt', 'company', 'defense', 'bank'].includes(job.category);
  if (isGovtOrCorp && isOfficerGrade && posts >= 5) {
    const priority = 50 + (job.grade?.includes('৯ম') ? 10 : 5);
    return { isFeatured: true, priority, reason: `officer_grade_${job.grade}_posts_${posts}` };
  }

  return { isFeatured: false, priority: 0 };
}

const featuredList = jobs.map(j => ({ job: j, ...testIsJobFeatured(j) })).filter(x => x.isFeatured);
console.log('Total curated featured jobs:', featuredList.length);

featuredList.sort((a, b) => b.priority - a.priority);

console.log('\nTop 10 Curated Featured Jobs:');
featuredList.slice(0, 10).forEach(x => {
  console.log(`[Priority: ${x.priority}] (${x.reason}) ${x.job.title} | ${x.job.organization} | Posts: ${x.job.totalPosts} | Grade: ${x.job.grade}`);
});

