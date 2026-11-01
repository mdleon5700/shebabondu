import { BD_64_DISTRICTS, getAllDistricts, getDistrictsByDivision } from '../src/lib/testing/synthetic/bangladesh-geography';

console.log('=== RUNNING PRE-TEST 1: 64-DISTRICT GEOGRAPHY ENGINE ===');

const all = getAllDistricts();
console.log('Total Districts Count:', all.length);

if (all.length !== 64) {
  throw new Error(`FAIL: Expected 64 districts, found ${all.length}`);
}

// Assert unique IDs, EN, BN
const ids = new Set<string>();
const ens = new Set<string>();
const bns = new Set<string>();

const divisions = ['DHAKA', 'CHATTOGRAM', 'RAJSHAHI', 'KHULNA', 'BARISHAL', 'SYLHET', 'RANGPUR', 'MYMENSINGH'];
const divCounts: Record<string, number> = {};

for (const d of all) {
  if (ids.has(d.id)) throw new Error(`FAIL: Duplicate district ID: ${d.id}`);
  if (ens.has(d.en)) throw new Error(`FAIL: Duplicate district EN: ${d.en}`);
  if (bns.has(d.bn)) throw new Error(`FAIL: Duplicate district BN: ${d.bn}`);
  ids.add(d.id);
  ens.add(d.en);
  bns.add(d.bn);

  if (!d.upazilas || d.upazilas.length === 0) {
    throw new Error(`FAIL: District ${d.en} has no upazilas!`);
  }

  divCounts[d.divisionEn] = (divCounts[d.divisionEn] || 0) + 1;
}

console.log('Districts per division breakdown:');
for (const div of divisions) {
  const count = divCounts[div] || 0;
  console.log(`- ${div}: ${count} districts`);
  if (count === 0) throw new Error(`FAIL: Division ${div} has 0 districts!`);
}

console.log('✅ PRE-TEST 1 PASSED: All 64 Districts cleanly verified with zero duplicates and non-empty upazilas.');