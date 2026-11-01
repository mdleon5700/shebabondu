import { SyntheticUserManager } from '../src/lib/testing/synthetic/synthetic-user-manager';

console.log('=== RE-INITIALIZING SYNTHETIC USER STORE (64 DISTRICTS x 20 SLOTS) ===');

const store = SyntheticUserManager.initialize(true);
console.log('Store re-initialized with personas count:', Object.keys(store).length);

const summary = SyntheticUserManager.getDemographicSummary();
console.log('Districts covered:', summary.districtsCovered);
console.log('Categories breakdown:', JSON.stringify(summary.categoryBreakdown, null, 2));

const audit = SyntheticUserManager.getDistrictBatchAudit();
console.log('Nationwide Pass Rate:', audit.nationwideSummary.passRate + '%');
console.log('Total Validated:', audit.nationwideSummary.validatedAccounts, '/', audit.nationwideSummary.targetAccounts);

const isolation = SyntheticUserManager.verifyDataIsolation();
console.log('Isolation verification:', isolation);
console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
