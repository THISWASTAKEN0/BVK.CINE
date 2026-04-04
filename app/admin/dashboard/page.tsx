'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';
import SortableCollectionList from '@/components/admin/SortableCollectionList';
import CollectionForm from '@/components/admin/CollectionForm';
import PortraitUpload from '@/components/admin/PortraitUpload';
import type { Collection, CollectionFormData } from '@/lib/types';

type CollectionWithCount = Collection & { photo_count: number };

export default function DashboardPage() {
  const [collections, setCollections] = useState<CollectionWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Collection | null>(null);
  const [portraitUrl, setPortraitUrl] = useState('');

  const fetchCollections = useCallback(async () => {
    setError('');
    const res = await fetch('/api/collections');
    if (!res.ok) {
      setError('Failed to load collections. Please refresh.');
      setLoading(false);
      return;
    }
    const data: CollectionWithCount[] = await res.json();
    setCollections(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCollections();
    fetch('/api/settings')
      .then((r) => r.json())
      .then((s) => setPortraitUrl(s.portrait_url ?? ''))
      .catch(() => {});
  }, [fetchCollections]);

  // ── Create ───────────────────────────────────────────────────────────────────
  const handleCreate = async (form: CollectionFormData) => {
    const res = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) throw new Error('Failed to create collection');
    const created: Collection = await res.json();
    setCollections((prev) => [...prev, { ...created, photo_count: 0 }]);
  };

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const handleEdit = async (form: CollectionFormData) => {
    if (!editTarget) return;
    const res = await fetch(`/api/collections/${editTarget.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) throw new Error('Failed to update collection');
    const updated: Collection = await res.json();
    setCollections((prev) =>
      prev.map((c) =>
        c.id === updated.id ? { ...c, ...updated } : c
      )
    );
  };

  // ── Toggle published ─────────────────────────────────────────────────────────
  const handleTogglePublished = async (id: string, value: boolean) => {
    // Optimistic update
    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_published: value } : c))
    );
    await fetch(`/api/collections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: value }),
    }).catch(() => {
      // Revert on failure
      setCollections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_published: !value } : c))
      );
    });
  };

  // ── Reorder ──────────────────────────────────────────────────────────────────
  const handleReorder = async (reordered: CollectionWithCount[]) => {
    setCollections(reordered); // optimistic
    // Persist new display_order for every item
    await Promise.all(
      reordered.map((col, i) =>
        fetch(`/api/collections/${col.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: i }),
        })
      )
    );
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    // Optimistic remove
    setCollections((prev) => prev.filter((c) => c.id !== id));
    const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      // Restore on failure
      fetchCollections();
    }
  };

  return (
    <>
      <AdminNav />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {/* ── Profile portrait ──────────────────────────── */}
        <section>
          <h2 className="text-[17px] font-semibold text-text-primary mb-1">Profile Portrait</h2>
          <p className="text-[13px] text-text-secondary mb-5">
            Shown in the About section of your public portfolio.
          </p>
          <PortraitUpload
            currentUrl={portraitUrl}
            onSaved={(url) => setPortraitUrl(url)}
          />
        </section>

        <div className="border-t border-black/6" />

        {/* ── Collections header ────────────────────────── */}
        <div>
        <div className="flex items-center justify-between mb-7">
          <h1 className="text-[28px] font-semibold text-text-primary tracking-tight">
            Collections
          </h1>
          <button
            onClick={() => { setEditTarget(null); setDrawerOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl text-[14px] font-medium hover:bg-accent-hover transition-colors"
          >
            <Plus size={16} />
            New Collection
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 text-destructive text-[14px] rounded-xl">
            {error}
          </div>
        )}

        {/* Loading skeletons */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[74px] rounded-2xl skeleton"
              />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-black/8 rounded-2xl">
            <p className="text-text-secondary font-light text-[16px]">
              No collections yet.
            </p>
            <p className="text-text-secondary/60 text-[13px] mt-2">
              Click &ldquo;New Collection&rdquo; to create your first one.
            </p>
          </div>
        ) : (
          <SortableCollectionList
            collections={collections}
            onReorder={handleReorder}
            onTogglePublished={handleTogglePublished}
            onEdit={(c) => { setEditTarget(c); setDrawerOpen(true); }}
            onDelete={handleDelete}
          />
        )}
        </div>
      </main>

      {/* Create / Edit drawer */}
      <CollectionForm
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditTarget(null); }}
        onSave={editTarget ? handleEdit : handleCreate}
        initial={editTarget}
        title={editTarget ? 'Edit Collection' : 'New Collection'}
      />
    </>
  );
}
