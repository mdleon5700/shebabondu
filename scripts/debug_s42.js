const { SyntheticUserManager } = require('../src/lib/testing/synthetic/synthetic-user-manager');

try {
  const audits = SyntheticUserManager.getDistrictBatchAudit();
  console.log('Total district summaries:', audits.districtSummary.length);
  const sample = audits.districtSummary[0];
  console.log('Sample district:', sample);
  for (const d of audits.districtSummary) {
    if (!d.districtBn) {
      console.log('Missing districtBn for:', d);
    }
    const users = SyntheticUserManager.getSyntheticUsersByDistrict(d.districtBn);
  }
  console.log('All districts queried successfully');
} catch (e) {
  console.error('Error caught:', e);
}
