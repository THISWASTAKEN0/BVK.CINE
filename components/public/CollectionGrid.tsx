import Image from 'next/image';
import Link from 'next/link';
import { thumbUrl } from '@/lib/cloudinary';
import type { Collection } from '@/lib/types';

interface Props {
  collections: Collection[];
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

const HOLES = Array.from({ length: 60 });

function SprocketRail() {
  return (
    <div style={{ background: '#040405', padding: '5px 0' }}>
      <div style={{ display: 'flex', gap: 18, paddingLeft: 14, overflow: 'hidden' }}>
        {HOLES.map((_, i) => (
          <div
            key={i}
            style={{
              width: 12,
              height: 8,
              background: '#000',
              border: '1px solid #1a1a1c',
              borderRadius: 2,
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function CollectionGrid({ collections }: Props) {
  if (!collections.length) {
    return (
      <div className="text-center py-20 px-5" style={{ color: 'var(--text-secondary)' }}>
        <p className="font-light">No collections published yet.</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#060607' }}>
      {/* Top sprocket rail */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <SprocketRail />
      </div>

      {/* Film metadata bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 18px 2px' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.16)', letterSpacing: '0.22em', textTransform: 'uppercase' as const }}>
          Roll 001 · {collections.length} frames
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.10)', letterSpacing: '0.12em' }}>
          35mm · ISO 400
        </span>
      </div>

      {/* Scrollable frame strip */}
      <div
        className="flex overflow-x-auto"
        style={{
          gap: 3,
          padding: '10px 18px 14px',
          scrollbarWidth: 'none' as const,
          scrollSnapType: 'x mandatory',
        }}
      >
        {collections.map((col, i) => {
          const cover = col.cover_photo?.cloudinary_public_id;
          return (
            <Link
              key={col.id}
              href={`/collections/${col.id}`}
              className="group block flex-shrink-0"
              style={{ width: 240, scrollSnapAlign: 'start' }}
            >
              {/* Frame top label */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px 4px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.20)', letterSpacing: '0.10em' }}>
                  {String(i + 1).padStart(2, '0')} ▷
                </span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.14)' }}>
                  {formatDate(col.shoot_date)}
                </span>
              </div>

              {/* Photo frame */}
              <div
                className="relative overflow-hidden"
                style={{ height: 188, background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {cover ? (
                  <Image
                    src={thumbUrl(cover)}
                    alt={col.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    sizes="240px"
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#131316' }} />
                )}

                {/* Cinematic vignette */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.52) 100%)' }}
                />

                {/* Hover: dark gradient + info */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 55%)' }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300"
                  style={{ padding: '9px 11px' }}
                >
                  <p style={{ color: '#fff', fontSize: 12, fontWeight: 500, margin: 0, lineHeight: 1.3 }}>
                    {col.name}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 10, margin: '2px 0 0' }}>
                    {col.photo_count} {col.photo_count === 1 ? 'photo' : 'photos'}
                  </p>
                </div>
              </div>

              {/* Frame bottom label */}
              <div style={{ textAlign: 'right', padding: '3px 2px 0' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.08)', letterSpacing: '0.06em' }}>
                  BVK.CINE
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom sprocket rail */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <SprocketRail />
      </div>
    </div>
  );
}
