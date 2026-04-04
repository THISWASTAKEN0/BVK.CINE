import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { isAuthenticated } from '@/lib/auth';
import { cloudinary } from '@/lib/cloudinary';

type Params = { params: { id: string } };

// GET /api/collections/[id] — fetch one collection + its photos
export async function GET(request: NextRequest, { params }: Params) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const admin = createAdminClient();

    const [{ data: collection, error: colErr }, { data: photos, error: photoErr }] =
      await Promise.all([
        admin.from('collections').select('*').eq('id', params.id).single(),
        admin
          .from('photos')
          .select('*')
          .eq('collection_id', params.id)
          .order('display_order', { ascending: true }),
      ]);

    if (colErr || !collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }
    if (photoErr) throw photoErr;

    // Attach cover_photo object if cover_photo_id is set
    let cover_photo = null;
    if (collection.cover_photo_id) {
      const found = (photos ?? []).find((p) => p.id === collection.cover_photo_id);
      if (found) {
        cover_photo = {
          id: found.id,
          cloudinary_public_id: found.cloudinary_public_id,
          cloudinary_url: found.cloudinary_url,
        };
      }
    }

    return NextResponse.json({
      collection: { ...collection, cover_photo },
      photos: photos ?? [],
    });
  } catch (err) {
    console.error('[collections GET/:id]', err);
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const admin = createAdminClient();

    const update: Record<string, unknown> = {};
    if ('name' in body) update.name = body.name?.trim();
    if ('description' in body) update.description = body.description?.trim() || null;
    if ('shoot_date' in body) update.shoot_date = body.shoot_date || null;
    if ('is_published' in body) update.is_published = body.is_published;
    if ('cover_photo_id' in body) update.cover_photo_id = body.cover_photo_id || null;
    if ('cover_photo_position' in body) update.cover_photo_position = body.cover_photo_position || '50% 50%';
    if ('display_order' in body) update.display_order = body.display_order;

    const { data, error } = await admin
      .from('collections')
      .update(update)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    console.error('[collections PATCH]', err);
    return NextResponse.json(
      { error: 'Failed to update collection' },
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

    const { data: photos, error: fetchErr } = await admin
      .from('photos')
      .select('cloudinary_public_id')
      .eq('collection_id', params.id);

    if (fetchErr) throw fetchErr;

    if (photos && photos.length > 0) {
      const ids = photos.map((p) => p.cloudinary_public_id);
      for (let i = 0; i < ids.length; i += 100) {
        await cloudinary.api
          .delete_resources(ids.slice(i, i + 100))
          .catch((e) => console.warn('[cloudinary batch delete]', e));
      }
      await cloudinary.api.delete_folder(`collections/${params.id}`).catch(() => {});
    }

    const { error: deleteErr } = await admin
      .from('collections')
      .delete()
      .eq('id', params.id);

    if (deleteErr) throw deleteErr;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[collections DELETE]', err);
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
}
