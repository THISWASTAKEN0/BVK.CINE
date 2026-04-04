import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { isAuthenticated } from '@/lib/auth';
import { cloudinary } from '@/lib/cloudinary';

type Params = { params: { id: string } };

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const admin = createAdminClient();

    const update: Record<string, unknown> = {};
    if ('display_order' in body) update.display_order = body.display_order;

    const { data, error } = await admin
      .from('photos')
      .update(update)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    console.error('[photos PATCH]', err);
    return NextResponse.json(
      { error: 'Failed to update photo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const admin = createAdminClient();

    const { data: photo, error: fetchErr } = await admin
      .from('photos')
      .select('cloudinary_public_id, collection_id')
      .eq('id', params.id)
      .single();

    if (fetchErr || !photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    const result = await cloudinary.uploader.destroy(photo.cloudinary_public_id);
    if (result.result !== 'ok' && result.result !== 'not found') {
      console.warn('[cloudinary photo delete]', result);
    }

    const { error: deleteErr } = await admin
      .from('photos')
      .delete()
      .eq('id', params.id);

    if (deleteErr) throw deleteErr;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[photos DELETE]', err);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}
