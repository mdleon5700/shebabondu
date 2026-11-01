import fs from 'fs';
import path from 'path';
import { TestRunRecord } from './types';

export class TestReportingModule {
  static formatMarkdown(run: TestRunRecord): string {
    const s = run.summary;
    let md = `# CHAKRI SHEBA AUTONOMOUS SPIDER AUDIT REPORT\n`;
    md += `**Test Run ID**: \`${run.runId}\`  \n`;
    md += `**Environment**: \`${run.config.environment}\`  \n`;
    md += `**Browser**: \`${run.config.browser}\` (\`${run.config.viewport.width}x${run.config.viewport.height}\`)  \n`;
    md += `**Execution Time**: ${run.startTime} to ${run.endTime || 'IN_PROGRESS'} (${run.totalDurationMs || 0}ms)  \n\n`;

    md += `## 1. Executive Summary\n\n`;
    md += `| Total Scenarios | Passed | Failed | Blocked | Pass Rate | Browser Errors |\n`;
    md += `|:---:|:---:|:---:|:---:|:---:|:---:|\n`;
    md += `| **${s.total}** | **${s.passed}** | **${s.failed}** | **${s.blocked}** | **${s.passRate.toFixed(1)}%** | **${s.totalErrors}** |\n\n`;

    md += `## 2. Baseline Scenario Details\n\n`;
    md += `| Scenario ID | Name | Category | Status | Duration | Evidence |\n`;
    md += `|---|---|---|:---:|:---:|:---:|\n`;
    for (const sc of run.scenarios) {
      const badge = sc.status === 'PASS' ? '✅ PASS' : sc.status === 'FAIL' ? '❌ FAIL' : '⚠️ ' + sc.status;
      const ev = sc.screenshotRef ? `[Screenshot](${sc.screenshotRef})` : 'N/A';
      md += `| \`${sc.scenarioId}\` | ${sc.name} | \`${sc.category}\` | ${badge} | ${sc.durationMs || 0}ms | ${ev} |\n`;
    }

    md += `\n## 3. Assertions & Action Log\n\n`;
    for (const sc of run.scenarios) {
      md += `### ${sc.scenarioId}: ${sc.name}\n`;
      md += `- **Status**: ${sc.status}\n`;
      md += `- **Actions**:\n`;
      sc.actionsPerformed.forEach(a => md += `  - ${a}\n`);
      md += `- **Assertions**:\n`;
      sc.assertions.forEach(a => {
        md += `  - [${a.passed ? 'X' : ' '}] ${a.assertion} (Expected: \`${a.expected}\`, Actual: \`${a.actual}\`)\n`;
      });
      if (sc.errors.length > 0) {
        md += `- **Errors**:\n`;
        sc.errors.forEach(e => md += `  - \`${e.type}\`: ${e.message}\n`);
      }
      md += `\n`;
    }

    return md;
  }

  static saveReport(run: TestRunRecord): { jsonPath: string; mdPath: string } {
    const dir = path.join(process.cwd(), 'test-evidence', run.runId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const jsonPath = path.join(dir, 'report.json');
    const mdPath = path.join(dir, 'report.md');

    fs.writeFileSync(jsonPath, JSON.stringify(run, null, 2), 'utf8');
    fs.writeFileSync(mdPath, this.formatMarkdown(run), 'utf8');

    return { jsonPath, mdPath };
  }
}