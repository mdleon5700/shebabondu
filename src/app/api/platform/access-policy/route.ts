import { NextResponse } from 'next/server';
import { FreeAccessPolicyEngine } from '@/lib/operations';

export async function GET() {
  try {
    const policy = FreeAccessPolicyEngine.getPolicy();
    const audit = FreeAccessPolicyEngine.auditPaywalls();

    return NextResponse.json({
      success: true,
      policy,
      audit
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to resolve access policy' },
      { status: 500 }
    );
  }
}
