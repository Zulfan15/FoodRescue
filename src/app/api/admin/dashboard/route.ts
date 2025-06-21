import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/services/adminService';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authPayload = verifyAuth(request);
    if (!authPayload || authPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const stats = await AdminService.getDashboardStats();

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
