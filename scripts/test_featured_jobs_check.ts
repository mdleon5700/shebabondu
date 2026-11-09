import { serverDB } from '../src/lib/db';
import { FeaturedManager } from '../src/lib/feeds/featured';

const jobs = serverDB.getPublicJobs();
const placements = serverDB.getFeaturedPlacements();

console.log('Total public jobs:', jobs.length);
console.log('Total placements in DB:', placements.length);

const featuredByProp = jobs.filter(j => j.featured === true);
const hotByProp = jobs.filter(j => j.isHot === true);
const featuredByManager = jobs.filter(j => FeaturedManager.isJobFeatured(j, placements).isFeatured);

console.log('Jobs with j.featured === true:', featuredByProp.length);
console.log('Jobs with j.isHot === true:', hotByProp.length);
console.log('Jobs considered featured by FeaturedManager:', featuredByManager.length);

if (featuredByManager.length > 0) {
  console.log('Sample featured jobs:');
  featuredByManager.slice(0, 5).forEach(j => {
    console.log(`- ${j.title} (${j.organization}) [posts: ${j.totalPosts}, grade: ${j.grade}]`);
  });
}

