const GeminiProvider = require('../core/GeminiProvider');

async function runMilestone9Tests() {
  console.log('--- STARTING MILESTONE 9 VERIFICATION ---');
  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${message}`);
      failCount++;
    }
  }

  const provider = new GeminiProvider();

  // Test 1: Configuration Detection
  assert(provider.isConfigured() === true, 'GeminiProvider detected configured API key from .env.local');

  // Test 2: Live API Connectivity Verification
  console.log('[INFO] Verifying live connection to Google Gemini API...');
  const conn = await provider.verifyConnectivity();
  assert(conn.connected === true, `Successfully connected to Google Gemini API (found ${conn.modelsCount} models)`);
  assert(Array.isArray(conn.availableModels) && conn.availableModels.length > 0, `Available models retrieved: ${conn.availableModels.slice(0, 3).join(', ')}`);

  // Test 3: Structured Defect Analysis
  const sampleDefect = {
    category: 'ENCODING',
    description: 'Bengali text in admin interface rendered as ????? due to ANSI write',
    file: 'src/app/admin/page.tsx',
    evidence: '653 occurrences of ??? in page.tsx',
    severity: 'HIGH'
  };

  const result = await provider.analyzeDefectAndProposeFix(sampleDefect);
  assert(result.modelConnected === true, 'Defect analysis performed with live model connectivity');
  assert(result.analysis && typeof result.analysis === 'object', 'Received valid structured JSON analysis object');
  assert(typeof result.analysis.rootCauseAnalysis === 'string', 'Analysis includes rootCauseAnalysis string');
  assert(typeof result.analysis.proposedPatchStrategy === 'string', 'Analysis includes proposedPatchStrategy string');
  console.log('[ANALYSIS OUTPUT]:', JSON.stringify(result.analysis, null, 2));

  // Test 4: Deterministic Fallback Verification
  const unconfiguredProvider = new GeminiProvider({ apiKey: '' });
  assert(unconfiguredProvider.isConfigured() === false, 'Unconfigured provider correctly identifies missing key');
  const fallbackResult = await unconfiguredProvider.analyzeDefectAndProposeFix(sampleDefect);
  assert(fallbackResult.source === 'DETERMINISTIC_FALLBACK', 'System safely fell back to deterministic rule engine without crashing');
  assert(fallbackResult.analysis.riskLevel !== undefined, 'Fallback provided complete risk assessment');

  console.log(`--- MILESTONE 9 COMPLETE: ${passCount} PASSED, ${failCount} FAILED ---`);
  if (failCount > 0) process.exit(1);
}

runMilestone9Tests();
