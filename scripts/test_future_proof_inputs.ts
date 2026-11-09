import { resolveCircularInput } from '../src/lib/collector/alljobs_smart_resolver';

async function testFutureProofing() {
  console.log('Testing Future-Proofing Inputs...\n');

  const testCases = [
    { name: 'Bangla Digits', input: '১৫১৭৬' },
    { name: 'Facebook Tracking URL', input: 'https://alljobs.teletalk.com.bd/jobs/government/15176?fbclid=IwAR09832948239048&utm_source=facebook' },
    { name: 'Embedded in Text Block', input: 'জরুরি নিয়োগ বিজ্ঞপ্তি! দেখুন https://alljobs.teletalk.com.bd/jobs/all/14989 আবেদনের লিংক' },
    { name: 'Direct Org Name (পেট্রোবাংলা)', input: 'পেট্রোবাংলা' },
    { name: 'Direct Org Name (BCIC)', input: 'BCIC' }
  ];

  for (const tc of testCases) {
    try {
      const res = await resolveCircularInput(tc.input);
      console.log(`✅ [${tc.name}] => Org: "${res.organization}", Posts: ${res.totalPosts}, Positions: ${res.positions.length}`);
    } catch (e: any) {
      console.log(`❌ [${tc.name}] => Error: ${e.message}`);
    }
  }
}

testFutureProofing().catch(console.error);

