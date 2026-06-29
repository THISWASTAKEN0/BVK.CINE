'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, LayoutGrid, Eye, FileText } from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';
import SortableCollectionList from '@/components/admin/SortableCollectionList';
import CollectionForm from '@/components/admin/CollectionForm';
import PortraitUpload from '@/components/admin/PortraitUpload';
import type { Collection, CollectionFormData } from '@/lib/types';

type CollectionWithCount = Collection & { photo_count: number };

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className="rounded-xl px-5 py-4 flex items-center gap-4"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div
        className="p-2 rounded-lg flex-shrink-0"
        style={{ background: `${color}18` }}
      >
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <p className="text-[22px] font-bold leading-none text-text-primary">{value}</p>
        <p className="text-[11px] font-medium text-text-secondary mt-1 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [collections, setCollections] = useState<CollectionWithCount[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [editTarget, setEditTarget]   = useState<Collection | null>(null);
  const [portraitUrl, setPortraitUrl] = useState('');

  const fetchCollections = useCallback(async () => {
    setError('');
    const res = await fetch('/api/collections');
    if (!res.ok) { setError('Failed to load collections.'); setLoading(false); return; }
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

  const handleCreate = async (form: CollectionFormData) => {
    const res = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) throw new Error('Failed to create');
    const created: Collection = await res.json();
    setCollections((prev) => [...prev, { ...created, photo_count: 0 }]);
  };

  const handleEdit = async (form: CollectionFormData) => {
    if (!editTarget) return;
    const res = await fetch(`/api/collections/${editTarget.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) throw new Error('Failed to update');
    const updated: Collection = await res.json();
    setCollections((prev) => prev.map((c) => c.id === updated.id ? { ...c, ...updated } : c));
  };

  const handleTogglePublished = async (id: string, value: boolean) => {
    setCollections((prev) => prev.map((c) => c.id === id ? { ...c, is_published: value } : c));
    await fetch(`/api/collections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: value }),
    }).catch(() => setCollections((prev) => prev.map((c) => c.id === id ? { ...c, is_published: !value } : c)));
  };

  const handleReorder = async (reordered: CollectionWithCount[]) => {
    setCollections(reordered);
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

  const handleDelete = async (id: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
    const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' });
    if (!res.ok) fetchCollections();
  };

  const published = collections.filter((c) => c.is_published).length;
  const drafts    = collections.length - published;

  return (
    <>
      <AdminNav />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-10">

        {/* ── Stats row ─────────────────────────────── */}
        {!loading && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={LayoutGrid} label="Collections" value={collections.length} color="var(--accent)" />
            <StatCard icon={Eye}        label="Published"   value={published}           color="#34d399" />
            <StatCard icon={FileText}   label="Drafts"      value={drafts}              color="rgba(175,182,215,0.52)" />
          </div>
        )}

        {/* ── Profile portrait ──────────────────────── */}
        <section>
          <h2 className="text-[15px] font-semibold text-text-primary mb-1">Profile Portrait</h2>
          <p className="text-[13px] text-text-secondary mb-4">
            Shown in the About section of your public portfolio.
          </p>
          <PortraitUpload currentUrl={portraitUrl} onSaved={(url) => setPortraitUrl(url)} />
        </section>

        <div className="border-t" style={{ borderColor: 'var(--border)' }} />

        {/* ── Collections ───────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[22px] font-semibold text-text-primary tracking-tight">
              Collections
            </h1>
            <button
              onClick={() => { setEditTarget(null); setDrawerOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)' }}
            >
              <Plus size={15} />
              New Collection
            </button>
          </div>

          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-[13px]"
              style={{ background: 'rgba(255,77,79,0.1)', color: 'var(--destructive)', border: '1px solid rgba(255,77,79,0.15)' }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[74px] rounded-2xl skeleton" />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div
              className="text-center py-24 rounded-2xl"
              style={{ border: '2px dashed var(--border-strong)' }}
            >
              <LayoutGrid size={32} className="mx-auto mb-3 text-text-secondary" style={{ opacity: 0.3 }} />
              <p className="text-text-secondary font-light text-[15px]">No collections yet.</p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
                Click &ldquo;New Collection&rdquo; to get started.
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
