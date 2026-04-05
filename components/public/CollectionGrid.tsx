import CollectionCard, { CollectionCardSkeleton } from './CollectionCard';
import type { Collection } from '@/lib/types';

interface Props {
  collections: Collection[];
  loading?: boolean;
}

export default function CollectionGrid({ collections, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <CollectionCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div
        className="text-center py-24 rounded-2xl"
        style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
      >
        <p className="text-lg font-light" style={{ color: 'var(--text-secondary)' }}>
          No collections yet.
        </p>
        <p className="text-sm mt-2 opacity-50" style={{ color: 'var(--text-secondary)' }}>
          Check back soon — new work is on its way.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {collections.map((col) => (
        <CollectionCard key={col.id} collection={col} />
      ))}
    </div>
  );
}
