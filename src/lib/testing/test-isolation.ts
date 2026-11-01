import { SyntheticIdentity } from './types';

export class TestDataIsolation {
  private static SYNTHETIC_PREFIX = 'SYNTH-';
  private static TEST_PHONE_PREFIX = '01799'; // reserved mock testing prefix

  static generateSyntheticIdentity(runId: string, district = 'DHAKA', division = 'DHAKA'): SyntheticIdentity {
    const entropy = Math.random().toString(36).substring(2, 7);
    const ts = Date.now().toString().slice(-4);
    return {
      id: `${this.SYNTHETIC_PREFIX}USR-${Date.now().toString(36)}-${entropy}`,
      name: `Synthetic Tester ${entropy.toUpperCase()}`,
      phone: `${this.TEST_PHONE_PREFIX}${ts}${Math.floor(10 + Math.random() * 90)}`,
      email: `synth.test.${entropy}@chakrisheba.local`,
      district,
      division,
      isSynthetic: true,
      testRunId: runId,
      createdAt: new Date().toISOString()
    };
  }

  static isSyntheticRecord(record: any): boolean {
    if (!record) return false;
    if (record.isSynthetic === true) return true;
    if (typeof record.id === 'string' && record.id.startsWith(this.SYNTHETIC_PREFIX)) return true;
    if (typeof record.phone === 'string' && record.phone.startsWith(this.TEST_PHONE_PREFIX)) return true;
    return false;
  }

  static assertSafeForTestOperation(targetId: string): void {
    if (!targetId.startsWith(this.SYNTHETIC_PREFIX)) {
      throw new Error(`SECURITY ALERT: Attempted test operation on non-synthetic account: ${targetId}. Operation blocked.`);
    }
  }
}