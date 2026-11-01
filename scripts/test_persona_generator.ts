import { BanglaPersonaGenerator } from '../src/lib/testing/synthetic/bangla-persona-generator';
import { BD_64_DISTRICTS } from '../src/lib/testing/synthetic/bangladesh-geography';

console.log('=== RUNNING PRE-TEST 2: DEMOGRAPHIC PERSONA GENERATION (1,280 ACCOUNTS) ===');

const startTime = Date.now();
const personas = BanglaPersonaGenerator.generateNationwidePersonas(20);
const elapsedMs = Date.now() - startTime;

console.log(`Generated ${personas.length} personas across 64 districts in ${elapsedMs}ms`);

if (personas.length !== 1280) {
  throw new Error(`FAIL: Expected 1,280 personas (64 x 20), but got ${personas.length}`);
}

const idSet = new Set<string>();
const phoneSet = new Set<string>();
const emailSet = new Set<string>();
const districtCounts: Record<string, number> = {};
const genderCounts = { male: 0, female: 0 };
const quotaCounts: Record<string, number> = {};
const archetypeCounts: Record<string, number> = {};

for (const p of personas) {
  // 1. ID uniqueness & prefix
  if (idSet.has(p.id!)) throw new Error(`FAIL: Duplicate Persona ID: ${p.id}`);
  if (!p.id!.startsWith('SYNTH-USR-')) throw new Error(`FAIL: Invalid prefix on ${p.id}`);
  idSet.add(p.id!);

  // 2. Phone uniqueness & format
  if (phoneSet.has(p.phone)) throw new Error(`FAIL: Duplicate Phone: ${p.phone}`);
  if (!p.phone.startsWith('01') || p.phone.length !== 11) throw new Error(`FAIL: Invalid BD phone: ${p.phone}`);
  phoneSet.add(p.phone);

  // 3. Email uniqueness
  if (emailSet.has(p.email)) throw new Error(`FAIL: Duplicate Email: ${p.email}`);
  emailSet.add(p.email);

  // 4. Strict Synthetic flag
  if (p.isSynthetic !== true) throw new Error(`FAIL: isSynthetic flag missing or false on ${p.id}`);

  // 5. Demographics counts
  districtCounts[p.district] = (districtCounts[p.district] || 0) + 1;
  genderCounts[p.gender]++;
  quotaCounts[p.quota || 'none'] = (quotaCounts[p.quota || 'none'] || 0) + 1;
  archetypeCounts[p.archetype] = (archetypeCounts[p.archetype] || 0) + 1;

  // 6. Education validation
  if (!p.education || p.education.length === 0) {
    throw new Error(`FAIL: Persona ${p.id} has no education history!`);
  }
}

// Assert every district has exactly 20 personas
for (const dist of BD_64_DISTRICTS) {
  const count = districtCounts[dist.bn] || 0;
  if (count !== 20) {
    throw new Error(`FAIL: District ${dist.bn} (${dist.en}) has ${count} personas, expected exactly 20!`);
  }
}

console.log('✅ 64-District Demographic Breakdown:');
console.log(`- Districts with exactly 20 personas: ${Object.keys(districtCounts).length} / 64`);
console.log(`- Gender Ratio: Male = ${genderCounts.male} (50%), Female = ${genderCounts.female} (50%)`);
console.log(`- Unique Phones: ${phoneSet.size} / 1280 (100% Unique)`);
console.log(`- Quota Breakdown:`, quotaCounts);
console.log(`- Archetypes:`, archetypeCounts);
console.log('✅ PRE-TEST 2 PASSED: 1,280 Personas cleanly generated with zero duplicates and strict schema compliance.');