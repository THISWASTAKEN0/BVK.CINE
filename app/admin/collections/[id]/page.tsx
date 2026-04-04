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

export default function CollectionDetailPage({ params }: Props) {
  const { id } = params;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setError('');
    const res = await fetch(`/api/collections/${id}`);
    if (!res.ok) {
      setError('Collection not found.');
      setLoading(false);
      return;
    }
    const { collection: col, photos: phs } = await res.json();
    setCollection(col);
    setPhotos(phs);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Edit collection metadata ──────────────────────────────────────────────
  const handleEdit = async (form: CollectionFormData) => {
    const res = await fetch(`/api/collections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) throw new Error('Failed to update collection');
    const updated: Collection = await res.json();
    setCollection((prev) => (prev ? { ...prev, ...updated } : updated));
  };

  // ── Upload: add photo to grid immediately ─────────────────────────────────
  const handleUploaded = (photo: Photo) => {
    setPhotos((prev) => [...prev, photo]);
  };

  // ── Photo drag-and-drop reorder ───────────────────────────────────────────
  const handleReorder = async (reordered: Photo[]) => {
    setPhotos(reordered);
    await Promise.all(
      reordered.map((p, i) =>
        fetch(`/api/photos/${p.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: i }),
        }).catch(() => {})
      )
    );
  };

  // ── Delete photo ──────────────────────────────────────────────────────────
  const handleDeletePhoto = async (photoId: string) => {
    // Optimistic remove
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    // If this was the cover, clear it optimistically
    if (collection?.cover_photo_id === photoId) {
      setCollection((prev) => prev ? { ...prev, cover_photo_id: null, cover_photo: null } : prev);
    }

    const res = await fetch(`/api/photos/${photoId}`, { method: 'DELETE' });
    if (!res.ok) {
      // Restore on failure
      fetchData();
    }
  };

  // ── Set cover photo ───────────────────────────────────────────────────────
  const handleSetCover = async (photoId: string) => {
    const photo = photos.find((p) => p.id === photoId);
    if (!photo) return;

    // Optimistic
    setCollection((prev) =>
      prev
        ? {
            ...prev,
            cover_photo_id: photoId,
            cover_photo: {
              id: photo.id,
              cloudinary_public_id: photo.cloudinary_public_id,
              cloudinary_url: photo.cloudinary_url,
            },
          }
        : prev
    );

    await fetch(`/api/collections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cover_photo_id: photoId }),
    }).catch(() => fetchData());
  };

  // ── Focal point ───────────────────────────────────────────────────────────
  const handleFocalPoint = async (position: string): Promise<boolean> => {
    setCollection((prev) => prev ? { ...prev, cover_photo_position: position } : prev);
    try {
      const res = await fetch(`/api/collections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cover_photo_position: position }),
      });
      if (!res.ok) throw new Error('Server error');
      return true;
    } catch {
      return false;
    }
  };

  // ── Toggle published ──────────────────────────────────────────────────────
  const handleTogglePublished = async () => {
    if (!collection) return;
    const newValue = !collection.is_published;
    setCollection((prev) => prev ? { ...prev, is_published: newValue } : prev);
    await fetch(`/api/collections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: newValue }),
    }).catch(() => fetchData());
  };

  if (loading) {
    return (
      <>
        <AdminNav />
        <main className="max-w-6xl mx-auto px-6 py-8 space-y-4">
          <div className="h-8 w-32 skeleton rounded-lg" />
          <div className="h-12 w-64 skeleton rounded-xl" />
          <div className="h-48 skeleton rounded-2xl" />
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
          <p className="text-destructive">{error || 'Collection not found.'}</p>
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
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-[28px] font-semibold text-text-primary tracking-tight truncate">
                {collection.name}
              </h1>
              <button
                onClick={() => setEditOpen(true)}
                className="p-2 rounded-lg text-text-secondary hover:bg-surface hover:text-text-primary transition-colors flex-shrink-0"
                aria-label="Edit collection"
              >
                <Pencil size={16} />
              </button>
            </div>

            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {collection.shoot_date && (
                <span className="flex items-center gap-1.5 text-[13px] text-text-secondary">
                  <Calendar size={12} />
                  {new Date(collection.shoot_date + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-[13px] text-text-secondary">
                <ImageIcon size={12} />
                {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
              </span>
              <button
                onClick={handleTogglePublished}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium transition-colors ${
                  collection.is_published
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-surface text-text-secondary hover:bg-[#e8e8ed]'
                }`}
              >
                {collection.is_published ? (
                  <>
                    <Eye size={11} />
                    Published
                  </>
                ) : (
                  <>
                    <EyeOff size={11} />
                    Draft
                  </>
                )}
              </button>
            </div>

            {collection.description && (
              <p className="text-[14px] text-text-secondary mt-3 max-w-xl leading-relaxed">
                {collection.description}
              </p>
            )}
          </div>
        </div>

        {/* Upload zone */}
        <section>
          <h2 className="text-[17px] font-semibold text-text-primary mb-4">
            Upload Photos
          </h2>
          <UploadZone collectionId={id} onUploaded={handleUploaded} />
        </section>

        {/* Focal point picker — only shown when a cover photo is set */}
        {collection.cover_photo && (
          <section>
            <h2 className="text-[17px] font-semibold text-text-primary mb-4">
              Cover Crop
            </h2>
            <div className="max-w-sm">
              <FocalPointPicker
                cloudinaryPublicId={collection.cover_photo.cloudinary_public_id}
                position={collection.cover_photo_position ?? '50% 50%'}
                onChange={handleFocalPoint}
              />
            </div>
          </section>
        )}

        {/* Photo grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-semibold text-text-primary">
              Photos
              {photos.length > 0 && (
                <span className="ml-2 text-[14px] font-normal text-text-secondary">
                  ({photos.length})
                </span>
              )}
            </h2>
            {photos.length > 0 && (
              <p className="text-[12px] text-text-secondary">
                Drag to reorder · ★ to set cover · ✕ to delete
              </p>
            )}
          </div>

          <SortablePhotoGrid
            photos={photos}
            coverPhotoId={collection.cover_photo_id}
            onReorder={handleReorder}
            onDelete={handleDeletePhoto}
            onSetCover={handleSetCover}
          />
        </section>
      </main>

      {/* Edit drawer */}
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
