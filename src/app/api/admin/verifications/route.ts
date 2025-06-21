import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/services/adminService';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authPayload = verifyAuth(request);
    if (!authPayload || authPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await AdminService.getPendingVerifications(page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Pending verifications fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending verifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authPayload = verifyAuth(request);
    if (!authPayload || authPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { donationId, isApproved } = body;

    if (!donationId || typeof isApproved !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const result = await AdminService.verifyDonation(donationId, isApproved);

    return NextResponse.json({
      message: isApproved ? 'Donation approved' : 'Donation rejected',
      donation: result,
    });
  } catch (error) {
    console.error('Donation verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify donation' },
      { status: 500 }
    );
  }
}
