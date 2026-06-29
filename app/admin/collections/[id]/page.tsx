'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Pencil, Calendar, ImageIcon, Eye, EyeOff } from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';
import UploadZone from '@/components/admin/UploadZone';
import SortablePhotoGrid from '@/components/admin/SortablePhotoGrid';
import CollectionForm from '@/components/admin/CollectionForm';
import FocalPointPicker from '@/components/admin/FocalPointPicker';
import type { Collection, CollectionFormData, Photo } from '@/lib/types';

type Props = { params: { id: string } };

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-[16px] font-semibold text-text-primary">{title}</h2>
        {subtitle && <p className="text-[13px] text-text-secondary mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export default function CollectionDetailPage({ params }: Props) {
  const { id } = params;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [photos, setPhotos]         = useState<Photo[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [editOpen, setEditOpen]     = useState(false);

  const fetchData = useCallback(async () => {
    setError('');
    const res = await fetch(`/api/collections/${id}`);
    if (!res.ok) { setError('Collection not found.'); setLoading(false); return; }
    const { collection: col, photos: phs } = await res.json();
    setCollection(col);
    setPhotos(phs);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleEdit = async (form: CollectionFormData) => {
    const res = await fetch(`/api/collections/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    if (!res.ok) throw new Error('Failed to update collection');
    const updated: Collection = await res.json();
    setCollection((prev) => (prev ? { ...prev, ...updated } : updated));
  };

  const handleUploaded = (photo: Photo) => setPhotos((prev) => [...prev, photo]);

  const handleReorder = async (reordered: Photo[]) => {
    setPhotos(reordered);
    await Promise.all(
      reordered.map((p, i) =>
        fetch(`/api/photos/${p.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: i }),
        }).catch(() => {})
      )
    );
  };

  const handleDeletePhoto = async (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    if (collection?.cover_photo_id === photoId)
      setCollection((prev) => prev ? { ...prev, cover_photo_id: null, cover_photo: null } : prev);
    if (collection?.hover_photo_id === photoId)
      setCollection((prev) => prev ? { ...prev, hover_photo_id: null, hover_photo: null } : prev);
    const res = await fetch(`/api/photos/${photoId}`, { method: 'DELETE' });
    if (!res.ok) fetchData();
  };

  const handleSetHoverPhoto = async (photoId: string) => {
    const photo = photos.find((p) => p.id === photoId);
    if (!photo) return;
    setCollection((prev) =>
      prev ? { ...prev, hover_photo_id: photoId, hover_photo: { id: photo.id, cloudinary_public_id: photo.cloudinary_public_id, cloudinary_url: photo.cloudinary_url } } : prev
    );
    await fetch(`/api/collections/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hover_photo_id: photoId }),
    }).catch(() => fetchData());
  };

  const handleHoverFocalPoint = async (position: string): Promise<boolean> => {
    setCollection((prev) => prev ? { ...prev, hover_photo_position: position } : prev);
    try {
      const res = await fetch(`/api/collections/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hover_photo_position: position }),
      });
      if (!res.ok) throw new Error();
      return true;
    } catch { return false; }
  };

  const handleSetCover = async (photoId: string) => {
    const photo = photos.find((p) => p.id === photoId);
    if (!photo) return;
    setCollection((prev) =>
      prev ? { ...prev, cover_photo_id: photoId, cover_photo: { id: photo.id, cloudinary_public_id: photo.cloudinary_public_id, cloudinary_url: photo.cloudinary_url } } : prev
    );
    await fetch(`/api/collections/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cover_photo_id: photoId }),
    }).catch(() => fetchData());
  };

  const handleFocalPoint = async (position: string): Promise<boolean> => {
    setCollection((prev) => prev ? { ...prev, cover_photo_position: position } : prev);
    try {
      const res = await fetch(`/api/collections/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cover_photo_position: position }),
      });
      if (!res.ok) throw new Error();
      return true;
    } catch { return false; }
  };

  const handleTogglePublished = async () => {
    if (!collection) return;
    const newValue = !collection.is_published;
    setCollection((prev) => prev ? { ...prev, is_published: newValue } : prev);
    await fetch(`/api/collections/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: newValue }),
    }).catch(() => fetchData());
  };

  if (loading) {
    return (
      <>
        <AdminNav />
        <main className="max-w-6xl mx-auto px-6 py-8 space-y-4">
          <div className="h-6 w-28 skeleton rounded-lg" />
          <div className="h-10 w-64 skeleton rounded-xl" />
          <div className="h-40 skeleton rounded-2xl" />
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square skeleton rounded-xl" />
            ))}
          </div>
        </main>
      </>
    );
  }

  if (error || !collection) {
    return (
      <>
        <AdminNav />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <p style={{ color: 'var(--destructive)' }}>{error || 'Collection not found.'}</p>
          <Link href="/admin/dashboard" className="text-accent text-sm mt-4 inline-block">
            ← Back to dashboard
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminNav />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Back */}
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-text-primary transition-colors group"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          All Collections
        </Link>

        {/* Page header */}
        <div
          className="rounded-2xl px-6 py-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5">
                <h1 className="text-[24px] font-semibold text-text-primary tracking-tight truncate">
                  {collection.name}
                </h1>
                <button
                  onClick={() => setEditOpen(true)}
                  className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors flex-shrink-0"
                  aria-label="Edit collection"
                >
                  <Pencil size={14} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                {collection.shoot_date && (
                  <span className="flex items-center gap-1.5 text-[13px] text-text-secondary">
                    <Calendar size={12} />
                    {new Date(collection.shoot_date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-[13px] text-text-secondary">
                  <ImageIcon size={12} />
                  {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
                </span>
                <button
                  onClick={handleTogglePublished}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium transition-colors"
                  style={
                    collection.is_published
                      ? { background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }
                      : { background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                  }
                >
                  {collection.is_published ? <><Eye size={11} /> Published</> : <><EyeOff size={11} /> Draft</>}
                </button>
              </div>

              {collection.description && (
                <p className="text-[14px] text-text-secondary mt-3 max-w-xl leading-relaxed">
                  {collection.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Upload */}
        <Section title="Upload Photos">
          <UploadZone collectionId={id} onUploaded={handleUploaded} />
        </Section>

        {/* Cover focal point */}
        {collection.cover_photo && (
          <Section title="Cover Crop">
            <div className="max-w-sm">
              <FocalPointPicker
                cloudinaryPublicId={collection.cover_photo.cloudinary_public_id}
                position={collection.cover_photo_position ?? '50% 50%'}
                onChange={handleFocalPoint}
              />
            </div>
          </Section>
        )}

        {/* Hover focal point */}
        {collection.hover_photo && (
          <Section title="Hover Photo Frame" subtitle="Drag to set the focal point for the hover reveal.">
            <div className="max-w-sm">
              <FocalPointPicker
                cloudinaryPublicId={collection.hover_photo.cloudinary_public_id}
                position={collection.hover_photo_position ?? '50% 50%'}
                onChange={handleHoverFocalPoint}
              />
            </div>
          </Section>
        )}

        {/* Photo grid */}
        <Section
          title={`Photos${photos.length > 0 ? ` (${photos.length})` : ''}`}
          subtitle={photos.length > 0 ? 'Drag to reorder · ★ cover · ⊞ hover · ✕ delete' : undefined}
        >
          <SortablePhotoGrid
            photos={photos}
            coverPhotoId={collection.cover_photo_id}
            hoverPhotoId={collection.hover_photo_id}
            onReorder={handleReorder}
            onDelete={handleDeletePhoto}
            onSetCover={handleSetCover}
            onSetHoverPhoto={handleSetHoverPhoto}
          />
        </Section>
      </main>

      <CollectionForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleEdit}
        initial={collection}
        title="Edit Collection"
      />
    </>
  );
}
