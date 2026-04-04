import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { cloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'portrait';

    // Sign with only { timestamp, folder } — matches the working photo upload pattern exactly
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      api_key: process.env.CLOUDINARY_API_KEY!,
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    });
  } catch (err) {
    console.error('[sign-portrait]', err);
    return NextResponse.json({ error: 'Failed to sign upload' }, { status: 500 });
  }
}
