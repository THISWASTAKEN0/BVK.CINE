import CollectionCard, { CollectionCardSkeleton } from './CollectionCard';
import type { Collection } from '@/lib/types';

interface Props {
  collections: Collection[];
  loading?: boolean;
}

export default function CollectionGrid({ collections, loading }: Props) {
  if (loading) {
    return (
      <div className="masonry-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="masonry-item">
            <CollectionCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="text-center py-24 rounded-2xl" style={{ border: '1px dashed var(--border-strong)' }}>
        <p className="text-lg font-light" style={{ color: 'var(--text-secondary)' }}>No collections yet.</p>
        <p className="text-sm mt-2 opacity-50" style={{ color: 'var(--text-secondary)' }}>
          Check back soon — new work is on its way.
        </p>
      </div>
    );
  }

  return (
    <div className="masonry-grid">
      {collections.map((col) => (
        <div key={col.id} className="masonry-item animate-fade-in-up">
          <CollectionCard collection={col} />
        </div>
      ))}
    </div>
  );
}
