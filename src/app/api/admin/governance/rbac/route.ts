import { NextResponse } from 'next/server';
import { 
  AdminGovernanceRbac, 
  ALL_PERMISSIONS, 
  ROLE_PERMISSIONS, 
  ROLE_METADATA 
} from '@/lib/governance';

export async function GET(req: Request) {
  const auth = AdminGovernanceRbac.authorizeRequest(req, 'roles.manage');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const staff = AdminGovernanceRbac.getStaffMembers();
    return NextResponse.json({
      success: true,
      staff,
      permissions: ALL_PERMISSIONS,
      rolePermissions: ROLE_PERMISSIONS,
      roleMetadata: ROLE_METADATA
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch staff & RBAC data' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = AdminGovernanceRbac.authorizeRequest(req, 'roles.manage');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, staffId, newRole } = body;

    if (!action || !staffId) {
      return NextResponse.json(
        { error: 'action and staffId are required' },
        { status: 400 }
      );
    }

    if (action === 'update_role') {
      if (!newRole) {
        return NextResponse.json({ error: 'newRole is required' }, { status: 400 });
      }
      const updated = AdminGovernanceRbac.updateStaffRole(staffId, newRole);
      if (!updated) {
        return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: 'স্টাফের পদবি সফলভাবে পরিবর্তন করা হয়েছে।',
        staff: updated
      });
    }

    if (action === 'toggle_status') {
      const updated = AdminGovernanceRbac.toggleStaffStatus(staffId);
      if (!updated) {
        return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: `স্টাফ অ্যাকাউন্টের স্ট্যাটাস ${updated.status === 'active' ? 'সক্রিয়' : 'স্থগিত'} করা হয়েছে।`,
        staff: updated
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process RBAC update' },
      { status: 500 }
    );
  }
}
