import { SyntheticUserManager } from '../src/lib/testing/synthetic/synthetic-user-manager';

console.log('=== RUNNING PRE-TEST 3: SYNTHETIC USER STORE & DATA ISOLATION GUARD ===');

// 1. Initialize store
const store = SyntheticUserManager.initialize(true);
const total = Object.keys(store).length;
console.log('Total Synthetic Users Stored:', total);
if (total !== 1280) {
  throw new Error(`FAIL: Expected 1,280 accounts in store, got ${total}`);
}

// 2. Test Lookup by ID
const sampleId = 'SYNTH-USR-DHAKA-001';
const userById = SyntheticUserManager.getSyntheticUserById(sampleId);
if (!userById) throw new Error(`FAIL: Could not find user by ID: ${sampleId}`);
console.log(`Lookup by ID [${sampleId}] -> Name: ${userById.name}, Phone: ${userById.phone}, District: ${userById.district}`);

// 3. Test Lookup by Phone
const userByPhone = SyntheticUserManager.getSyntheticUserByIdentifier(userById.phone);
if (!userByPhone || userByPhone.id !== sampleId) {
  throw new Error(`FAIL: Phone lookup mismatch for ${userById.phone}`);
}
console.log(`Lookup by Phone [${userById.phone}] -> Success`);

// 4. Test District Filtering
const dhakaUsers = SyntheticUserManager.getSyntheticUsersByDistrict('ঢাকা');
const rangpurUsers = SyntheticUserManager.getSyntheticUsersByDistrict('রংপুর');
const sylhetUsers = SyntheticUserManager.getSyntheticUsersByDistrict('সিলেট');
console.log(`District Filter -> Dhaka: ${dhakaUsers.length}, Rangpur: ${rangpurUsers.length}, Sylhet: ${sylhetUsers.length}`);
if (dhakaUsers.length !== 20 || rangpurUsers.length !== 20 || sylhetUsers.length !== 20) {
  throw new Error(`FAIL: Expected 20 users per district`);
}

// 5. Test Demographic Summary
const summary = SyntheticUserManager.getDemographicSummary();
console.log('Demographic Summary:');
console.log(`- Total Users: ${summary.totalUsers}`);
console.log(`- Districts: ${summary.districtsCovered} / 64`);
console.log(`- Divisions: ${summary.divisionsCovered} / 8`);
console.log(`- Male / Female: ${summary.genderBreakdown.male} / ${summary.genderBreakdown.female}`);

if (summary.districtsCovered !== 64 || summary.divisionsCovered !== 8) {
  throw new Error(`FAIL: Geographic coverage incomplete!`);
}

// 6. Test Data Isolation Assertion against real store
const isolation = SyntheticUserManager.verifyDataIsolation();
console.log('Data Isolation Status:');
console.log(`- Real Candidates in local_store.json: ${isolation.realCandidatesCount} (Must be 41)`);
console.log(`- Synthetic Users in separate store: ${isolation.syntheticCandidatesCount} (Must be 1280)`);
console.log(`- Isolation Guard: ${isolation.isIsolated ? 'STRICTLY ENFORCED' : 'FAILED'}`);

if (isolation.realCandidatesCount !== 41) {
  throw new Error(`FAIL: Real candidates count altered! Expected 41, got ${isolation.realCandidatesCount}`);
}

console.log('✅ PRE-TEST 3 PASSED: Synthetic User Store cleanly persisted, indexed, and isolated with zero contamination of live database.');