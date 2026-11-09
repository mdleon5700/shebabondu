import { serverDB } from '../src/lib/db';
import { CentralDeadlineEngine } from '../src/lib/deadlines/engine';
import { BangladeshDateHelper } from '../src/lib/feeds/timezone';

const jobs = serverDB.getPublicJobs();
console.log('Total jobs:', jobs.length);

const todayInfo = BangladeshDateHelper.getBangladeshTodayDate();
console.log('Today in Bangladesh:', todayInfo.isoDate, todayInfo.dateBn);

const closingToday = [];
const closingSoon = [];

for (const job of jobs) {
  const evalResult = CentralDeadlineEngine.evaluateDeadline(job);
  if (evalResult.isClosingToday && !evalResult.isClosed) {
    closingToday.push({ job, evalResult });
  }
  if (evalResult.daysRemaining >= 0 && evalResult.daysRemaining <= 3 && !evalResult.isClosed) {
    closingSoon.push({ job, evalResult });
  }
}

console.log('Closing today count:', closingToday.length);
console.log('Closing soon (0-3 days) count:', closingSoon.length);

const sortedByDays = [...jobs].map(j => ({ j, ev: CentralDeadlineEngine.evaluateDeadline(j) }))
  .sort((a, b) => (a.ev.daysRemaining ?? 999) - (b.ev.daysRemaining ?? 999));

console.log('\nTop 5 shortest deadlines:');
sortedByDays.slice(0, 5).forEach(x => {
  console.log(`- [${x.ev.daysRemaining} days remaining] ${x.j.title} | Deadline: ${x.j.deadline} | Status: ${x.ev.status}`);
});

